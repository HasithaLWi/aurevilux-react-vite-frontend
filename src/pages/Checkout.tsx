import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  ShieldCheck,
  Loader2,
  CheckCircle2,
  MapPin,
  CreditCard,
  Package,
  Truck,
  ArrowRight,
  Lock,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { OrderService } from "../services/order.service";
import { UserService } from "../services/user.service";
import { AuthService } from "../services/auth.service";
import { useLuxuryAlert } from "../context/LuxuryAlertContext";
import type { SavedAddress, PaymentMethodCard, Order } from "../types";

type CheckoutStep = "shipping" | "payment" | "review";
type PaymentMethod = "credit" | "paypal" | "applepay";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useApp();
  const { showAlert, confirm } = useLuxuryAlert();

  const [activeStep, setActiveStep] = useState<CheckoutStep>("shipping");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit");
  const [saveForFuture, setSaveForFuture] = useState(true);

  // Saved Profile Vault State
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [savedCards, setSavedCards] = useState<PaymentMethodCard[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("custom");
  const [selectedCardId, setSelectedCardId] = useState<string>("custom");

  // Form Data State
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
    cardHolder: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    cardZip: "",
  });

  const [phoneError, setPhoneError] = useState<string | null>(null);

  // Progressive Order Processing State
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<number>(0);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  useEffect(() => {
    const user = AuthService.getStoredUser();

    // Preload from user profile service if authenticated
    if (user) {
      UserService.getUserProfile()
        .then((profile) => {
          if (profile) {
            let activeName = profile.name || user.name || "";
            let activePostal = profile.postalCode || "";

            if (profile.savedAddresses && profile.savedAddresses.length > 0) {
              setSavedAddresses(profile.savedAddresses);
              // Select default address if available
              const defaultAddr =
                profile.savedAddresses.find((a) => a.isDefault) ||
                profile.savedAddresses[0];
              if (defaultAddr) {
                applyAddressToForm(defaultAddr);
                setSelectedAddressId(
                  defaultAddr.id || (defaultAddr as any)._id || "addr-0",
                );
                activeName = defaultAddr.name || activeName;
                activePostal = defaultAddr.postalCode || activePostal;
              }
            } else if (profile.address || profile.name) {
              setFormData((prev) => ({
                ...prev,
                fullName: profile.name || user.name || prev.fullName,
                email: profile.email || user.email || prev.email,
                phone: profile.phone || prev.phone,
                address: profile.address || prev.address,
                city: profile.city || prev.city,
                state: (profile as any).state || prev.state,
                postalCode: profile.postalCode || prev.postalCode,
                country: (profile as any).country || prev.country,
              }));
            }

            // Always ensure cardHolder and cardZip default from user profile
            setFormData((prev) => ({
              ...prev,
              cardHolder: prev.cardHolder || activeName,
              cardZip: prev.cardZip || activePostal,
            }));

            if (profile.savedCards && profile.savedCards.length > 0) {
              setSavedCards(profile.savedCards);
              const defaultCard =
                profile.savedCards.find((c) => c.isDefault) ||
                profile.savedCards[0];
              if (defaultCard) {
                applyCardToForm(defaultCard);
                setSelectedCardId(
                  defaultCard.id || (defaultCard as any)._id || "card-0",
                );
              }
            } else {
              loadSavedCardFromLocalStorage(activeName, activePostal);
            }
          }
        })
        .catch((err) => {
          console.warn(
            "Could not fetch remote profile, checking local storage:",
            err,
          );
          loadLocalStorageData();
        });
    } else {
      loadLocalStorageData();
    }
  }, []);

  const loadSavedCardFromLocalStorage = (fallbackName = "", fallbackZip = "") => {
    const savedCard = localStorage.getItem("aurevilux_payment_details");
    if (savedCard) {
      try {
        const card = JSON.parse(savedCard);
        setFormData((prev) => ({
          ...prev,
          cardHolder: card.cardHolder || fallbackName || prev.cardHolder || prev.fullName,
          cardNumber: card.cardNumber || prev.cardNumber,
          cardExpiry: card.cardExpiry || card.expiry || prev.cardExpiry,
          cardCvv: card.cardCvv || "•••",
          cardZip: card.cardZip || fallbackZip || prev.postalCode || prev.cardZip || "",
        }));
      } catch (e) {
        console.error("Error parsing saved card in checkout", e);
      }
    }
  };

  const loadLocalStorageData = () => {
    let localName = "";
    let localZip = "";

    const savedProfile = localStorage.getItem("aurevilux_user_profile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        localName = profile.name || "";
        localZip = profile.postalCode || "";
        setFormData((prev) => ({
          ...prev,
          fullName: profile.name || prev.fullName,
          email: profile.email || prev.email,
          phone: profile.phone || prev.phone,
          address: profile.address || prev.address,
          city: profile.city || prev.city,
          state: profile.state || prev.state,
          postalCode: profile.postalCode || prev.postalCode,
          country: profile.country || prev.country,
        }));
      } catch (e) {
        console.error("Error parsing saved profile in checkout", e);
      }
    }

    loadSavedCardFromLocalStorage(localName, localZip);
  };

  const applyAddressToForm = (addr: SavedAddress) => {
    setFormData((prev) => ({
      ...prev,
      fullName: addr.name || prev.fullName,
      phone: addr.phone || prev.phone,
      address: addr.street || prev.address,
      city: addr.city || prev.city,
      state: (addr as any).state || prev.state || addr.city,
      postalCode: addr.postalCode || prev.postalCode,
      country: addr.country || prev.country,
      cardHolder: prev.cardHolder || addr.name || prev.fullName,
      cardZip: prev.cardZip || addr.postalCode || prev.postalCode,
    }));
  };

  const applyCardToForm = (card: PaymentMethodCard) => {
    setFormData((prev) => ({
      ...prev,
      cardHolder: card.cardHolder || prev.cardHolder || prev.fullName,
      cardNumber: card.cardNumber || prev.cardNumber,
      cardExpiry: card.expiry || (card as any).cardExpiry || prev.cardExpiry,
      cardCvv: "•••",
    }));
  };

  const handleSelectSavedAddress = (addr: SavedAddress) => {
    const id = addr.id || (addr as any)._id;
    setSelectedAddressId(id);
    applyAddressToForm(addr);
    showAlert("info", `Applied saved address: "${addr.name}" (${addr.city})`);
  };

  const handleSelectCustomAddress = () => {
    setSelectedAddressId("custom");
  };

  const handleSelectSavedCard = (card: PaymentMethodCard) => {
    const id = card.id || (card as any)._id;
    setSelectedCardId(id);
    applyCardToForm(card);
    showAlert(
      "info",
      `Applied saved card: ${card.brand?.toUpperCase()} (${card.cardNumber})`,
    );
  };

  const handleSelectCustomCard = () => {
    setSelectedCardId("custom");
    setFormData((prev) => ({
      ...prev,
      cardHolder: "",
      cardNumber: "",
      cardExpiry: "",
      cardCvv: "",
    }));
  };

  // Phone input sanitization & strict validation
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Allow digits, plus sign, spaces, hyphens, and parentheses only
    const sanitized = raw.replace(/[^0-9+\s\-()]/g, "");
    setFormData((prev) => ({ ...prev, phone: sanitized }));

    if (sanitized && !/^\+?[0-9\s\-()]{7,20}$/.test(sanitized)) {
      setPhoneError("Please enter a valid telephone number (7 to 20 digits)");
    } else {
      setPhoneError(null);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // If already confirmed, render the Haute Confirmation Dossier
  if (confirmedOrder) {
    return (
      <div className="min-h-screen bg-brand-black text-white pt-28 pb-20 px-6 md:px-12 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Luxury Background Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-brand-burgundy/15 blur-[120px] pointer-events-none rounded-full" />

        <div className="max-w-2xl w-full relative z-10 space-y-8 bg-[#0e0e12]/90 border border-zinc-800 p-8 md:p-12 rounded-xl shadow-2xl backdrop-blur-xl animate-fade-in text-left">
          {/* Header Seal */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-brand-burgundy/20 border border-brand-gold/40 flex items-center justify-center flex-shrink-0 text-brand-gold shadow-lg shadow-brand-burgundy/30">
                <CheckCircle2 className="w-8 h-8 text-brand-gold" />
              </div>
              <div>
                <span className="text-[10px] tracking-[0.3em] text-brand-gold uppercase font-bold block">
                  HAUTE CONSIGNMENT CONFIRMED
                </span>
                <h1 className="font-serif text-2xl md:text-3xl text-white uppercase tracking-wider mt-0.5">
                  Order Authorized
                </h1>
              </div>
            </div>
            <div className="text-right sm:border-l sm:border-zinc-800 sm:pl-6">
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold block">
                CONSIGNMENT NUMBER
              </span>
              <span className="font-mono text-base text-brand-gold font-bold">
                {confirmedOrder.orderNumber}
              </span>
            </div>
          </div>

          {/* Delivery & Courier Protocol */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-[#08080a] border border-zinc-800/80 rounded-lg">
            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold block flex items-center gap-1.5">
                <Truck className="w-3 h-3 text-brand-gold" />
                <span>Private Courier Protocol</span>
              </span>
              <p className="text-sm text-white font-medium">
                {confirmedOrder.carrier || "DHL Express Elite White-Glove"}
              </p>
              <p className="text-xs text-zinc-400 font-light">
                {confirmedOrder.trackingNumber
                  ? `AWB: ${confirmedOrder.trackingNumber}`
                  : "Assigned for direct atelier pickup & secure vault dispatch"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold block flex items-center gap-1.5">
                <MapPin className="w-3 h-3 text-brand-gold" />
                <span>Destination Dossier</span>
              </span>
              <p className="text-sm text-white font-medium truncate">
                {confirmedOrder.customer?.name}
              </p>
              <p className="text-xs text-zinc-400 font-light truncate">
                {confirmedOrder.shippingAddress?.street},{" "}
                {confirmedOrder.shippingAddress?.city},{" "}
                {confirmedOrder.shippingAddress?.state}{" "}
                {confirmedOrder.shippingAddress?.postalCode},{" "}
                {confirmedOrder.shippingAddress?.country}
              </p>
            </div>
          </div>

          {/* Itemized Acquisitions Breakdown */}
          <div className="space-y-3">
            <span className="text-[10px] uppercase tracking-[0.2em] text-zinc-400 font-semibold block">
              ACQUISITIONS RESERVED ({confirmedOrder.itemsCount} PIECES)
            </span>
            <div className="divide-y divide-zinc-900 border border-zinc-900 rounded-lg bg-[#08080a] overflow-hidden max-h-56 overflow-y-auto">
              {confirmedOrder.items.map((item, idx) => (
                <div key={idx} className="p-3.5 flex items-center gap-4">
                  <div className="w-12 h-14 bg-zinc-900 rounded overflow-hidden flex-shrink-0 border border-zinc-800">
                    <img
                      src={item.image || "/placeholder.jpg"}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs font-serif uppercase tracking-wider text-white font-semibold truncate">
                      {item.name}
                    </h4>
                    <p className="text-[10px] text-zinc-400 font-light">
                      {item.brand} &bull; Qty: {item.quantity}
                      {item.selectedSize &&
                        ` &bull; Size: ${item.selectedSize}`}
                      {item.selectedColor && ` &bull; ${item.selectedColor}`}
                    </p>
                  </div>
                  <span className="text-xs font-mono text-brand-gold font-semibold">
                    $
                    {(item.price * item.quantity).toLocaleString("en-US", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Total Settlement Amount */}
          <div className="flex justify-between items-center pt-2 border-t border-zinc-800/80">
            <div>
              <span className="text-[10px] uppercase tracking-widest text-zinc-400 block">
                Total Settlement Charged
              </span>
              <span className="text-[10px] text-emerald-400 font-mono">
                Payment Authorized &bull; 256-Bit Encrypted
              </span>
            </div>
            <span className="font-serif text-2xl text-brand-gold font-bold">
              $
              {confirmedOrder.total.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </span>
          </div>

          {/* Actions: Retain User on Confirmation Until They Decide */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-4">
            <Link
              to="/account?tab=orders"
              className="w-full sm:w-1/2 py-3 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold uppercase tracking-widest text-center rounded transition-colors flex items-center justify-center gap-2 shadow-lg shadow-brand-burgundy/30"
            >
              <span>View in Patron Account</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              to="/shop"
              className="w-full sm:w-1/2 py-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-bold uppercase tracking-widest text-center rounded transition-colors"
            >
              Continue Curating Atelier
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Summary Calculations (Tax removed per requirement)
  const shippingFee = cartTotal > 500 ? 0 : 35;
  const grandTotal = cartTotal + shippingFee;
  const itemCount = cart.reduce((c, i) => c + i.quantity, 0);

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 bg-brand-black text-zinc-400 pt-28">
        <Package className="w-12 h-12 text-zinc-600 stroke-[1.2]" />
        <p className="font-serif tracking-widest text-lg uppercase text-white">
          Your Bag is Empty for Checkout
        </p>
        <p className="text-xs text-zinc-500 font-light">
          Explore the atelier collections to reserve your luxury acquisitions.
        </p>
        <button
          onClick={() => navigate("/shop")}
          className="text-xs text-brand-gold underline tracking-widest uppercase font-semibold hover:text-white transition-colors"
        >
          Return To Shop
        </button>
      </div>
    );
  }

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone number
    if (
      formData.phone &&
      !/^\+?[0-9\s\-()]{7,20}$/.test(formData.phone.trim())
    ) {
      showAlert(
        "warning",
        "Please provide a valid contact telephone number with at least 7 digits (e.g. +1 555 123 4567).",
        "Invalid Contact Number",
      );
      return;
    }

    if (
      !formData.fullName.trim() ||
      !formData.address.trim() ||
      !formData.city.trim() ||
      !formData.state.trim() ||
      !formData.postalCode.trim()
    ) {
      showAlert(
        "warning",
        "Please complete all delivery destination fields including State / Province.",
        "Missing Shipping Parameters",
      );
      return;
    }

    if (paymentMethod === "paypal" || paymentMethod === "applepay") {
      showAlert(
        "info",
        `${paymentMethod === "paypal" ? "PayPal" : "Apple Pay"} direct settlement is currently coming soon. Please select Credit Card to authorize your acquisition today.`,
        "Gateway Coming Soon"
      );
      return;
    }

    // Pre-checkout stock validation
    try {
      const cartItems = cart.map((item) => ({
        productId:
          (item.product as any)._id || item.product.id || item.product.slug,
        selectedSize: item.selectedSize,
        quantity: item.quantity,
      }));
      const validation = await OrderService.validateCart(cartItems);
      if (!validation.valid) {
        const names = validation.unavailable.map(
          (u) => `${u.name} (Available: ${u.available})`,
        );
        showAlert(
          "error",
          `The following items are out of stock or exceed inventory reserves: ${names.join(", ")}. Please adjust your bag.`,
          "Inventory Reserve Unavailable",
        );
        return;
      }
    } catch (err: any) {
      console.warn("Cart validation warning:", err);
      if (err.response?.status === 409) {
        showAlert(
          "error",
          err.response?.data?.message ||
            "Some items in your cart exceed available atelier stock.",
          "Inventory Reserve Unavailable",
        );
        return;
      }
    }

    // Confirm order placement dialog
    const confirmed = await confirm({
      title: "Authorize Haute Consignment",
      message: `Authorize settlement of $${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })} for ${itemCount} piece(s) dispatched to ${formData.city}, ${formData.country}?`,
      confirmText: "Authorize & Reserve",
      cancelText: "Review Bag",
      variant: "info",
    });

    if (!confirmed) return;

    // Start progressive luxury order processing
    setIsProcessing(true);
    setProcessingStage(1); // Stage 1: Securing atelier reserve

    const orderPayload = {
      items: cart.map((item) => ({
        productId:
          (item.product as any)._id || item.product.id || item.product.slug,
        name: item.product.name,
        brand: item.product.brand,
        price: item.product.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor,
        selectedSize: item.selectedSize,
        image: item.product.images[0] || "",
      })),
      total: grandTotal,
      itemsCount: itemCount,
      customer: {
        name: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
      },
      shippingAddress: {
        street: formData.address.trim(),
        city: formData.city.trim(),
        state: formData.state.trim() || formData.city.trim(),
        postalCode: formData.postalCode.trim(),
        country: formData.country.trim(),
      },
      carrier: "DHL Express Elite White-Glove",
      paymentMethod,
    };

    try {
      // Progressive visual pacing: 800ms stage 1
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProcessingStage(2); // Stage 2: Encrypted 256-bit settlement

      // Dispatch order to backend
      const createdOrder = await OrderService.createOrder(orderPayload);

      // Progressive visual pacing: 800ms stage 2
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProcessingStage(3); // Stage 3: Consignment dossier generation

      await new Promise((resolve) => setTimeout(resolve, 600));

      // Save for future use in localStorage if checked
      if (saveForFuture) {
        localStorage.setItem(
          "aurevilux_user_profile",
          JSON.stringify({
            name: formData.fullName,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            city: formData.city,
            state: formData.state,
            postalCode: formData.postalCode,
            country: formData.country,
          }),
        );
        if (paymentMethod === "credit" && formData.cardNumber) {
          localStorage.setItem(
            "aurevilux_payment_details",
            JSON.stringify({
              cardHolder: formData.cardHolder,
              cardNumber: formData.cardNumber.slice(-4)
                ? `•••• •••• •••• ${formData.cardNumber.slice(-4)}`
                : formData.cardNumber,
              cardExpiry: formData.cardExpiry,
            }),
          );
        }
      }

      // Also set legacy sessionStorage
      sessionStorage.setItem(
        "aurevilux_last_order",
        JSON.stringify({
          orderId: createdOrder.orderNumber || (createdOrder as any)._id,
          total: grandTotal,
          itemsCount: itemCount,
          name: formData.fullName,
          address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country}`,
        }),
      );

      clearCart();
      setIsProcessing(false);
      setConfirmedOrder(createdOrder);
      showAlert(
        "success",
        `Order ${createdOrder.orderNumber} successfully authorized!`,
        "Consignment Reserved",
      );
    } catch (apiErr: any) {
      setIsProcessing(false);
      setProcessingStage(0);
      const msg =
        apiErr?.response?.data?.message ||
        "Failed to place order. Please review your details.";
      showAlert("error", msg, "Authorization Failed");
    }
  };

  const steps: { key: CheckoutStep; label: string; number: number }[] = [
    { key: "shipping", label: "SHIPPING", number: 1 },
    { key: "payment", label: "PAYMENT", number: 2 },
    { key: "review", label: "REVIEW", number: 3 },
  ];

  const inputClass =
    "w-full bg-[#0a0a0c] border border-zinc-700/60 focus:border-brand-gold/70 px-4 py-3 text-[13px] text-white/90 outline-none rounded-md placeholder:text-zinc-600 transition-colors duration-300";

  return (
    <div className="min-h-screen mx-auto relative bg-brand-black">
      {/* Background: Left half black, Right half campaign imagery */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-1/2 h-full bg-brand-black" />
        <div className="absolute top-0 right-0 w-1/2 h-full">
          <img
            src="/images/backgrounds/checkout_section_image.jpeg"
            alt="Aurevilux luxury fashion"
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
        </div>
      </div>

      <div className="min-h-screen pt-28 pb-16 px-6 md:px-12 max-w-7xl mx-auto space-y-12 relative z-10 text-left">
        {/* Header */}
        <div className="border-zinc-900 pb-4 text-center sm:text-left space-y-2">
          <span className="text-[10px] tracking-[0.3em] text-brand-gold font-semibold uppercase">
            SECURE ENCRYPTED GATEWAY
          </span>
          <h1 className="font-serif text-3xl md:text-5xl text-white uppercase tracking-wider">
            Checkout
          </h1>
          {/* Step Indicator */}
          <div className="flex items-center gap-1 text-[11px] tracking-[0.15em] font-medium pt-2">
            {steps.map((step, index) => (
              <React.Fragment key={step.key}>
                <button
                  type="button"
                  onClick={() => setActiveStep(step.key)}
                  className={`transition-colors duration-300 ${
                    activeStep === step.key
                      ? "text-white font-bold"
                      : "text-zinc-600 hover:text-zinc-400"
                  }`}
                >
                  {step.number}. {step.label}
                </button>
                {index < steps.length - 1 && (
                  <span className="text-zinc-700 mx-2">|</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Main Content Form */}
        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
        >
          {/* LEFT SIDE: CHECKOUT FORM */}
          <div
            className="lg:col-span-7 space-y-10 px-6 py-8 lg:py-10 rounded-xl"
            style={{
              background: "rgba(10, 10, 12, 0.65)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.7)",
            }}
          >
            {/* SAVED PROFILE ADDRESS SELECTOR */}
            {savedAddresses.length > 0 && (
              <div className="space-y-3 pb-4 border-b border-zinc-900">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>Saved Profile Addresses</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectCustomAddress}
                    className={`text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                      selectedAddressId === "custom"
                        ? "text-brand-gold"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    + Enter New Address
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedAddresses.map((addr, idx) => {
                    const id = addr.id || (addr as any)._id || `addr-${idx}`;
                    const isSelected = selectedAddressId === id;
                    return (
                      <div
                        key={id}
                        onClick={() => handleSelectSavedAddress(addr)}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all duration-200 text-left relative ${
                          isSelected
                            ? "bg-brand-burgundy/15 border-brand-gold/70 shadow-md shadow-brand-burgundy/20"
                            : "bg-[#08080a] border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 font-mono">
                            {addr.type || "Residence"}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                          )}
                        </div>
                        <p className="text-xs text-white font-medium truncate">
                          {addr.name}
                        </p>
                        <p className="text-[11px] text-zinc-400 font-light truncate">
                          {addr.street}
                        </p>
                        <p className="text-[10px] text-zinc-500 font-mono">
                          {addr.city}, {addr.country}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Shipping Details */}
            <div className="space-y-5">
              <h3 className="font-serif text-lg text-white uppercase tracking-wider border-b border-zinc-900 pb-2 flex items-center justify-between">
                <span>Shipping Destination</span>
                <span className="text-[10px] text-zinc-500 tracking-widest font-sans font-light">
                  Direct Atelier Consignment
                </span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Patron Full Name *
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    required
                    placeholder="e.g. Lord Alexander Sterling"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="patron@aurevilux.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Strict Phone Number Input */}
              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Contact Telephone * (Digits Only, e.g. +1 555 123 4567)
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="+1 555 123 4567"
                  value={formData.phone}
                  onChange={handlePhoneChange}
                  className={`${inputClass} ${
                    phoneError ? "border-red-500/80 focus:border-red-500" : ""
                  }`}
                />
                {phoneError && (
                  <p className="text-[11px] text-red-400 mt-1 font-light">
                    {phoneError}
                  </p>
                )}
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  name="address"
                  required
                  placeholder="e.g. 742 Evergreen Terrace, Suite 400"
                  value={formData.address}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    name="city"
                    required
                    placeholder="City"
                    value={formData.city}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    State / Region *
                  </label>
                  <input
                    type="text"
                    name="state"
                    required
                    placeholder="State / Region"
                    value={formData.state}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    required
                    placeholder="Zip / Postal"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Country *
                  </label>
                  <input
                    type="text"
                    name="country"
                    required
                    placeholder="e.g. Sri Lanka"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Save for future use toggle */}
              <label className="flex items-center gap-2.5 cursor-pointer group pt-1">
                <input
                  type="checkbox"
                  checked={saveForFuture}
                  onChange={(e) => setSaveForFuture(e.target.checked)}
                  className="w-4 h-4 rounded bg-[#0a0a0c] border-zinc-700 text-brand-burgundy focus:ring-0 cursor-pointer"
                />
                <span className="text-[12px] text-zinc-400 tracking-wide select-none group-hover:text-zinc-200 transition-colors">
                  Save address & payment credentials securely in Aurevilux
                  Atelier Vault
                </span>
              </label>
            </div>

            {/* SAVED PROFILE PAYMENT CARDS SELECTOR */}
            {savedCards.length > 0 && (
              <div className="space-y-3 pb-4 border-b border-zinc-900 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Saved Payment Vault</span>
                  </span>
                  <button
                    type="button"
                    onClick={handleSelectCustomCard}
                    className={`text-[10px] uppercase tracking-wider font-semibold transition-colors ${
                      selectedCardId === "custom"
                        ? "text-brand-gold"
                        : "text-zinc-500 hover:text-white"
                    }`}
                  >
                    + Use Another Card
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {savedCards.map((card, idx) => {
                    const id = card.id || (card as any)._id || `card-${idx}`;
                    const isSelected = selectedCardId === id;
                    return (
                      <div
                        key={id}
                        onClick={() => handleSelectSavedCard(card)}
                        className={`p-3.5 rounded-lg border cursor-pointer transition-all duration-200 text-left relative ${
                          isSelected
                            ? "bg-brand-burgundy/15 border-brand-gold/70 shadow-md shadow-brand-burgundy/20"
                            : "bg-[#08080a] border-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-[9px] uppercase tracking-widest px-2 py-0.5 rounded bg-zinc-900 text-brand-gold font-mono font-bold">
                            {card.brand?.toUpperCase() || "CARD"}
                          </span>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-brand-gold" />
                          )}
                        </div>
                        <p className="text-xs text-white font-mono font-semibold">
                          {card.cardNumber}
                        </p>
                        <p className="text-[10px] text-zinc-400 font-light">
                          {card.cardHolder} &bull; Exp: {card.expiry}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Payment Method Section */}
            <div className="space-y-5">
              <h3 className="font-serif text-lg text-white uppercase tracking-wider border-b border-zinc-900 pb-2">
                Settlement Gateway
              </h3>

              {/* Payment Method Tabs */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("credit")}
                  className={`flex flex-col items-center justify-center gap-1.5 py-4 px-3 rounded-lg border transition-all duration-300 ${
                    paymentMethod === "credit"
                      ? "border-brand-gold/50 bg-brand-burgundy/10 text-white"
                      : "border-zinc-800 bg-[#08080a] text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-[11px] font-semibold tracking-wider uppercase">
                    Credit Card
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="bg-[#1A1F71] text-white text-[7px] font-bold px-1.5 py-0.5 rounded-sm">
                      VISA
                    </span>
                    <span
                      className="text-[7px] font-bold px-1.5 py-0.5 rounded-sm"
                      style={{
                        background:
                          "linear-gradient(135deg, #EB001B 50%, #F79E1B 50%)",
                      }}
                    >
                      &nbsp;&nbsp;&nbsp;
                    </span>
                    <span className="bg-zinc-600 text-white text-[6px] font-bold px-1 py-0.5 rounded-sm tracking-wider">
                      AMEX
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={`relative flex flex-col items-center justify-center gap-1 py-3 px-3 rounded-lg border transition-all duration-300 ${
                    paymentMethod === "paypal"
                      ? "border-brand-gold/50 bg-brand-burgundy/10 text-white"
                      : "border-zinc-800 bg-[#08080a] text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <span className="text-[13px] font-bold">
                    <span className="text-[#009CDE]">P</span>
                    <span className="text-[#003087]">Pay</span>
                    <span className="text-[#009CDE]">Pal</span>
                  </span>
                  <span className="text-[8px] bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-semibold border border-amber-500/30">
                    Coming Soon
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("applepay")}
                  className={`relative flex flex-col items-center justify-center gap-1 py-3 px-3 rounded-lg border transition-all duration-300 ${
                    paymentMethod === "applepay"
                      ? "border-brand-gold/50 bg-brand-burgundy/10 text-white"
                      : "border-zinc-800 bg-[#08080a] text-zinc-400 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <svg
                      viewBox="0 0 24 24"
                      className="w-3.5 h-3.5 text-white fill-current"
                    >
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                    </svg>
                    <span className="text-[12px] font-semibold text-white">
                      Pay
                    </span>
                  </div>
                  <span className="text-[8px] bg-amber-500/15 text-amber-300 px-1.5 py-0.5 rounded font-mono uppercase tracking-wider font-semibold border border-amber-500/30">
                    Coming Soon
                  </span>
                </button>
              </div>

              {/* Credit Card Fields */}
              {paymentMethod === "credit" && (
                <div className="space-y-4 pt-1">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        name="cardHolder"
                        required
                        placeholder="NAME AS APPEARS ON CARD"
                        value={formData.cardHolder}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                        Encrypted Card Number *
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        required
                        placeholder="•••• •••• •••• ••••"
                        maxLength={19}
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        className={`${inputClass} font-mono`}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                        Expiry Date *
                      </label>
                      <input
                        type="text"
                        name="cardExpiry"
                        required
                        placeholder="MM/YY"
                        maxLength={5}
                        value={formData.cardExpiry}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                        CVV / CVC *
                      </label>
                      <input
                        type="password"
                        name="cardCvv"
                        required
                        placeholder="•••"
                        maxLength={4}
                        value={formData.cardCvv}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                        Billing Postal
                      </label>
                      <input
                        type="text"
                        name="cardZip"
                        placeholder="Zip Code"
                        value={formData.cardZip}
                        onChange={handleInputChange}
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "paypal" && (
                <div className="text-center py-7 px-6 bg-[#0e0e13] border border-amber-500/30 rounded-xl space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] uppercase font-mono tracking-widest font-bold border border-amber-500/30">
                    Coming Soon
                  </div>
                  <h4 className="font-serif text-base text-white tracking-wide">
                    PayPal Direct Checkout is Coming Soon
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    PayPal payment integration is currently under atelier development. Please select <strong className="text-brand-gold font-medium">Credit Card</strong> to authorize your order.
                  </p>
                </div>
              )}

              {paymentMethod === "applepay" && (
                <div className="text-center py-7 px-6 bg-[#0e0e13] border border-amber-500/30 rounded-xl space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-[10px] uppercase font-mono tracking-widest font-bold border border-amber-500/30">
                    Coming Soon
                  </div>
                  <h4 className="font-serif text-base text-white tracking-wide">
                    Apple Pay One-Touch is Coming Soon
                  </h4>
                  <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
                    Apple Pay integration is coming in an upcoming release. Please use <strong className="text-brand-gold font-medium">Credit Card</strong> to complete your acquisition today.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: ORDER SUMMARY */}
          <div className="lg:col-span-5 relative min-h-[550px] rounded-lg overflow-hidden">
            <div className="relative z-10 flex items-start justify-center h-full px-2 py-4 lg:py-6">
              <div
                className="w-full max-w-[400px] rounded-xl overflow-hidden"
                style={{
                  background: "rgba(10, 10, 12, 0.75)",
                  backdropFilter: "blur(14px)",
                  WebkitBackdropFilter: "blur(14px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.7)",
                }}
              >
                {/* Card Header */}
                <div className="px-6 pt-6 pb-4 border-b border-white/[0.06] flex items-center justify-between">
                  <h3 className="text-[12px] font-semibold tracking-[0.2em] text-white uppercase">
                    Consignment Summary
                  </h3>
                  <span className="text-[10px] font-mono text-brand-gold uppercase">
                    {itemCount} Pieces
                  </span>
                </div>

                {/* Cart Items */}
                <div className="px-6 py-4 max-h-[240px] overflow-y-auto space-y-3">
                  {cart.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                      className="flex items-start gap-3 bg-white/5 p-3 rounded-md border border-white/5"
                    >
                      <div className="w-12 h-14 relative overflow-hidden bg-brand-dark rounded border border-zinc-800/50 flex-shrink-0">
                        <img
                          src={item.product.images[0]}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-[12px] font-semibold text-white uppercase tracking-wide truncate">
                          {item.product.name}
                        </h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">
                          {item.product.brand || item.product.name}
                        </p>
                        <p className="text-[9px] text-zinc-500 mt-0.5">
                          Qty: {item.quantity}{" "}
                          {item.selectedSize && `| Size: ${item.selectedSize}`}
                        </p>
                      </div>
                      <span className="text-[12px] text-brand-gold font-mono font-medium whitespace-nowrap">
                        $
                        {(item.product.price * item.quantity).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 },
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Summary Pricing */}
                <div className="px-6 py-4 border-t border-white/[0.06] space-y-2.5 text-[12px]">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Subtotal</span>
                    <span className="text-white font-medium font-mono">
                      $
                      {cartTotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">White-Glove Shipping</span>
                    {shippingFee === 0 ? (
                      <span className="text-brand-gold font-semibold text-[11px] uppercase tracking-wider">
                        COMPLIMENTARY
                      </span>
                    ) : (
                      <span className="text-white font-medium font-mono">
                        ${shippingFee.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Grand Total */}
                <div className="px-6 py-4 border-t border-white/[0.06]">
                  <div className="flex justify-between items-center">
                    <span className="text-[14px] font-semibold text-white tracking-wider">
                      TOTAL
                    </span>
                    <span className="text-[22px] font-serif text-brand-gold tracking-wide">
                      $
                      {grandTotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {/* Place Order Button */}
                <div className="px-6 pb-6">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover disabled:bg-zinc-800 disabled:text-zinc-500 text-white py-3.5 text-center text-[12px] font-bold tracking-[0.2em] transition-all duration-300 rounded-md uppercase flex items-center justify-center gap-2 shadow-lg shadow-brand-burgundy/30 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4 text-brand-gold" />
                    <span>AUTHORIZE & PLACE ORDER</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* FULL-SCREEN LUXURY PROGRESSIVE PROCESSING MODAL OVERLAY */}
      {isProcessing && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in text-left">
          <div className="max-w-md w-full bg-[#0e0e12] border border-zinc-800 rounded-xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-brand-burgundy via-brand-gold to-brand-burgundy animate-pulse" />

            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-brand-burgundy/20 border border-brand-gold/40 flex items-center justify-center text-brand-gold">
                <Lock className="w-6 h-6 animate-pulse" />
              </div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-brand-gold font-bold block">
                256-BIT ENCRYPTED AUTHORIZATION
              </span>
              <h2 className="font-serif text-xl text-white uppercase tracking-wider">
                Securing Consignment
              </h2>
            </div>

            {/* Step-by-Step Progressive Skeleton Indicator */}
            <div className="space-y-4 pt-2">
              {/* Step 1 */}
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all">
                  {processingStage > 1 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Loader2 className="w-5 h-5 text-brand-gold animate-spin" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-xs text-white uppercase tracking-wider font-medium block">
                    1. Securing Atelier Inventory Reserve
                  </span>
                  <span className="text-[10px] text-zinc-500 font-light">
                    Synchronizing real-time stock and reserving piece allocation
                  </span>
                </div>
              </div>

              {/* Step 2 */}
              <div
                className={`flex items-center gap-3 ${processingStage < 2 ? "opacity-40" : "opacity-100"}`}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all">
                  {processingStage > 2 ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : processingStage === 2 ? (
                    <Loader2 className="w-5 h-5 text-brand-gold animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-zinc-600" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-xs text-white uppercase tracking-wider font-medium block">
                    2. Authorizing Encrypted Settlement
                  </span>
                  <span className="text-[10px] text-zinc-500 font-light">
                    Routing payment payload through PCI-DSS secure vault
                  </span>
                </div>
              </div>

              {/* Step 3 */}
              <div
                className={`flex items-center gap-3 ${processingStage < 3 ? "opacity-40" : "opacity-100"}`}
              >
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all">
                  {processingStage === 3 ? (
                    <Loader2 className="w-5 h-5 text-brand-gold animate-spin" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-zinc-600" />
                  )}
                </div>
                <div className="flex-1">
                  <span className="text-xs text-white uppercase tracking-wider font-medium block">
                    3. Generating Consignment Dossier
                  </span>
                  <span className="text-[10px] text-zinc-500 font-light">
                    Assigning white-glove courier dispatch and official receipt
                  </span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-zinc-900/60 rounded border border-zinc-800 text-center">
              <span className="text-[10px] text-zinc-400 font-light italic">
                Please remain on this page while we confirm your luxury
                consignment reservation.
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

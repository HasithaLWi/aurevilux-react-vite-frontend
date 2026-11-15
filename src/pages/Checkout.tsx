import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, Loader2, ChevronDown } from "lucide-react";
import { useApp } from "../context/AppContext";
import { OrderService } from "../services/order.service";
import { useLuxuryAlert } from "../context/LuxuryAlertContext";

type CheckoutStep = "shipping" | "payment" | "review";
type PaymentMethod = "credit" | "paypal" | "applepay";

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, clearCart } = useApp();
  const { showAlert, confirm } = useLuxuryAlert();

  const [isProcessing, setIsProcessing] = useState(false);
  const [activeStep, setActiveStep] = useState<CheckoutStep>("shipping");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("credit");
  const [saveForFuture, setSaveForFuture] = useState(true);
  const [promoCode, setPromoCode] = useState("");

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "United States",
    cardHolder: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvv: "",
    cardZip: "",
  });

  useEffect(() => {
    // Pre-fill Shipping info
    const savedProfile = localStorage.getItem("aurevilux_user_profile");
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setFormData((prev) => ({
          ...prev,
          fullName: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          address: profile.address || "",
          city: profile.city || "",
          postalCode: profile.postalCode || "",
          country: profile.country || "United States",
        }));
      } catch (e) {
        console.error("Error parsing saved profile in checkout", e);
      }
    }

    // Pre-fill Payment Card info
    const savedCard = localStorage.getItem("aurevilux_payment_details");
    if (savedCard) {
      try {
        const card = JSON.parse(savedCard);
        setFormData((prev) => ({
          ...prev,
          cardHolder: card.cardHolder || "",
          cardNumber: card.cardNumber || "",
          cardExpiry: card.cardExpiry || "",
          cardCvv: card.cardCvv || "",
          cardZip: card.cardZip || prev.postalCode || "",
        }));
      } catch (e) {
        console.error("Error parsing saved card in checkout", e);
      }
    }
  }, []);

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 bg-brand-black text-zinc-400">
        <p className="font-serif tracking-widest text-lg">YOUR CART IS EMPTY FOR CHECKOUT</p>
        <button
          onClick={() => navigate("/shop")}
          className="text-xs text-brand-gold underline tracking-widest uppercase font-semibold"
        >
          Return To Shop
        </button>
      </div>
    );
  }

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Summary Calculations
  const shippingFee = cartTotal > 500 ? 0 : 35;
  const taxRate = 0.075;
  const taxFee = Math.round(cartTotal * taxRate * 100) / 100;
  const grandTotal = cartTotal + shippingFee + taxFee;
  const itemCount = cart.reduce((c, i) => c + i.quantity, 0);

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // ── Pre-checkout stock validation ─────────────────────────────────────
    try {
      const cartItems = cart.map((item) => ({
        productId: (item.product as any)._id || item.product.id,
        quantity: item.quantity,
      }));
      const validation = await OrderService.validateCart(cartItems);
      if (!validation.valid) {
        const names = validation.unavailable.map(
          (u) => `${u.name} (available: ${u.available})`
        );
        showAlert(
          "error",
          `The following items are out of stock or have insufficient quantity: ${names.join(", ")}. Please update your cart.`,
          "Stock Unavailable"
        );
        setIsProcessing(false);
        return;
      }
    } catch (err) {
      console.warn("Cart validation failed, proceeding with order:", err);
    }

    // ── Confirm order placement ───────────────────────────────────────────
    const confirmed = await confirm({
      title: "Confirm Your Order",
      message: `Place order for $${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })} (${itemCount} items)?`,
      confirmText: "Place Order",
      cancelText: "Review Cart",
      variant: "info",
    });
    if (!confirmed) {
      setIsProcessing(false);
      return;
    }

    const orderPayload = {
      items: cart.map((item) => ({
        productId: (item.product as any)._id || item.product.id,
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
        name: formData.fullName,
        email: formData.email,
        phone: formData.phone || "",
      },
      shippingAddress: {
        street: formData.address,
        city: formData.city,
        state: formData.city, // Use city as state fallback (removed hardcoded CA)
        postalCode: formData.postalCode,
        country: formData.country,
      },
      carrier: "DHL White Glove Concierge",
      paymentMethod,
    };

    try {
      const order = await OrderService.createOrder(orderPayload);

      // Use backend response order data as source of truth
      const orderData = {
        orderId: (order as any).orderNumber || (order as any)._id,
        total: grandTotal,
        itemsCount: itemCount,
        name: formData.fullName,
        address: `${formData.address}, ${formData.city}, ${formData.postalCode}, ${formData.country}`,
      };

      sessionStorage.setItem("aurevilux_last_order", JSON.stringify(orderData));

      setIsProcessing(false);
      clearCart();
      showAlert("success", "Your order has been placed successfully!", "Order Confirmed");
      navigate(`/checkout/success?orderId=${orderData.orderId}`);
    } catch (apiErr: any) {
      setIsProcessing(false);
      const msg = apiErr?.response?.data?.message || "Failed to place order. Please try again.";
      showAlert("error", msg, "Order Failed");
    }
  };

  const steps: { key: CheckoutStep; label: string; number: number }[] = [
    { key: "shipping", label: "SHIPPING", number: 1 },
    { key: "payment", label: "PAYMENT", number: 2 },
    { key: "review", label: "REVIEW", number: 3 },
  ];

  const inputClass =
    "w-full bg-transparent border border-zinc-700/60 focus:border-brand-gold/70 px-4 py-3 text-[13px] text-white/90 outline-none rounded-md placeholder:text-zinc-600 transition-colors duration-300";

  return (
    <div className="min-h-screen mx-auto relative">
      {/* Background: Left half black, Right half image */}
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

      <div className="min-h-screen pt-28 pb-16 px-6 md:px-12 max-w-7xl mx-auto space-y-12 relative">
        {/* Header */}
        <div className="border-zinc-900 pb-8 text-center sm:text-left space-y-2">
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
                      ? "text-white"
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

        {/* Main Content — Two-column layout */}
        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start"
        >
          {/* LEFT SIDE: CHECKOUT FORM */}
          <div
            className="lg:col-span-7 space-y-10 px-5 py-8 lg:py-10"
            style={{
              background: "rgba(10, 10, 12, 0.5)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              border: "1px solid rgba(255, 255, 255, 0.08)",
              boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.6)",
            }}
          >
            {/* Shipping Details */}
            <div className="space-y-5">
              <h3 className="font-serif text-lg text-white uppercase tracking-wider border-b border-zinc-900 pb-2">
                Shipping Details
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="fullName"
                  required
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className={inputClass}
                />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={inputClass}
                />
              </div>

              <input
                type="tel"
                name="phone"
                placeholder="Phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`${inputClass} sm:w-1/2`}
              />

              <input
                type="text"
                name="address"
                required
                placeholder="Address"
                value={formData.address}
                onChange={handleInputChange}
                className={inputClass}
              />

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="city"
                  required
                  placeholder="City"
                  value={formData.city}
                  onChange={handleInputChange}
                  className={inputClass}
                />
                <input
                  type="text"
                  name="postalCode"
                  required
                  placeholder="Postal Code"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className={inputClass}
                />
                <div className="relative">
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleInputChange}
                    className={`${inputClass} appearance-none cursor-pointer bg-brand-black pr-10`}
                  >
                    <option value="United States">United States</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="France">France</option>
                    <option value="Italy">Italy</option>
                    <option value="Japan">Japan</option>
                    <option value="Germany">Germany</option>
                    <option value="Australia">Australia</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </div>
              </div>

              {/* Save for future use */}
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div
                  className={`w-4 h-4 rounded border flex items-center justify-center transition-all duration-200 ${
                    saveForFuture
                      ? "bg-brand-gold border-brand-gold"
                      : "border-zinc-600 group-hover:border-zinc-400"
                  }`}
                  onClick={() => setSaveForFuture(!saveForFuture)}
                >
                  {saveForFuture && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path
                        d="M1 4L3.5 6.5L9 1"
                        stroke="#070708"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-[12px] text-zinc-400 tracking-wide">
                  Save for future use
                </span>
              </label>
            </div>

            {/* Payment Method */}
            <div className="space-y-5">
              <h3 className="font-serif text-lg text-white uppercase tracking-wider border-b border-zinc-900 pb-2">
                Payment Method
              </h3>

              {/* Payment Method Tabs */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod("credit")}
                  className={`relative flex flex-col items-center justify-center gap-1.5 py-4 px-3 rounded-lg border transition-all duration-300 ${
                    paymentMethod === "credit"
                      ? "border-brand-gold/50 bg-brand-dark/60"
                      : "border-zinc-800 bg-transparent hover:border-zinc-600"
                  }`}
                >
                  <span className="text-[11px] font-semibold tracking-wider text-white">
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
                      EXPRESS
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("paypal")}
                  className={`flex items-center justify-center py-4 px-3 rounded-lg border transition-all duration-300 ${
                    paymentMethod === "paypal"
                      ? "border-brand-gold/50 bg-brand-dark/60"
                      : "border-zinc-800 bg-transparent hover:border-zinc-600"
                  }`}
                >
                  <span className="text-[13px] font-bold">
                    <span className="text-[#009CDE]">P</span>
                    <span className="text-[#003087]">Pay</span>
                    <span className="text-[#009CDE]">Pal</span>
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod("applepay")}
                  className={`flex items-center justify-center gap-1.5 py-4 px-3 rounded-lg border transition-all duration-300 ${
                    paymentMethod === "applepay"
                      ? "border-brand-gold/50 bg-brand-dark/60"
                      : "border-zinc-800 bg-transparent hover:border-zinc-600"
                  }`}
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="w-4 h-4 text-white fill-current"
                  >
                    <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  <span className="text-[13px] font-semibold text-white">Pay</span>
                </button>
              </div>

              {/* Credit Card Fields */}
              {paymentMethod === "credit" && (
                <div className="space-y-4">
                  <h4 className="text-[13px] text-zinc-400 font-medium tracking-wide">
                    Card Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="cardHolder"
                      required
                      placeholder="Cardholder Name"
                      value={formData.cardHolder}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="cardNumber"
                      required
                      placeholder="Card Number"
                      maxLength={19}
                      value={formData.cardNumber}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
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
                    <input
                      type="password"
                      name="cardCvv"
                      required
                      placeholder="CVV"
                      maxLength={4}
                      value={formData.cardCvv}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                    <input
                      type="text"
                      name="cardZip"
                      placeholder="Billing Zip"
                      value={formData.cardZip}
                      onChange={handleInputChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              )}

              {paymentMethod === "paypal" && (
                <div className="text-center py-8 text-zinc-400 text-sm">
                  PayPal gateway initialized. Complete payment upon authorization.
                </div>
              )}

              {paymentMethod === "applepay" && (
                <div className="text-center py-8 text-zinc-400 text-sm">
                  Authenticate with Apple Pay on your device.
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDE: ORDER SUMMARY */}
          <div className="lg:col-span-5 relative min-h-[600px] lg:min-h-[700px] rounded-lg overflow-hidden">
            <div className="relative z-10 flex items-start justify-center h-full px-5 py-8 lg:py-10">
              <div
                className="w-full max-w-[380px] rounded-xl overflow-hidden"
                style={{
                  background: "rgba(10, 10, 12, 0.7)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(255, 255, 255, 0.08)",
                  boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.7)",
                }}
              >
                {/* Card Header */}
                <div className="px-6 pt-6 pb-4 border-b border-white/[0.06]">
                  <h3 className="text-[13px] font-semibold tracking-[0.2em] text-white uppercase">
                    YOUR ORDER SUMMARY ({itemCount})
                  </h3>
                </div>

                {/* Cart Items */}
                <div className="px-6 py-4 max-h-[230px] overflow-y-auto space-y-4">
                  {cart.map((item) => (
                    <div
                      key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                      className="flex items-start gap-3 bg-white/5 backdrop-blur-3xl p-3 rounded-md"
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
                          Qty: {item.quantity} | {item.selectedColor}
                        </p>
                      </div>
                      <span className="text-[12px] text-brand-gold font-medium whitespace-nowrap">
                        $
                        {(item.product.price * item.quantity).toLocaleString(
                          "en-US",
                          { minimumFractionDigits: 2 }
                        )}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Summary Pricing */}
                <div className="px-6 py-4 border-t border-white/[0.06] space-y-2.5 text-[12px]">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Subtotal</span>
                    <span className="text-white font-medium">
                      $
                      {cartTotal.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Shipping</span>
                    {shippingFee === 0 ? (
                      <span className="text-brand-gold font-semibold text-[11px]">
                        COMPLIMENTARY
                      </span>
                    ) : (
                      <span className="text-white font-medium">
                        ${shippingFee.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Sales Tax (7.5%)</span>
                    <span className="text-white font-medium">
                      $
                      {taxFee.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </span>
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

                {/* Promo Code */}
                <div className="px-6 pb-4">
                  <input
                    type="text"
                    placeholder="Promo Code"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-brand-gold/40 px-4 py-2.5 text-[12px] text-white/80 outline-none rounded-md placeholder:text-zinc-600 transition-colors uppercase tracking-widest"
                  />
                </div>

                {/* Place Order Button */}
                <div className="px-6 pb-4">
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover disabled:bg-zinc-700 disabled:text-zinc-500 text-white py-3.5 text-center text-[12px] font-bold tracking-[0.2em] transition-all duration-300 rounded-md uppercase flex items-center justify-center gap-2 shadow-lg shadow-brand-burgundy/20"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>PROCESSING ORDER...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4" />
                        <span>PLACE ORDER & PAY</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}


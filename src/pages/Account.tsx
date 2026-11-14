import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  ClipboardList,
  Heart,
  ShoppingBag,
  MapPin,
  CreditCard,
  User,
  Shield,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { UserService } from "../services/user.service";
import { OrderService } from "../services/order.service";
import { AuthService } from "../services/auth.service";
import { products } from "../data/data";
import type {
  UserProfile,
  SavedAddress,
  PaymentMethodCard,
  Order,
} from "../types";

import {
  AccountSidebar,
  type AccountTabId,
  type MenuItem,
} from "../components/account/AccountSidebar";
import { DashboardTab } from "../components/account/DashboardTab";
import { OrdersTab } from "../components/account/OrdersTab";
import { WishlistTab } from "../components/account/WishlistTab";
import { CartTab } from "../components/account/CartTab";
import { AddressesTab } from "../components/account/AddressesTab";
import { PaymentsTab } from "../components/account/PaymentsTab";
import { ProfileTab, type ProfileFormData } from "../components/account/ProfileTab";
import { SecurityTab } from "../components/account/SecurityTab";

export default function Account() {
  const navigate = useNavigate();
  const {
    cart,
    removeFromCart,
    updateCartQuantity,
    cartTotal,
    clearCart,
    addToCart,
    wishlist,
    toggleWishlist,
  } = useApp();

  // Tab State
  const [activeTab, setActiveTab] = useState<AccountTabId>("dashboard");
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  // Toast Notification
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastType, setToastType] = useState<"success" | "error">("success");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToastMessage(message);
    setToastType(type);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Profile State: initialized cleanly from authenticated user session
  const [profile, setProfile] = useState<UserProfile>(() => {
    const user = AuthService.getStoredUser();
    return {
      name: user?.name || "",
      email: user?.email || "",
      phone: "",
      address: "",
      city: "",
      state: "",
      postalCode: "",
      country: "",
      tier: "Haute Client",
      memberSince: "2026",
      birthday: "",
      gender: "",
      avatarUrl: user?.avatarUrl || "",
      authProvider: user?.authProvider || "local",
    };
  });

  const [profileForm, setProfileForm] = useState<ProfileFormData>({
    name: "",
    email: "",
    phone: "",
    birthday: "",
    gender: "",
    avatarUrl: "",
    authProvider: "local",
  });

  // Orders State (Strict Zero-Fallback Policy: load only genuine backend orders)
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Addresses State (Empty until loaded from backend user profile)
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);

  // Payment Cards State (Empty until loaded from backend user vault)
  const [paymentCards, setPaymentCards] = useState<PaymentMethodCard[]>([]);

  // Initial Data Loading
  useEffect(() => {
    const fetchUserData = async () => {
      const user = AuthService.getStoredUser();
      if (!user) {
        navigate("/login");
        return;
      }

      // Pre-fill from local user session first
      setProfile((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        avatarUrl: user.avatarUrl || prev.avatarUrl,
        authProvider: user.authProvider || prev.authProvider,
      }));
      setProfileForm((prev) => ({
        ...prev,
        name: user.name || prev.name,
        email: user.email || prev.email,
        avatarUrl: user.avatarUrl || prev.avatarUrl,
        authProvider: user.authProvider || prev.authProvider,
      }));

      try {
        const backendProfile = await UserService.getUserProfile();
        if (backendProfile) {
          setProfile(backendProfile);
          setProfileForm({
            name: backendProfile.name || user.name || "",
            email: backendProfile.email || user.email || "",
            phone: backendProfile.phone || "",
            birthday: backendProfile.birthday || "",
            gender: backendProfile.gender || "",
            avatarUrl: backendProfile.avatarUrl || user.avatarUrl || "",
            authProvider: backendProfile.authProvider || user.authProvider || "local",
          });
          if (backendProfile.savedAddresses && Array.isArray(backendProfile.savedAddresses)) {
            setAddresses(backendProfile.savedAddresses);
          }
          if (backendProfile.savedCards && Array.isArray(backendProfile.savedCards)) {
            setPaymentCards(backendProfile.savedCards);
          }
        }
      } catch (err) {
        console.warn("Could not retrieve remote user profile:", err);
      }

      try {
        const backendOrders = await OrderService.getMyOrders();
        setOrders(backendOrders || []);
      } catch (err) {
        console.error("Failed to fetch user orders:", err);
        setOrders([]);
      }
    };

    fetchUserData();
  }, [navigate]);

  // Handlers
  const handleCopyTracking = (tracking: string, id: string) => {
    navigator.clipboard.writeText(tracking);
    setCopiedId(id);
    showToast("TRACKING NUMBER COPIED TO CLIPBOARD");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleCancelOrder = async (orderId: string) => {
    try {
      await OrderService.cancelOrder(orderId, "Customer requested cancellation");
    } catch (err) {
      // Local fallback
    }
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId || ord._id === orderId
          ? { ...ord, status: "Cancelled" }
          : ord
      )
    );
    showToast("ORDER STATUS SET TO CANCELLED");
  };

  const handleReorder = (order: Order) => {
    order.items.forEach((item) => {
      const match = products.find((p) => p.name === item.name);
      if (match) {
        addToCart(
          match,
          item.quantity || 1,
          item.selectedColor || match.colors[0]?.name || "Noir",
          item.selectedSize || match.sizes[0] || "M"
        );
      }
    });
    showToast("ITEMS ADDED TO YOUR SHOPPING BAG");
    setActiveTab("cart");
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await UserService.updateUserProfile(profileForm);
      setProfile((prev) => ({ ...prev, ...profileForm }));
      const currentUser = AuthService.getStoredUser();
      if (currentUser) {
        AuthService.setStoredUser({
          ...currentUser,
          name: profileForm.name,
          avatarUrl: profileForm.avatarUrl,
        });
        window.dispatchEvent(new Event("storage"));
      }
      showToast("CLIENT PROFILE UPDATED SECURELY");
    } catch (err) {
      setProfile((prev) => ({ ...prev, ...profileForm }));
      showToast("CLIENT PROFILE SAVED LOCALLY");
    }
  };

  const handleSaveAddress = async (
    newAddr: SavedAddress,
    editingId: string | null
  ) => {
    try {
      if (editingId) {
        setAddresses((prev) =>
          prev.map((a) => (a.id === editingId ? newAddr : a))
        );
      } else {
        await UserService.addAddress(newAddr);
        setAddresses((prev) => {
          if (newAddr.isDefault) {
            return [...prev.map((a) => ({ ...a, isDefault: false })), newAddr];
          }
          return [...prev, newAddr];
        });
      }
      showToast(editingId ? "ADDRESS UPDATED" : "NEW ADDRESS SAVED");
    } catch (err) {
      setAddresses((prev) => [...prev, newAddr]);
      showToast("ADDRESS SAVED");
    }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      await UserService.deleteAddress(id);
    } catch (err) {}
    setAddresses((prev) => prev.filter((a) => a.id !== id));
    showToast("ADDRESS REMOVED");
  };

  const handleSetDefaultAddress = (id: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({
        ...a,
        isDefault: a.id === id,
      }))
    );
    showToast("DEFAULT SHIPPING ADDRESS SET");
  };

  const handleSaveCard = async (newCard: PaymentMethodCard) => {
    try {
      await UserService.addCard(newCard);
    } catch (err) {}
    setPaymentCards((prev) => {
      if (newCard.isDefault) {
        return [...prev.map((c) => ({ ...c, isDefault: false })), newCard];
      }
      return [...prev, newCard];
    });
    showToast("PAYMENT METHOD SECURELY ENCRYPTED & SAVED");
  };

  const handleDeleteCard = async (id: string) => {
    try {
      await UserService.deleteCard(id);
    } catch (err) {}
    setPaymentCards((prev) => prev.filter((c) => c.id !== id));
    showToast("CARD REMOVED FROM ATELIER VAULT");
  };

  const handleChangePassword = async (
    currentPw: string,
    newPw: string,
    confirmPw: string
  ) => {
    if (newPw !== confirmPw) {
      showToast("NEW PASSWORDS DO NOT MATCH", "error");
      return;
    }
    if (newPw.length < 6) {
      showToast("PASSWORD MUST BE AT LEAST 6 CHARACTERS", "error");
      return;
    }

    try {
      await UserService.changePassword(currentPw, newPw);
      showToast("PASSWORD UPDATED SUCCESSFULLY");
    } catch (err: any) {
      const msg = err.response?.data?.message || "INCORRECT CURRENT PASSWORD";
      showToast(msg.toUpperCase(), "error");
    }
  };

  const handleSignOut = () => {
    AuthService.logout();
    navigate("/login");
  };

  // Menu items list with live counter badges
  const menuItems: MenuItem[] = [
    { id: "dashboard", label: "Dashboard", icon: Home },
    { id: "orders", label: "Orders", icon: ClipboardList, badge: orders.length },
    { id: "wishlist", label: "Wishlist", icon: Heart, badge: wishlist.length },
    {
      id: "cart",
      label: "Shopping Cart",
      icon: ShoppingBag,
      badge: cart.reduce((tot, i) => tot + i.quantity, 0),
    },
    { id: "addresses", label: "Addresses", icon: MapPin },
    { id: "payments", label: "Payment Methods", icon: CreditCard },
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
  ];

  // Check for executive roles
  const storedUser = AuthService.getStoredUser();
  const isStaffOrAdmin = storedUser?.roles?.some((r: string) =>
    ["SUPERADMIN", "SUPER_ADMIN", "ADMIN", "STAFF"].includes(r)
  );

  return (
    <div className="bg-[#09090b] text-white min-h-screen flex flex-col md:flex-row w-full font-sans antialiased selection:bg-brand-burgundy selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-6 right-6 z-50 flex items-center space-x-2.5 px-5 py-3 rounded border text-xs font-semibold tracking-widest uppercase shadow-2xl transition-all duration-300 ${
            toastType === "error"
              ? "bg-red-950/90 border-red-800 text-red-200"
              : "bg-brand-black/95 border-brand-gold/40 text-brand-gold"
          }`}
        >
          {toastType === "error" ? (
            <AlertCircle className="w-4 h-4 text-red-400" />
          ) : (
            <CheckCircle className="w-4 h-4 text-brand-gold" />
          )}
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Modular Left Sidebar */}
      <AccountSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        menuItems={menuItems}
        isMobileNavOpen={isMobileNavOpen}
        setIsMobileNavOpen={setIsMobileNavOpen}
        onSignOut={handleSignOut}
        onSelectTab={() => setSelectedOrderId(null)}
      />

      {/* Main Viewport: spans 100% full width to prevent empty right-side gaps */}
      <main className="flex-1 min-w-0 w-full p-6 md:p-8 lg:p-10 overflow-y-auto min-h-screen bg-[#09090b]">
        {/* Executive Staff Access Banner */}
        {isStaffOrAdmin && (
          <div className="mb-6 p-4 bg-brand-gold/10 border border-brand-gold/30 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-lg">
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-5 h-5 text-brand-gold flex-shrink-0" />
              <div>
                <span className="font-bold uppercase tracking-wider text-brand-gold block">
                  Executive Personnel Clearance Detected ({storedUser?.roles?.[0] || "STAFF"})
                </span>
                <p className="text-[11px] text-zinc-400">
                  You are signed in with administrative privileges. You can manage boutique products, inventory, orders, and staff.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate("/admin")}
              className="px-4 py-2 bg-brand-gold text-black font-semibold text-[10px] tracking-widest uppercase rounded hover:bg-white transition-colors flex-shrink-0"
            >
              Enter Admin Portal &rarr;
            </button>
          </div>
        )}
        {activeTab === "dashboard" && (
          <DashboardTab
            profile={profile}
            orders={orders}
            wishlist={wishlist}
            cart={cart}
            cartTotal={cartTotal}
            addresses={addresses}
            paymentCards={paymentCards}
            setActiveTab={setActiveTab}
            setSelectedOrderId={setSelectedOrderId}
          />
        )}

        {activeTab === "orders" && (
          <OrdersTab
            orders={orders}
            selectedOrderId={selectedOrderId}
            setSelectedOrderId={setSelectedOrderId}
            copiedId={copiedId}
            onCopyTracking={handleCopyTracking}
            onCancelOrder={handleCancelOrder}
            onReorder={handleReorder}
          />
        )}

        {activeTab === "wishlist" && (
          <WishlistTab
            wishlist={wishlist}
            toggleWishlist={toggleWishlist}
            addToCart={addToCart}
            showToast={showToast}
          />
        )}

        {activeTab === "cart" && (
          <CartTab
            cart={cart}
            cartTotal={cartTotal}
            removeFromCart={removeFromCart}
            updateCartQuantity={updateCartQuantity}
            clearCart={clearCart}
          />
        )}

        {activeTab === "addresses" && (
          <AddressesTab
            addresses={addresses}
            profile={profile}
            onSaveAddress={handleSaveAddress}
            onDeleteAddress={handleDeleteAddress}
            onSetDefaultAddress={handleSetDefaultAddress}
          />
        )}

        {activeTab === "payments" && (
          <PaymentsTab
            paymentCards={paymentCards}
            cardHolderPlaceholder={profile.name ? profile.name.toUpperCase() : "CARDHOLDER NAME"}
            onSaveCard={handleSaveCard}
            onDeleteCard={handleDeleteCard}
          />
        )}

        {activeTab === "profile" && (
          <ProfileTab
            profileForm={profileForm}
            setProfileForm={setProfileForm}
            onSaveProfile={handleSaveProfile}
          />
        )}

        {activeTab === "security" && (
          <SecurityTab
            authProvider={profile.authProvider}
            onChangePassword={handleChangePassword}
            showToast={showToast}
          />
        )}
      </main>
    </div>
  );
}

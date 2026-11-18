import React from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ShoppingBag,
  FolderTree,
  ShieldCheck,
  Sliders,
  Star,
  ClipboardList,
  Truck,
  Users,
  Mail,
  UserCog,
  KeyRound,
  Settings,
  ExternalLink,
  LogOut,
  FileBarChart,
} from "lucide-react";

export type AdminTabId =
  | "dashboard"
  | "products"
  | "categories"
  | "brands"
  | "inventory"
  | "reviews"
  | "couriers"
  | "orders"
  | "customers"
  | "newsletter"
  | "reports"
  | "staff"
  | "roles"
  | "settings";

interface AdminSidebarProps {
  activeTab: AdminTabId;
  setActiveTab: (tab: AdminTabId) => void;
  currentUser: {
    name: string;
    email: string;
    roles?: string[];
    role?: string;
    avatarUrl?: string;
  } | null;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  onLogout,
}) => {
  const primaryRole =
    currentUser?.roles?.[0] || currentUser?.role || "ADMIN";

  // Role-based access map: which tabs each role can see
  const isSuper = primaryRole === "SUPERADMIN" || primaryRole === "SUPER_ADMIN";
  const isAdmin = primaryRole === "ADMIN" || isSuper;

  const tabAccess: Record<string, boolean> = {
    dashboard: true,
    products: true,
    categories: isAdmin,
    brands: isAdmin,
    inventory: true,
    reviews: true,
    couriers: isAdmin,
    orders: true,
    customers: true,
    newsletter: isAdmin,
    reports: isAdmin,
    staff: isAdmin,
    roles: isSuper,
    settings: isSuper,
  };

  return (
    <aside className="w-full md:w-64 bg-[#0a0a0c] border-r border-zinc-900 flex flex-col justify-between flex-shrink-0 min-h-screen text-left">
      <div className="p-5 space-y-6">
        {/* Brand Header */}
        <div className="space-y-1.5 border-b border-zinc-900 pb-4">
          <span className="text-[14px] tracking-[0.3em] text-white font-serif font-bold uppercase block">
            A U R E V I L U X
          </span>
          <span className="text-[9px] tracking-[0.2em] text-zinc-500 font-sans uppercase block">
            LUXURY FASHION MARKETPLACE
          </span>
          {currentUser && (
            <div className="pt-2 flex items-center gap-2">
              <span className="text-[9px] bg-brand-burgundy/20 text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded font-mono uppercase tracking-wider font-semibold">
                {primaryRole}
              </span>
              <span className="text-[10px] text-zinc-400 truncate">
                {currentUser.name}
              </span>
            </div>
          )}
        </div>

        {/* Navigation Sections */}
        <nav className="space-y-4 text-xs">
          {/* 1. Dashboard */}
          <div>
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded transition-all text-left uppercase text-[11px] tracking-wider font-medium ${
                activeTab === "dashboard"
                  ? "bg-brand-burgundy/90 text-white border border-brand-burgundy font-bold shadow-sm shadow-brand-burgundy/40"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              }`}
            >
              <LayoutDashboard className="w-4 h-4 text-brand-gold" />
              <span>DASHBOARD</span>
            </button>
          </div>

          {/* 2. CATALOG */}
          <div className="space-y-1">
            <span className="text-[9px] tracking-[0.25em] text-zinc-600 font-bold uppercase px-3 block">
              CATALOG
            </span>
            <div className="space-y-0.5">
              {[
                { id: "products", label: "PRODUCTS", icon: ShoppingBag },
                { id: "categories", label: "CATEGORIES", icon: FolderTree },
                { id: "brands", label: "BRANDS", icon: ShieldCheck },
                { id: "inventory", label: "INVENTORY", icon: Sliders },
                { id: "reviews", label: "REVIEWS", icon: Star },
                { id: "couriers", label: "COURIERS", icon: Truck },
              ].filter((item) => tabAccess[item.id] !== false).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as AdminTabId)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded transition-all text-left uppercase text-[11px] tracking-wider ${
                      isActive
                        ? "bg-brand-burgundy text-white font-bold"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 3. ORDERS */}
          <div className="space-y-1">
            <span className="text-[9px] tracking-[0.25em] text-zinc-600 font-bold uppercase px-3 block">
              ORDERS
            </span>
            <div className="space-y-0.5">
              {[
                { id: "orders", label: "ORDERS", icon: ClipboardList },
              ].filter((item) => tabAccess[item.id] !== false).map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as AdminTabId)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded transition-all text-left uppercase text-[11px] tracking-wider ${
                      isActive
                        ? "bg-brand-burgundy text-white font-bold"
                        : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4. CUSTOMERS */}
          <div className="space-y-1">
            <span className="text-[9px] tracking-[0.25em] text-zinc-600 font-bold uppercase px-3 block">
              CUSTOMERS
            </span>
            <button
              onClick={() => setActiveTab("customers")}
              className={`w-full flex items-center space-x-3 px-3 py-2 rounded transition-all text-left uppercase text-[11px] tracking-wider ${
                activeTab === "customers"
                  ? "bg-brand-burgundy text-white font-bold"
                  : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>CUSTOMERS</span>
            </button>
          </div>

          {/* 5. MARKETING */}
          {tabAccess.newsletter && (
            <div className="space-y-1">
              <span className="text-[9px] tracking-[0.25em] text-zinc-600 font-bold uppercase px-3 block">
                MARKETING
              </span>
              <button
                onClick={() => setActiveTab("newsletter")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded transition-all text-left uppercase text-[11px] tracking-wider ${
                  activeTab === "newsletter"
                    ? "bg-brand-burgundy text-white font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                <Mail className="w-3.5 h-3.5" />
                <span>NEWSLETTER</span>
              </button>
            </div>
          )}

          {/* 6. EXECUTIVE REPORTS */}
          {tabAccess.reports && (
            <div className="space-y-1">
              <span className="text-[9px] tracking-[0.25em] text-zinc-600 font-bold uppercase px-3 block">
                MANAGEMENT & REPORTS
              </span>
              <button
                onClick={() => setActiveTab("reports")}
                className={`w-full flex items-center space-x-3 px-3 py-2 rounded transition-all text-left uppercase text-[11px] tracking-wider ${
                  activeTab === "reports"
                    ? "bg-brand-burgundy text-white font-bold"
                    : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                }`}
              >
                <FileBarChart className="w-3.5 h-3.5 text-brand-gold" />
                <span>REPORTS</span>
              </button>
            </div>
          )}

          {/* 7. STAFF & SETTINGS */}
          {[
            { id: "staff", label: "STAFF MANAGEMENT", icon: UserCog },
            { id: "roles", label: "ROLES & PERMISSIONS", icon: KeyRound },
            { id: "settings", label: "SETTINGS", icon: Settings },
          ].filter((item) => tabAccess[item.id] !== false).length > 0 && (
            <div className="space-y-1">
              <span className="text-[9px] tracking-[0.25em] text-zinc-600 font-bold uppercase px-3 block">
                STAFF & SETTINGS
              </span>
              <div className="space-y-0.5">
                {[
                  { id: "staff", label: "STAFF MANAGEMENT", icon: UserCog },
                  { id: "roles", label: "ROLES & PERMISSIONS", icon: KeyRound },
                  { id: "settings", label: "SETTINGS", icon: Settings },
                ]
                  .filter((item) => tabAccess[item.id] !== false)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id as AdminTabId)}
                        className={`w-full flex items-center space-x-3 px-3 py-2 rounded transition-all text-left uppercase text-[11px] tracking-wider ${
                          isActive
                            ? "bg-brand-burgundy text-white font-bold"
                            : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
              </div>
            </div>
          )}
        </nav>
      </div>

      {/* Bottom Footer Actions */}
      <div className="p-4 border-t border-zinc-900 space-y-2">
        <Link
          to="/shop"
          className="w-full flex items-center justify-between px-3 py-2 text-zinc-400 hover:text-white text-[11px] uppercase font-semibold tracking-wider hover:bg-zinc-900/60 rounded border border-zinc-900 transition-colors"
        >
          <span>VIEW STORE</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-2 px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-950/20 text-[11px] uppercase font-semibold tracking-wider rounded transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>SIGN OUT</span>
        </button>
      </div>
    </aside>
  );
};


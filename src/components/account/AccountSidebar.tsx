import React from "react";
import { Link } from "react-router-dom";
import {
  LogOut,
  CheckCircle,
  ArrowLeft,
  X,
  Menu,
} from "lucide-react";
import type { UserProfile } from "../../types";

export type AccountTabId =
  | "dashboard"
  | "orders"
  | "wishlist"
  | "cart"
  | "addresses"
  | "payments"
  | "profile"
  | "security";

export interface MenuItem {
  id: AccountTabId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface AccountSidebarProps {
  activeTab: AccountTabId;
  setActiveTab: (tab: AccountTabId) => void;
  profile: UserProfile;
  menuItems: MenuItem[];
  isMobileNavOpen: boolean;
  setIsMobileNavOpen: (open: boolean) => void;
  onSignOut: () => void;
  onSelectTab?: () => void;
}

export const AccountSidebar: React.FC<AccountSidebarProps> = ({
  activeTab,
  setActiveTab,
  profile,
  menuItems,
  isMobileNavOpen,
  setIsMobileNavOpen,
  onSignOut,
  onSelectTab,
}) => {
  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden w-full h-16 px-6 bg-zinc-950 border-b border-zinc-900 flex justify-between items-center sticky top-0 z-40">
        <Link
          to="/"
          className="font-serif text-xl tracking-[0.25em] text-white hover:text-brand-gold transition-colors"
        >
          AUREVILUX
        </Link>
        <button
          onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
          className="text-zinc-400 hover:text-white p-1"
          aria-label="Toggle navigation"
        >
          {isMobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Aside */}
      <aside
        className={`${
          isMobileNavOpen ? "flex" : "hidden"
        } md:flex flex-col justify-between w-full md:w-[280px] min-w-[280px] border-r border-zinc-900 bg-zinc-950 p-6 md:h-screen md:sticky md:top-0 overflow-y-auto z-30 transition-all duration-300`}
      >
        <div className="space-y-6">
          {/* Brand Header & Back to Shop */}
          <div className="space-y-3.5 border-b border-zinc-900 pb-5">
            <Link
              to="/"
              className="font-serif text-2xl tracking-[0.25em] text-white hover:text-brand-gold transition-colors duration-300 block"
            >
              AUREVILUX
            </Link>

            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 text-[10px] font-bold tracking-widest text-brand-gold hover:text-white transition-colors duration-200 uppercase group"
            >
              <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
              <span>Back To Shop</span>
            </Link>
          </div>

          {/* Profile Card (Crown badge excluded per instructions) */}
          <div className="space-y-4 border-b border-zinc-900 pb-5">
            <div className="flex items-center space-x-3.5">
              <div className="relative w-14 h-14 rounded-full border border-brand-gold/30 overflow-hidden bg-brand-black flex-shrink-0 flex items-center justify-center">
                {profile.avatarUrl ? (
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name || "Client"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-serif text-base font-bold text-brand-gold tracking-widest">
                    {profile.name
                      ? profile.name
                          .trim()
                          .split(/\s+/)
                          .map((n) => n[0])
                          .slice(0, 2)
                          .join("")
                          .toUpperCase()
                      : "AU"}
                  </span>
                )}
              </div>
              <div className="space-y-0.5 truncate">
                <h3 className="font-serif text-[15px] text-white uppercase tracking-wider font-semibold truncate">
                  {profile.name || "Atelier Patron"}
                </h3>
                <p className="text-[10px] text-zinc-500 font-light truncate">
                  {profile.email || "patron@aurevilux.com"}
                </p>
              </div>
            </div>

            {/* Member Info & Verified Badge */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center space-x-1.5 text-[10px] text-zinc-400">
                <span className="text-zinc-500">Member since:</span>
                <span className="font-medium text-white">
                  {profile.memberSince || "2026"}
                </span>
              </div>
              <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400 font-medium">
                <CheckCircle className="w-3.5 h-3.5 fill-emerald-500/10 text-emerald-400" />
                <span>Verified Account</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex flex-col space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileNavOpen(false);
                    if (onSelectTab) onSelectTab();
                  }}
                  className={`flex items-center justify-between px-3 py-2.5 text-[11px] font-bold tracking-widest rounded uppercase transition-all duration-200 ${
                    isActive
                      ? "bg-brand-burgundy/15 border-l-2 border-brand-gold text-brand-gold shadow-md"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-900/60 border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? "text-brand-gold" : "text-zinc-500"
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-brand-gold font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sign Out Button */}
        <div className="pt-6 border-t border-zinc-900 mt-6">
          <button
            onClick={onSignOut}
            className="flex items-center space-x-3 text-[10.5px] font-bold tracking-widest text-zinc-500 hover:text-red-400 uppercase transition-colors w-full px-3 py-2 rounded hover:bg-red-950/20"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};


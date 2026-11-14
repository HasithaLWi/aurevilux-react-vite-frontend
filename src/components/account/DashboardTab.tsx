import React from "react";
import { Link } from "react-router-dom";
import {
  Package,
  Heart,
  ShoppingBag,
  MapPin,
  ChevronRight,
} from "lucide-react";
import type { UserProfile, SavedAddress, PaymentMethodCard, Order } from "../../types";
import type { CartItem } from "../../context/AppContext";
import type { Product } from "../../data/data";
import type { AccountTabId } from "./AccountSidebar";

interface DashboardTabProps {
  profile: UserProfile;
  orders: Order[];
  wishlist: Product[];
  cart: CartItem[];
  cartTotal: number;
  addresses: SavedAddress[];
  paymentCards: PaymentMethodCard[];
  setActiveTab: (tab: AccountTabId) => void;
  setSelectedOrderId: (id: string | null) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  profile,
  orders,
  wishlist,
  cart,
  cartTotal,
  addresses,
  paymentCards,
  setActiveTab,
  setSelectedOrderId,
}) => {
  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
  const defaultCard = paymentCards.find((c) => c.isDefault) || paymentCards[0];

  return (
    <div className="space-y-8 animate-fade-in w-full">
      {/* Greeting Banner */}
      <div className="space-y-1 border-b border-zinc-900 pb-6">
        <span className="text-[10px] tracking-[0.35em] text-brand-gold font-bold uppercase block">
          ATELIER CLIENT SUITE
        </span>
        <h1 className="font-serif text-3xl md:text-4xl text-white uppercase tracking-wider">
          Welcome back, {profile.name ? profile.name.trim().split(" ")[0] : "Patron"}.
        </h1>
        <p className="text-xs text-zinc-400 font-light">
          Monitor your haute couture acquisitions, addresses, and private selections.
        </p>
      </div>

      {/* KPI Stat Cards (4 Columns Spanning Full Width) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full">
        <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-lg flex flex-col justify-between h-[125px] hover:border-zinc-800 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[9px] tracking-[0.2em] text-zinc-500 font-bold uppercase">
              TOTAL ORDERS
            </span>
            <div className="p-2 bg-zinc-900 rounded-full border border-zinc-800 text-brand-gold">
              <Package className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-serif text-white">{orders.length}</h2>
            <button
              onClick={() => setActiveTab("orders")}
              className="text-[9px] tracking-wider text-brand-gold hover:text-white uppercase font-bold flex items-center space-x-1 pt-1"
            >
              <span>View all orders</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-lg flex flex-col justify-between h-[125px] hover:border-zinc-800 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[9px] tracking-[0.2em] text-zinc-500 font-bold uppercase">
              WISHLIST PIECES
            </span>
            <div className="p-2 bg-zinc-900 rounded-full border border-zinc-800 text-brand-gold">
              <Heart className="w-3.5 h-3.5 fill-brand-gold/10" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-serif text-white">{wishlist.length}</h2>
            <button
              onClick={() => setActiveTab("wishlist")}
              className="text-[9px] tracking-wider text-brand-gold hover:text-white uppercase font-bold flex items-center space-x-1 pt-1"
            >
              <span>View wishlist</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-lg flex flex-col justify-between h-[125px] hover:border-zinc-800 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[9px] tracking-[0.2em] text-zinc-500 font-bold uppercase">
              SHOPPING BAG
            </span>
            <div className="p-2 bg-zinc-900 rounded-full border border-zinc-800 text-brand-gold">
              <ShoppingBag className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-serif text-white">
              {cart.reduce((tot, i) => tot + i.quantity, 0)}
            </h2>
            <button
              onClick={() => setActiveTab("cart")}
              className="text-[9px] tracking-wider text-brand-gold hover:text-white uppercase font-bold flex items-center space-x-1 pt-1"
            >
              <span>View shopping bag</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="bg-zinc-950/60 border border-zinc-900 p-5 rounded-lg flex flex-col justify-between h-[125px] hover:border-zinc-800 transition-all">
          <div className="flex justify-between items-start">
            <span className="text-[9px] tracking-[0.2em] text-zinc-500 font-bold uppercase">
              SAVED ADDRESSES
            </span>
            <div className="p-2 bg-zinc-900 rounded-full border border-zinc-800 text-brand-gold">
              <MapPin className="w-3.5 h-3.5" />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-serif text-white">{addresses.length}</h2>
            <button
              onClick={() => setActiveTab("addresses")}
              className="text-[9px] tracking-wider text-brand-gold hover:text-white uppercase font-bold flex items-center space-x-1 pt-1"
            >
              <span>Manage addresses</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Middle Row: Recent Orders, Wishlist Preview, Cart Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Recent Orders Card */}
        <div className="lg:col-span-4 border border-zinc-900 bg-zinc-950/50 p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h3 className="font-serif text-sm text-white uppercase tracking-wider">
              Recent Orders
            </h3>
            <button
              onClick={() => setActiveTab("orders")}
              className="text-[9px] tracking-widest text-brand-gold hover:text-white uppercase font-bold flex items-center space-x-1"
            >
              <span>All Orders</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {orders.length === 0 ? (
              <p className="text-xs text-zinc-500 py-6 text-center italic">
                No recent orders found.
              </p>
            ) : (
              orders.slice(0, 3).map((ord) => (
                <div
                  key={ord.id || ord._id}
                  className="border border-zinc-900/60 hover:border-zinc-800 bg-zinc-900/30 p-3.5 rounded flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-12 bg-zinc-900 rounded overflow-hidden flex-shrink-0 flex items-center justify-center border border-zinc-800">
                      {ord.items?.[0]?.image ? (
                        <img
                          src={ord.items[0].image}
                          alt="piece"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-4 h-4 text-zinc-650" />
                      )}
                    </div>
                    <div>
                      <span className="text-xs font-mono font-bold text-white block">
                        {ord.orderNumber || ord.id}
                      </span>
                      <span className="text-[10px] text-zinc-500">
                        {ord.date || "Recent"}
                      </span>
                    </div>
                  </div>

                  <div className="text-right space-y-1">
                    <span className="text-xs font-serif font-bold text-brand-gold block">
                      ${ord.total?.toLocaleString()}
                    </span>
                    <button
                      onClick={() => {
                        setSelectedOrderId(ord.id || ord._id || null);
                        setActiveTab("orders");
                      }}
                      className="text-[9px] font-bold text-zinc-400 hover:text-brand-gold uppercase tracking-wider"
                    >
                      Details &rarr;
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Wishlist Preview */}
        <div className="lg:col-span-4 border border-zinc-900 bg-zinc-950/50 p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h3 className="font-serif text-sm text-white uppercase tracking-wider">
              Wishlist Preview
            </h3>
            <button
              onClick={() => setActiveTab("wishlist")}
              className="text-[9px] tracking-widest text-brand-gold hover:text-white uppercase font-bold flex items-center space-x-1"
            >
              <span>View Wishlist</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {wishlist.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <Heart className="w-8 h-8 text-zinc-700 mx-auto" />
              <p className="text-xs text-zinc-500 font-serif">
                Your wishlist is empty.
              </p>
              <Link
                to="/shop"
                className="inline-block text-[10px] font-bold tracking-widest text-brand-gold hover:text-white uppercase"
              >
                Explore Boutique &rarr;
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2.5">
              {wishlist.slice(0, 3).map((item) => (
                <div
                  key={item.id}
                  className="group border border-zinc-900 bg-zinc-900/30 rounded overflow-hidden flex flex-col justify-between"
                >
                  <div className="aspect-[3/4] w-full bg-zinc-950 overflow-hidden">
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="p-2 space-y-1">
                    <span className="text-[8px] text-brand-gold font-bold tracking-widest uppercase block truncate">
                      {item.brand}
                    </span>
                    <span className="text-[10px] font-serif text-white block truncate">
                      ${item.price.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cart Preview */}
        <div className="lg:col-span-4 border border-zinc-900 bg-zinc-950/50 p-6 rounded-lg space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <h3 className="font-serif text-sm text-white uppercase tracking-wider">
              Shopping Bag
            </h3>
            <button
              onClick={() => setActiveTab("cart")}
              className="text-[9px] tracking-widest text-brand-gold hover:text-white uppercase font-bold flex items-center space-x-1"
            >
              <span>Open Bag</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>

          {cart.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <ShoppingBag className="w-8 h-8 text-zinc-700 mx-auto" />
              <p className="text-xs text-zinc-500 font-serif">
                Your shopping bag is empty.
              </p>
              <Link
                to="/shop"
                className="inline-block text-[10px] font-bold tracking-widest text-brand-gold hover:text-white uppercase"
              >
                Discover Pieces &rarr;
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.slice(0, 3).map((item) => (
                <div
                  key={`${item.product.id}-${item.selectedColor}-${item.selectedSize}`}
                  className="flex items-center justify-between border border-zinc-900/60 bg-zinc-900/30 p-2.5 rounded"
                >
                  <div className="flex items-center space-x-2.5 truncate">
                    <img
                      src={item.product.images[0]}
                      alt={item.product.name}
                      className="w-9 h-11 object-cover rounded bg-zinc-950 flex-shrink-0"
                    />
                    <div className="truncate">
                      <span className="text-[10px] font-serif text-white block truncate uppercase">
                        {item.product.name}
                      </span>
                      <span className="text-[9px] text-zinc-500">
                        Qty: {item.quantity} &middot; {item.selectedSize}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-serif text-brand-gold font-bold flex-shrink-0">
                    ${(item.product.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-zinc-900 flex justify-between items-center text-xs">
                <span className="text-zinc-500 uppercase tracking-widest text-[9px]">
                  Subtotal
                </span>
                <span className="font-serif text-brand-gold font-bold">
                  ${cartTotal.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Row: Default Address & Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        <div className="border border-zinc-900 bg-zinc-950/40 p-6 rounded-lg space-y-3">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5">
            <h4 className="font-serif text-xs uppercase tracking-wider text-white">
              Default Shipping Address
            </h4>
            <button
              onClick={() => setActiveTab("addresses")}
              className="text-[9px] tracking-widest text-brand-gold hover:text-white uppercase font-bold"
            >
              Manage
            </button>
          </div>
          {defaultAddress ? (
            <div className="text-xs text-zinc-400 space-y-1">
              <p className="font-semibold text-white">{defaultAddress.name}</p>
              <p>{defaultAddress.street}</p>
              <p>
                {defaultAddress.city}, {defaultAddress.postalCode} &middot;{" "}
                {defaultAddress.country}
              </p>
              <p className="text-zinc-500 text-[11px]">{defaultAddress.phone}</p>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic">No address on file.</p>
          )}
        </div>

        <div className="border border-zinc-900 bg-zinc-950/40 p-6 rounded-lg space-y-3">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5">
            <h4 className="font-serif text-xs uppercase tracking-wider text-white">
              Primary Payment Method
            </h4>
            <button
              onClick={() => setActiveTab("payments")}
              className="text-[9px] tracking-widest text-brand-gold hover:text-white uppercase font-bold"
            >
              Manage
            </button>
          </div>
          {defaultCard ? (
            <div className="flex items-center space-x-4 pt-1">
              <div className="w-12 h-8 bg-zinc-900 border border-zinc-800 rounded flex items-center justify-center text-brand-gold font-mono text-[10px] font-bold uppercase">
                {defaultCard.brand}
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-mono text-white block">
                  {defaultCard.cardNumber}
                </span>
                <span className="text-zinc-500 text-[10px]">
                  Expires {defaultCard.expiry}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-zinc-500 italic">No saved card.</p>
          )}
        </div>
      </div>
    </div>
  );
};


import React from "react";
import {
  TrendingUp,
  ShoppingBag,
  Package,
  AlertTriangle,
  Users,
  ArrowUpRight,
  Plus,
  Truck,
  Star,
  UserPlus,
} from "lucide-react";
import type { AnalyticsData } from "../../services/admin.service";
import type { Product, Order } from "../../types";
import type { AdminTabId } from "./AdminSidebar";

interface DashboardTabProps {
  analytics?: AnalyticsData;
  products: Product[];
  orders: Order[];
  setActiveTab: (tab: AdminTabId) => void;
  onOpenAddProduct: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  analytics,
  products,
  orders,
  setActiveTab,
  onOpenAddProduct,
}) => {
  const lowStockPieces = products.filter(
    (p) => (p.stockCount ?? 10) <= 5 && !p.isDeleted
  );
  const recentOrders = orders.slice(0, 6);

  return (
    <div className="space-y-8 w-full text-left">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
            ATELIER EXECUTIVE OVERVIEW
          </span>
          <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
            Dashboard & Performance
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenAddProduct}
            className="bg-brand-burgundy hover:bg-brand-burgundyHover text-white px-3.5 py-2 rounded text-[11px] font-bold tracking-widest uppercase flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Piece</span>
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className="border border-zinc-800 hover:border-zinc-700 bg-zinc-900 text-zinc-300 hover:text-white px-3 py-2 rounded text-[11px] font-semibold tracking-wider uppercase flex items-center gap-1.5 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Invite Personnel</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Revenue */}
        <div className="bg-[#101014] border border-zinc-900 p-5 rounded-lg space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] uppercase tracking-widest font-semibold">
              Net Revenue
            </span>
            <TrendingUp className="w-4 h-4 text-brand-gold" />
          </div>
          <div className="font-serif text-2xl text-white font-bold tracking-tight">
            ${(analytics?.totalRevenue ?? 128450).toLocaleString()}
          </div>
          <div className="text-[10px] text-emerald-400 flex items-center gap-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+18.4% this cycle</span>
          </div>
        </div>

        {/* Orders Placed */}
        <div className="bg-[#101014] border border-zinc-900 p-5 rounded-lg space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] uppercase tracking-widest font-semibold">
              Total Orders
            </span>
            <Package className="w-4 h-4 text-brand-burgundy" />
          </div>
          <div className="font-serif text-2xl text-white font-bold tracking-tight">
            {analytics?.ordersCount ?? orders.length}
          </div>
          <div className="text-[10px] text-zinc-400">
            {analytics?.pendingOrdersCount ?? 2} pending fulfillment
          </div>
        </div>

        {/* Registered Clients */}
        <div className="bg-[#101014] border border-zinc-900 p-5 rounded-lg space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] uppercase tracking-widest font-semibold">
              Atelier Patrons
            </span>
            <Users className="w-4 h-4 text-brand-gold" />
          </div>
          <div className="font-serif text-2xl text-white font-bold tracking-tight">
            {analytics?.customersCount ?? 48}
          </div>
          <div className="text-[10px] text-zinc-400">Haute membership directory</div>
        </div>

        {/* Low Stock Watch */}
        <div className="bg-[#101014] border border-zinc-900 p-5 rounded-lg space-y-2">
          <div className="flex justify-between items-center text-zinc-500">
            <span className="text-[10px] uppercase tracking-widest font-semibold">
              Stock Warnings
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-serif text-2xl text-white font-bold tracking-tight">
            {lowStockPieces.length}
          </div>
          <div className="text-[10px] text-amber-400/80 font-medium">
            Requires inventory attention
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Products Catalog", tab: "products", icon: ShoppingBag },
          { label: "Dispatch Logistics", tab: "shipping", icon: Truck },
          { label: "Moderate Reviews", tab: "reviews", icon: Star },
          { label: "Patron Roster", tab: "customers", icon: Users },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.tab}
              onClick={() => setActiveTab(action.tab as AdminTabId)}
              className="bg-[#101014] hover:bg-[#14141a] border border-zinc-900 hover:border-zinc-800 p-3.5 rounded text-left transition-colors group flex items-center justify-between"
            >
              <div className="space-y-0.5">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block font-medium">
                  MANAGE
                </span>
                <span className="text-xs font-semibold text-zinc-200 group-hover:text-white uppercase tracking-wider">
                  {action.label}
                </span>
              </div>
              <Icon className="w-4 h-4 text-zinc-500 group-hover:text-brand-gold transition-colors" />
            </button>
          );
        })}
      </div>

      {/* Two Column Layout: Recent Orders + Low Stock Pieces */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders (2 cols) */}
        <div className="lg:col-span-2 bg-[#101014] border border-zinc-900 rounded-lg p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <div>
              <h3 className="font-serif text-base text-white uppercase tracking-wider font-semibold">
                Recent Atelier Acquisitions
              </h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
                Latest transactions requiring dispatch
              </p>
            </div>
            <button
              onClick={() => setActiveTab("orders")}
              className="text-[10px] text-brand-gold hover:underline uppercase tracking-wider font-semibold"
            >
              View All Orders &rarr;
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[9px] uppercase tracking-widest text-zinc-500 border-b border-zinc-900">
                <tr>
                  <th className="pb-2">Order #</th>
                  <th className="pb-2">Customer</th>
                  <th className="pb-2">Total</th>
                  <th className="pb-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/60 font-light">
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-zinc-500 text-xs">
                      No orders placed yet.
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((ord: any) => {
                    const id = ord.orderNumber || ord.id || "AUR-2026-001";
                    return (
                      <tr key={id} className="hover:bg-zinc-900/40 transition-colors">
                        <td className="py-3 font-mono text-zinc-300 font-medium">{id}</td>
                        <td className="py-3">
                          <span className="text-zinc-200 font-medium block">
                            {ord.customer?.name || "Patron"}
                          </span>
                          <span className="text-[10px] text-zinc-500">
                            {ord.customer?.email || ""}
                          </span>
                        </td>
                        <td className="py-3 font-serif text-brand-gold font-bold">
                          ${Number(ord.total || 0).toLocaleString()}
                        </td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                              ord.status === "Delivered"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                : ord.status === "Processing"
                                ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                : ord.status === "Cancelled"
                                ? "bg-red-500/10 text-red-400 border border-red-500/30"
                                : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                            }`}
                          >
                            {ord.status || "Pending"}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Alerts (1 col) */}
        <div className="bg-[#101014] border border-zinc-900 rounded-lg p-5 space-y-4">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
            <div>
              <h3 className="font-serif text-base text-white uppercase tracking-wider font-semibold">
                Low Inventory
              </h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
                Restock alerts (&le; 5 units)
              </p>
            </div>
            <button
              onClick={() => setActiveTab("inventory")}
              className="text-[10px] text-brand-gold hover:underline uppercase tracking-wider font-semibold"
            >
              Manage &rarr;
            </button>
          </div>

          <div className="space-y-3">
            {lowStockPieces.length === 0 ? (
              <p className="text-zinc-500 text-xs py-6 text-center">
                All catalog pieces adequately stocked.
              </p>
            ) : (
              lowStockPieces.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-2.5 rounded bg-zinc-900/40 border border-zinc-900"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-11 bg-zinc-900 rounded overflow-hidden flex-shrink-0 border border-zinc-800">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white uppercase truncate">
                        {p.name}
                      </p>
                      <span className="text-[9px] text-zinc-400 uppercase font-mono block">
                        {p.brand}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-red-400 font-mono px-2 py-0.5 rounded bg-red-950/30 border border-red-900/40">
                    {p.stockCount ?? 0} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};


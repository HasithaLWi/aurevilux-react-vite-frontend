import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ArrowLeft,
  Copy,
  Check,
  Search,
  Filter,
  X,
} from "lucide-react";
import type { Order, OrderItem } from "../../types";
import { LuxuryPagination } from "../common/LuxuryPagination";

interface OrdersTabProps {
  orders: Order[];
  selectedOrderId: string | null;
  setSelectedOrderId: (id: string | null) => void;
  copiedId: string | null;
  onCopyTracking: (tracking: string, id: string) => void;
  onCancelOrder: (id: string) => void;
  onReorder: (order: Order) => void;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({
  orders,
  selectedOrderId,
  setSelectedOrderId,
  copiedId,
  onCopyTracking,
  onCancelOrder,
  onReorder,
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [orderFilter, setOrderFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  const getActiveStepIndex = (status: string) => {
    switch (status) {
      case "Pending":
      case "Confirmed":
        return 0;
      case "Processing":
        return 1;
      case "In Transit":
        return 2;
      case "Delivered":
        return 3;
      default:
        return 0;
    }
  };

  const activeOrder = orders.find(
    (o) => o.id === selectedOrderId || o._id === selectedOrderId
  );

  // Search, Filter and Sort
  const filteredOrders = orders
    .filter((o) => {
      // Status filter
      if (orderFilter !== "ALL" && o.status.toUpperCase() !== orderFilter.toUpperCase()) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const idMatch = (o.orderNumber || o.id || o._id || "").toLowerCase().includes(query);
        const trackingMatch = (o.trackingNumber || "").toLowerCase().includes(query);
        const addressMatch = (
          o.address ||
          (o.shippingAddress && `${o.shippingAddress.street} ${o.shippingAddress.city}`) ||
          ""
        ).toLowerCase().includes(query);
        const itemMatch = (o.items || []).some(
          (it) =>
            (it.name || "").toLowerCase().includes(query) ||
            (it.brand || "").toLowerCase().includes(query)
        );

        if (!idMatch && !trackingMatch && !addressMatch && !itemMatch) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.date || a.createdAt || 0).getTime() - new Date(b.date || b.createdAt || 0).getTime();
      }
      if (sortBy === "highest") {
        return (b.total || 0) - (a.total || 0);
      }
      if (sortBy === "lowest") {
        return (a.total || 0) - (b.total || 0);
      }
      // default: newest
      return new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime();
    });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleFilterChange = (val: string) => {
    setOrderFilter(val);
    setCurrentPage(1);
  };

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    setCurrentPage(1);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setOrderFilter("ALL");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-8 animate-fade-in w-full">
      {activeOrder ? (
        // Order Detail Screen
        <div className="space-y-8 w-full">
          <div className="flex justify-between items-center pb-4 border-b border-zinc-900 flex-wrap gap-4">
            <button
              onClick={() => setSelectedOrderId(null)}
              className="flex items-center space-x-2 text-[10px] font-bold tracking-widest text-brand-gold hover:text-white transition-colors uppercase"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Orders List</span>
            </button>

            <div className="flex items-center space-x-3 text-xs">
              <span className="text-zinc-500 uppercase tracking-widest font-bold text-[9px]">
                STATUS:
              </span>
              <span
                className={`px-3 py-1 text-[9px] font-bold tracking-widest uppercase rounded border ${
                  activeOrder.status === "Delivered"
                    ? "bg-emerald-950/30 border-emerald-800 text-emerald-400"
                    : activeOrder.status === "Cancelled"
                    ? "bg-red-950/30 border-red-800 text-red-400"
                    : "bg-brand-burgundy/20 border-brand-gold/30 text-brand-gold"
                }`}
              >
                {activeOrder.status}
              </span>
            </div>
          </div>

          {/* Progress Stepper Timeline */}
          <div className="border border-zinc-900 bg-zinc-950/60 p-6 md:p-8 rounded-lg space-y-6 w-full">
            <div className="flex justify-between items-center text-[10px] tracking-widest text-zinc-500 font-bold uppercase">
              <span>SHIPMENT TRACKING PROGRESS</span>
              <span className="text-zinc-400 font-mono">
                {activeOrder.orderNumber || activeOrder.id}
              </span>
            </div>

            <div className="relative pt-4 pb-2 px-2">
              <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-zinc-800 -translate-y-1/2 z-0" />
              {activeOrder.status !== "Cancelled" && (
                <div
                  className="absolute top-1/2 left-4 h-[1px] bg-brand-gold -translate-y-1/2 z-0 transition-all duration-500"
                  style={{
                    width: `calc(${
                      (getActiveStepIndex(activeOrder.status) / 3) * 100
                    }% - 8px)`,
                  }}
                />
              )}

              <div className="relative z-10 flex justify-between">
                {[
                  { label: "Order Confirmed" },
                  { label: "Atelier Processing" },
                  { label: "In Transit" },
                  { label: "Delivered" },
                ].map((step, idx) => {
                  const activeIndex = getActiveStepIndex(activeOrder.status);
                  const isCompleted =
                    idx <= activeIndex && activeOrder.status !== "Cancelled";
                  const isActive =
                    idx === activeIndex && activeOrder.status !== "Cancelled";

                  return (
                    <div
                      key={step.label}
                      className="flex flex-col items-center space-y-2"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center border text-[10px] font-bold transition-all ${
                          activeOrder.status === "Cancelled"
                            ? "bg-zinc-900 border-zinc-800 text-zinc-600"
                            : isCompleted
                            ? "bg-brand-black border-brand-gold text-brand-gold shadow-[0_0_12px_rgba(197,168,128,0.25)]"
                            : "bg-zinc-900 border-zinc-800 text-zinc-600"
                        }`}
                      >
                        {isCompleted ? (
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        ) : (
                          idx + 1
                        )}
                      </div>
                      <span
                        className={`text-[8.5px] tracking-widest uppercase font-bold text-center ${
                          activeOrder.status === "Cancelled"
                            ? "text-zinc-600"
                            : isActive
                            ? "text-brand-gold"
                            : isCompleted
                            ? "text-white"
                            : "text-zinc-500"
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Tracking Number Bar */}
            {activeOrder.trackingNumber && (
              <div className="border-t border-zinc-900 pt-5 flex items-center justify-between flex-wrap gap-4">
                <div className="text-xs">
                  <span className="text-zinc-500 text-[10px] uppercase tracking-widest block">
                    Carrier & Waybill
                  </span>
                  <span className="font-mono text-brand-gold font-semibold">
                    {activeOrder.carrier || "DHL Express"} &middot;{" "}
                    {activeOrder.trackingNumber}
                  </span>
                </div>
                <button
                  onClick={() =>
                    onCopyTracking(
                      activeOrder.trackingNumber!,
                      activeOrder.id
                    )
                  }
                  className="inline-flex items-center space-x-1.5 border border-zinc-800 hover:border-brand-gold px-3.5 py-1.5 rounded text-[10px] font-bold tracking-widest text-white hover:text-brand-gold uppercase transition-colors"
                >
                  {copiedId === activeOrder.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Tracking #</span>
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Items & Financial Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start w-full">
            <div className="lg:col-span-8 border border-zinc-900 bg-zinc-950/50 p-6 rounded-lg space-y-4">
              <h3 className="font-serif text-sm uppercase tracking-wider text-white border-b border-zinc-900 pb-3">
                Ordered Silhouettes
              </h3>
              <div className="divide-y divide-zinc-900">
                {activeOrder.items?.map((item: OrderItem, i: number) => (
                  <div
                    key={item.id || i}
                    className="py-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center space-x-3.5">
                      <img
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1539533018447-63fcce667883?auto=format&fit=crop&w=300&q=80"
                        }
                        alt={item.name}
                        className="w-14 h-18 object-cover rounded bg-zinc-950 border border-zinc-800"
                      />
                      <div className="space-y-0.5">
                        <span className="text-[9px] text-brand-gold font-bold tracking-widest uppercase">
                          {item.brand}
                        </span>
                        <h4 className="font-serif text-xs text-white uppercase">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-zinc-500">
                          Color: {item.selectedColor || item.color || "Standard"} &middot; Size:{" "}
                          {item.selectedSize || item.size || "M"} &middot; Qty: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-serif text-sm text-brand-gold font-bold">
                      ${(item.price * item.quantity).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Order Action Buttons */}
              <div className="pt-4 border-t border-zinc-900 flex justify-end gap-3">
                {activeOrder.status !== "Cancelled" &&
                  activeOrder.status !== "Delivered" && (
                    <button
                      onClick={() =>
                        onCancelOrder(activeOrder.id || activeOrder._id!)
                      }
                      className="border border-red-900/60 hover:bg-red-950/40 text-red-400 text-[10px] font-bold tracking-widest px-4 py-2 rounded uppercase transition-colors"
                    >
                      Cancel Order
                    </button>
                  )}
                <button
                  onClick={() => onReorder(activeOrder)}
                  className="bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-[10px] font-bold tracking-widest px-5 py-2 rounded uppercase transition-colors"
                >
                  Buy It Again
                </button>
              </div>
            </div>

            {/* Summary & Shipping Address */}
            <div className="lg:col-span-4 border border-zinc-900 bg-zinc-950/50 p-6 rounded-lg space-y-5">
              <h3 className="font-serif text-sm uppercase tracking-wider text-white border-b border-zinc-900 pb-3">
                Order Summary
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-zinc-400">
                  <span>Subtotal</span>
                  <span>${activeOrder.total?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>White-Glove Shipping</span>
                  <span className="text-brand-gold">Complimentary</span>
                </div>
                <div className="flex justify-between text-zinc-400">
                  <span>Luxury Tax Included</span>
                  <span>$0</span>
                </div>
                <div className="flex justify-between text-white font-serif font-bold text-sm pt-2 border-t border-zinc-900">
                  <span>Total Paid</span>
                  <span className="text-brand-gold">
                    ${activeOrder.total?.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-zinc-900 space-y-1 text-xs">
                <span className="text-[9px] uppercase tracking-widest text-zinc-500 font-bold block">
                  Delivery Destination
                </span>
                <p className="text-zinc-300">
                  {activeOrder.address ||
                    (activeOrder.shippingAddress &&
                      `${activeOrder.shippingAddress.street}, ${activeOrder.shippingAddress.city}`) ||
                    "Private Client Address"}
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Orders List Screen
        <div className="space-y-6 w-full">
          <div className="flex justify-between items-center border-b border-zinc-900 pb-4 flex-wrap gap-4">
            <div>
              <h2 className="font-serif text-2xl text-white uppercase tracking-wider">
                Orders History
              </h2>
              <p className="text-xs text-zinc-500 mt-0.5">
                Review and track all past and ongoing bespoke acquisitions ({filteredOrders.length} found).
              </p>
            </div>
          </div>

          {/* Top Control Bar: Search & Selectors (No sidebars) */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by order #, piece name, brand, or tracking..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full bg-[#101014] border border-zinc-900 text-xs pl-9 pr-9 py-2.5 rounded text-white placeholder-zinc-500 outline-none focus:border-brand-gold/50 transition-colors"
              />
              {searchTerm && (
                <button
                  onClick={() => handleSearchChange("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  title="Clear search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Selectors Group */}
            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Status Selector */}
              <div className="flex items-center gap-1.5 bg-[#101014] border border-zinc-900 rounded px-2.5 py-1">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <select
                  value={orderFilter}
                  onChange={(e) => handleFilterChange(e.target.value)}
                  className="bg-transparent text-xs text-zinc-300 outline-none uppercase tracking-wider py-1.5 cursor-pointer"
                >
                  <option value="ALL" className="bg-[#101014] text-white">All Statuses</option>
                  <option value="PENDING" className="bg-[#101014] text-white">Pending</option>
                  <option value="CONFIRMED" className="bg-[#101014] text-white">Confirmed</option>
                  <option value="PROCESSING" className="bg-[#101014] text-white">Processing</option>
                  <option value="IN TRANSIT" className="bg-[#101014] text-white">In Transit</option>
                  <option value="DELIVERED" className="bg-[#101014] text-white">Delivered</option>
                  <option value="CANCELLED" className="bg-[#101014] text-white">Cancelled</option>
                </select>
              </div>

              {/* Sort Selector */}
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-[#101014] border border-zinc-900 text-xs px-3 py-2.5 rounded text-zinc-300 outline-none uppercase tracking-wider cursor-pointer"
              >
                <option value="newest" className="bg-[#101014] text-white">Newest First</option>
                <option value="oldest" className="bg-[#101014] text-white">Oldest First</option>
                <option value="highest" className="bg-[#101014] text-white">Price: High to Low</option>
                <option value="lowest" className="bg-[#101014] text-white">Price: Low to High</option>
              </select>

              {(searchTerm || orderFilter !== "ALL" || sortBy !== "newest") && (
                <button
                  onClick={handleClearFilters}
                  className="text-[10px] text-zinc-400 hover:text-brand-gold uppercase tracking-widest px-2.5 py-2 underline"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="py-20 text-center border border-dashed border-zinc-800 rounded-lg space-y-4">
              <Package className="w-10 h-10 text-zinc-700 mx-auto" />
              <p className="font-serif text-sm tracking-wider text-zinc-400 uppercase">
                NO ORDERS FOUND MATCHING YOUR SELECTION
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-brand-gold underline uppercase tracking-widest font-bold"
                >
                  Clear Filters
                </button>
                <span className="text-zinc-600">&bull;</span>
                <Link
                  to="/shop"
                  className="bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-[10px] font-bold tracking-[0.2em] px-5 py-2 rounded transition-all uppercase"
                >
                  Explore Boutique
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4 w-full">
              {paginatedOrders.map((ord) => (
                <div
                  key={ord.id || ord._id}
                  className="border border-zinc-900 hover:border-zinc-800 bg-zinc-950/60 p-5 rounded-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all w-full"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-16 bg-zinc-900 border border-zinc-800 rounded overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {ord.items?.[0]?.image ? (
                        <img
                          src={ord.items[0].image}
                          alt="item"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="w-5 h-5 text-zinc-650" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <span className="font-mono text-xs font-bold text-white block">
                        {ord.orderNumber || ord.id}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">
                        Ordered {ord.date || "Recently"} &middot; {ord.itemsCount || ord.items?.length || 1} item(s)
                      </span>
                      {ord.trackingNumber && (
                        <span className="text-[10px] font-mono text-zinc-400 block">
                          Track: {ord.trackingNumber}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between w-full md:w-auto gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-zinc-900">
                    <span
                      className={`px-3 py-1 text-[9px] font-bold tracking-widest uppercase rounded border ${
                        ord.status === "Delivered"
                          ? "bg-emerald-950/25 border-emerald-900 text-emerald-400"
                          : ord.status === "Cancelled"
                          ? "bg-red-950/25 border-red-900 text-red-400"
                          : "bg-brand-burgundy/20 border-brand-gold/30 text-brand-gold"
                      }`}
                    >
                      {ord.status}
                    </span>
                    <span className="font-serif text-sm text-brand-gold font-bold">
                      ${ord.total?.toLocaleString()}
                    </span>
                    <button
                      onClick={() =>
                        setSelectedOrderId(ord.id || ord._id || null)
                      }
                      className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-brand-gold text-white text-[10px] font-bold tracking-widest px-4 py-2 rounded uppercase transition-colors"
                    >
                      Track & Details
                    </button>
                  </div>
                </div>
              ))}

              {/* Complete Pagination */}
              <LuxuryPagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredOrders.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                itemName="orders"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};


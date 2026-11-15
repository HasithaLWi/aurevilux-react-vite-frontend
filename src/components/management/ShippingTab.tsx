import React, { useState } from "react";
import { Truck, X, Search, Filter } from "lucide-react";
import type { Order } from "../../types";
import { OrderService } from "../../services/order.service";
import { LuxuryPagination } from "../common/LuxuryPagination";
import { useLuxuryAlert } from "../../context/LuxuryAlertContext";

interface ShippingTabProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

export const ShippingTab: React.FC<ShippingTabProps> = ({ orders, setOrders }) => {
  const { showAlert } = useLuxuryAlert();
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [carrier, setCarrier] = useState("DHL Express Elite");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [estimatedDelivery, setEstimatedDelivery] = useState("3-5 Business Days");

  const [searchTerm, setSearchTerm] = useState("");
  const [carrierFilter, setCarrierFilter] = useState("all");
  const [dispatchStatus, setDispatchStatus] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleOpenDispatch = (order: Order) => {
    setSelectedOrder(order);
    setCarrier(order.carrier || "DHL Express Elite");
    setTrackingNumber(order.trackingNumber || "");
    setEstimatedDelivery(order.estimatedDelivery || "3-5 Business Days");
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    const id = selectedOrder.id || selectedOrder.orderNumber || (selectedOrder as any)._id;

    try {
      await OrderService.updateTracking(id, carrier, trackingNumber, estimatedDelivery);
      showAlert("success", `Consignment dispatched via ${carrier}. Tracking: ${trackingNumber}`);
    } catch (e: any) {
      showAlert("error", "Failed to update tracking: " + (e.response?.data?.message || e.message));
      return;
    }

    setOrders((prev) =>
      prev.map((o) => {
        const oId = o.id || o.orderNumber || (o as any)._id;
        return oId === id
          ? {
              ...o,
              carrier,
              trackingNumber,
              estimatedDelivery,
              status: "In Transit" as any,
            }
          : o;
      })
    );

    setSelectedOrder(null);
  };

  const filteredOrders = orders
    .filter((o: any) => {
      const id = o.orderNumber || o.id || o._id || "";
      const name = o.customer?.name || o.name || "";
      const city = o.shippingAddress?.city || "";
      const country = o.shippingAddress?.country || "";
      const orderCarrier = o.carrier || "";
      const track = o.trackingNumber || "";

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const idMatch = id.toLowerCase().includes(q);
        const nameMatch = name.toLowerCase().includes(q);
        const locMatch = `${city} ${country}`.toLowerCase().includes(q);
        const carrierMatch = orderCarrier.toLowerCase().includes(q);
        const trackMatch = track.toLowerCase().includes(q);
        if (!idMatch && !nameMatch && !locMatch && !carrierMatch && !trackMatch) {
          return false;
        }
      }

      if (carrierFilter !== "all" && orderCarrier !== carrierFilter) {
        return false;
      }

      if (dispatchStatus === "dispatched" && !track) return false;
      if (dispatchStatus === "awaiting" && track) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.date || a.createdAt || 0).getTime() - new Date(b.date || b.createdAt || 0).getTime();
      }
      if (sortBy === "valuation-desc") {
        return (b.total || 0) - (a.total || 0);
      }
      if (sortBy === "valuation-asc") {
        return (a.total || 0) - (b.total || 0);
      }
      return new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime();
    });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClearFilters = () => {
    setSearchTerm("");
    setCarrierFilter("all");
    setDispatchStatus("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5">
        <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
          GLOBAL ATELIER DISPATCH
        </span>
        <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
          White-Glove Shipping & Couriers ({filteredOrders.length})
        </h1>
      </div>

      {/* Control Bar: Search & Selectors (No sidebars) */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search consignments by Order Ref, recipient, destination, or tracking..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#101014] border border-zinc-900 text-xs pl-9 pr-9 py-2.5 rounded text-white placeholder-zinc-500 outline-none focus:border-brand-gold/50"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Selectors Group */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Courier Selector */}
          <div className="flex items-center gap-1.5 bg-[#101014] border border-zinc-900 rounded px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={carrierFilter}
              onChange={(e) => {
                setCarrierFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-zinc-300 outline-none uppercase tracking-wider py-1.5 cursor-pointer"
            >
              <option value="all" className="bg-[#101014] text-white">All Couriers</option>
              <option value="DHL Express Elite" className="bg-[#101014] text-white">DHL Express Elite</option>
              <option value="FedEx International Priority" className="bg-[#101014] text-white">FedEx Priority</option>
              <option value="Aurevilux Private Concierge" className="bg-[#101014] text-white">Private Concierge</option>
            </select>
          </div>

          {/* Dispatch Status */}
          <select
            value={dispatchStatus}
            onChange={(e) => {
              setDispatchStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#101014] border border-zinc-900 text-xs px-3 py-2.5 rounded text-zinc-300 outline-none uppercase tracking-wider cursor-pointer"
          >
            <option value="all" className="bg-[#101014] text-white">All Dispatches</option>
            <option value="dispatched" className="bg-[#101014] text-white">Dispatched (Has Tracking)</option>
            <option value="awaiting" className="bg-[#101014] text-white">Awaiting Dispatch</option>
          </select>

          {/* Sort By */}
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
            <option value="valuation-desc" className="bg-[#101014] text-white">Valuation: High to Low</option>
            <option value="valuation-asc" className="bg-[#101014] text-white">Valuation: Low to High</option>
          </select>

          {(searchTerm || carrierFilter !== "all" || dispatchStatus !== "all" || sortBy !== "newest") && (
            <button
              onClick={handleClearFilters}
              className="text-[10px] text-zinc-400 hover:text-brand-gold uppercase tracking-widest px-2 py-2 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      <div className="bg-[#101014] border border-zinc-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-900/60 text-zinc-500 uppercase text-[9px] tracking-widest font-semibold border-b border-zinc-900">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Recipient & Destination</th>
                <th className="py-3 px-4">Valuation</th>
                <th className="py-3 px-4">Courier Partner</th>
                <th className="py-3 px-4">Tracking Code</th>
                <th className="py-3 px-4 text-right">Logistics Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 font-light">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    No consignments match your logistics search or filter.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((o: any) => {
                  const id = o.orderNumber || o.id || o._id;
                  return (
                    <tr key={id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-white">{id}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-zinc-200">
                          {o.customer?.name || o.name || "Client"}
                        </p>
                        <span className="text-[10px] text-zinc-400 block">
                          {o.shippingAddress?.city}, {o.shippingAddress?.country || "International"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-serif text-brand-gold font-bold">
                        ${Number(o.total || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-zinc-300 font-medium">
                        {o.carrier || "DHL Express Elite"}
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-400 text-[11px]">
                        {o.trackingNumber ? (
                          <span className="text-emerald-400 font-bold">{o.trackingNumber}</span>
                        ) : (
                          <span className="text-zinc-600 italic">Awaiting Courier Dispatch</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleOpenDispatch(o)}
                          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-brand-gold rounded text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1.5"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{o.trackingNumber ? "Update Tracking" : "Dispatch Order"}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Complete Luxury Pagination */}
        <div className="px-4 pb-4">
          <LuxuryPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredOrders.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemName="shipments"
          />
        </div>
      </div>

      {/* Dispatch Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#101014] border border-zinc-800 rounded-lg max-w-md w-full p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-base text-white uppercase tracking-wider font-bold">
                Assign Dispatch: {selectedOrder.orderNumber || selectedOrder.id}
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTracking} className="space-y-3.5">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Courier Service Partner
                </label>
                <select
                  value={carrier}
                  onChange={(e) => setCarrier(e.target.value)}
                  className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none cursor-pointer"
                >
                  <option value="DHL Express Elite">DHL Express Elite Worldwide</option>
                  <option value="FedEx Private Luxe">FedEx Private Luxe Priority</option>
                  <option value="Ferrari Logistics">Ferrari Group Haute Logistics (Valuables)</option>
                  <option value="Malca-Amit">Malca-Amit Luxury Security Express</option>
                  <option value="Aurevilux Private Concierge">Aurevilux Private White-Glove Concierge</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Tracking / Waybill Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. AUR-EXP-9081249"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Estimated Delivery Window
                </label>
                <input
                  type="text"
                  value={estimatedDelivery}
                  onChange={(e) => setEstimatedDelivery(e.target.value)}
                  className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white text-xs uppercase rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold uppercase rounded tracking-wider"
                >
                  Confirm Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

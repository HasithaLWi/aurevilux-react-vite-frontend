import React, { useState } from "react";
import { Search, Filter, Eye, X } from "lucide-react";
import type { Order } from "../../types";
import { OrderService } from "../../services/order.service";
import { LuxuryPagination } from "../common/LuxuryPagination";

interface OrdersTabProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ orders, setOrders }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [carrierFilter, setCarrierFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    try {
      await OrderService.updateOrderStatus(orderId, nextStatus);
    } catch (e: any) {
      alert("Failed to update status: " + (e.response?.data?.message || e.message));
      return;
    }

    setOrders((prev) =>
      prev.map((o) => {
        const id = o.id || o.orderNumber || (o as any)._id;
        return id === orderId ? { ...o, status: nextStatus as any } : o;
      })
    );

    if (selectedOrder) {
      setSelectedOrder((prev) => (prev ? { ...prev, status: nextStatus as any } : null));
    }
  };

  const filteredOrders = orders
    .filter((o) => {
      const id = o.id || o.orderNumber || (o as any)._id || "";
      const name = o.customer?.name || (o as any).name || "";
      const email = o.customer?.email || (o as any).email || "";
      const tracking = o.trackingNumber || "";

      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const idMatch = id.toLowerCase().includes(query);
        const nameMatch = name.toLowerCase().includes(query);
        const emailMatch = email.toLowerCase().includes(query);
        const trackingMatch = tracking.toLowerCase().includes(query);
        const itemMatch = (o.items || []).some(
          (it: any) =>
            (it.name || "").toLowerCase().includes(query) ||
            (it.brand || "").toLowerCase().includes(query)
        );
        if (!idMatch && !nameMatch && !emailMatch && !trackingMatch && !itemMatch) {
          return false;
        }
      }

      if (statusFilter !== "all" && o.status !== statusFilter) {
        return false;
      }

      if (carrierFilter !== "all") {
        if (carrierFilter === "unassigned") {
          if (o.trackingNumber) return false;
        } else {
          if (o.carrier !== carrierFilter) return false;
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
      return new Date(b.date || b.createdAt || 0).getTime() - new Date(a.date || a.createdAt || 0).getTime();
    });

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage) || 1;
  const paginatedOrders = filteredOrders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setCarrierFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
            ATELIER LOGISTICS
          </span>
          <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
            Order Fulfillment & Invoicing ({filteredOrders.length})
          </h1>
        </div>
      </div>

      {/* Control Bar: Search & Selectors (No sidebars) */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search orders by Order Number, client name, email, piece or tracking..."
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
          {/* Status */}
          <div className="flex items-center gap-1.5 bg-[#101014] border border-zinc-900 rounded px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-zinc-300 outline-none uppercase tracking-wider py-1.5 cursor-pointer"
            >
              <option value="all" className="bg-[#101014] text-white">All Statuses</option>
              <option value="Pending" className="bg-[#101014] text-white">Pending</option>
              <option value="Confirmed" className="bg-[#101014] text-white">Confirmed</option>
              <option value="Processing" className="bg-[#101014] text-white">Processing</option>
              <option value="In Transit" className="bg-[#101014] text-white">In Transit</option>
              <option value="Delivered" className="bg-[#101014] text-white">Delivered</option>
              <option value="Cancelled" className="bg-[#101014] text-white">Cancelled</option>
            </select>
          </div>

          {/* Courier Partner */}
          <select
            value={carrierFilter}
            onChange={(e) => {
              setCarrierFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#101014] border border-zinc-900 text-xs px-3 py-2.5 rounded text-zinc-300 outline-none uppercase tracking-wider cursor-pointer"
          >
            <option value="all" className="bg-[#101014] text-white">All Couriers</option>
            <option value="DHL Express Elite" className="bg-[#101014] text-white">DHL Express</option>
            <option value="FedEx Private Luxe" className="bg-[#101014] text-white">FedEx Luxe</option>
            <option value="Ferrari Logistics" className="bg-[#101014] text-white">Ferrari Logistics</option>
            <option value="Malca-Amit" className="bg-[#101014] text-white">Malca-Amit</option>
            <option value="unassigned" className="bg-[#101014] text-white">Unassigned Tracking</option>
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
            <option value="highest" className="bg-[#101014] text-white">Total: High to Low</option>
            <option value="lowest" className="bg-[#101014] text-white">Total: Low to High</option>
          </select>

          {(searchTerm || statusFilter !== "all" || carrierFilter !== "all" || sortBy !== "newest") && (
            <button
              onClick={handleClearFilters}
              className="text-[10px] text-zinc-400 hover:text-brand-gold uppercase tracking-widest px-2 py-2 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#101014] border border-zinc-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-900/60 text-zinc-500 uppercase text-[9px] tracking-widest font-semibold border-b border-zinc-900">
              <tr>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Patron</th>
                <th className="py-3 px-4">Pieces</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Status Workflow</th>
                <th className="py-3 px-4">Courier & Tracking</th>
                <th className="py-3 px-4 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 font-light">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No atelier orders match your current filter.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((ord: any) => {
                  const id = ord.orderNumber || ord.id || ord._id;
                  return (
                    <tr key={id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-white">{id}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-zinc-200">
                          {ord.customer?.name || ord.name || "Client"}
                        </p>
                        <span className="text-[10px] text-zinc-500 block">
                          {ord.customer?.email || ord.email || ""}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-zinc-400">
                        {ord.itemsCount || ord.items?.length || 1} items
                      </td>
                      <td className="py-3 px-4 font-serif text-brand-gold font-bold">
                        ${Number(ord.total || 0).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={ord.status || "Pending"}
                          onChange={(e) => handleStatusChange(id, e.target.value)}
                          className="bg-brand-black border border-zinc-800 text-[11px] px-2 py-1 rounded text-zinc-200 outline-none font-medium uppercase cursor-pointer"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Confirmed">Confirmed</option>
                          <option value="Processing">Processing</option>
                          <option value="In Transit">In Transit</option>
                          <option value="Delivered">Delivered</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 font-mono text-[10px] text-zinc-400">
                        {ord.trackingNumber ? (
                          <div>
                            <span className="text-zinc-200 font-semibold">{ord.trackingNumber}</span>
                            <span className="text-zinc-500 block text-[9px]">{ord.carrier || "DHL Express"}</span>
                          </div>
                        ) : (
                          <span className="text-zinc-600 italic">Unassigned</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded text-[10px] uppercase font-semibold inline-flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Inspect</span>
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
            itemName="orders"
          />
        </div>
      </div>

      {/* Inspect Order Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#101014] border border-zinc-800 rounded-lg max-w-xl w-full p-6 space-y-5 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[9px] text-brand-gold uppercase tracking-[0.25em] font-bold">
                  ORDER SPECIFICATION
                </span>
                <h3 className="font-serif text-lg text-white uppercase tracking-wider font-bold">
                  {selectedOrder.orderNumber || selectedOrder.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Patron & Destination */}
            <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-900/40 p-3 rounded border border-zinc-900">
              <div>
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block">
                  Client Profile
                </span>
                <p className="text-white font-medium mt-1">
                  {selectedOrder.customer?.name || (selectedOrder as any).name || "Patron"}
                </p>
                <p className="text-zinc-400">
                  {selectedOrder.customer?.email || (selectedOrder as any).email}
                </p>
                <p className="text-zinc-400">{selectedOrder.customer?.phone || ""}</p>
              </div>
              <div>
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block">
                  Delivery Destination
                </span>
                <p className="text-white font-medium mt-1">
                  {selectedOrder.shippingAddress?.street}
                </p>
                <p className="text-zinc-400">
                  {selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.state}{" "}
                  {selectedOrder.shippingAddress?.postalCode}
                </p>
                <p className="text-zinc-400">{selectedOrder.shippingAddress?.country}</p>
              </div>
            </div>

            {/* Ordered Pieces */}
            <div className="space-y-2">
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                Acquisitions ({(selectedOrder.items || []).length} items)
              </span>
              <div className="space-y-2 divide-y divide-zinc-900">
                {(selectedOrder.items || []).map((item: any, idx: number) => (
                  <div key={idx} className="pt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-12 bg-zinc-900 rounded overflow-hidden border border-zinc-800 flex-shrink-0">
                        {item.image && (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        )}
                      </div>
                      <div>
                        <p className="font-serif text-white uppercase text-xs font-semibold">
                          {item.name}
                        </p>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          Qty: {item.quantity || 1} &bull; Size: {item.selectedSize || "Standard"}
                        </span>
                      </div>
                    </div>
                    <span className="font-serif text-white font-bold text-sm">
                      ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary */}
            <div className="pt-3 border-t border-zinc-800 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">
                  Total Settlement
                </span>
                <span className="font-serif text-xl text-brand-gold font-bold">
                  ${Number(selectedOrder.total || 0).toLocaleString()}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest block">
                  Current Status
                </span>
                <span className="text-xs font-bold uppercase text-white font-mono">
                  {selectedOrder.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

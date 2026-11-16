import React, { useState } from "react";
import { Search, Filter, Eye, X, Plus, Loader2 } from "lucide-react";
import type { Order } from "../../types";
import { OrderService } from "../../services/order.service";
import { LuxuryPagination } from "../common/LuxuryPagination";
import { OrderDetailPanel } from "./OrderDetailPanel";
import { useLuxuryAlert } from "../../context/LuxuryAlertContext";

interface OrdersTabProps {
  orders: Order[];
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>;
}

export const OrdersTab: React.FC<OrdersTabProps> = ({ orders, setOrders }) => {
  const { showAlert } = useLuxuryAlert();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [carrierFilter, setCarrierFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // VIP Order Creation State
  const [isCreatingVIPOrder, setIsCreatingVIPOrder] = useState(false);
  const [isSubmittingVIP, setIsSubmittingVIP] = useState(false);
  const [vipForm, setVipForm] = useState({
    name: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "United States",
    itemName: "",
    brand: "Saint Laurent",
    price: 1500,
    quantity: 1,
    size: "M",
    color: "Noir Onyx",
    carrier: "DHL Express Elite",
  });

  const handleStatusChange = async (orderId: string, nextStatus: string) => {
    try {
      await OrderService.updateOrderStatus(orderId, nextStatus);
      showAlert("success", `Order status transitioned to ${nextStatus}.`);
    } catch (e: any) {
      showAlert("error", "Failed to update status: " + (e.response?.data?.message || e.message));
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

  const handleUpdateFromPanel = (updatedOrder: Order) => {
    const id = updatedOrder.id || updatedOrder.orderNumber || (updatedOrder as any)._id;
    setOrders((prev) =>
      prev.map((o) => {
        const oId = o.id || o.orderNumber || (o as any)._id;
        return oId === id ? updatedOrder : o;
      })
    );
    setSelectedOrder(updatedOrder);
  };

  const handleCreateVIPOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vipForm.name || !vipForm.email || !vipForm.street || !vipForm.city || !vipForm.itemName) {
      showAlert("warning", "Please fill in all client and piece requirements.");
      return;
    }

    setIsSubmittingVIP(true);
    try {
      const payload = {
        customer: {
          name: vipForm.name.trim(),
          email: vipForm.email.trim(),
          phone: vipForm.phone.trim(),
        },
        shippingAddress: {
          street: vipForm.street.trim(),
          city: vipForm.city.trim(),
          state: vipForm.state.trim() || vipForm.city.trim(),
          postalCode: vipForm.postalCode.trim(),
          country: vipForm.country.trim(),
        },
        items: [
          {
            name: vipForm.itemName.trim(),
            brand: vipForm.brand,
            price: Number(vipForm.price),
            quantity: Number(vipForm.quantity),
            selectedSize: vipForm.size,
            selectedColor: vipForm.color,
          },
        ],
        itemsCount: Number(vipForm.quantity),
        total: Number(vipForm.price) * Number(vipForm.quantity),
        carrier: vipForm.carrier,
        paymentMethod: "credit" as const,
      };

      const created = await OrderService.createOrder(payload);
      setOrders((prev) => [created, ...prev]);
      setIsCreatingVIPOrder(false);
      showAlert("success", `VIP Bespoke Consignment ${created.orderNumber || ""} booked.`);
    } catch (err: any) {
      showAlert("error", "Failed to book VIP order: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmittingVIP(false);
    }
  };

  // If inspecting an order, render full-page OrderDetailPanel
  if (selectedOrder) {
    return (
      <OrderDetailPanel
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onUpdateOrder={handleUpdateFromPanel}
      />
    );
  }

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
    <div className="space-y-6 w-full text-left animate-fade-in">
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
        <button
          onClick={() => setIsCreatingVIPOrder(true)}
          className="bg-brand-burgundy hover:bg-brand-burgundyHover text-white px-4 py-2 rounded text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors shadow-md shadow-brand-burgundy/20"
        >
          <Plus className="w-4 h-4" />
          <span>Book VIP Phone Order</span>
        </button>
      </div>

      {/* Control Bar: Search & Selectors */}
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
                <th className="py-3 px-4">Courier Logistics</th>
                <th className="py-3 px-4 text-right">Actions</th>
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
                      <td className="py-3 px-4 text-zinc-300">
                        <span className="text-zinc-200 font-medium block">
                          {ord.carrier || "DHL Express Elite"}
                        </span>
                        {ord.estimatedDelivery && (
                          <span className="text-zinc-500 block text-[9px] font-mono">
                            {ord.estimatedDelivery}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white rounded text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1.5 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5 text-brand-gold" />
                          <span>Manage Order</span>
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

      {/* VIP Phone / Bespoke Booking Modal */}
      {isCreatingVIPOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#101014] border border-zinc-800 rounded-xl max-w-xl w-full p-6 space-y-5 text-left max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[9px] uppercase tracking-[0.25em] text-brand-gold font-bold">
                  CONCIERGE DESK
                </span>
                <h3 className="font-serif text-lg text-white uppercase tracking-wider font-bold">
                  Book VIP Phone / Bespoke Order
                </h3>
              </div>
              <button
                onClick={() => setIsCreatingVIPOrder(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateVIPOrder} className="space-y-4">
              {/* Client Dossier */}
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block border-b border-zinc-900 pb-1">
                  1. Patron Contact Dossier
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Patron Full Name *"
                    value={vipForm.name}
                    onChange={(e) => setVipForm({ ...vipForm, name: e.target.value })}
                    className="bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Contact Email *"
                    value={vipForm.email}
                    onChange={(e) => setVipForm({ ...vipForm, email: e.target.value })}
                    className="bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                  />
                </div>
                <input
                  type="tel"
                  placeholder="Telephone Contact (e.g. +1 555 123 4567)"
                  value={vipForm.phone}
                  onChange={(e) => setVipForm({ ...vipForm, phone: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                />
              </div>

              {/* Delivery Address */}
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block border-b border-zinc-900 pb-1">
                  2. Destination Specification
                </span>
                <input
                  type="text"
                  required
                  placeholder="Street Address *"
                  value={vipForm.street}
                  onChange={(e) => setVipForm({ ...vipForm, street: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="City *"
                    value={vipForm.city}
                    onChange={(e) => setVipForm({ ...vipForm, city: e.target.value })}
                    className="bg-[#0a0a0c] border border-zinc-800 text-xs px-2.5 py-2 rounded text-white outline-none focus:border-brand-gold"
                  />
                  <input
                    type="text"
                    placeholder="State / Region"
                    value={vipForm.state}
                    onChange={(e) => setVipForm({ ...vipForm, state: e.target.value })}
                    className="bg-[#0a0a0c] border border-zinc-800 text-xs px-2.5 py-2 rounded text-white outline-none focus:border-brand-gold"
                  />
                  <input
                    type="text"
                    placeholder="Postal Code"
                    value={vipForm.postalCode}
                    onChange={(e) => setVipForm({ ...vipForm, postalCode: e.target.value })}
                    className="bg-[#0a0a0c] border border-zinc-800 text-xs px-2.5 py-2 rounded text-white outline-none focus:border-brand-gold"
                  />
                  <input
                    type="text"
                    placeholder="Country"
                    value={vipForm.country}
                    onChange={(e) => setVipForm({ ...vipForm, country: e.target.value })}
                    className="bg-[#0a0a0c] border border-zinc-800 text-xs px-2.5 py-2 rounded text-white outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              {/* Piece Specification */}
              <div className="space-y-3">
                <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block border-b border-zinc-900 pb-1">
                  3. Piece & Settlement Details
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    required
                    placeholder="Piece Title (e.g. Silk Velvet Gown) *"
                    value={vipForm.itemName}
                    onChange={(e) => setVipForm({ ...vipForm, itemName: e.target.value })}
                    className="bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                  />
                  <input
                    type="text"
                    placeholder="Maison / Brand"
                    value={vipForm.brand}
                    onChange={(e) => setVipForm({ ...vipForm, brand: e.target.value })}
                    className="bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-[9px] text-zinc-500 uppercase block mb-1">Unit Valuation ($)</label>
                    <input
                      type="number"
                      min={1}
                      value={vipForm.price}
                      onChange={(e) => setVipForm({ ...vipForm, price: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-1.5 rounded text-brand-gold font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-500 uppercase block mb-1">Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={vipForm.quantity}
                      onChange={(e) => setVipForm({ ...vipForm, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-1.5 rounded text-white font-mono outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[9px] text-zinc-500 uppercase block mb-1">Size</label>
                    <input
                      type="text"
                      value={vipForm.size}
                      onChange={(e) => setVipForm({ ...vipForm, size: e.target.value })}
                      className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-1.5 rounded text-white font-mono outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Courier Selection */}
              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Assigned Private Courier
                </label>
                <select
                  value={vipForm.carrier}
                  onChange={(e) => setVipForm({ ...vipForm, carrier: e.target.value })}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none cursor-pointer"
                >
                  <option value="DHL Express Elite">DHL Express Elite Worldwide</option>
                  <option value="Ferrari Logistics">Ferrari Group Haute Logistics (Valuables)</option>
                  <option value="FedEx Private Luxe">FedEx Private Luxe Priority</option>
                  <option value="Malca-Amit Security">Malca-Amit Armored Vault Delivery</option>
                  <option value="Aurevilux Private Concierge">Aurevilux White-Glove Hand Courier</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreatingVIPOrder(false)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white text-xs uppercase rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingVIP}
                  className="px-5 py-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold uppercase tracking-widest rounded flex items-center gap-2 shadow-lg shadow-brand-burgundy/20"
                >
                  {isSubmittingVIP && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Authorize VIP Booking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

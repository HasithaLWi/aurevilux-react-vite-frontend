import React, { useState } from "react";
import {
  ArrowLeft,
  Truck,
  CheckCircle,
  Clock,
  Package,
  User,
  MapPin,
  Loader2,
} from "lucide-react";
import type { Order } from "../../types";
import { OrderService } from "../../services/order.service";
import { useLuxuryAlert } from "../../context/LuxuryAlertContext";

interface OrderDetailPanelProps {
  order: Order;
  onClose: () => void;
  onUpdateOrder: (updatedOrder: Order) => void;
}

const ORDER_STEPS = [
  { status: "Pending", label: "Order Placed", desc: "Awaiting atelier verification" },
  { status: "Confirmed", label: "Confirmed", desc: "Payment confirmed by atelier" },
  { status: "Processing", label: "Atelier Packaging", desc: "Inspected & packaged in presentation box" },
  { status: "In Transit", label: "In Transit", desc: "Dispatched with courier partner" },
  { status: "Delivered", label: "Delivered", desc: "Signed for by patron" },
];

export const OrderDetailPanel: React.FC<OrderDetailPanelProps> = ({
  order,
  onClose,
  onUpdateOrder,
}) => {
  const { showAlert, confirm } = useLuxuryAlert();
  const [currentStatus, setCurrentStatus] = useState<string>(order.status || "Pending");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Tracking details edit
  const [isEditingTracking, setIsEditingTracking] = useState(false);
  const [carrier, setCarrier] = useState(order.carrier || "DHL Express Elite");
  const [trackingNumber, setTrackingNumber] = useState(order.trackingNumber || "");
  const [estimatedDelivery, setEstimatedDelivery] = useState(order.estimatedDelivery || "3-5 Business Days");
  const [isSavingTracking, setIsSavingTracking] = useState(false);

  const orderId = order.id || order.orderNumber || (order as any)._id;

  const handleStatusChange = async (nextStatus: string) => {
    if (nextStatus === currentStatus) return;

    if (nextStatus === "Cancelled") {
      const ok = await confirm({
        title: "Cancel Order & Restore Inventory",
        message: `Are you sure you wish to cancel order "${order.orderNumber || orderId}"? This will automatically restore stock counts for all pieces in this order.`,
        confirmText: "Cancel Order & Restore Stock",
        cancelText: "Keep Order Active",
        variant: "danger",
      });
      if (!ok) return;
    }

    setIsUpdatingStatus(true);
    try {
      await OrderService.updateOrderStatus(orderId, nextStatus);
      setCurrentStatus(nextStatus);
      const updated: Order = { ...order, status: nextStatus as any };
      onUpdateOrder(updated);
      showAlert("success", `Order status transitioned to ${nextStatus}.`);
    } catch (err: any) {
      showAlert("error", "Failed to update order status: " + (err.response?.data?.message || err.message));
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleSaveTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingTracking(true);
    try {
      await OrderService.updateTracking(orderId, carrier, trackingNumber, estimatedDelivery);
      const updated: Order = {
        ...order,
        carrier,
        trackingNumber,
        estimatedDelivery,
        status: (currentStatus === "Pending" || currentStatus === "Confirmed" || currentStatus === "Processing")
          ? ("In Transit" as any)
          : (currentStatus as any),
      };
      if (currentStatus === "Pending" || currentStatus === "Confirmed" || currentStatus === "Processing") {
        setCurrentStatus("In Transit");
      }
      onUpdateOrder(updated);
      setIsEditingTracking(false);
      showAlert("success", "Courier tracking assigned and order updated.");
    } catch (err: any) {
      showAlert("error", "Failed to assign tracking: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSavingTracking(false);
    }
  };

  const currentStepIdx = ORDER_STEPS.findIndex((s) => s.status === currentStatus);

  return (
    <div className="w-full text-left space-y-8 animate-fade-in pb-16">
      {/* Top Bar Header */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-[#121216] hover:bg-zinc-800 text-zinc-400 hover:text-white rounded border border-zinc-800 transition-colors"
            title="Return to Orders Roster"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
                ATELIER LOGISTICS
              </span>
              <span className="text-zinc-600 text-xs">&bull;</span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                ACQUISITION SPECIFICATION
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider font-bold">
                {order.orderNumber || orderId}
              </h1>
              <span
                className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${
                  currentStatus === "Delivered"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    : currentStatus === "Cancelled"
                    ? "bg-red-500/10 text-red-400 border border-red-500/30"
                    : currentStatus === "In Transit"
                    ? "bg-sky-500/10 text-sky-400 border border-sky-500/30"
                    : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                }`}
              >
                {currentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Status Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
            Workflow Action:
          </span>
          <select
            value={currentStatus}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isUpdatingStatus}
            className="bg-[#101014] border border-zinc-800 text-xs px-3 py-2 rounded text-white font-bold uppercase outline-none focus:border-brand-gold cursor-pointer"
          >
            <option value="Pending">Pending Verification</option>
            <option value="Confirmed">Confirmed</option>
            <option value="Processing">Processing & Packaging</option>
            <option value="In Transit">Dispatched (In Transit)</option>
            <option value="Delivered">Delivered</option>
            <option value="Cancelled">Cancelled (Restock)</option>
          </select>
          {isUpdatingStatus && <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />}
        </div>
      </div>

      {/* Workflow Stepper (If not cancelled) */}
      {currentStatus !== "Cancelled" && (
        <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-0.5 bg-zinc-800 -z-0" />
            {ORDER_STEPS.map((step, idx) => {
              const isPassed = currentStepIdx >= idx;
              const isCurrent = currentStepIdx === idx;
              return (
                <div key={step.status} className="relative z-10 flex flex-col items-center text-center">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all ${
                      isPassed
                        ? "bg-brand-burgundy border-brand-gold text-white"
                        : "bg-[#101014] border-zinc-800 text-zinc-600"
                    } ${isCurrent ? "ring-4 ring-brand-burgundy/30 scale-110" : ""}`}
                  >
                    {isPassed ? (
                      <CheckCircle className="w-4 h-4 text-brand-gold" />
                    ) : (
                      <Clock className="w-4 h-4" />
                    )}
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider mt-2 ${
                      isPassed ? "text-white" : "text-zinc-600"
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[8px] text-zinc-500 hidden sm:block max-w-[120px]">
                    {step.desc}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Grid: Order Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Products Table & Logistics */}
        <div className="lg:col-span-2 space-y-6">
          {/* Card: Acquisitions List */}
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-brand-gold" />
                <h2 className="font-serif text-base uppercase text-white tracking-wider font-semibold">
                  Acquired Pieces ({(order.items || []).length} items)
                </h2>
              </div>
            </div>

            <div className="divide-y divide-zinc-900">
              {(order.items || []).map((item: any, idx: number) => (
                <div key={idx} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-16 rounded bg-[#0a0a0c] border border-zinc-800 overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-600">
                          <Package className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-serif text-white uppercase text-sm font-semibold tracking-wide">
                        {item.name}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        {item.brand && (
                          <span className="text-[10px] text-brand-gold uppercase font-semibold">
                            {item.brand}
                          </span>
                        )}
                        {item.selectedSize && (
                          <span className="text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded font-mono uppercase">
                            Size: {item.selectedSize}
                          </span>
                        )}
                        {item.selectedColor && (
                          <span className="text-[10px] bg-zinc-900 text-zinc-400 border border-zinc-800 px-2 py-0.5 rounded font-mono uppercase flex items-center gap-1">
                            {item.selectedColor.value && (
                              <span
                                className="w-2 h-2 rounded-full inline-block"
                                style={{ backgroundColor: item.selectedColor.value }}
                              />
                            )}
                            Color: {item.selectedColor.name || item.selectedColor}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span className="text-[10px] text-zinc-500 font-mono block">
                      ${Number(item.price || 0).toLocaleString()} &times; {item.quantity || 1}
                    </span>
                    <span className="font-serif text-base text-white font-bold block mt-0.5">
                      ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card: Courier Partner & Waybill Tracking */}
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <div className="flex items-center gap-2.5">
                <Truck className="w-4 h-4 text-brand-gold" />
                <h2 className="font-serif text-base uppercase text-white tracking-wider font-semibold">
                  White-Glove Courier Logistics
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsEditingTracking(!isEditingTracking)}
                className="text-xs text-brand-gold hover:underline uppercase tracking-wider font-semibold"
              >
                {isEditingTracking ? "Cancel Edit" : "Edit Logistics"}
              </button>
            </div>

            {isEditingTracking ? (
              <form onSubmit={handleSaveTracking} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                      Courier Partner
                    </label>
                    <select
                      value={carrier}
                      onChange={(e) => setCarrier(e.target.value)}
                      className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold cursor-pointer"
                    >
                      <option value="DHL Express Elite">DHL Express Elite Worldwide</option>
                      <option value="FedEx Private Luxe">FedEx Private Luxe International</option>
                      <option value="Ferrari Logistics">Ferrari Group Haute Logistics (Valuables)</option>
                      <option value="Malca-Amit">Malca-Amit Luxury Security Express</option>
                      <option value="Aurevilux Private Concierge">Aurevilux Private White-Glove Concierge</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                      Tracking / Waybill Code
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. AUR-EXP-98471"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white font-mono outline-none focus:border-brand-gold"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Estimated Delivery Window
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2-4 Business Days"
                    value={estimatedDelivery}
                    onChange={(e) => setEstimatedDelivery(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingTracking(false)}
                    className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white text-xs uppercase rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingTracking}
                    className="px-4 py-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold uppercase rounded tracking-wider flex items-center gap-1.5"
                  >
                    {isSavingTracking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Confirm Tracking</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                <div className="bg-[#0a0a0c] p-3.5 rounded border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block">
                    Assigned Courier
                  </span>
                  <span className="font-serif text-white font-semibold text-sm mt-1 block">
                    {order.carrier || "DHL Express Elite"}
                  </span>
                </div>
                <div className="bg-[#0a0a0c] p-3.5 rounded border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block">
                    Waybill Tracking Ref
                  </span>
                  <span className="font-mono text-brand-gold font-bold text-sm mt-1 block">
                    {order.trackingNumber || "Awaiting Dispatch"}
                  </span>
                </div>
                <div className="bg-[#0a0a0c] p-3.5 rounded border border-zinc-900">
                  <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block">
                    Delivery Estimate
                  </span>
                  <span className="text-zinc-300 text-xs mt-1 block">
                    {order.estimatedDelivery || "3-5 Business Days"}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Patron Dossier & Settlement */}
        <div className="space-y-6">
          {/* Patron Profile */}
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-3">
              <User className="w-4 h-4 text-brand-gold" />
              <h2 className="font-serif text-base uppercase text-white tracking-wider font-semibold">
                Patron Dossier
              </h2>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block">
                  Client Full Name
                </span>
                <span className="text-white font-medium text-sm mt-0.5 block">
                  {order.customer?.name || (order as any).name || "Patron"}
                </span>
              </div>

              <div>
                <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block">
                  Contact Coordinates
                </span>
                <span className="text-zinc-300 block font-mono">
                  {order.customer?.email || (order as any).email || "concierge@aurevilux.com"}
                </span>
                {order.customer?.phone && (
                  <span className="text-zinc-400 block font-mono mt-0.5">
                    {order.customer.phone}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Delivery Destination */}
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-3">
              <MapPin className="w-4 h-4 text-brand-gold" />
              <h2 className="font-serif text-base uppercase text-white tracking-wider font-semibold">
                Delivery Destination
              </h2>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-white font-medium">
                {order.shippingAddress?.street || "Private Residence"}
              </p>
              <p className="text-zinc-300">
                {order.shippingAddress?.city}{order.shippingAddress?.state ? `, ${order.shippingAddress.state}` : ""} {order.shippingAddress?.postalCode}
              </p>
              <p className="text-zinc-400 uppercase font-semibold">
                {order.shippingAddress?.country || "International"}
              </p>
            </div>
          </div>

          {/* Financial Settlement */}
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block border-b border-zinc-900 pb-3">
              Settlement Ledger
            </span>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between text-zinc-400">
                <span>Acquisitions Subtotal</span>
                <span className="text-white font-mono font-medium">
                  ${Number(order.total || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>White-Glove Atelier Shipping</span>
                <span className="text-emerald-400 font-semibold uppercase text-[10px]">
                  Complimentary
                </span>
              </div>
              <div className="pt-3 border-t border-zinc-900 flex justify-between items-baseline">
                <span className="font-serif uppercase text-sm text-white font-semibold">
                  Total Settlement
                </span>
                <span className="font-serif text-2xl text-brand-gold font-bold">
                  ${Number(order.total || 0).toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

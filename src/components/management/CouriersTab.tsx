import React, { useState, useEffect } from "react";
import {
  Truck,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Loader2,
  X,
  Phone,
} from "lucide-react";
import { CourierService, type CourierPartner } from "../../services/courier.service";
import { useLuxuryAlert } from "../../context/LuxuryAlertContext";

export const CouriersTab: React.FC = () => {
  const { showAlert, confirm } = useLuxuryAlert();
  const [couriers, setCouriers] = useState<CourierPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingCourier, setEditingCourier] = useState<CourierPartner | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [serviceType, setServiceType] = useState("White-Glove Courier");
  const [supportContact, setSupportContact] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchCouriers = async () => {
    setLoading(true);
    try {
      const data = await CourierService.getAllCouriers(true);
      setCouriers(data);
    } catch (err: any) {
      showAlert("error", "Failed to load couriers: " + (err.message || err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCouriers();
  }, []);

  const handleOpenCreate = () => {
    setEditingCourier(null);
    setName("");
    setCode("");
    setServiceType("White-Glove Courier");
    setSupportContact("");
    setIsActive(true);
    setShowModal(true);
  };

  const handleOpenEdit = (c: CourierPartner) => {
    setEditingCourier(c);
    setName(c.name);
    setCode(c.code);
    setServiceType(c.serviceType || "White-Glove Courier");
    setSupportContact(c.supportContact || "");
    setIsActive(c.isActive);
    setShowModal(true);
  };

  const handleToggleActive = async (c: CourierPartner) => {
    const id = c._id || c.id;
    if (!id) return;
    try {
      const updated = await CourierService.toggleActive(id);
      setCouriers((prev) =>
        prev.map((item) => ((item._id || item.id) === id ? updated : item))
      );
      showAlert(
        "info",
        `Courier "${c.name}" status changed to ${updated.isActive ? "Active" : "Inactive"}.`
      );
    } catch (err: any) {
      showAlert("error", "Status toggle failed: " + (err.message || err));
    }
  };

  const handleDelete = async (c: CourierPartner) => {
    const id = c._id || c.id;
    if (!id) return;

    const confirmed = await confirm({
      title: "De-register Courier Partner",
      message: `Are you certain you wish to purge "${c.name}" from your logistics registry? Any orders referencing this carrier will retain historical tracking records.`,
      variant: "danger",
    });
    if (!confirmed) return;

    try {
      await CourierService.deleteCourier(id);
      setCouriers((prev) => prev.filter((item) => (item._id || item.id) !== id));
      showAlert("success", `Courier "${c.name}" de-registered successfully.`);
    } catch (err: any) {
      showAlert("error", "Courier deletion failed: " + (err.message || err));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      showAlert("error", "Courier name and unique code are mandatory.");
      return;
    }

    const payload: Partial<CourierPartner> = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      serviceType: serviceType.trim() || "White-Glove Courier",
      supportContact: supportContact.trim(),
      isActive,
    };

    setIsSubmitting(true);
    try {
      if (editingCourier) {
        const id = editingCourier._id || editingCourier.id || "";
        const updated = await CourierService.updateCourier(id, payload);
        setCouriers((prev) =>
          prev.map((c) => ((c._id || c.id) === id ? updated : c))
        );
        showAlert("success", `Courier "${updated.name}" updated successfully.`);
      } else {
        const created = await CourierService.createCourier(payload);
        setCouriers((prev) => [...prev, created]);
        showAlert("success", `Courier "${created.name}" established successfully.`);
      }
      setShowModal(false);
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || err.message || "Failed to persist courier partner."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredCouriers = couriers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.serviceType && c.serviceType.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6 w-full text-left">
      {/* Top Header */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
            LOGISTICS ALLIANCES
          </span>
          <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
            White-Glove Courier Registry ({couriers.length})
          </h1>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2 shadow-lg shadow-brand-burgundy/30"
        >
          <Plus className="w-4 h-4" />
          <span>Add Courier Partner</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search courier partners by carrier name, code, or service tier..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#101014] border border-zinc-900 text-xs pl-9 pr-4 py-2.5 rounded text-white placeholder-zinc-500 outline-none focus:border-brand-gold/50"
        />
      </div>

      {/* Courier Partners Table */}
      <div className="bg-[#101014] border border-zinc-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-900/60 text-zinc-500 uppercase text-[9px] tracking-widest font-semibold border-b border-zinc-900">
              <tr>
                <th className="py-3 px-4">Courier Partner</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Service Tier</th>
                <th className="py-3 px-4">Contact Coordinate</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 font-light">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-zinc-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-gold mb-2" />
                    <span>Accessing white-glove courier network...</span>
                  </td>
                </tr>
              ) : filteredCouriers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    No courier partners registered or matching query.
                  </td>
                </tr>
              ) : (
                filteredCouriers.map((c) => (
                  <tr
                    key={c._id || c.id || c.code}
                    className="hover:bg-zinc-900/30 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 text-brand-gold">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="font-serif text-white font-semibold uppercase">
                            {c.name}
                          </p>
                          <span className="text-[9px] text-zinc-500 font-mono">
                            {c._id || c.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-brand-gold font-mono font-bold text-[10px]">
                        {c.code}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-zinc-300">
                      {c.serviceType || "Standard Express"}
                    </td>
                    <td className="py-3 px-4 text-zinc-400">
                      {c.supportContact ? (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-zinc-500" />
                          {c.supportContact}
                        </span>
                      ) : (
                        <span className="text-zinc-600">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase transition-colors ${
                          c.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                            : "bg-zinc-800 text-zinc-500 border border-zinc-700 hover:bg-zinc-700"
                        }`}
                      >
                        {c.isActive ? (
                          <>
                            <CheckCircle className="w-2.5 h-2.5" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-2.5 h-2.5" />
                            <span>Inactive</span>
                          </>
                        )}
                      </button>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(c)}
                          className="p-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white rounded transition-colors"
                          title="Edit Partner"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(c)}
                          className="p-1.5 bg-zinc-900 hover:bg-red-950/40 border border-zinc-800 hover:border-red-900/60 text-zinc-400 hover:text-red-400 rounded transition-colors"
                          title="Delete Partner"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Create / Edit Courier Partner */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-[#0e0e12] border border-zinc-800 rounded-xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <span className="text-[9px] tracking-[0.25em] text-brand-gold uppercase font-bold">
                {editingCourier ? "UPDATE ALLIANCE" : "NEW ALLIANCE"}
              </span>
              <h2 className="font-serif text-xl uppercase text-white tracking-wider">
                {editingCourier ? `Edit: ${editingCourier.name}` : "Register Courier Partner"}
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Courier Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DHL Express Elite"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#141418] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Unique Code * (e.g. DHL)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="DHL"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full bg-[#141418] border border-zinc-800 text-xs px-3 py-2 rounded text-brand-gold font-mono uppercase outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Service Tier / Logistics Classification
                </label>
                <input
                  type="text"
                  placeholder="e.g. Armored Vault Transit, Next-Day Air Concierge"
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-[#141418] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Support Contact Coordinate (Email / Phone)
                </label>
                <input
                  type="text"
                  placeholder="concierge@carrier.com or +33 1 40 00 00"
                  value={supportContact}
                  onChange={(e) => setSupportContact(e.target.value)}
                  className="w-full bg-[#141418] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                />
              </div>

              <label className="flex items-center gap-3 p-2 rounded bg-[#141418] border border-zinc-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 rounded bg-zinc-900 border-zinc-700 text-brand-burgundy"
                />
                <div>
                  <span className="text-xs text-white font-semibold uppercase block">
                    Active Partner
                  </span>
                  <span className="text-[9px] text-zinc-500 block">
                    Make selectable in Order Logistics and Consignment Dispatch
                  </span>
                </div>
              </label>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs uppercase tracking-wider rounded transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{editingCourier ? "Save Changes" : "Establish Alliance"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
} from "lucide-react";
import type { Brand, BrandApp } from "../../types";
import { BrandService } from "../../services/brand.service";
import { AdminService } from "../../services/admin.service";
import { BrandForm } from "./BrandForm";
import { useLuxuryAlert } from "../../context/LuxuryAlertContext";

interface BrandsTabProps {
  brands: Brand[];
  setBrands: React.Dispatch<React.SetStateAction<Brand[]>>;
  brandApps: BrandApp[];
  setBrandApps: React.Dispatch<React.SetStateAction<BrandApp[]>>;
}

export const BrandsTab: React.FC<BrandsTabProps> = ({
  brands,
  setBrands,
  brandApps,
  setBrandApps,
}) => {
  const { showAlert, confirm } = useLuxuryAlert();
  const [activeSubTab, setActiveSubTab] = useState<"directory" | "applications">("directory");
  const [viewMode, setViewMode] = useState<"directory" | "form">("directory");
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setViewMode("form");
  };

  const handleOpenEdit = (b: Brand) => {
    setEditingBrand(b);
    setViewMode("form");
  };

  const handleSaveBrand = (savedBrand: Brand) => {
    const id = savedBrand._id || savedBrand.id || savedBrand.slug;
    setBrands((prev) => {
      const exists = prev.some((b) => b._id === id || b.id === id || b.slug === id);
      if (exists) {
        return prev.map((b) =>
          b._id === id || b.id === id || b.slug === id ? { ...b, ...savedBrand } : b
        );
      }
      return [savedBrand, ...prev];
    });
    setViewMode("directory");
  };

  // Toggle Active State
  const handleToggleActive = async (b: Brand) => {
    const id = b._id || b.id || b.slug || "";
    const nextState = !(b.isActive ?? true);
    try {
      await BrandService.toggleBrandActive(id);
      showAlert("info", `Maison "${b.name}" visibility changed to ${nextState ? "Live" : "Inactive"}.`);
    } catch (e: any) {
      console.warn("Toggle brand API note:", e);
    }
    setBrands((prev) =>
      prev.map((item) =>
        item._id === id || item.id === id ? { ...item, isActive: nextState } : item
      )
    );
  };

  // Soft Delete
  const handleDelete = async (b: Brand) => {
    const confirmed = await confirm({
      title: "Archive Maison Partner",
      message: `Are you certain you wish to archive Maison "${b.name}"? This will soft-delete the brand profile and remove its collections from active merchandising.`,
      confirmText: "Archive Maison",
      cancelText: "Keep Maison",
      variant: "danger",
    });

    if (!confirmed) return;

    const id = b._id || b.id || b.slug || "";
    try {
      await BrandService.deleteBrand(id);
      showAlert("success", `Maison "${b.name}" successfully archived.`);
    } catch (e: any) {
      console.warn("Delete brand API note:", e);
      showAlert("error", "Failed to archive brand: " + (e.response?.data?.message || e.message));
    }
    setBrands((prev) => prev.filter((item) => item._id !== id && item.id !== id));
  };

  // Brand Application decision
  const handleBrandDecision = async (id: string, decision: "Approved" | "Rejected") => {
    try {
      await AdminService.updateBrandApplication(id, decision);
      showAlert("success", `Brand application marked as ${decision}.`);
    } catch (e: any) {
      console.warn("Brand app decision fallback:", e);
    }
    setBrandApps((prev) =>
      prev.map((a) => (a.id === id || a._id === id ? { ...a, status: decision } : a))
    );
  };

  // If in Form mode, render full-page BrandForm
  if (viewMode === "form") {
    return (
      <BrandForm
        brand={editingBrand}
        onSave={handleSaveBrand}
        onCancel={() => setViewMode("directory")}
      />
    );
  }

  return (
    <div className="space-y-6 w-full text-left animate-fade-in">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
            HAUTE MAISONS
          </span>
          <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
            Brand Partners & Applications
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#101014] border border-zinc-900 rounded p-1 flex">
            <button
              onClick={() => setActiveSubTab("directory")}
              className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors ${
                activeSubTab === "directory"
                  ? "bg-brand-burgundy text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Maison Directory ({brands.length})
            </button>
            <button
              onClick={() => setActiveSubTab("applications")}
              className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors ${
                activeSubTab === "applications"
                  ? "bg-brand-burgundy text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Applications ({brandApps.length})
            </button>
          </div>
          <button
            onClick={handleOpenAdd}
            className="bg-brand-burgundy hover:bg-brand-burgundyHover text-white px-4 py-2 rounded text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors shadow-md shadow-brand-burgundy/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Brand</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: MAISON DIRECTORY */}
      {activeSubTab === "directory" && (
        <div className="bg-[#101014] border border-zinc-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-900/60 text-zinc-500 uppercase text-[9px] tracking-widest font-semibold border-b border-zinc-900">
                <tr>
                  <th className="py-3 px-4">Maison / House</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Featured Atelier</th>
                  <th className="py-3 px-4">Visibility</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 font-light">
                {brands.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-zinc-500">
                      No luxury Maisons registered yet. Click &quot;Add Brand&quot; to publish one.
                    </td>
                  </tr>
                ) : (
                  brands.map((b) => {
                    const isActive = b.isActive !== false;
                    return (
                      <tr
                        key={b.id || b._id}
                        className={`hover:bg-zinc-900/30 transition-colors ${
                          !isActive ? "opacity-60 bg-zinc-950/40" : ""
                        }`}
                      >
                        <td className="py-3 px-4 flex items-center space-x-3">
                          <div className="w-10 h-10 rounded bg-white overflow-hidden border border-zinc-800 flex-shrink-0 flex items-center justify-center p-1">
                            <img
                              src={b.logo || "/placeholder.jpg"}
                              alt={b.name}
                              className="max-h-full max-w-full object-contain"
                            />
                          </div>
                          <div>
                            <p className="font-serif text-white font-semibold uppercase">
                              {b.name}
                            </p>
                            <span className="text-[9px] text-zinc-500 font-mono">
                              /brand/{b.slug || b.id}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-400 max-w-xs truncate">
                          {b.description || "Prestige luxury atelier."}
                        </td>
                        <td className="py-3 px-4">
                          {b.featured ? (
                            <span className="text-[9px] bg-brand-gold/10 text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded uppercase font-semibold">
                              Featured
                            </span>
                          ) : (
                            <span className="text-[9px] text-zinc-500 uppercase font-mono">
                              Standard
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleActive(b)}
                            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-bold uppercase transition-all ${
                              isActive
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                                : "bg-zinc-800/60 text-zinc-400 border border-zinc-700 hover:bg-zinc-800"
                            }`}
                          >
                            {isActive ? (
                              <>
                                <Eye className="w-3 h-3" />
                                <span>Live</span>
                              </>
                            ) : (
                              <>
                                <EyeOff className="w-3 h-3" />
                                <span>Inactive</span>
                              </>
                            )}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleOpenEdit(b)}
                              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded border border-zinc-800"
                              title="Edit Maison"
                            >
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(b)}
                              className="p-1.5 bg-zinc-900 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 rounded border border-zinc-800 hover:border-red-900"
                              title="Soft Delete & Archive Maison"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: BRAND APPLICATIONS */}
      {activeSubTab === "applications" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {brandApps.length === 0 ? (
            <div className="col-span-full py-16 text-center border border-dashed border-zinc-800 rounded bg-[#101014]">
              <p className="text-zinc-500 text-xs uppercase tracking-wider font-serif">
                No pending brand partnership applications.
              </p>
            </div>
          ) : (
            brandApps.map((app) => (
              <div
                key={app.id || app._id}
                className="bg-[#101014] border border-zinc-900 p-5 rounded-lg space-y-3.5 text-left"
              >
                <div className="flex justify-between items-start border-b border-zinc-900 pb-3">
                  <div>
                    <h4 className="font-serif text-white uppercase text-base font-bold">
                      {app.name || app.brandName}
                    </h4>
                    <span className="text-[10px] text-zinc-500 uppercase tracking-widest block mt-0.5">
                      {app.category || "Luxury Fashion"}
                    </span>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                      app.status === "Approved"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : app.status === "Rejected"
                        ? "bg-red-500/10 text-red-400 border border-red-500/30"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                <div className="text-xs text-zinc-400 space-y-1 font-light">
                  <p>
                    <span className="text-zinc-500 uppercase text-[9px] font-semibold">
                      Contact:
                    </span>{" "}
                    {app.contactEmail || app.email || "concierge@brand.com"}
                  </p>
                  {app.story && (
                    <p className="text-[11px] text-zinc-500 italic mt-2 line-clamp-3">
                      &quot;{app.story}&quot;
                    </p>
                  )}
                </div>

                {app.status === "Pending" && (
                  <div className="flex gap-2 pt-2 border-t border-zinc-900">
                    <button
                      onClick={() => handleBrandDecision(app.id || app._id || "", "Approved")}
                      className="flex-1 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-300 text-[10px] uppercase font-bold rounded transition-colors"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleBrandDecision(app.id || app._id || "", "Rejected")}
                      className="flex-1 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 text-[10px] uppercase font-bold rounded transition-colors"
                    >
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

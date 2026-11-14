import React, { useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Upload,
  X,
  Loader2,
} from "lucide-react";
import type { Brand, BrandApp } from "../../types";
import { BrandService } from "../../services/brand.service";
import { AdminService } from "../../services/admin.service";
import { UploadService } from "../../services/upload.service";

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
  const [activeSubTab, setActiveSubTab] = useState<"directory" | "applications">("directory");
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [featured, setFeatured] = useState(false);
  const [logoUrl, setLogoUrl] = useState("");
  const [campaignUrl, setCampaignUrl] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);

  const handleOpenAdd = () => {
    setEditingBrand(null);
    setName("");
    setDescription("");
    setFeatured(false);
    setLogoUrl("");
    setCampaignUrl("");
    setShowModal(true);
  };

  const handleOpenEdit = (b: Brand) => {
    setEditingBrand(b);
    setName(b.name);
    setDescription(b.description || "");
    setFeatured(b.featured || false);
    setLogoUrl(b.logo || "");
    setCampaignUrl(b.campaignImage || "");
    setShowModal(true);
  };

  // Upload Logo to Supabase
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingLogo(true);
    try {
      const res = await UploadService.uploadSingle(e.target.files[0], "brands/logos");
      const url = res?.publicUrl || (res as any)?.url;
      if (url) {
        setLogoUrl(url);
      }
    } catch (err: any) {
      alert("Logo upload failed: " + (err.message || err));
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Upload Hero Banner to Supabase
  const handleUploadHero = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingHero(true);
    try {
      const res = await UploadService.uploadSingle(e.target.files[0], "brands/campaigns");
      const url = res?.publicUrl || (res as any)?.url;
      if (url) {
        setCampaignUrl(url);
      }
    } catch (err: any) {
      alert("Campaign banner upload failed: " + (err.message || err));
    } finally {
      setIsUploadingHero(false);
    }
  };

  // Save Brand
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const payload: Partial<Brand> = {
      name,
      slug,
      description,
      featured,
      logo: logoUrl || "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=300",
      campaignImage:
        campaignUrl ||
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200",
      isActive: editingBrand ? editingBrand.isActive ?? true : true,
    };

    try {
      if (editingBrand) {
        const id = editingBrand._id || editingBrand.id || editingBrand.slug || "";
        const updated = await BrandService.updateBrand(id, payload);
        setBrands((prev) =>
          prev.map((b) => (b._id === id || b.id === id ? { ...b, ...updated } : b))
        );
      } else {
        const created = await BrandService.createBrand(payload);
        setBrands((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch {
      // Local fallback
      if (editingBrand) {
        setBrands((prev) =>
          prev.map((b) =>
            b.id === editingBrand.id ? ({ ...b, ...payload } as Brand) : b
          )
        );
      } else {
        const localBrand = {
          ...payload,
          id: `brand-${Date.now()}`,
        } as Brand;
        setBrands((prev) => [localBrand, ...prev]);
      }
      setShowModal(false);
    }
  };

  // Toggle Active State
  const handleToggleActive = async (b: Brand) => {
    const id = b._id || b.id || b.slug || "";
    const nextState = !(b.isActive ?? true);
    try {
      await BrandService.toggleBrandActive(id);
    } catch (e) {
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
    if (!confirm(`Are you sure you want to remove Maison "${b.name}"? This will soft-delete the brand and purge its assets from Supabase.`)) {
      return;
    }
    const id = b._id || b.id || b.slug || "";
    try {
      await BrandService.deleteBrand(id);
    } catch (e) {
      console.warn("Delete brand API note:", e);
    }
    setBrands((prev) => prev.filter((item) => item._id !== id && item.id !== id));
  };

  // Brand Application decision
  const handleBrandDecision = async (id: string, decision: "Approved" | "Rejected") => {
    try {
      await AdminService.updateBrandApplication(id, decision);
    } catch (e) {
      console.warn("Brand app decision fallback:", e);
    }
    setBrandApps((prev) =>
      prev.map((a) => (a.id === id || a._id === id ? { ...a, status: decision } : a))
    );
  };

  return (
    <div className="space-y-6 w-full text-left">
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
            className="bg-brand-burgundy hover:bg-brand-burgundyHover text-white px-3.5 py-2 rounded text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors"
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
                {brands.map((b) => {
                  const isActive = b.isActive !== false;
                  return (
                    <tr
                      key={b.id || b._id}
                      className={`hover:bg-zinc-900/30 transition-colors ${
                        !isActive ? "opacity-60 bg-zinc-950/40" : ""
                      }`}
                    >
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <div className="w-10 h-10 rounded bg-zinc-900 overflow-hidden border border-zinc-800 flex-shrink-0 flex items-center justify-center p-1">
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
                            title="Soft Delete & Purge Supabase Assets"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
                      "{app.story}"
                    </p>
                  )}
                </div>

                {app.status === "Pending" && (
                  <div className="flex gap-2 pt-2 border-t border-zinc-900">
                    <button
                      onClick={() => handleBrandDecision(app.id || app._id || "", "Approved")}
                      className="flex-1 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-300 text-[10px] uppercase font-bold rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleBrandDecision(app.id || app._id || "", "Rejected")}
                      className="flex-1 py-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-800 text-red-300 text-[10px] uppercase font-bold rounded"
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

      {/* Add / Edit Brand Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#101014] border border-zinc-800 rounded-lg max-w-lg w-full p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-base text-white uppercase tracking-wider font-bold">
                {editingBrand ? "Edit Maison Profile" : "Register Luxury Brand"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Maison Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Bottega Veneta, Celine"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Maison Description / Heritage
                </label>
                <textarea
                  rows={2}
                  placeholder="Crafted in Vicenza with signature Intrecciato craftsmanship..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-brand-black border border-zinc-800 text-xs p-2.5 rounded text-white outline-none focus:border-brand-gold"
                />
              </div>

              {/* Supabase Logo Upload */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                  Brand Logo / Monogram (Supabase Storage)
                </label>
                <div className="flex items-center gap-3">
                  {logoUrl && (
                    <div className="w-10 h-10 rounded bg-zinc-900 border border-zinc-800 p-1 flex items-center justify-center">
                      <img src={logoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                    </div>
                  )}
                  <label className="cursor-pointer border border-zinc-800 hover:border-brand-gold/60 bg-zinc-900 text-zinc-300 px-3 py-1.5 rounded text-xs flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{logoUrl ? "Replace Logo" : "Upload Logo to Supabase"}</span>
                    <input type="file" accept="image/*" onChange={handleUploadLogo} className="hidden" />
                  </label>
                  {isUploadingLogo && <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />}
                </div>
              </div>

              {/* Supabase Hero Banner Upload */}
              <div className="space-y-1">
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                  Campaign Hero Banner (Supabase Storage)
                </label>
                <div className="flex items-center gap-3">
                  {campaignUrl && (
                    <div className="w-14 h-10 rounded bg-zinc-900 border border-zinc-800 overflow-hidden">
                      <img src={campaignUrl} alt="Hero preview" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <label className="cursor-pointer border border-zinc-800 hover:border-brand-gold/60 bg-zinc-900 text-zinc-300 px-3 py-1.5 rounded text-xs flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5" />
                    <span>{campaignUrl ? "Replace Hero" : "Upload Hero Banner to Supabase"}</span>
                    <input type="file" accept="image/*" onChange={handleUploadHero} className="hidden" />
                  </label>
                  {isUploadingHero && <Loader2 className="w-4 h-4 animate-spin text-brand-gold" />}
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featuredCheck"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded bg-brand-black border-zinc-800 text-brand-burgundy focus:ring-0"
                />
                <label htmlFor="featuredCheck" className="text-xs text-zinc-300 select-none cursor-pointer">
                  Feature prominently on Aurevilux homepage & collections
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white text-xs uppercase rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold uppercase rounded tracking-wider"
                >
                  Save Maison
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

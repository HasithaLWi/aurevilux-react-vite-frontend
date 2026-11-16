import React, { useState } from "react";
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";
import type { Brand } from "../../types";
import { BrandService } from "../../services/brand.service";
import { UploadService } from "../../services/upload.service";
import { useLuxuryAlert } from "../../context/LuxuryAlertContext";

interface BrandFormProps {
  brand: Brand | null;
  onSave: (savedBrand: Brand) => void;
  onCancel: () => void;
}

export const BrandForm: React.FC<BrandFormProps> = ({
  brand,
  onSave,
  onCancel,
}) => {
  const { showAlert } = useLuxuryAlert();
  const isEditing = Boolean(brand);

  // Form State
  const [name, setName] = useState(brand?.name || "");
  const [slug, setSlug] = useState(brand?.slug || "");
  const [description, setDescription] = useState(brand?.description || "");
  const [featured, setFeatured] = useState<boolean>(brand?.featured ?? false);
  const [isActive, setIsActive] = useState<boolean>(brand?.isActive ?? true);
  const [logoUrl, setLogoUrl] = useState(brand?.logo || "");
  const [campaignUrl, setCampaignUrl] = useState(brand?.campaignImage || "");

  // Upload & Save State
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleNameChange = (val: string) => {
    setName(val);
    if (!isEditing || !slug) {
      setSlug(
        val
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, "")
      );
    }
  };

  // Upload Logo to Supabase aurevilux-products bucket
  const handleUploadLogo = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingLogo(true);
    try {
      const res = await UploadService.uploadSingle(e.target.files[0], "brands/logos", "aurevilux-products");
      const url = res?.publicUrl || (res as any)?.url;
      if (url) {
        setLogoUrl(url);
        showAlert("success", "Maison monogram logo uploaded to Supabase Storage (aurevilux-products).");
      }
    } catch (err: any) {
      showAlert("error", "Logo upload failed: " + (err.message || err));
    } finally {
      setIsUploadingLogo(false);
    }
  };

  // Upload Campaign Hero Banner to Supabase aurevilux-products bucket
  const handleUploadHero = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploadingHero(true);
    try {
      const res = await UploadService.uploadSingle(e.target.files[0], "brands/campaigns", "aurevilux-products");
      const url = res?.publicUrl || (res as any)?.url;
      if (url) {
        setCampaignUrl(url);
        showAlert("success", "Maison campaign hero banner uploaded to Supabase Storage (aurevilux-products).");
      }
    } catch (err: any) {
      showAlert("error", "Campaign banner upload failed: " + (err.message || err));
    } finally {
      setIsUploadingHero(false);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!name.trim()) {
      setErrorMessage("Maison brand name is required.");
      return;
    }

    const finalSlug = (slug || name)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const payload: Partial<Brand> = {
      name: name.trim(),
      slug: finalSlug,
      description: description.trim() || `Haute couture maison ${name.trim()} partnered with Aurevilux.`,
      featured,
      isActive,
      logo:
        logoUrl ||
        "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&q=80&w=400",
      campaignImage:
        campaignUrl ||
        "https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&q=80&w=1200",
    };

    setIsSaving(true);
    try {
      let saved: Brand;
      if (isEditing && brand) {
        const id = brand._id || brand.id || brand.slug || "";
        saved = await BrandService.updateBrand(id, payload);
        showAlert("success", `Maison "${saved.name}" updated successfully.`);
      } else {
        saved = await BrandService.createBrand(payload);
        showAlert("success", `Maison "${saved.name}" registered successfully.`);
      }
      onSave(saved);
    } catch (err: any) {
      console.error("Failed to save brand:", err);
      const msg = err.response?.data?.message || err.message || "Failed to persist Maison brand.";
      setErrorMessage(msg);
      showAlert("error", msg, "Brand Persistence Error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full text-left space-y-8 animate-fade-in pb-16">
      {/* Top Header */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 bg-[#121216] hover:bg-zinc-800 text-zinc-400 hover:text-white rounded border border-zinc-800 transition-colors"
            title="Return to Maison Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
                HAUTE MAISON PARTNERS
              </span>
              <span className="text-zinc-600 text-xs">&bull;</span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                {isEditing ? "MAISON PROFILE SUITE" : "NEW BRAND REGISTRATION"}
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
              {isEditing ? `Edit Maison: ${name || "Untitled"}` : "Register Luxury Maison"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-white text-xs uppercase tracking-wider rounded font-medium transition-colors"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || isUploadingLogo || isUploadingHero}
            className="px-6 py-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2 shadow-lg shadow-brand-burgundy/30 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isEditing ? "Save & Publish Maison" : "Register Maison"}</span>
          </button>
        </div>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="p-4 bg-red-950/40 border border-red-900 text-red-200 text-xs rounded-lg flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold uppercase tracking-wider block">Submission Error</span>
            <p className="mt-0.5 font-light">{errorMessage}</p>
          </div>
        </div>
      )}

      {/* Form Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Core Info & Story */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-3">
              <ShieldCheck className="w-4 h-4 text-brand-gold" />
              <h2 className="font-serif text-base uppercase text-white tracking-wider font-semibold">
                Maison Identity & Heritage
              </h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1.5">
                    Maison Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Bottega Veneta"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-sm px-3.5 py-2.5 rounded text-white outline-none focus:border-brand-gold font-medium"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="bottega-veneta"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3.5 py-2.5 rounded text-zinc-300 font-mono outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1.5">
                  Heritage, Craftsmanship & Provenance Story
                </label>
                <textarea
                  rows={5}
                  placeholder="Founded in 1966 in Vicenza, the house is renowned for signature Intrecciato leather craftsmanship and quiet luxury..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs p-3 rounded text-white outline-none focus:border-brand-gold leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* Campaign Banner Upload */}
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
              Editorial Campaign Banner (Supabase Storage)
            </span>

            {campaignUrl ? (
              <div className="relative aspect-[21/9] rounded-lg overflow-hidden border border-zinc-800 bg-[#0a0a0c] group">
                <img
                  src={campaignUrl}
                  alt="Campaign Hero"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => setCampaignUrl("")}
                  className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Campaign Banner"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="aspect-[21/9] border-2 border-dashed border-zinc-800 hover:border-brand-gold/60 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors text-zinc-500 hover:text-zinc-300 p-4 text-center">
                <Upload className="w-6 h-6 mb-2" />
                <span className="text-xs uppercase font-bold tracking-wider">
                  Upload Campaign Banner
                </span>
                <span className="text-[9px] text-zinc-600 uppercase mt-0.5">
                  Supabase Bucket &bull; 1920x820 Widescreen Recommended
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadHero}
                  disabled={isUploadingHero}
                  className="hidden"
                />
              </label>
            )}

            {isUploadingHero && (
              <div className="flex items-center gap-2 text-xs text-brand-gold pt-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading banner to Supabase Storage...</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                  Or Direct Campaign Banner URL
                </label>
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-brand-gold hover:text-white text-[10px] uppercase font-bold tracking-wider rounded border border-zinc-800 hover:border-brand-gold/60 cursor-pointer transition-colors">
                  <Upload className="w-3 h-3" />
                  <span>Upload Banner</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadHero}
                    disabled={isUploadingHero}
                    className="hidden"
                  />
                </label>
              </div>
              <input
                type="url"
                placeholder="https://..."
                value={campaignUrl}
                onChange={(e) => setCampaignUrl(e.target.value)}
                className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-zinc-300 font-mono outline-none focus:border-brand-gold"
              />
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Logo & Merchandising */}
        <div className="space-y-6">
          {/* Logo Upload */}
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
              Maison Monogram / Logo (Supabase Storage)
            </span>

            {logoUrl ? (
              <div className="relative w-32 h-32 mx-auto rounded-lg overflow-hidden border border-zinc-800 bg-white p-3 flex items-center justify-center group">
                <img
                  src={logoUrl}
                  alt="Maison Logo"
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  type="button"
                  onClick={() => setLogoUrl("")}
                  className="absolute top-1 right-1 p-1 bg-black/80 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Logo"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <label className="w-32 h-32 mx-auto border-2 border-dashed border-zinc-800 hover:border-brand-gold/60 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors text-zinc-500 hover:text-zinc-300 p-3 text-center">
                <Upload className="w-5 h-5 mb-1" />
                <span className="text-[10px] uppercase font-bold tracking-wider">
                  Upload Logo
                </span>
                <span className="text-[8px] text-zinc-600 uppercase mt-0.5">
                  Square / PNG
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadLogo}
                  disabled={isUploadingLogo}
                  className="hidden"
                />
              </label>
            )}

            {isUploadingLogo && (
              <div className="flex items-center justify-center gap-2 text-xs text-brand-gold pt-1">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading logo...</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                  Or Direct Logo URL
                </label>
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-brand-gold hover:text-white text-[10px] uppercase font-bold tracking-wider rounded border border-zinc-800 hover:border-brand-gold/60 cursor-pointer transition-colors">
                  <Upload className="w-3 h-3" />
                  <span>Upload Logo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadLogo}
                    disabled={isUploadingLogo}
                    className="hidden"
                  />
                </label>
              </div>
              <input
                type="url"
                placeholder="https://..."
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-zinc-300 font-mono outline-none focus:border-brand-gold"
              />
            </div>
          </div>

          {/* Visibility & Curation Settings */}
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
              Merchandising & Status
            </span>

            <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-zinc-900/40">
              <div>
                <span className="text-xs text-white uppercase font-semibold block">Featured Atelier</span>
                <span className="text-[10px] text-zinc-500 block">Promote on homepage showcase</span>
              </div>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="w-4 h-4 rounded bg-[#0a0a0c] border-zinc-800 text-brand-burgundy focus:ring-0"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer p-2 rounded hover:bg-zinc-900/40">
              <div>
                <span className="text-xs text-white uppercase font-semibold block">Storefront Active</span>
                <span className="text-[10px] text-zinc-500 block">Live in maison directory and filter</span>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded bg-[#0a0a0c] border-zinc-800 text-brand-burgundy focus:ring-0"
              />
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

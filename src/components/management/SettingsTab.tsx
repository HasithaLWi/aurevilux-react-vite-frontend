import React, { useState, useEffect } from "react";
import {
  Save,
  Building2,
  FileText,
  BookOpen,
  Upload,
  Loader2,
} from "lucide-react";
import { BusinessService, type BusinessInfo } from "../../services/business.service";
import { UploadService } from "../../services/upload.service";
import { validateImageFile, isSupabaseStorageUrl } from "../../utils/imageValidation";
import { useLuxuryAlert } from "../../context/LuxuryAlertContext";

export const SettingsTab: React.FC = () => {
  const { showAlert } = useLuxuryAlert();
  const [activeSection, setActiveSection] = useState<"general" | "legal" | "lookbook">("general");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State: Maison Identity & Pricing
  const [name, setName] = useState("Aurevilux Haute Couture");
  const [legalName, setLegalName] = useState("Aurevilux Luxury Group S.A.");
  const [tagline, setTagline] = useState(
    "Crafting confidence and contemporary elegance. Sourcing the finest silhouettes and bespoke designs for the refined modern wardrobe."
  );
  const [email, setEmail] = useState("concierge@aurevilux.com");
  const [phone, setPhone] = useState("+33 1 42 68 00 00");
  const [address, setAddress] = useState("12 Place Vendôme, 75001 Paris, France");
  const [currency, setCurrency] = useState("USD ($) - UNITED STATES DOLLAR");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(2500);

  // Form State: Legal Policies
  const [termsAndConditions, setTermsAndConditions] = useState("");
  const [privacyPolicy, setPrivacyPolicy] = useState("");

  // Form State: Lookbook Studio
  const [lookbookTitle, setLookbookTitle] = useState("Modern Elegance");
  const [lookbookSubtitle, setLookbookSubtitle] = useState("THE LOOKBOOK");
  const [lookbookQuote, setLookbookQuote] = useState(
    "A curation of timeless silhouettes and modern craftsmanship, defining confident individuality through sophisticated design and understated luxury. Tailored to perfection, styled for the avant-garde."
  );
  const [lookbookQuoteCaption, setLookbookQuoteCaption] = useState("Atelier Aurevilux Editorial");
  const [lookbookStory, setLookbookStory] = useState(
    "Founded on the principles of immaculate bespoke tailoring and rare artisan sourcing, Aurevilux represents the pinnacle of modern luxury. Each collection is carefully orchestrated in limited quantities to preserve exclusivity and honor timeless craftsmanship."
  );
  const [lookbookHero, setLookbookHero] = useState("/images/fashion_models/luxury_lookbook_hero.jpg");
  const [lookbookLeft, setLookbookLeft] = useState("/images/fashion_models/featured_categories_men.jpg");
  const [lookbookRight, setLookbookRight] = useState("/images/fashion_models/featured_categories_women.jpg");

  const [uploadingHero, setUploadingHero] = useState(false);
  const [uploadingLeft, setUploadingLeft] = useState(false);
  const [uploadingRight, setUploadingRight] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const info = await BusinessService.getBusinessInfo();
        if (info) {
          setName(info.name || "Aurevilux Haute Couture");
          setLegalName(info.legalName || "Aurevilux Luxury Group S.A.");
          setTagline(info.tagline || "");
          setEmail(info.email || "concierge@aurevilux.com");
          setPhone(info.phone || "+33 1 42 68 00 00");
          setAddress(info.address || "12 Place Vendôme, 75001 Paris, France");
          setCurrency(info.currency || "USD ($) - UNITED STATES DOLLAR");
          setFreeShippingThreshold(info.freeShippingThreshold ?? 2500);
          setTermsAndConditions(info.termsAndConditions || "");
          setPrivacyPolicy(info.privacyPolicy || "");

          if (info.lookbook) {
            setLookbookTitle(info.lookbook.title || "Modern Elegance");
            setLookbookSubtitle(info.lookbook.subtitle || "THE LOOKBOOK");
            setLookbookQuote(info.lookbook.quote || "");
            setLookbookQuoteCaption(info.lookbook.quoteCaption || "Atelier Aurevilux Editorial");
            setLookbookStory(info.lookbook.story || "");
            setLookbookHero(info.lookbook.mainImage || "/images/fashion_models/luxury_lookbook_hero.jpg");
            setLookbookLeft(info.lookbook.leftImage || "/images/fashion_models/featured_categories_men.jpg");
            setLookbookRight(info.lookbook.rightImage || "/images/fashion_models/featured_categories_women.jpg");
          }
        }
      } catch (err: any) {
        showAlert("error", "Failed to load atelier business configuration: " + (err.message || err));
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleUploadLookbookImage = async (
    file: File,
    target: "hero" | "left" | "right"
  ) => {
    // 1. Optimize validation logic (format, extension, size <= 8MB for high-res lookbook photos)
    const val = validateImageFile(file, { maxSizeMB: 8 });
    if (!val.valid) {
      showAlert("warning", val.error || "Invalid lookbook image selected.");
      return;
    }

    const previousUrl =
      target === "hero" ? lookbookHero : target === "left" ? lookbookLeft : lookbookRight;

    const setLoader =
      target === "hero" ? setUploadingHero : target === "left" ? setUploadingLeft : setUploadingRight;
    setLoader(true);
    try {
      // 2. Upload new image to Supabase and purge previous Supabase image if present
      const res = await UploadService.uploadAndReplace(file, {
        folder: "lookbook",
        bucket: "aurevilux-products",
        previousUrl,
        validation: { maxSizeMB: 8 },
      });
      const url = res?.publicUrl || (res as any)?.url;
      if (url) {
        if (target === "hero") setLookbookHero(url);
        if (target === "left") setLookbookLeft(url);
        if (target === "right") setLookbookRight(url);

        // 3. Immediately persist new image link to the database
        await BusinessService.updateBusinessInfo({
          lookbook: {
            title: lookbookTitle,
            subtitle: lookbookSubtitle,
            quote: lookbookQuote,
            quoteCaption: lookbookQuoteCaption,
            description: lookbookQuote,
            story: lookbookStory,
            mainImage: target === "hero" ? url : lookbookHero,
            leftImage: target === "left" ? url : lookbookLeft,
            rightImage: target === "right" ? url : lookbookRight,
            galleryImages: [],
          },
        });

        showAlert(
          "success",
          isSupabaseStorageUrl(previousUrl)
            ? `Previous lookbook ${target} photo purged from Supabase. New photo uploaded & saved to database.`
            : `Lookbook ${target} imagery uploaded to Supabase Storage & saved to database.`
        );
      }
    } catch (err: any) {
      showAlert("error", "Image upload failed: " + (err.message || err));
    } finally {
      setLoader(false);
    }
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload: Partial<BusinessInfo> = {
        name,
        legalName,
        tagline,
        email,
        phone,
        address,
        currency,
        freeShippingThreshold,
        termsAndConditions,
        privacyPolicy,
        lookbook: {
          title: lookbookTitle,
          subtitle: lookbookSubtitle,
          quote: lookbookQuote,
          quoteCaption: lookbookQuoteCaption,
          description: lookbookQuote,
          story: lookbookStory,
          mainImage: lookbookHero,
          leftImage: lookbookLeft,
          rightImage: lookbookRight,
          galleryImages: [],
        },
      };

      await BusinessService.updateBusinessInfo(payload);
      showAlert("success", "Atelier parameters & Lookbook Studio saved successfully.");
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message || err.message || "Failed to persist business settings."
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-zinc-500">
        <Loader2 className="w-8 h-8 animate-spin text-brand-gold mb-3" />
        <span className="text-xs uppercase tracking-widest font-mono">
          Loading Atelier Backoffice Configuration...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full text-left pb-16">
      {/* Top Header */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
            BACKOFFICE CONFIGURATION
          </span>
          <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
            Boutique & Atelier Parameters
          </h1>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={saving}
          className="px-6 py-2.5 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2 shadow-lg shadow-brand-burgundy/30 disabled:opacity-50"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>Save Atelier Parameters</span>
        </button>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-900 pb-2">
        <button
          onClick={() => setActiveSection("general")}
          className={`flex items-center gap-2 px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold transition-colors ${
            activeSection === "general"
              ? "bg-brand-burgundy text-white font-bold"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Maison Identity & Logistics</span>
        </button>

        <button
          onClick={() => setActiveSection("legal")}
          className={`flex items-center gap-2 px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold transition-colors ${
            activeSection === "legal"
              ? "bg-brand-burgundy text-white font-bold"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Terms & Privacy Policies</span>
        </button>

        <button
          onClick={() => setActiveSection("lookbook")}
          className={`flex items-center gap-2 px-4 py-2 rounded text-xs uppercase tracking-wider font-semibold transition-colors ${
            activeSection === "lookbook"
              ? "bg-brand-burgundy text-white font-bold"
              : "text-zinc-400 hover:text-white hover:bg-zinc-900/60"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>Lookbook Studio</span>
        </button>
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">
        {/* Section 1: General Identity & Logistics */}
        {activeSection === "general" && (
          <div className="space-y-6 animate-fade-in">
            {/* Maison Identity */}
            <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
              <h3 className="font-serif text-sm text-white uppercase tracking-wider font-semibold border-b border-zinc-900 pb-2">
                Maison Identity & Concierge
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Atelier Brand Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold font-medium"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Legal Entity Name
                  </label>
                  <input
                    type="text"
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Concierge Support Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Atelier Phone Coordinate
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Atelier Flagship Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Atelier Editorial Tagline
                </label>
                <textarea
                  rows={2}
                  value={tagline}
                  onChange={(e) => setTagline(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs p-3 rounded text-white outline-none focus:border-brand-gold leading-relaxed"
                />
              </div>
            </div>

            {/* Pricing & Courier Thresholds */}
            <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
              <h3 className="font-serif text-sm text-white uppercase tracking-wider font-semibold border-b border-zinc-900 pb-2">
                Pricing & Courier Thresholds
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Operational Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none uppercase cursor-pointer"
                  >
                    <option value="USD ($) - UNITED STATES DOLLAR">USD ($) - United States Dollar</option>
                    <option value="EUR (€) - EUROZONE">EUR (€) - Eurozone</option>
                    <option value="GBP (£) - BRITISH POUND">GBP (£) - British Pound</option>
                    <option value="CHF (CHF) - SWISS FRANC">CHF (CHF) - Swiss Franc</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Complimentary White-Glove Shipping Minimum ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={freeShippingThreshold}
                    onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: Legal Policies (Terms & Conditions, Privacy Policy) */}
        {activeSection === "legal" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
              <div className="border-b border-zinc-900 pb-2 flex items-center justify-between">
                <h3 className="font-serif text-sm text-white uppercase tracking-wider font-semibold">
                  Terms & Conditions Accord
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Rendered live at /terms
                </span>
              </div>
              <textarea
                rows={12}
                value={termsAndConditions}
                onChange={(e) => setTermsAndConditions(e.target.value)}
                placeholder="Enter complete terms and conditions markdown..."
                className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs p-3.5 rounded text-white font-mono leading-relaxed outline-none focus:border-brand-gold"
              />
            </div>

            <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
              <div className="border-b border-zinc-900 pb-2 flex items-center justify-between">
                <h3 className="font-serif text-sm text-white uppercase tracking-wider font-semibold">
                  Patron Privacy Policy Covenant
                </h3>
                <span className="text-[10px] text-zinc-500 font-mono">
                  Rendered live at /privacy
                </span>
              </div>
              <textarea
                rows={12}
                value={privacyPolicy}
                onChange={(e) => setPrivacyPolicy(e.target.value)}
                placeholder="Enter complete privacy policy markdown..."
                className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs p-3.5 rounded text-white font-mono leading-relaxed outline-none focus:border-brand-gold"
              />
            </div>
          </div>
        )}

        {/* Section 3: Lookbook Studio */}
        {activeSection === "lookbook" && (
          <div className="space-y-6 animate-fade-in">
            <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
              <h3 className="font-serif text-sm text-white uppercase tracking-wider font-semibold border-b border-zinc-900 pb-2">
                Lookbook Story & Editorial Content
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Lookbook Section Subtitle
                  </label>
                  <input
                    type="text"
                    value={lookbookSubtitle}
                    onChange={(e) => setLookbookSubtitle(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-brand-gold uppercase tracking-widest outline-none focus:border-brand-gold font-bold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Editorial Title
                  </label>
                  <input
                    type="text"
                    value={lookbookTitle}
                    onChange={(e) => setLookbookTitle(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-sm px-3 py-2 rounded text-white font-serif uppercase tracking-wider outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Editorial Quote / Manifesto
                </label>
                <textarea
                  rows={3}
                  value={lookbookQuote}
                  onChange={(e) => setLookbookQuote(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs p-3 rounded text-white outline-none focus:border-brand-gold leading-relaxed font-serif"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Full Atelier Provenance & Story (Shown on /about)
                </label>
                <textarea
                  rows={5}
                  value={lookbookStory}
                  onChange={(e) => setLookbookStory(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs p-3 rounded text-white outline-none focus:border-brand-gold leading-relaxed"
                />
              </div>
            </div>

            {/* Lookbook Imagery (Supabase aurevilux-products) */}
            <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-5">
              <h3 className="font-serif text-sm text-white uppercase tracking-wider font-semibold border-b border-zinc-900 pb-2">
                Lookbook Imagery (Supabase Bucket: aurevilux-products)
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Hero / Main Lookbook Image */}
                <div className="space-y-2">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                    Main Hero Editorial
                  </span>
                  <div className="relative aspect-[4/5] rounded bg-[#0a0a0c] border border-zinc-800 overflow-hidden group">
                    <img src={lookbookHero} alt="Hero" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-brand-gold hover:text-white text-[10px] uppercase font-bold tracking-wider rounded border border-zinc-800 cursor-pointer transition-colors w-full justify-center">
                      {uploadingHero ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      <span>Upload Hero Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleUploadLookbookImage(e.target.files[0], "hero")}
                        disabled={uploadingHero}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    placeholder="Or Direct Image URL"
                    value={lookbookHero}
                    onChange={(e) => setLookbookHero(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-[10px] px-2.5 py-1.5 rounded text-zinc-400 font-mono outline-none focus:border-brand-gold"
                  />
                </div>

                {/* Left Grid Image */}
                <div className="space-y-2">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                    Left Grid Silhouette
                  </span>
                  <div className="relative aspect-[4/5] rounded bg-[#0a0a0c] border border-zinc-800 overflow-hidden group">
                    <img src={lookbookLeft} alt="Left Grid" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-brand-gold hover:text-white text-[10px] uppercase font-bold tracking-wider rounded border border-zinc-800 cursor-pointer transition-colors w-full justify-center">
                      {uploadingLeft ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      <span>Upload Left Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleUploadLookbookImage(e.target.files[0], "left")}
                        disabled={uploadingLeft}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    placeholder="Or Direct Image URL"
                    value={lookbookLeft}
                    onChange={(e) => setLookbookLeft(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-[10px] px-2.5 py-1.5 rounded text-zinc-400 font-mono outline-none focus:border-brand-gold"
                  />
                </div>

                {/* Right Grid Image */}
                <div className="space-y-2">
                  <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                    Right Grid Silhouette
                  </span>
                  <div className="relative aspect-[4/5] rounded bg-[#0a0a0c] border border-zinc-800 overflow-hidden group">
                    <img src={lookbookRight} alt="Right Grid" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-brand-gold hover:text-white text-[10px] uppercase font-bold tracking-wider rounded border border-zinc-800 cursor-pointer transition-colors w-full justify-center">
                      {uploadingRight ? <Loader2 className="w-3 h-3 animate-spin" /> : <Upload className="w-3 h-3" />}
                      <span>Upload Right Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleUploadLookbookImage(e.target.files[0], "right")}
                        disabled={uploadingRight}
                        className="hidden"
                      />
                    </label>
                  </div>
                  <input
                    type="url"
                    placeholder="Or Direct Image URL"
                    value={lookbookRight}
                    onChange={(e) => setLookbookRight(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-[10px] px-2.5 py-1.5 rounded text-zinc-400 font-mono outline-none focus:border-brand-gold"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

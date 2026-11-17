import React, { useState } from "react";
import {
  ArrowLeft,
  Upload,
  X,
  Loader2,
  FolderTree,
  AlertCircle,
} from "lucide-react";
import type { Category } from "../../types";
import { CategoryService } from "../../services/category.service";
import { UploadService } from "../../services/upload.service";
import { validateImageFile, isSupabaseStorageUrl } from "../../utils/imageValidation";
import { useLuxuryAlert } from "../../context/LuxuryAlertContext";

interface CategoryFormProps {
  category: Category | null;
  onSave: (savedCategory: Category) => void;
  onCancel: () => void;
}

export const CategoryForm: React.FC<CategoryFormProps> = ({
  category,
  onSave,
  onCancel,
}) => {
  const { showAlert } = useLuxuryAlert();
  const isEditing = Boolean(category);

  // Form State
  const [title, setTitle] = useState(category?.title || "");
  const [slug, setSlug] = useState(category?.slug || "");
  const [description, setDescription] = useState(category?.description || "");
  const [imageUrl, setImageUrl] = useState(category?.image || "");
  const [link, setLink] = useState(category?.link || "");
  const [buttonText, setButtonText] = useState(category?.buttonText || "EXPLORE COLLECTION");
  const [isActive, setIsActive] = useState<boolean>(category?.isActive ?? true);

  // Upload & Save State
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing || !slug) {
      const generatedSlug = val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generatedSlug);
      setLink(`/shop?category=${generatedSlug}`);
    }
  };

  // Upload Banner / Imagery to Supabase Storage Bucket aurevilux-products
  // Checks if an image is already in Supabase; if so, purges old image and saves new link to database
  const handleUploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // 1. Optimize validation logic (format, extension, size <= 5MB)
    const validation = validateImageFile(file, { maxSizeMB: 5 });
    if (!validation.valid) {
      showAlert("warning", validation.error || "Invalid image selected.");
      e.target.value = "";
      return;
    }

    const previousUrl = imageUrl;
    setIsUploading(true);
    try {
      // 2. Upload new image to Supabase and purge previous Supabase image if present
      const res = await UploadService.uploadAndReplace(file, {
        folder: "categories",
        bucket: "aurevilux-products",
        previousUrl,
        validation: { maxSizeMB: 5 },
      });
      const url = res?.publicUrl || (res as any)?.url;
      if (url) {
        setImageUrl(url);

        // 3. If editing an existing category, persist the new image link to the database immediately
        if (isEditing && category) {
          const catId = category._id || category.id || category.slug;
          if (catId) {
            await CategoryService.updateCategory(catId, { image: url });
          }
        }

        showAlert(
          "success",
          isSupabaseStorageUrl(previousUrl)
            ? "Previous image purged from Supabase. New image uploaded and linked in database."
            : "Category hero banner uploaded to Supabase Storage (aurevilux-products) & linked."
        );
      }
    } catch (err: any) {
      showAlert("error", "Supabase category upload failed: " + (err.message || err));
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleRemoveImage = async () => {
    const oldUrl = imageUrl;
    setImageUrl("");
    if (oldUrl && isSupabaseStorageUrl(oldUrl)) {
      try {
        await UploadService.deleteImage(oldUrl);
      } catch (err) {
        console.warn("Could not purge category image from Supabase:", err);
      }
    }
    if (isEditing && category) {
      const catId = category._id || category.id || category.slug;
      if (catId) {
        try {
          await CategoryService.updateCategory(catId, { image: "" });
        } catch {}
      }
    }
    showAlert("info", "Hero banner removed and purged from storage.");
  };

  // Form Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!title.trim()) {
      setErrorMessage("Category title is required.");
      return;
    }

    const finalSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");

    const payload: Partial<Category> = {
      title: title.trim(),
      slug: finalSlug,
      description: description.trim() || `Haute collection of ${title.trim()} curated for Aurevilux patrons.`,
      image:
        imageUrl ||
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=1200",
      link: link.trim() || `/shop?category=${finalSlug}`,
      buttonText: buttonText.trim() || "EXPLORE COLLECTION",
      isActive,
    };

    setIsSaving(true);
    try {
      let saved: Category;
      if (isEditing && category) {
        const id = category._id || category.id || category.slug || "";
        saved = await CategoryService.updateCategory(id, payload);
        showAlert("success", `Category "${saved.title}" updated successfully.`);
      } else {
        saved = await CategoryService.createCategory(payload);
        showAlert("success", `Category "${saved.title}" created successfully.`);
      }
      onSave(saved);
    } catch (err: any) {
      console.error("Failed to save category:", err);
      const msg = err.response?.data?.message || err.message || "Failed to persist category.";
      setErrorMessage(msg);
      showAlert("error", msg, "Category Persistence Error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full text-left space-y-8 animate-fade-in pb-16">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 bg-[#121216] hover:bg-zinc-800 text-zinc-400 hover:text-white rounded border border-zinc-800 transition-colors"
            title="Return to Category Directory"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
                CATEGORY MANAGEMENT
              </span>
              <span className="text-zinc-600 text-xs">&bull;</span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-mono">
                {isEditing ? "CATEGORY EDITING SUITE" : "NEW CATEGORY CREATION"}
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
              {isEditing ? `Edit Category: ${title || "Untitled"}` : "Create Luxury Category"}
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
            disabled={isSaving || isUploading}
            className="px-6 py-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold uppercase tracking-widest rounded transition-colors flex items-center gap-2 shadow-lg shadow-brand-burgundy/30 disabled:opacity-50"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isEditing ? "Save & Publish Category" : "Publish Category"}</span>
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

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column (2 Cols): Core Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-5">
            <div className="flex items-center gap-2.5 border-b border-zinc-900 pb-3">
              <FolderTree className="w-4 h-4 text-brand-gold" />
              <h2 className="font-serif text-base uppercase text-white tracking-wider font-semibold">
                Category Details & Taxonomy
              </h2>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1.5">
                  Category Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Evening Gowns, High Jewelry, Horology, Leather Goods"
                  value={title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 text-sm px-3.5 py-2.5 rounded text-white outline-none focus:border-brand-gold font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1.5">
                    URL Slug
                  </label>
                  <input
                    type="text"
                    placeholder="evening-gowns"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3.5 py-2.5 rounded text-zinc-300 font-mono outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1.5">
                    Storefront Action CTA
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DISCOVER COLLECTION"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3.5 py-2.5 rounded text-white outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1.5">
                  Storefront Route Link
                </label>
                <input
                  type="text"
                  placeholder="/shop?category=evening-gowns"
                  value={link}
                  onChange={(e) => setLink(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3.5 py-2.5 rounded text-zinc-300 font-mono outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1.5">
                  Editorial Description
                </label>
                <textarea
                  rows={4}
                  placeholder="Architectural silhouettes and artisanal craftsmanship curated for Aurevilux patrons..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs p-3 rounded text-white outline-none focus:border-brand-gold leading-relaxed"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (1 Col): Banner Image & Visibility */}
        <div className="space-y-6">
          {/* Banner Imagery */}
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
              Hero Banner Image (Supabase: aurevilux-products)
            </span>

            {imageUrl ? (
              <div className="relative aspect-video rounded-lg overflow-hidden border border-zinc-800 bg-[#0a0a0c] group">
                <img
                  src={imageUrl}
                  alt="Category Banner"
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute top-2 right-2 p-1.5 bg-black/80 hover:bg-red-600 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove and purge image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <label className="aspect-video border-2 border-dashed border-zinc-800 hover:border-brand-gold/60 rounded-lg flex flex-col items-center justify-center cursor-pointer transition-colors text-zinc-500 hover:text-zinc-300 p-4 text-center">
                <Upload className="w-6 h-6 mb-2 text-brand-gold" />
                <span className="text-xs uppercase font-bold tracking-wider text-zinc-300">
                  Upload Category Banner
                </span>
                <span className="text-[9px] text-zinc-500 uppercase mt-0.5">
                  Supabase Bucket &bull; aurevilux-products
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  disabled={isUploading}
                  className="hidden"
                />
              </label>
            )}

            {isUploading && (
              <div className="flex items-center gap-2 text-xs text-brand-gold pt-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Uploading banner to aurevilux-products...</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                  Or Direct Image URL
                </label>
                <label className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 text-brand-gold hover:text-white text-[10px] uppercase font-bold tracking-wider rounded border border-zinc-800 hover:border-brand-gold/60 cursor-pointer transition-colors">
                  <Upload className="w-3 h-3" />
                  <span>Upload Image</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleUploadImage}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>
              </div>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="w-full bg-[#0a0a0c] border border-zinc-800 text-xs px-3 py-2 rounded text-zinc-300 font-mono outline-none focus:border-brand-gold"
              />
            </div>
          </div>

          {/* Visibility Switch */}
          <div className="bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
            <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
              Storefront Display Settings
            </span>

            <label className="flex items-center justify-between cursor-pointer p-2.5 rounded bg-[#0a0a0c] border border-zinc-800 hover:border-zinc-700 transition-colors">
              <div>
                <span className="text-xs text-white uppercase font-semibold block">Storefront Active</span>
                <span className="text-[10px] text-zinc-500 block">Expose category in catalog navigation</span>
              </div>
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded bg-[#101014] border-zinc-700 text-brand-burgundy focus:ring-0"
              />
            </label>
          </div>
        </div>
      </form>
    </div>
  );
};

import React, { useState } from "react";
import { Plus, Trash2, Edit, Eye, EyeOff, ExternalLink } from "lucide-react";
import type { Category } from "../../types";
import { CategoryService } from "../../services/category.service";
import { CategoryForm } from "./CategoryForm";
import { useLuxuryAlert } from "../../context/LuxuryAlertContext";

interface CategoriesTabProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  setCategories,
}) => {
  const { showAlert, confirm } = useLuxuryAlert();
  const [viewMode, setViewMode] = useState<"directory" | "form">("directory");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Default Luxury Category Roster if empty
  const defaultCategories: Category[] = [
    {
      id: "cat-gowns",
      title: "Haute Gowns & Silhouettes",
      slug: "gowns",
      description: "Floor-length architectural evening wear crafted with French silk and beadwork.",
      image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=1200",
      link: "/shop?category=gowns",
      buttonText: "DISCOVER GOWNS",
      isActive: true,
    },
    {
      id: "cat-tailoring",
      title: "Savile Row Tailoring",
      slug: "tailoring",
      description: "Structured double-breasted blazers and wool trenchcoats handmade in Italy.",
      image: "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80&w=1200",
      link: "/shop?category=tailoring",
      buttonText: "DISCOVER TAILORING",
      isActive: true,
    },
    {
      id: "cat-bags",
      title: "Maison Handbags & Clutches",
      slug: "bags",
      description: "Structured top-handle leather bags with 24k gold-plated brass hardware.",
      image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&q=80&w=1200",
      link: "/shop?category=bags",
      buttonText: "DISCOVER BAGS",
      isActive: true,
    },
    {
      id: "cat-shoes",
      title: "Artisanal Footwear",
      slug: "shoes",
      description: "Italian calfskin Chelsea boots, sculptural heels, and velvet smoking loafers.",
      image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&q=80&w=1200",
      link: "/shop?category=shoes",
      buttonText: "DISCOVER FOOTWEAR",
      isActive: true,
    },
    {
      id: "cat-horology",
      title: "Fine Horology & Watches",
      slug: "watches",
      description: "Swiss automatic complications, tourbillons, and chronometers.",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=1200",
      link: "/shop?category=watches",
      buttonText: "DISCOVER WATCHES",
      isActive: true,
    },
    {
      id: "cat-jewelry",
      title: "High Jewelry & Joaillerie",
      slug: "jewelry",
      description: "Hand-set diamond solitaires, sapphire pendants, and 18k solid gold cuffs.",
      image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?auto=format&fit=crop&q=80&w=1200",
      link: "/shop?category=jewelry",
      buttonText: "DISCOVER JEWELRY",
      isActive: true,
    },
  ];

  const currentCategories =
    categories.length > 0 ? categories : defaultCategories;

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setViewMode("form");
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setViewMode("form");
  };

  const handleSaveCategory = (savedCategory: Category) => {
    const id = savedCategory._id || savedCategory.id || savedCategory.slug;
    setCategories((prev) => {
      const exists = prev.some((c) => c._id === id || c.id === id || c.slug === id);
      if (exists) {
        return prev.map((c) =>
          c._id === id || c.id === id || c.slug === id ? { ...c, ...savedCategory } : c
        );
      }
      return [...prev, savedCategory];
    });
    setViewMode("directory");
  };

  const handleToggleActive = async (cat: Category) => {
    const id = cat._id || cat.id || cat.slug || "";
    const nextState = !(cat.isActive ?? true);
    try {
      await CategoryService.toggleCategoryActive(id);
      showAlert("info", `Category "${cat.title}" storefront visibility set to ${nextState ? "Active" : "Archived"}.`);
    } catch (e: any) {
      console.warn("Toggle category API note:", e);
    }
    setCategories((prev) =>
      prev.map((c) =>
        c._id === id || c.id === id ? { ...c, isActive: nextState } : c
      )
    );
  };

  const handleDelete = async (cat: Category) => {
    const confirmed = await confirm({
      title: "Archive Category",
      message: `Are you certain you wish to remove category "${cat.title}"? Connected products will remain safe in inventory.`,
      confirmText: "Archive Category",
      cancelText: "Keep Category",
      variant: "danger",
    });

    if (!confirmed) return;

    const id = cat._id || cat.id || cat.slug || "";
    try {
      await CategoryService.deleteCategory(id);
      showAlert("success", `Category "${cat.title}" successfully archived.`);
    } catch (e: any) {
      console.warn("Delete category API note:", e);
      showAlert("error", "Failed to archive category: " + (e.response?.data?.message || e.message));
    }
    setCategories((prev) => prev.filter((c) => c._id !== id && c.id !== id));
  };

  // If in Form mode, render full-page CategoryForm
  if (viewMode === "form") {
    return (
      <CategoryForm
        category={editingCategory}
        onSave={handleSaveCategory}
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
            TAXONOMY CURATION
          </span>
          <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
            Luxury Categories ({currentCategories.length})
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="bg-brand-burgundy hover:bg-brand-burgundyHover text-white px-4 py-2 rounded text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors shadow-md shadow-brand-burgundy/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* CATEGORY DIRECTORY GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {currentCategories.map((cat) => {
          const isActive = cat.isActive !== false;
          return (
            <div
              key={cat.id || (cat as any)._id || cat.slug}
              className={`bg-[#101014] border rounded-lg overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                !isActive ? "border-zinc-900/60 opacity-60" : "border-zinc-900 hover:border-zinc-800 hover:shadow-xl hover:shadow-black/50"
              }`}
            >
              <div className="relative h-48 overflow-hidden group bg-black">
                <img
                  src={cat.image || "/placeholder.jpg"}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101014] via-black/40 to-transparent" />
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => handleToggleActive(cat)}
                    className={`p-1.5 rounded backdrop-blur-sm transition-colors ${
                      isActive
                        ? "bg-black/70 hover:bg-emerald-950 text-emerald-400"
                        : "bg-black/70 hover:bg-zinc-800 text-zinc-500"
                    }`}
                    title={isActive ? "Visible in Storefront" : "Archived"}
                  >
                    {isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 bg-black/70 hover:bg-brand-burgundy text-white rounded transition-colors backdrop-blur-sm"
                    title="Edit Category"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 bg-black/70 hover:bg-red-900 text-white rounded transition-colors backdrop-blur-sm"
                    title="Archive Category"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="absolute bottom-3 left-4 right-4">
                  <span className="text-[9px] uppercase tracking-[0.25em] text-brand-gold font-bold block">
                    SLUG: {cat.slug}
                  </span>
                  <h3 className="font-serif text-lg text-white uppercase font-bold tracking-wider truncate">
                    {cat.title}
                  </h3>
                </div>
              </div>

              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <p className="text-xs text-zinc-400 font-light leading-relaxed line-clamp-2">
                  {cat.description || "Haute couture collection curated for Aurevilux patrons."}
                </p>
                <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
                  <a
                    href={cat.link || `/shop?category=${cat.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[10px] text-zinc-500 hover:text-brand-gold flex items-center gap-1 font-mono uppercase tracking-wider transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>{cat.link || `/shop?category=${cat.slug}`}</span>
                  </a>
                  <span
                    className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase font-semibold ${
                      isActive
                        ? "bg-emerald-950/40 text-emerald-400 border border-emerald-900/50"
                        : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                    }`}
                  >
                    {isActive ? "Active" : "Archived"}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

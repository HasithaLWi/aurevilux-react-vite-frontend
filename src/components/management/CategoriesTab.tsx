import React, { useState } from "react";
import { Plus, Trash2, Edit, Check, Eye, EyeOff } from "lucide-react";
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
  const [activeView, setActiveView] = useState<"departments" | "subcategories">(
    "departments"
  );

  // Default Department Roster if empty
  const defaultDepartments: Category[] = [
    {
      id: "dept-women",
      title: "Women Haute Couture",
      slug: "women",
      department: "women",
      subcategories: ["Gowns", "Bags", "Coats", "Shoes", "Jewelry", "Watches"],
      description: "Architectural silhouettes tailored with Parisian craftsmanship.",
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800",
      link: "/shop?category=women",
      buttonText: "DISCOVER WOMEN",
      isActive: true,
    },
    {
      id: "dept-men",
      title: "Men Savile Row & Atelier",
      slug: "men",
      department: "men",
      subcategories: ["Suits", "Outerwear", "Bags", "Shoes", "Watches", "Accessories"],
      description: "Modern bespoke tailoring and handcrafted Italian leather goods.",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
      link: "/shop?category=men",
      buttonText: "DISCOVER MEN",
      isActive: true,
    },
    {
      id: "dept-accessories",
      title: "Fine Accessories & Horology",
      slug: "accessories",
      department: "accessories",
      subcategories: ["Watches", "Fine Jewelry", "Silk Scarves", "Belts", "Eyewear"],
      description: "Swiss horological masterpieces and gemstone haute joaillerie.",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
      link: "/shop?category=accessories",
      buttonText: "DISCOVER ACCESSORIES",
      isActive: true,
    },
    {
      id: "dept-new",
      title: "New Arrivals & Private Releases",
      slug: "new-arrivals",
      department: "new-arrivals",
      subcategories: ["Limited Atelier", "Runway Autumn/Winter", "Capsule Drops"],
      description: "First access to private capsule collections from Milan and Paris.",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800",
      link: "/shop?category=new-arrivals",
      buttonText: "DISCOVER NEW ARRIVALS",
      isActive: true,
    },
  ];

  const currentCategories =
    categories.length > 0 ? categories : defaultDepartments;

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
      showAlert("info", `Category "${cat.title}" visibility changed to ${nextState ? "Active" : "Archived"}.`);
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
      message: `Are you certain you wish to remove category "${cat.title}"? Connected products will retain their departmental mapping.`,
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
            TAXONOMY ARCHITECTURE
          </span>
          <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
            Two-Tier Categories ({currentCategories.length})
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-[#101014] border border-zinc-900 rounded p-1 flex">
            <button
              onClick={() => setActiveView("departments")}
              className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors ${
                activeView === "departments"
                  ? "bg-brand-burgundy text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Featured Departments
            </button>
            <button
              onClick={() => setActiveView("subcategories")}
              className={`px-3 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors ${
                activeView === "subcategories"
                  ? "bg-brand-burgundy text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              Subcategories Roster
            </button>
          </div>
          <button
            onClick={handleOpenAdd}
            className="bg-brand-burgundy hover:bg-brand-burgundyHover text-white px-4 py-2 rounded text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors shadow-md shadow-brand-burgundy/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: FEATURED DEPARTMENTS */}
      {activeView === "departments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {currentCategories.map((cat) => {
            const isActive = cat.isActive !== false;
            return (
              <div
                key={cat.id || (cat as any)._id}
                className={`bg-[#101014] border rounded-lg overflow-hidden flex flex-col justify-between transition-colors ${
                  !isActive ? "border-zinc-900/60 opacity-60" : "border-zinc-900 hover:border-zinc-800"
                }`}
              >
                <div className="relative h-48 overflow-hidden group">
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
                      title="Delete Category"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <span className="text-[9px] uppercase tracking-[0.25em] text-brand-gold font-bold block">
                      DEPARTMENT: {cat.department || cat.slug}
                    </span>
                    <h3 className="font-serif text-lg text-white uppercase font-bold tracking-wider">
                      {cat.title}
                    </h3>
                  </div>
                </div>

                <div className="p-4 space-y-3">
                  <p className="text-xs text-zinc-400 font-light leading-relaxed">{cat.description}</p>
                  <div className="space-y-1.5 pt-2 border-t border-zinc-900">
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-semibold block">
                      Connected Subcategories:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {(cat.subcategories && cat.subcategories.length > 0
                        ? cat.subcategories
                        : ["Bags", "Shoes", "Coats", "Watches", "Jewelry"]
                      ).map((sub, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-800 px-2.5 py-0.5 rounded font-mono uppercase"
                        >
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: SUBCATEGORIES ROSTER & DEPARTMENT CONNECTIONS */}
      {activeView === "subcategories" && (
        <div className="bg-[#101014] border border-zinc-900 rounded-lg overflow-hidden">
          <div className="p-4 border-b border-zinc-900 flex justify-between items-center">
            <div>
              <h4 className="font-serif text-sm text-white uppercase tracking-wider font-semibold">
                Hierarchical Mapping (e.g. Men &rarr; Bags, Women &rarr; Watches)
              </h4>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
                Subcategories dynamically filtered within the shop sidebar
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-zinc-900/60 text-zinc-500 uppercase text-[9px] tracking-widest font-semibold border-b border-zinc-900">
                <tr>
                  <th className="py-3 px-4">Subcategory</th>
                  <th className="py-3 px-4">Linked Departments</th>
                  <th className="py-3 px-4">URL Routing Filter</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900 font-light">
                {[
                  { name: "Bags & Leather", depts: ["Women", "Men"], slug: "bags" },
                  { name: "Shoes & Footwear", depts: ["Women", "Men"], slug: "shoes" },
                  { name: "Coats & Tailoring", depts: ["Women", "Men"], slug: "coats" },
                  { name: "Watches & Horology", depts: ["Women", "Men", "Accessories"], slug: "watches" },
                  { name: "Fine Jewelry", depts: ["Women", "Accessories"], slug: "jewelry" },
                  { name: "Evening Gowns", depts: ["Women"], slug: "gowns" },
                  { name: "Silk Scarves & Belts", depts: ["Women", "Men", "Accessories"], slug: "accessories" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3 px-4 font-serif text-white font-medium">
                      {row.name}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5">
                        {row.depts.map((d, i) => (
                          <span
                            key={i}
                            className="text-[9px] bg-brand-burgundy/20 text-brand-gold border border-brand-gold/30 px-2 py-0.5 rounded font-mono uppercase"
                          >
                            {d}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-400 text-[10px]">
                      /shop?subcategory={row.slug}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="text-[9px] text-emerald-400 font-bold uppercase flex items-center justify-end gap-1">
                        <Check className="w-3 h-3" />
                        <span>Active</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

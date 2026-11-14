import React, { useState } from "react";
import { Plus, Trash2, Edit, Check, X } from "lucide-react";
import type { Category } from "../../types";
import { CategoryService } from "../../services/category.service";

interface CategoriesTabProps {
  categories: Category[];
  setCategories: React.Dispatch<React.SetStateAction<Category[]>>;
}

export const CategoriesTab: React.FC<CategoriesTabProps> = ({
  categories,
  setCategories,
}) => {
  const [activeView, setActiveView] = useState<"departments" | "subcategories">(
    "departments"
  );
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState<
    "women" | "men" | "accessories" | "new-arrivals" | "all"
  >("women");
  const [parentCategory, setParentCategory] = useState("");
  const [subcategoriesInput, setSubcategoriesInput] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  // Default Department Roster if empty
  const defaultDepartments = [
    {
      id: "dept-women",
      title: "Women Haute Couture",
      slug: "women",
      department: "women" as const,
      subcategories: ["Gowns", "Bags", "Coats", "Shoes", "Jewelry", "Watches"],
      description: "Architectural silhouettes tailored with Parisian craftsmanship.",
      image: "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800",
      link: "/shop?category=women",
      buttonText: "DISCOVER WOMEN",
    },
    {
      id: "dept-men",
      title: "Men Savile Row & Atelier",
      slug: "men",
      department: "men" as const,
      subcategories: ["Suits", "Outerwear", "Bags", "Shoes", "Watches", "Accessories"],
      description: "Modern bespoke tailoring and handcrafted Italian leather goods.",
      image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=800",
      link: "/shop?category=men",
      buttonText: "DISCOVER MEN",
    },
    {
      id: "dept-accessories",
      title: "Fine Accessories & Horology",
      slug: "accessories",
      department: "accessories" as const,
      subcategories: ["Watches", "Fine Jewelry", "Silk Scarves", "Belts", "Eyewear"],
      description: "Swiss horological masterpieces and gemstone haute joaillerie.",
      image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&q=80&w=800",
      link: "/shop?category=accessories",
      buttonText: "DISCOVER ACCESSORIES",
    },
    {
      id: "dept-new",
      title: "New Arrivals & Private Releases",
      slug: "new-arrivals",
      department: "new-arrivals" as const,
      subcategories: ["Limited Atelier", "Runway Autumn/Winter", "Capsule Drops"],
      description: "First access to private capsule collections from Milan and Paris.",
      image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&q=80&w=800",
      link: "/shop?category=new-arrivals",
      buttonText: "DISCOVER NEW ARRIVALS",
    },
  ];

  const currentCategories =
    categories.length > 0 ? categories : defaultDepartments;

  const handleOpenAdd = () => {
    setEditingCategory(null);
    setTitle("");
    setDepartment("women");
    setParentCategory("");
    setSubcategoriesInput("Bags, Shoes, Coats");
    setDescription("");
    setImage("");
    setShowModal(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setEditingCategory(cat);
    setTitle(cat.title);
    setDepartment((cat.department as any) || "women");
    setParentCategory(cat.parentCategory || "");
    setSubcategoriesInput((cat.subcategories || []).join(", "));
    setDescription(cat.description || "");
    setImage(cat.image || "");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const subcats = subcategoriesInput
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const payload: Partial<Category> = {
      title,
      slug,
      department,
      parentCategory,
      subcategories: subcats,
      description,
      image:
        image ||
        "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?auto=format&fit=crop&q=80&w=800",
      link: `/shop?category=${slug}`,
      buttonText: "EXPLORE COLLECTION",
    };

    try {
      if (editingCategory) {
        const id = editingCategory._id || editingCategory.id || editingCategory.slug || "";
        const updated = await CategoryService.updateCategory(id, payload);
        setCategories((prev) =>
          prev.map((c) => (c._id === id || c.id === id ? { ...c, ...updated } : c))
        );
      } else {
        const created = await CategoryService.createCategory(payload);
        setCategories((prev) => [...prev, created]);
      }
      setShowModal(false);
    } catch {
      // Local fallback
      if (editingCategory) {
        setCategories((prev) =>
          prev.map((c) =>
            c.id === editingCategory.id ? ({ ...c, ...payload } as Category) : c
          )
        );
      } else {
        const localCat = {
          ...payload,
          id: `cat-${Date.now()}`,
        } as Category;
        setCategories((prev) => [...prev, localCat]);
      }
      setShowModal(false);
    }
  };

  const handleDelete = async (cat: Category) => {
    if (!confirm(`Remove category "${cat.title}"?`)) return;
    const id = cat._id || cat.id || cat.slug || "";
    try {
      await CategoryService.deleteCategory(id);
    } catch (e) {
      console.warn("Delete category API note:", e);
    }
    setCategories((prev) => prev.filter((c) => c._id !== id && c.id !== id));
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
            TAXONOMY ARCHITECTURE
          </span>
          <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
            Two-Tier Categories
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
            className="bg-brand-burgundy hover:bg-brand-burgundyHover text-white px-3.5 py-2 rounded text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add Category</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: FEATURED DEPARTMENTS */}
      {activeView === "departments" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {currentCategories.map((cat) => (
            <div
              key={cat.id || (cat as any)._id}
              className="bg-[#101014] border border-zinc-900 rounded-lg overflow-hidden flex flex-col justify-between"
            >
              <div className="relative h-44 overflow-hidden group">
                <img
                  src={cat.image}
                  alt={cat.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101014] via-black/40 to-transparent" />
                <div className="absolute top-3 right-3 flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 bg-black/70 hover:bg-brand-burgundy text-white rounded transition-colors"
                    title="Edit Category"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1.5 bg-black/70 hover:bg-red-900 text-white rounded transition-colors"
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
                <p className="text-xs text-zinc-400 font-light">{cat.description}</p>
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
                        className="text-[10px] bg-zinc-900 text-zinc-300 border border-zinc-800 px-2 py-0.5 rounded font-mono uppercase"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
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

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#101014] border border-zinc-800 rounded-lg max-w-lg w-full p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-base text-white uppercase tracking-wider font-bold">
                {editingCategory ? "Edit Category" : "Add Luxury Category"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Category Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Leather Goods & Horology"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Department
                </label>
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value as any)}
                  className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none uppercase"
                >
                  <option value="women">Women</option>
                  <option value="men">Men</option>
                  <option value="accessories">Accessories</option>
                  <option value="new-arrivals">New Arrivals</option>
                  <option value="all">Universal (All Departments)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Connected Subcategories (comma-separated)
                </label>
                <input
                  type="text"
                  placeholder="Bags, Shoes, Coats, Watches"
                  value={subcategoriesInput}
                  onChange={(e) => setSubcategoriesInput(e.target.value)}
                  className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Banner Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://..."
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Editorial description of this collection..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-brand-black border border-zinc-800 text-xs p-2.5 rounded text-white outline-none focus:border-brand-gold"
                />
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from "react";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Upload,
  X,
  Loader2,
  CheckCircle,
} from "lucide-react";
import type { Product } from "../../types";
import { ProductService } from "../../services/product.service";
import { UploadService } from "../../services/upload.service";
import { LuxuryPagination } from "../common/LuxuryPagination";

interface ProductsTabProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  showModal: boolean;
  setShowModal: (open: boolean) => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  setProducts,
  showModal,
  setShowModal,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStock, setSelectedStock] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [formName, setFormName] = useState("");
  const [formBrand, setFormBrand] = useState("Saint Laurent");
  const [formDepartment, setFormDepartment] = useState<
    "women" | "men" | "accessories" | "new-arrivals"
  >("women");
  const [formSubcategory, setFormSubcategory] = useState("Bags");
  const [formPrice, setFormPrice] = useState(1450);
  const [formStock, setFormStock] = useState(12);
  const [formDescription, setFormDescription] = useState("");
  const [formImages, setFormImages] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [formError, setFormError] = useState("");

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setFormName("");
    setFormBrand("Saint Laurent");
    setFormDepartment("women");
    setFormSubcategory("Bags");
    setFormPrice(1450);
    setFormStock(12);
    setFormDescription("");
    setFormImages([]);
    setUploadMessage("");
    setFormError("");
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormBrand(p.brand);
    setFormDepartment((p.department as any) || (p.category as any) || "women");
    setFormSubcategory(p.subcategory || "Bags");
    setFormPrice(p.price);
    setFormStock(p.stockCount ?? 10);
    setFormDescription(p.description || "");
    setFormImages(p.images || []);
    setUploadMessage("");
    setFormError("");
    setShowModal(true);
  };

  // Handle Multi-file Supabase upload (Max 5 images)
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);

    if (formImages.length + files.length > 5) {
      alert("Aurevilux policy allows a maximum of 5 images per luxury piece.");
      return;
    }

    setIsUploading(true);
    setUploadMessage("Uploading to Supabase Storage...");
    try {
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const res = await UploadService.uploadSingle(file, "products");
        const url = res?.publicUrl || (res as any)?.url;
        if (url) {
          uploadedUrls.push(url);
        }
      }
      setFormImages((prev) => [...prev, ...uploadedUrls]);
      setUploadMessage(`Successfully stored ${uploadedUrls.length} piece image(s) to Supabase.`);
    } catch (err: any) {
      alert("Supabase upload failed: " + (err.message || err));
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setFormImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Save (Create or Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Piece name is required.");
      return;
    }
    if (formImages.length === 0) {
      setFormError("Please upload at least 1 image to Supabase.");
      return;
    }

    const slug = formName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const payload: Partial<Product> = {
      name: formName,
      slug,
      brand: formBrand,
      category: formDepartment,
      categoryLabel: `${formDepartment.toUpperCase()} / ${formSubcategory.toUpperCase()}`,
      department: formDepartment,
      subcategory: formSubcategory,
      price: Number(formPrice),
      stockCount: Number(formStock),
      inStock: Number(formStock) > 0,
      description: formDescription.trim() || `${formName} tailored for Aurevilux atelier fine living.`,
      longDescription: formDescription.trim() || `${formName} tailored for Aurevilux atelier fine living.`,
      images: formImages.slice(0, 5),
      isActive: editingProduct ? editingProduct.isActive ?? true : true,
    };

    try {
      if (editingProduct) {
        const id = editingProduct._id || editingProduct.id || editingProduct.slug;
        const updated = await ProductService.updateProduct(id, payload);
        setProducts((prev) =>
          prev.map((p) =>
            (p._id === id || p.id === id || p.slug === id) ? { ...p, ...updated } : p
          )
        );
      } else {
        const created = await ProductService.createProduct(payload);
        setProducts((prev) => [created, ...prev]);
      }
      setShowModal(false);
    } catch (err: any) {
      console.error("Failed to save product:", err);
      setFormError(
        err.response?.data?.message ||
        err.message ||
        "Failed to persist luxury piece in database. Please verify connection."
      );
    }
  };

  // Toggle Active State
  const handleToggleActive = async (p: Product) => {
    const id = p._id || p.id || p.slug;
    const nextState = !(p.isActive ?? true);
    try {
      await ProductService.toggleProductActive(id);
    } catch (e) {
      console.warn("Toggle active API note:", e);
    }
    setProducts((prev) =>
      prev.map((item) =>
        (item._id === id || item.id === id || item.slug === id)
          ? { ...item, isActive: nextState }
          : item
      )
    );
  };

  // Soft Delete
  const handleDelete = async (p: Product) => {
    if (!confirm(`Are you sure you want to remove "${p.name}"? This will soft-delete the piece and purge its images from Supabase Storage.`)) {
      return;
    }
    const id = p._id || p.id || p.slug;
    try {
      await ProductService.deleteProduct(id);
    } catch (e) {
      console.warn("Delete product API note:", e);
    }
    setProducts((prev) =>
      prev.filter((item) => item._id !== id && item.id !== id && item.slug !== id)
    );
  };

  // Filter & Sort products
  const filteredProducts = products
    .filter((p) => {
      if (p.isDeleted) return false;

      // Search term
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = (p.name || "").toLowerCase().includes(q);
        const matchBrand = (p.brand || "").toLowerCase().includes(q);
        const matchSub = (p.subcategory || "").toLowerCase().includes(q);
        const matchId = (p._id || p.id || p.slug || "").toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchSub && !matchId) return false;
      }

      // Department filter
      if (selectedDept !== "all") {
        if (p.department !== selectedDept && p.category !== selectedDept) return false;
      }

      // Visibility filter
      if (selectedStatus === "active" && p.isActive === false) return false;
      if (selectedStatus === "hidden" && p.isActive !== false) return false;

      // Stock filter
      const stock = p.stockCount ?? 10;
      if (selectedStock === "in-stock" && stock <= 5) return false;
      if (selectedStock === "low-stock" && (stock === 0 || stock > 5)) return false;
      if (selectedStock === "out-of-stock" && stock > 0) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
      if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "stock-desc") return (b.stockCount ?? 10) - (a.stockCount ?? 10);
      if (sortBy === "stock-asc") return (a.stockCount ?? 10) - (b.stockCount ?? 10);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedDept("all");
    setSelectedStatus("all");
    setSelectedStock("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
            CATALOG MANAGEMENT
          </span>
          <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
            Products Directory ({filteredProducts.length})
          </h1>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-brand-burgundy hover:bg-brand-burgundyHover text-white px-4 py-2 rounded text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Luxury Piece</span>
        </button>
      </div>

      {/* Filter / Search Bar (Horizontal Selectors, No Sidebars) */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search luxury pieces by title, brand, or SKU..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full bg-[#101014] border border-zinc-900 text-xs pl-9 pr-9 py-2.5 rounded text-white placeholder-zinc-500 outline-none focus:border-brand-gold/50"
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Selectors Group */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          {/* Department */}
          <div className="flex items-center gap-1.5 bg-[#101014] border border-zinc-900 rounded px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={selectedDept}
              onChange={(e) => {
                setSelectedDept(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-zinc-300 outline-none uppercase tracking-wider py-1.5 cursor-pointer"
            >
              <option value="all" className="bg-[#101014] text-white">All Departments</option>
              <option value="women" className="bg-[#101014] text-white">Women</option>
              <option value="men" className="bg-[#101014] text-white">Men</option>
              <option value="accessories" className="bg-[#101014] text-white">Accessories</option>
              <option value="new-arrivals" className="bg-[#101014] text-white">New Arrivals</option>
            </select>
          </div>

          {/* Visibility */}
          <select
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#101014] border border-zinc-900 text-xs px-3 py-2.5 rounded text-zinc-300 outline-none uppercase tracking-wider cursor-pointer"
          >
            <option value="all" className="bg-[#101014] text-white">All Visibilities</option>
            <option value="active" className="bg-[#101014] text-white">Live in Store</option>
            <option value="hidden" className="bg-[#101014] text-white">Hidden (Atelier Only)</option>
          </select>

          {/* Stock Health */}
          <select
            value={selectedStock}
            onChange={(e) => {
              setSelectedStock(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#101014] border border-zinc-900 text-xs px-3 py-2.5 rounded text-zinc-300 outline-none uppercase tracking-wider cursor-pointer"
          >
            <option value="all" className="bg-[#101014] text-white">All Stock Levels</option>
            <option value="in-stock" className="bg-[#101014] text-white">In Stock (&gt;5)</option>
            <option value="low-stock" className="bg-[#101014] text-white">Low Stock (1-5)</option>
            <option value="out-of-stock" className="bg-[#101014] text-white">Sold Out (0)</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#101014] border border-zinc-900 text-xs px-3 py-2.5 rounded text-zinc-300 outline-none uppercase tracking-wider cursor-pointer"
          >
            <option value="newest" className="bg-[#101014] text-white">Newest First</option>
            <option value="price-desc" className="bg-[#101014] text-white">Price: High to Low</option>
            <option value="price-asc" className="bg-[#101014] text-white">Price: Low to High</option>
            <option value="stock-desc" className="bg-[#101014] text-white">Stock: High to Low</option>
            <option value="stock-asc" className="bg-[#101014] text-white">Stock: Low to High</option>
          </select>

          {(searchTerm || selectedDept !== "all" || selectedStatus !== "all" || selectedStock !== "all" || sortBy !== "newest") && (
            <button
              onClick={handleClearFilters}
              className="text-[10px] text-zinc-400 hover:text-brand-gold uppercase tracking-widest px-2 py-2 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[#101014] border border-zinc-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-900/60 text-zinc-500 uppercase text-[9px] tracking-widest font-semibold border-b border-zinc-900">
              <tr>
                <th className="py-3 px-4">Piece</th>
                <th className="py-3 px-4">Department / Subcat</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Stock</th>
                <th className="py-3 px-4">Store Visibility</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 font-light">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-zinc-500">
                    No luxury pieces match your current catalog filters.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((p) => {
                  const isActive = p.isActive !== false;
                  return (
                    <tr
                      key={p.id || p._id}
                      className={`hover:bg-zinc-900/30 transition-colors ${
                        !isActive ? "opacity-60 bg-zinc-950/40" : ""
                      }`}
                    >
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <div className="w-10 h-12 rounded bg-zinc-900 overflow-hidden border border-zinc-800 flex-shrink-0">
                          <img
                            src={p.images[0] || "/placeholder.jpg"}
                            alt={p.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="font-serif text-white font-semibold uppercase">
                            {p.name}
                          </p>
                          <span className="text-[9px] text-brand-gold uppercase font-semibold">
                            {p.brand}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="text-zinc-300 uppercase text-[10px] block font-medium">
                          {p.department || p.category}
                        </span>
                        <span className="text-[9px] text-zinc-500 uppercase block">
                          {p.subcategory || "Couture Piece"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-serif text-white font-medium">
                        ${p.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={
                            (p.stockCount ?? 10) <= 3
                              ? "text-red-400 font-bold"
                              : "text-zinc-300"
                          }
                        >
                          {p.stockCount ?? 10} units
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleToggleActive(p)}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[9px] font-bold uppercase transition-all ${
                            isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                              : "bg-zinc-800/60 text-zinc-400 border border-zinc-700 hover:bg-zinc-800"
                          }`}
                          title="Click to toggle customer view"
                        >
                          {isActive ? (
                            <>
                              <Eye className="w-3 h-3" />
                              <span>Live in Store</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3" />
                              <span>Hidden (Atelier Only)</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded border border-zinc-800 transition-colors"
                            title="Edit Piece"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(p)}
                            className="p-1.5 bg-zinc-900 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 rounded border border-zinc-800 hover:border-red-900 transition-colors"
                            title="Soft Delete & Purge Supabase Images"
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

        {/* Complete Luxury Pagination */}
        <div className="px-4 pb-4">
          <LuxuryPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredProducts.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemName="pieces"
          />
        </div>
      </div>

      {/* Add / Edit Luxury Piece Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#101014] border border-zinc-800 rounded-lg max-w-2xl w-full p-6 space-y-5 my-8 text-left">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <div>
                <span className="text-[9px] text-brand-gold uppercase tracking-[0.25em] font-bold">
                  ATELIER WORKSHOP
                </span>
                <h3 className="font-serif text-lg text-white uppercase tracking-wider font-bold">
                  {editingProduct ? "Edit Luxury Piece" : "Add New Luxury Piece"}
                </h3>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-red-950/40 border border-red-900 text-red-300 text-xs rounded">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Piece Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Velvet Luna Wing Gown"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Maison / Brand *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Saint Laurent, Celine, Gucci"
                    value={formBrand}
                    onChange={(e) => setFormBrand(e.target.value)}
                    className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Department (Featured) *
                  </label>
                  <select
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value as any)}
                    className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none uppercase"
                  >
                    <option value="women">Women</option>
                    <option value="men">Men</option>
                    <option value="accessories">Accessories</option>
                    <option value="new-arrivals">New Arrivals</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Subcategory *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Bags, Shoes, Coats, Watches, Jewelry"
                    value={formSubcategory}
                    onChange={(e) => setFormSubcategory(e.target.value)}
                    className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Price (USD $) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formPrice}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold font-mono"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Stock Units *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formStock}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Atelier Description
                </label>
                <textarea
                  rows={3}
                  placeholder="Architectural lines tailored with Parisian craftsmanship..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full bg-brand-black border border-zinc-800 text-xs p-3 rounded text-white outline-none focus:border-brand-gold"
                />
              </div>

              {/* Supabase Multi-Image Upload (Max 5 images) */}
              <div className="space-y-2 border-t border-zinc-800/80 pt-3">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                    Product Imagery (Supabase Storage — Max 5 Images)
                  </label>
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {formImages.length}/5 uploaded
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 items-center">
                  {formImages.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      className="relative w-16 h-20 rounded bg-zinc-900 border border-zinc-800 overflow-hidden group"
                    >
                      <img
                        src={imgUrl}
                        alt="Product upload"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(idx)}
                        className="absolute top-1 right-1 bg-black/80 hover:bg-red-600 text-white rounded p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove Image"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {formImages.length < 5 && (
                    <label className="w-16 h-20 border border-dashed border-zinc-700 hover:border-brand-gold/60 rounded flex flex-col items-center justify-center cursor-pointer transition-colors text-zinc-500 hover:text-zinc-300">
                      <Upload className="w-4 h-4 mb-1" />
                      <span className="text-[9px] uppercase font-semibold">Upload</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={isUploading}
                      />
                    </label>
                  )}
                </div>

                {isUploading && (
                  <div className="flex items-center gap-2 text-xs text-brand-gold pt-1">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Uploading image(s) to Supabase Storage bucket...</span>
                  </div>
                )}
                {uploadMessage && !isUploading && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 pt-1">
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>{uploadMessage}</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white text-xs uppercase tracking-wider rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-5 py-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold uppercase tracking-widest rounded transition-colors disabled:opacity-50"
                >
                  {editingProduct ? "Save Changes" : "Create Piece"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};


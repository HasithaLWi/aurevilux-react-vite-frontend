import React, { useState, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  X,
} from "lucide-react";
import type { Product } from "../../types";
import { ProductService } from "../../services/product.service";
import { LuxuryPagination } from "../common/LuxuryPagination";
import { ProductForm } from "./ProductForm";
import { useLuxuryAlert } from "../../context/LuxuryAlertContext";

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
  const { showAlert, confirm } = useLuxuryAlert();
  const [viewMode, setViewMode] = useState<"directory" | "form">("directory");
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Filters & Pagination State
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedStock, setSelectedStock] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // React to parent request to open creation form
  useEffect(() => {
    if (showModal) {
      setEditingProduct(null);
      setViewMode("form");
    }
  }, [showModal]);

  // Open Full-Page Form for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setViewMode("form");
  };

  // Open Full-Page Form for Edit
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setViewMode("form");
  };

  // Handle Save from Form
  const handleSaveProduct = (savedProduct: Product) => {
    const id = savedProduct._id || savedProduct.id || savedProduct.slug;
    setProducts((prev) => {
      const exists = prev.some((p) => p._id === id || p.id === id || p.slug === id);
      if (exists) {
        return prev.map((p) =>
          p._id === id || p.id === id || p.slug === id ? { ...p, ...savedProduct } : p
        );
      }
      return [savedProduct, ...prev];
    });
    setViewMode("directory");
    setShowModal(false);
  };

  const handleCancelForm = () => {
    setViewMode("directory");
    setShowModal(false);
  };

  // Toggle Active State
  const handleToggleActive = async (p: Product) => {
    const id = p._id || p.id || p.slug;
    const nextState = !(p.isActive ?? true);
    try {
      await ProductService.toggleProductActive(id);
      showAlert(
        "info",
        `Piece "${p.name}" visibility changed to ${nextState ? "Live in Store" : "Atelier Archive"}.`
      );
    } catch (e: any) {
      console.warn("Toggle active API note:", e);
    }
    setProducts((prev) =>
      prev.map((item) =>
        item._id === id || item.id === id || item.slug === id
          ? { ...item, isActive: nextState }
          : item
      )
    );
  };

  // Soft Delete with Luxury Confirmation
  const handleDelete = async (p: Product) => {
    const confirmed = await confirm({
      title: "Archive Luxury Piece",
      message: `Are you certain you wish to archive "${p.name}"? This will soft-delete the piece from the active catalog and remove its assets from public display.`,
      confirmText: "Archive Piece",
      cancelText: "Keep Piece",
      variant: "danger",
    });

    if (!confirmed) return;

    const id = p._id || p.id || p.slug;
    try {
      await ProductService.deleteProduct(id);
      showAlert("success", `Piece "${p.name}" successfully archived.`);
    } catch (e: any) {
      console.warn("Delete product API note:", e);
      showAlert("error", "Failed to archive piece: " + (e.response?.data?.message || e.message));
    }
    setProducts((prev) =>
      prev.filter((item) => item._id !== id && item.id !== id && item.slug !== id)
    );
  };

  // If in Form view mode, render full-page ProductForm
  if (viewMode === "form") {
    return (
      <ProductForm
        product={editingProduct}
        onSave={handleSaveProduct}
        onCancel={handleCancelForm}
      />
    );
  }

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
        if (Array.isArray(p.department)) {
          if (!p.department.map((d) => d.toLowerCase()).includes(selectedDept.toLowerCase())) return false;
        } else if (p.department !== selectedDept && p.category !== selectedDept) {
          return false;
        }
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
          className="bg-brand-burgundy hover:bg-brand-burgundyHover text-white px-4 py-2.5 rounded text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors self-start md:self-auto shadow-md shadow-brand-burgundy/20"
        >
          <Plus className="w-4 h-4" />
          <span>Add Luxury Piece</span>
        </button>
      </div>

      {/* Filter / Search Bar */}
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
                  const deptDisplay = Array.isArray(p.department)
                    ? p.department.join(", ")
                    : p.department || p.category;
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
                          {deptDisplay}
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
                            title="Soft Delete & Archive Piece"
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
    </div>
  );
};

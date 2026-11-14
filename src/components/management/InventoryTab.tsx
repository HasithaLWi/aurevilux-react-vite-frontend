import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import type { Product } from "../../types";
import { ProductService } from "../../services/product.service";
import { LuxuryPagination } from "../common/LuxuryPagination";

interface InventoryTabProps {
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  products,
  setProducts,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");
  const [selectedStockHealth, setSelectedStockHealth] = useState("all");
  const [sortBy, setSortBy] = useState("low-first");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleAdjustStock = async (product: Product, delta: number) => {
    const nextCount = Math.max(0, (product.stockCount ?? 10) + delta);
    const slug = product.slug || product.id || (product as any)._id;

    try {
      await ProductService.updateStock(slug, nextCount);
    } catch (e) {
      console.warn("Stock update API note:", e);
    }

    setProducts((prev) =>
      prev.map((p) =>
        (p.id === product.id || p.slug === product.slug)
          ? { ...p, stockCount: nextCount, inStock: nextCount > 0 }
          : p
      )
    );
  };

  const filtered = products
    .filter((p) => {
      if (p.isDeleted) return false;

      // Search
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = (p.name || "").toLowerCase().includes(q);
        const matchBrand = (p.brand || "").toLowerCase().includes(q);
        const matchSub = (p.subcategory || "").toLowerCase().includes(q);
        const matchId = (p._id || p.id || p.slug || "").toLowerCase().includes(q);
        if (!matchName && !matchBrand && !matchSub && !matchId) return false;
      }

      // Department
      if (selectedDept !== "all") {
        if (p.department !== selectedDept && p.category !== selectedDept) return false;
      }

      // Stock health
      const stock = p.stockCount ?? 10;
      if (selectedStockHealth === "in-stock" && stock <= 5) return false;
      if (selectedStockHealth === "low-stock" && (stock === 0 || stock > 5)) return false;
      if (selectedStockHealth === "out-of-stock" && stock > 0) return false;

      return true;
    })
    .sort((a, b) => {
      const stockA = a.stockCount ?? 10;
      const stockB = b.stockCount ?? 10;
      if (sortBy === "low-first") return stockA - stockB;
      if (sortBy === "high-first") return stockB - stockA;
      if (sortBy === "price-desc") return (b.price || 0) - (a.price || 0);
      if (sortBy === "price-asc") return (a.price || 0) - (b.price || 0);
      if (sortBy === "name") return (a.name || "").localeCompare(b.name || "");
      return stockA - stockB;
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const lowStockCount = products.filter(
    (p) => (p.stockCount ?? 10) <= 5 && !p.isDeleted
  ).length;

  const handleClearFilters = () => {
    setSearchTerm("");
    setSelectedDept("all");
    setSelectedStockHealth("all");
    setSortBy("low-first");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
            INVENTORY CONCIERGE
          </span>
          <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
            Atelier Stock Tracker ({filtered.length})
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedStockHealth(selectedStockHealth === "low-stock" ? "all" : "low-stock");
              setCurrentPage(1);
            }}
            className={`px-3 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors ${
              selectedStockHealth === "low-stock"
                ? "bg-amber-500 text-black font-bold"
                : "bg-zinc-900 text-zinc-300 border border-zinc-800 hover:border-zinc-700"
            }`}
          >
            <span>Critical Low Filter ({lowStockCount})</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search & Horizontal Selectors (No sidebars) */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search inventory by piece name, brand, or SKU..."
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

        {/* Selectors */}
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

          {/* Stock Health */}
          <select
            value={selectedStockHealth}
            onChange={(e) => {
              setSelectedStockHealth(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#101014] border border-zinc-900 text-xs px-3 py-2.5 rounded text-zinc-300 outline-none uppercase tracking-wider cursor-pointer"
          >
            <option value="all" className="bg-[#101014] text-white">All Stock Levels</option>
            <option value="in-stock" className="bg-[#101014] text-white">Optimal Stock (&gt;5)</option>
            <option value="low-stock" className="bg-[#101014] text-white">Critical Low (1-5)</option>
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
            <option value="low-first" className="bg-[#101014] text-white">Lowest Units First</option>
            <option value="high-first" className="bg-[#101014] text-white">Highest Units First</option>
            <option value="price-desc" className="bg-[#101014] text-white">Price: High to Low</option>
            <option value="price-asc" className="bg-[#101014] text-white">Price: Low to High</option>
            <option value="name" className="bg-[#101014] text-white">Alphabetical (A-Z)</option>
          </select>

          {(searchTerm || selectedDept !== "all" || selectedStockHealth !== "all" || sortBy !== "low-first") && (
            <button
              onClick={handleClearFilters}
              className="text-[10px] text-zinc-400 hover:text-brand-gold uppercase tracking-widest px-2 py-2 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#101014] border border-zinc-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-900/60 text-zinc-500 uppercase text-[9px] tracking-widest font-semibold border-b border-zinc-900">
              <tr>
                <th className="py-3 px-4">Piece</th>
                <th className="py-3 px-4">Price</th>
                <th className="py-3 px-4">Available Units</th>
                <th className="py-3 px-4">Inventory Health</th>
                <th className="py-3 px-4 text-right">Quick Stepper</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 font-light">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    No atelier pieces match your inventory filters.
                  </td>
                </tr>
              ) : (
                paginated.map((p) => {
                  const stock = p.stockCount ?? 10;
                  const isOut = stock === 0;
                  const isLow = stock > 0 && stock <= 5;
                  return (
                    <tr key={p.id || p._id} className="hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <div className="w-9 h-11 rounded bg-zinc-900 overflow-hidden border border-zinc-800 flex-shrink-0">
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
                      <td className="py-3 px-4 font-serif text-white font-medium">
                        ${p.price.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-sm">
                        <span
                          className={
                            isOut ? "text-red-400" : isLow ? "text-amber-400" : "text-emerald-400"
                          }
                        >
                          {stock}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            isOut
                              ? "bg-red-500/10 text-red-400 border border-red-500/30"
                              : isLow
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          }`}
                        >
                          {isOut ? "Sold Out" : isLow ? "Critical Low" : "Optimal Stock"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1 font-mono">
                          <button
                            onClick={() => handleAdjustStock(p, -1)}
                            className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded text-[11px] font-bold"
                            title="Decrease 1"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleAdjustStock(p, 1)}
                            className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded text-[11px] font-bold"
                            title="Add 1"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleAdjustStock(p, 5)}
                            className="px-2.5 py-1 bg-brand-burgundy/20 hover:bg-brand-burgundy text-brand-gold hover:text-white border border-brand-gold/30 rounded text-[10px] font-bold uppercase tracking-wider"
                            title="Restock +5 units"
                          >
                            +5 Restock
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
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemName="inventory items"
          />
        </div>
      </div>
    </div>
  );
};

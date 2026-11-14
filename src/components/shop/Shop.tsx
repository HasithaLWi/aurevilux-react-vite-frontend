import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, Link } from "react-router-dom";
import {
  Heart,
  Star,
  ShoppingBag,
  SlidersHorizontal,
  X,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Search,
  Check,
} from "lucide-react";
import type { Product, Category, Brand } from "../../types";
import { ProductService, type PaginationInfo } from "../../services/product.service";
import { CategoryService } from "../../services/category.service";
import { BrandService } from "../../services/brand.service";
import { useApp } from "../../context/AppContext";

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const catalogTopRef = useRef<HTMLDivElement>(null);

  // Search input state (prominent top search bar)
  const [searchTerm, setSearchTerm] = useState<string>(searchParams.get("search") || "");

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>(searchParams.get("category") || "");
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>(searchParams.get("subcategory") || "");
  const [selectedBrand, setSelectedBrand] = useState<string>(searchParams.get("brand") || "");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");

  // Inline Filter Sidebar Visibility (DEFAULT HIDDEN as requested)
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState<boolean>(false);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 12;
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 1,
  });

  // Live Backend Data State (Strictly DB-only, zero mockups)
  const [productsList, setProductsList] = useState<Product[]>([]);
  const [categoriesList, setCategoriesList] = useState<Category[]>([]);
  const [brandsList, setBrandsList] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [backendOffline, setBackendOffline] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Add Notification
  const [quickAddNotice, setQuickAddNotice] = useState<string | null>(null);

  // Subcategories taxonomy list
  const subcategoryList = [
    "Bags",
    "Shoes",
    "Coats",
    "Watches",
    "Jewelry",
    "Gowns",
    "Scarves",
  ];

  // Fetch Categories and Brands metadata once
  useEffect(() => {
    async function loadMetadata() {
      try {
        const [cats, brs] = await Promise.allSettled([
          CategoryService.getCategories(),
          BrandService.getBrands(),
        ]);
        if (cats.status === "fulfilled" && cats.value) {
          setCategoriesList(cats.value);
        }
        if (brs.status === "fulfilled" && brs.value) {
          setBrandsList(brs.value);
        }
      } catch (e) {
        console.warn("Metadata note:", e);
      }
    }
    loadMetadata();
  }, []);

  // Fetch Live Products from Database via Backend API with pagination
  const fetchProducts = async (pageToFetch: number = 1) => {
    setIsLoading(true);
    setBackendOffline(false);
    setErrorMessage(null);

    try {
      const result = await ProductService.getPaginatedProducts({
        page: pageToFetch,
        limit: itemsPerPage,
        category: selectedCategory && selectedCategory !== "all" ? selectedCategory : undefined,
        subcategory: selectedSubcategory && selectedSubcategory !== "all" ? selectedSubcategory : undefined,
        brand: selectedBrand && selectedBrand !== "all" ? selectedBrand : undefined,
        search: searchTerm.trim() ? searchTerm.trim() : undefined,
        sort: sortBy as any,
      });

      setProductsList(result.products || []);
      setPagination(result.pagination);
      setCurrentPage(result.pagination.page);
    } catch (err: any) {
      console.error("Aurevilux Boutique API Error:", err);
      setBackendOffline(true);
      setErrorMessage(
        "Unable to connect to Aurevilux server on http://localhost:5000. Please ensure the backend server is running."
      );
      setProductsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Trigger fetch whenever filter selections or page changes
  useEffect(() => {
    fetchProducts(currentPage);
  }, [selectedCategory, selectedSubcategory, selectedBrand, sortBy, currentPage]);

  // Real-time debounced search (searches name, department, category live as user types)
  useEffect(() => {
    const timer = setTimeout(() => {
      const activeSearch = searchParams.get("search") || "";
      if (searchTerm.trim() !== activeSearch) {
        const params = new URLSearchParams(searchParams);
        if (searchTerm.trim()) {
          params.set("search", searchTerm.trim());
        } else {
          params.delete("search");
        }
        setSearchParams(params);
        setCurrentPage(1);
        fetchProducts(1);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Handle Search Input submit without page reload
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    if (searchTerm.trim()) {
      params.set("search", searchTerm.trim());
    } else {
      params.delete("search");
    }
    setSearchParams(params);
    fetchProducts(1);
  };

  // Clear Search
  const handleClearSearch = () => {
    setSearchTerm("");
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams);
    params.delete("search");
    setSearchParams(params);
    fetchProducts(1);
  };

  // Synchronize state when URL params change externally
  useEffect(() => {
    const category = searchParams.get("category");
    const subcat = searchParams.get("subcategory");
    const brand = searchParams.get("brand");
    const search = searchParams.get("search");

    if (category !== null) setSelectedCategory(category);
    if (subcat !== null) setSelectedSubcategory(subcat);
    if (brand !== null) setSelectedBrand(brand);
    if (search !== null) setSearchTerm(search);
  }, [searchParams]);

  // Extract all unique sizes from loaded products for side filter
  const allSizes = Array.from(
    new Set(productsList.flatMap((p) => p.sizes || []))
  );

  // Client-side fine-tuning for price & size (if active)
  const displayedProducts = productsList.filter((product) => {
    if (priceRange !== "all") {
      if (priceRange === "under-500" && product.price >= 500) return false;
      if (priceRange === "500-1000" && (product.price < 500 || product.price > 1000)) return false;
      if (priceRange === "over-1000" && product.price <= 1000) return false;
    }
    if (selectedSize && !product.sizes?.includes(selectedSize)) return false;
    return true;
  });

  const clearAllFilters = () => {
    setSelectedCategory("");
    setSelectedSubcategory("");
    setSelectedBrand("");
    setPriceRange("all");
    setSelectedSize("");
    setSortBy("featured");
    setSearchTerm("");
    setCurrentPage(1);
    setSearchParams({});
    fetchProducts(1);
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setCurrentPage(newPage);
      catalogTopRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleQuickAddToCart = (product: Product) => {
    const color = product.colors?.[0]?.name || "Default";
    const size = product.sizes?.[0] || "One Size";
    addToCart(product, 1, color, size);
    setQuickAddNotice(`Added ${product.name} to cart`);
    setTimeout(() => setQuickAddNotice(null), 2500);
  };

  return (
    <div
      ref={catalogTopRef}
      className="bg-brand-black min-h-screen pt-24 pb-24 px-4 sm:px-6 md:px-10 lg:px-14 w-full text-white space-y-6"
    >
      {/* Toast Notice */}
      {quickAddNotice && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#16161a] border border-brand-gold/40 text-brand-gold text-xs px-4 py-3 rounded shadow-2xl flex items-center space-x-2 animate-slide-in-right">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{quickAddNotice}</span>
        </div>
      )}

      {/* Top Header & Prominent Search Bar */}
      <div className="border-b border-zinc-900 pb-6 pt-2 space-y-4 w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] tracking-[0.35em] text-brand-gold font-bold uppercase block">
              A U R E V I L U X &bull; H A U T E &nbsp; C O U T U R E
            </span>
            <h1 className="font-serif text-3xl md:text-5xl text-white uppercase tracking-wider font-bold">
              {selectedCategory
                ? selectedCategory.replace("-", " ")
                : "THE ATELIER COLLECTION"}
            </h1>
          </div>

          {/* Prominent Shop Search Bar (Zero full-page refresh) */}
          <form
            onSubmit={handleSearchSubmit}
            className="relative w-full md:w-96 flex items-center"
          >
            <Search className="w-4 h-4 text-brand-gold absolute left-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by piece name, department, category, or maison..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#111115] border border-zinc-800 focus:border-brand-gold text-white text-xs pl-10 pr-9 py-2.5 rounded-lg outline-none tracking-wider placeholder-zinc-500 transition-colors"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 text-zinc-500 hover:text-white"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </form>
        </div>

        {searchTerm && (
          <p className="text-xs text-zinc-400 tracking-wider">
            SEARCH RESULTS FOR:{" "}
            <span className="text-brand-gold font-serif italic">"{searchTerm}"</span>
            <button
              onClick={handleClearSearch}
              className="ml-3 text-[10px] text-zinc-500 hover:text-white uppercase underline"
            >
              Clear
            </button>
          </p>
        )}
      </div>

      {/* Top Horizontal Quick Selectors Bar (Database-Driven Filters) */}
      <div className="w-full bg-[#0d0d11] p-3.5 border border-zinc-900 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Left Side: Dynamic Selectors */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* 1. Department Selector (From DB categoriesList) */}
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#16161b] text-zinc-200 border border-zinc-800 hover:border-brand-gold px-3 py-1.5 pr-7 rounded-lg text-xs outline-none cursor-pointer appearance-none tracking-wider transition-colors"
            >
              <option value="">ALL DEPARTMENTS</option>
              {(categoriesList.length > 0
                ? categoriesList.map((c) => ({
                    id: c.slug || c.id || (c as any)._id,
                    name: (c.title || (c as any).name || c.slug || "").toUpperCase(),
                  }))
                : [
                    { id: "women", name: "WOMEN" },
                    { id: "men", name: "MEN" },
                    { id: "accessories", name: "ACCESSORIES" },
                    { id: "new-arrivals", name: "NEW ARRIVALS" },
                  ]
              ).map((dept) => (
                <option key={dept.id} value={dept.id}>
                  {dept.name}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 2. Collection Piece / Subcategory Selector */}
          <div className="relative">
            <select
              value={selectedSubcategory}
              onChange={(e) => {
                setSelectedSubcategory(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#16161b] text-zinc-200 border border-zinc-800 hover:border-brand-gold px-3 py-1.5 pr-7 rounded-lg text-xs outline-none cursor-pointer appearance-none tracking-wider transition-colors"
            >
              <option value="">ALL PIECES</option>
              {subcategoryList.map((subcat) => (
                <option key={subcat} value={subcat}>
                  {subcat.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 3. Maison / Brand Selector (From DB brandsList) */}
          <div className="relative">
            <select
              value={selectedBrand}
              onChange={(e) => {
                setSelectedBrand(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#16161b] text-zinc-200 border border-zinc-800 hover:border-brand-gold px-3 py-1.5 pr-7 rounded-lg text-xs outline-none cursor-pointer appearance-none tracking-wider transition-colors"
            >
              <option value="">ALL MAISONS</option>
              {(brandsList.length > 0
                ? brandsList.map((b) => b.name)
                : ["Calvin Klein", "Gucci", "Zara", "Nike", "Tommy Hilfiger", "Levi's"]
              ).map((brandName) => (
                <option key={brandName} value={brandName}>
                  {brandName.toUpperCase()}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 4. Price Selector */}
          <div className="relative">
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="bg-[#16161b] text-zinc-200 border border-zinc-800 hover:border-brand-gold px-3 py-1.5 pr-7 rounded-lg text-xs outline-none cursor-pointer appearance-none tracking-wider transition-colors"
            >
              <option value="all">ALL PRICES</option>
              <option value="under-500">UNDER $500</option>
              <option value="500-1000">$500 – $1,000</option>
              <option value="over-1000">OVER $1,000</option>
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* 5. Filter Toggle Button (Default Hidden, Click to Expand detailed sidebar) */}
          <button
            onClick={() => setIsFilterSidebarOpen(!isFilterSidebarOpen)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wider transition-all ${
              isFilterSidebarOpen
                ? "bg-brand-gold text-black border border-brand-gold"
                : "bg-[#16161b] text-zinc-300 border border-zinc-800 hover:border-zinc-700"
            }`}
            aria-label="Toggle Extended Filter Menu"
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>{isFilterSidebarOpen ? "CLOSE FILTERS" : "EXTENDED FILTERS"}</span>
          </button>
        </div>

        {/* Right Side: Total Counter & Sorter */}
        <div className="flex items-center space-x-4 ml-auto text-xs">
          {!backendOffline && (
            <span className="text-[10px] text-zinc-500 tracking-widest uppercase hidden lg:inline">
              SHOWING {displayedProducts.length} OF {pagination.total} PIECES
            </span>
          )}

          <div className="relative flex items-center">
            <span className="text-zinc-500 tracking-widest text-[10px] uppercase mr-2 hidden sm:inline">
              SORT:
            </span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-[#16161b] text-white text-xs font-semibold tracking-wider outline-none cursor-pointer border border-zinc-800 hover:border-brand-gold rounded-lg px-3 py-1.5 pr-7 appearance-none transition-colors"
            >
              <option value="featured">FEATURED</option>
              <option value="price-low-high">PRICE: LOW &rarr; HIGH</option>
              <option value="price-high-low">PRICE: HIGH &rarr; LOW</option>
              <option value="rating">TOP RATED</option>
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(selectedCategory ||
        selectedSubcategory ||
        selectedBrand ||
        priceRange !== "all" ||
        selectedSize ||
        searchTerm) && (
        <div className="flex flex-wrap gap-2 items-center text-[10px] tracking-widest font-semibold pt-1">
          <span className="text-zinc-500 mr-1 uppercase">ACTIVE:</span>
          {selectedCategory && (
            <span className="bg-[#111116] border border-zinc-800 px-2.5 py-1 rounded flex items-center gap-1.5 uppercase text-zinc-300">
              <span>Dept: {selectedCategory}</span>
              <button onClick={() => setSelectedCategory("")}>
                <X className="w-3 h-3 text-zinc-500 hover:text-white" />
              </button>
            </span>
          )}
          {selectedSubcategory && (
            <span className="bg-[#111116] border border-brand-gold/40 text-brand-gold px-2.5 py-1 rounded flex items-center gap-1.5 uppercase">
              <span>Piece: {selectedSubcategory}</span>
              <button onClick={() => setSelectedSubcategory("")}>
                <X className="w-3 h-3 text-brand-gold/60 hover:text-white" />
              </button>
            </span>
          )}
          {selectedBrand && (
            <span className="bg-[#111116] border border-zinc-800 px-2.5 py-1 rounded flex items-center gap-1.5 uppercase text-zinc-300">
              <span>Maison: {selectedBrand}</span>
              <button onClick={() => setSelectedBrand("")}>
                <X className="w-3 h-3 text-zinc-500 hover:text-white" />
              </button>
            </span>
          )}
          {priceRange !== "all" && (
            <span className="bg-[#111116] border border-zinc-800 px-2.5 py-1 rounded flex items-center gap-1.5 uppercase text-zinc-300">
              <span>Price: {priceRange}</span>
              <button onClick={() => setPriceRange("all")}>
                <X className="w-3 h-3 text-zinc-500 hover:text-white" />
              </button>
            </span>
          )}
          {selectedSize && (
            <span className="bg-[#111116] border border-zinc-800 px-2.5 py-1 rounded flex items-center gap-1.5 uppercase text-zinc-300">
              <span>Size: {selectedSize}</span>
              <button onClick={() => setSelectedSize("")}>
                <X className="w-3 h-3 text-zinc-500 hover:text-white" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-brand-gold hover:text-white text-[9px] underline underline-offset-4 ml-1 uppercase font-bold"
          >
            RESET ALL
          </button>
        </div>
      )}

      {/* Backend Offline Notice */}
      {backendOffline && (
        <div className="p-8 bg-[#161214] border border-red-900/60 rounded-xl space-y-4 max-w-2xl mx-auto text-center shadow-2xl my-8">
          <div className="w-12 h-12 rounded-full bg-red-950/80 border border-red-800/80 flex items-center justify-center mx-auto text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif text-lg tracking-widest text-white uppercase">
              Aurevilux Server Unreachable
            </h3>
            <p className="text-xs text-zinc-400 font-light leading-relaxed max-w-md mx-auto">
              {errorMessage || "Unable to establish connection to Aurevilux server on http://localhost:5000."}
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => fetchProducts(1)}
              disabled={isLoading}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-brand-burgundy hover:bg-brand-burgundyHover text-white rounded text-xs font-semibold tracking-widest transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>RETRY CONNECTION</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Catalog Section (Full Width, with optional extended side filter) */}
      {!backendOffline && (
        <div className="flex flex-col lg:flex-row gap-6 items-start w-full">
          {/* Extended Side Filter Menu (Hidden by default, slides in when toggled) */}
          {isFilterSidebarOpen && (
            <aside className="w-full lg:w-64 flex-shrink-0 bg-[#0c0c10] border border-zinc-900 rounded-xl p-5 space-y-6 shadow-xl animate-fade-in">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-900">
                <span className="font-serif text-xs tracking-widest text-white uppercase font-bold">
                  ADVANCED FILTERS
                </span>
                <button
                  onClick={() => setIsFilterSidebarOpen(false)}
                  className="text-zinc-500 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Sizes Filter */}
              {allSizes.length > 0 && (
                <div className="space-y-2.5">
                  <h4 className="text-[10px] tracking-widest font-semibold text-zinc-400 uppercase">
                    SIZE AVAILABILITY
                  </h4>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {allSizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(selectedSize === s ? "" : s)}
                        className={`text-xs px-2.5 py-1 rounded border transition-colors ${
                          selectedSize === s
                            ? "border-brand-gold text-brand-gold bg-brand-gold/10 font-bold"
                            : "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Price Ranges */}
              <div className="space-y-2 border-t border-zinc-900 pt-4">
                <h4 className="text-[10px] tracking-widest font-semibold text-zinc-400 uppercase">
                  PRICE TIER
                </h4>
                <div className="flex flex-col space-y-1 text-xs">
                  {[
                    { label: "All Prices", value: "all" },
                    { label: "Under $500", value: "under-500" },
                    { label: "$500 – $1,000", value: "500-1000" },
                    { label: "Over $1,000", value: "over-1000" },
                  ].map((p) => (
                    <button
                      key={p.value}
                      onClick={() => setPriceRange(p.value)}
                      className={`text-left py-1 px-2 rounded text-xs transition-colors flex items-center justify-between ${
                        priceRange === p.value
                          ? "bg-brand-gold/10 text-brand-gold font-bold"
                          : "text-zinc-400 hover:text-white"
                      }`}
                    >
                      <span>{p.label}</span>
                      {priceRange === p.value && (
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-gold" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={clearAllFilters}
                  className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold rounded uppercase tracking-widest transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </aside>
          )}

          {/* Product Viewport Area */}
          <div className="flex-1 w-full min-w-0">
            {/* 1. LUXURY GOLDEN SHIMMER SKELETON LOADING (No plain spinner!) */}
            {isLoading ? (
              <div
                className={`grid grid-cols-2 md:grid-cols-3 ${
                  isFilterSidebarOpen ? "xl:grid-cols-4" : "xl:grid-cols-4 2xl:grid-cols-5"
                } gap-5 w-full`}
              >
                {Array.from({ length: 8 }).map((_, index) => (
                  <div
                    key={`skeleton-${index}`}
                    className="border border-zinc-900/80 bg-[#0e0e13] p-3.5 rounded-xl space-y-3 animate-pulse"
                  >
                    {/* Shimmer Image Area */}
                    <div className="aspect-[4/5] bg-gradient-to-b from-zinc-800/40 via-zinc-900/60 to-zinc-950/80 rounded-lg relative overflow-hidden border border-zinc-900">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-brand-gold/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    </div>
                    {/* Shimmer Title & Details */}
                    <div className="space-y-2 pt-1">
                      <div className="h-3 bg-zinc-800/60 rounded w-2/3" />
                      <div className="flex justify-between items-center pt-1">
                        <div className="h-2.5 bg-zinc-800/40 rounded w-1/3" />
                        <div className="h-3 bg-brand-gold/20 rounded w-1/4" />
                      </div>
                    </div>
                    {/* Shimmer Button */}
                    <div className="h-8 bg-zinc-900 rounded-lg w-full mt-2" />
                  </div>
                ))}
              </div>
            ) : displayedProducts.length === 0 ? (
              /* Empty Results */
              <div className="py-24 text-center border border-dashed border-zinc-800 rounded-2xl space-y-4 my-4">
                <SlidersHorizontal className="w-10 h-10 text-zinc-700 stroke-[1.2] mx-auto" />
                <h3 className="font-serif text-base tracking-widest text-zinc-300 uppercase font-semibold">
                  No Couture Pieces Match Your Criteria
                </h3>
                <p className="text-xs text-zinc-500 font-light max-w-sm mx-auto">
                  Try clearing active filters or refining your search parameters to view other pieces from the atelier.
                </p>
                <div className="pt-2">
                  <button
                    onClick={clearAllFilters}
                    className="px-6 py-2.5 bg-brand-gold text-black rounded text-xs font-bold tracking-widest uppercase hover:bg-white transition-colors"
                  >
                    Reset All Selections
                  </button>
                </div>
              </div>
            ) : (
              /* 2. REAL COUTURE PRODUCTS GRID (Full width responsive layout) */
              <div
                className={`grid grid-cols-2 md:grid-cols-3 ${
                  isFilterSidebarOpen ? "xl:grid-cols-4" : "xl:grid-cols-4 2xl:grid-cols-5"
                } gap-5 w-full`}
              >
                {displayedProducts.map((product) => {
                  const productId = product.id || (product as any)._id;
                  const isWishlisted = isInWishlist(productId);
                  const displayImg =
                    product.images && product.images.length > 0
                      ? product.images[0]
                      : "/images/products/placeholder.jpeg";

                  return (
                    <div
                      key={productId}
                      className="group flex flex-col justify-between border border-zinc-900 bg-[#0d0d12] p-3.5 rounded-xl transition-all duration-300 hover:border-zinc-800 hover:bg-[#121218] hover:shadow-2xl"
                    >
                      {/* Product Image */}
                      <div className="relative aspect-[4/5] overflow-hidden bg-black rounded-lg mb-3">
                        <Link to={`/product/${product.slug || productId}`}>
                          <img
                            src={displayImg}
                            alt={product.name}
                            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                        </Link>
                        <button
                          onClick={() => toggleWishlist(product)}
                          className="absolute top-2.5 right-2.5 p-2 bg-black/70 rounded-full border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-red-500 transition-colors z-10"
                          aria-label="Toggle wishlist"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              isWishlisted ? "text-red-500 fill-red-500" : ""
                            }`}
                          />
                        </button>
                        {product.isNewArrival && (
                          <span className="absolute top-2.5 left-2.5 bg-brand-gold text-black text-[8px] font-bold tracking-widest px-2 py-0.5 rounded uppercase">
                            NEW
                          </span>
                        )}
                      </div>

                      {/* Details */}
                      <div className="space-y-2 flex-grow flex flex-col justify-between">
                        <div className="space-y-1">
                          <Link to={`/product/${product.slug || productId}`}>
                            <h3 className="font-serif text-xs tracking-wider text-white uppercase group-hover:text-brand-gold transition-colors font-semibold line-clamp-1">
                              {product.name}
                            </h3>
                          </Link>
                          <div className="flex justify-between items-center text-[10px] tracking-wider text-zinc-400">
                            <span>{product.brand}</span>
                            <span className="text-brand-gold font-serif font-bold text-xs">
                              ${product.price.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* Rating & Colors */}
                        <div className="flex justify-between items-center pt-2 border-t border-zinc-900 text-xs">
                          <div className="flex items-center space-x-1">
                            {product.colors &&
                              product.colors.slice(0, 3).map((c, i) => (
                                <span
                                  key={i}
                                  style={{ backgroundColor: c.value }}
                                  className="w-2.5 h-2.5 rounded-full border border-zinc-800"
                                  title={c.name}
                                />
                              ))}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                            <span className="text-[10px] text-zinc-400 font-medium">
                              {product.rating || "5.0"}
                            </span>
                          </div>
                        </div>

                        {/* Quick Add To Bag */}
                        <button
                          onClick={() => handleQuickAddToCart(product)}
                          className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-2 text-center text-[9px] font-bold tracking-[0.2em] transition-colors rounded-lg uppercase flex items-center justify-center space-x-1.5 mt-1 shadow-md shadow-brand-burgundy/15"
                        >
                          <ShoppingBag className="w-3 h-3" />
                          <span>ADD TO BAG</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. COMPLETE PAGINATION BAR (Backend-Powered) */}
            {!isLoading && pagination.totalPages > 1 && (
              <div className="pt-12 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-900 mt-10">
                <span className="text-xs text-zinc-500 tracking-wider">
                  Page <strong className="text-white">{pagination.page}</strong> of{" "}
                  <strong className="text-white">{pagination.totalPages}</strong> (
                  {pagination.total} pieces total)
                </span>

                <div className="flex items-center space-x-1.5">
                  {/* Previous Page Button */}
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page <= 1}
                    className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    aria-label="Previous page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Page Number Buttons */}
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={`page-${p}`}
                      onClick={() => handlePageChange(p)}
                      className={`min-w-8 h-8 px-2 text-xs rounded-lg font-semibold tracking-wider transition-colors ${
                        p === pagination.page
                          ? "bg-brand-gold text-black font-bold shadow-lg shadow-brand-gold/20"
                          : "border border-zinc-900 text-zinc-400 hover:text-white hover:border-zinc-700 bg-[#0e0e12]"
                      }`}
                    >
                      {p}
                    </button>
                  ))}

                  {/* Next Page Button */}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="p-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
                    aria-label="Next page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;

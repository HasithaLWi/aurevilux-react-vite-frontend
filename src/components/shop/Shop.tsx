import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Heart, Star, ShoppingBag, SlidersHorizontal, X, ChevronDown } from "lucide-react";
import { products, type Product, brands, categories } from "../../data/data";
import { useApp } from "../../context/AppContext";

const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToCart, toggleWishlist, isInWishlist } = useApp();

  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [selectedBrand, setSelectedBrand] = useState<string>("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [localProducts] = useState<Product[]>(products);

  // Sync state with URL search params on load
  useEffect(() => {
    const category = searchParams.get("category");
    const brand = searchParams.get("brand");

    if (category) setSelectedCategory(category);
    if (brand) setSelectedBrand(brand);
  }, [searchParams]);

  // Extract all unique colors and sizes for filter options
  const allSizes = Array.from(new Set(localProducts.flatMap((p) => p.sizes)));
  const allColors = Array.from(
    new Set(localProducts.flatMap((p) => p.colors.map((c) => c.name)))
  );

  // Filter products
  const filteredProducts = localProducts.filter((product) => {
    // 1. Search Query Filter
    const searchQuery = searchParams.get("search") || "";
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = product.name.toLowerCase().includes(query);
      const matchesBrand = product.brand.toLowerCase().includes(query);
      const matchesDesc = product.description.toLowerCase().includes(query);
      if (!matchesName && !matchesBrand && !matchesDesc) return false;
    }

    // 2. Category Filter
    if (selectedCategory && product.category !== selectedCategory) {
      if (selectedCategory === "new-arrivals" && !product.isNewArrival) return false;
      if (selectedCategory !== "new-arrivals") return false;
    }

    // 3. Brand Filter
    if (selectedBrand && product.brand.toLowerCase().replace(" ", "-") !== selectedBrand) {
      if (product.brand !== selectedBrand) return false;
    }

    // 4. Price Filter
    if (priceRange !== "all") {
      if (priceRange === "under-500" && product.price >= 500) return false;
      if (priceRange === "500-1000" && (product.price < 500 || product.price > 1000)) return false;
      if (priceRange === "over-1000" && product.price <= 1000) return false;
    }

    // 5. Size Filter
    if (selectedSize && !product.sizes.includes(selectedSize)) return false;

    // 6. Color Filter
    if (selectedColor && !product.colors.some((c) => c.name === selectedColor)) return false;

    return true;
  });

  // Sort products
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low-high") return a.price - b.price;
    if (sortBy === "price-high-low") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return 0; // Default Featured
  });

  const clearAllFilters = () => {
    setSelectedCategory("");
    setSelectedBrand("");
    setPriceRange("all");
    setSelectedSize("");
    setSelectedColor("");
    setSortBy("featured");
    setSearchParams({});
  };

  const handleQuickAddToCart = (product: Product) => {
    const color = product.colors[0]?.name || "Default";
    const size = product.sizes[0] || "One Size";
    addToCart(product, 1, color, size);
  };

  return (
    <div className="bg-brand-black min-h-screen pt-28 pb-16 px-6 md:px-12 max-w-7xl mx-auto space-y-8">
      {/* Banner / Header */}
      <div className="border-b border-zinc-900 pb-8 space-y-3">
        <span className="text-[10px] tracking-[0.3em] text-brand-gold font-semibold uppercase">
          AUREVILUX COLLECTION
        </span>
        <h1 className="font-serif text-3xl md:text-5xl text-white uppercase tracking-wider">
          {selectedCategory ? selectedCategory.replace("-", " ") : "ALL PRODUCTS"}
        </h1>
        {searchParams.get("search") && (
          <p className="text-xs text-zinc-500 tracking-wider">
            SEARCH RESULTS FOR: <span className="text-white italic">"{searchParams.get("search")}"</span> ({filteredProducts.length} items)
          </p>
        )}
      </div>

      {/* Control Panel: Filters, Sorter, Counters */}
      <div className="flex justify-between items-center bg-brand-dark/40 p-4 border border-zinc-800/80 rounded">
        <button
          onClick={() => setIsFilterDrawerOpen(true)}
          className="flex items-center space-x-2 text-xs font-semibold tracking-widest text-zinc-300 hover:text-brand-gold transition-colors duration-200"
        >
          <SlidersHorizontal className="w-4 h-4 text-brand-gold" />
          <span>FILTERS</span>
        </button>

        <div className="flex items-center space-x-6">
          <span className="text-[10px] text-zinc-500 font-light tracking-widest hidden sm:inline">
            SHOWING {sortedProducts.length} OF {products.length} PRODUCTS
          </span>

          {/* Sorter */}
          <div className="relative group flex items-center space-x-2 text-xs">
            <span className="text-zinc-500 tracking-widest">SORT BY:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-brand-dark text-white font-semibold tracking-wider outline-none cursor-pointer border border-zinc-800 rounded px-2 py-1 pr-6 appearance-none hover:border-brand-gold"
            >
              <option value="featured">FEATURED</option>
              <option value="price-low-high">PRICE: LOW-HIGH</option>
              <option value="price-high-low">PRICE: HIGH-LOW</option>
              <option value="rating">TOP RATED</option>
            </select>
            <ChevronDown className="w-3 h-3 text-zinc-500 absolute right-2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Active Filter Badges */}
      {(selectedCategory || selectedBrand || priceRange !== "all" || selectedSize || selectedColor) && (
        <div className="flex flex-wrap gap-2 items-center text-[10px] tracking-widest font-semibold">
          <span className="text-zinc-600 mr-2">ACTIVE:</span>
          {selectedCategory && (
            <span className="bg-brand-dark border border-zinc-800 px-3 py-1.5 rounded flex items-center gap-1.5 uppercase">
              <span>{selectedCategory}</span>
              <button onClick={() => setSelectedCategory("")}><X className="w-3 h-3 text-zinc-500 hover:text-white" /></button>
            </span>
          )}
          {selectedBrand && (
            <span className="bg-brand-dark border border-zinc-800 px-3 py-1.5 rounded flex items-center gap-1.5 uppercase">
              <span>{selectedBrand}</span>
              <button onClick={() => setSelectedBrand("")}><X className="w-3 h-3 text-zinc-500 hover:text-white" /></button>
            </span>
          )}
          {priceRange !== "all" && (
            <span className="bg-brand-dark border border-zinc-800 px-3 py-1.5 rounded flex items-center gap-1.5 uppercase">
              <span>Price: {priceRange}</span>
              <button onClick={() => setPriceRange("all")}><X className="w-3 h-3 text-zinc-500 hover:text-white" /></button>
            </span>
          )}
          {selectedSize && (
            <span className="bg-brand-dark border border-zinc-800 px-3 py-1.5 rounded flex items-center gap-1.5 uppercase">
              <span>Size: {selectedSize}</span>
              <button onClick={() => setSelectedSize("")}><X className="w-3 h-3 text-zinc-500 hover:text-white" /></button>
            </span>
          )}
          {selectedColor && (
            <span className="bg-brand-dark border border-zinc-800 px-3 py-1.5 rounded flex items-center gap-1.5 uppercase">
              <span>Color: {selectedColor}</span>
              <button onClick={() => setSelectedColor("")}><X className="w-3 h-3 text-zinc-500 hover:text-white" /></button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-brand-gold hover:text-white text-[9px] underline underline-offset-4 ml-2"
          >
            CLEAR ALL
          </button>
        </div>
      )}

      {/* Main Catalog View */}
      {sortedProducts.length === 0 ? (
        <div className="py-24 text-center border border-dashed border-zinc-800 rounded space-y-4">
          <SlidersHorizontal className="w-10 h-10 text-zinc-700 stroke-[1.2] mx-auto" />
          <p className="font-serif text-sm tracking-wider text-zinc-400">NO PRODUCTS MATCHED YOUR SELECTIONS</p>
          <button
            onClick={clearAllFilters}
            className="text-xs font-semibold tracking-[0.2em] text-brand-gold hover:text-white transition-colors uppercase"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {sortedProducts.map((product) => {
            const isWishlisted = isInWishlist(product.id);
            return (
              <div
                key={product.id}
                className="group flex flex-col justify-between border border-zinc-900 bg-brand-dark/30 p-4 rounded transition-all duration-300 hover:border-zinc-800 hover:bg-brand-dark/80"
              >
                {/* Image */}
                <div className="relative aspect-[4/5] overflow-hidden bg-brand-black rounded mb-4">
                  <img
                    src={product.images[0]}
                    alt={product.name}
                    className="w-full h-full object-cover object-center group-hover:scale-[1.03] transition-transform duration-500"
                  />
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-3 right-3 p-2 bg-black/60 rounded-full border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-red-500 transition-colors z-10"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? "text-red-500 fill-red-500" : ""}`} />
                  </button>
                </div>

                {/* Details */}
                <div className="space-y-3 flex-grow flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-serif text-sm tracking-widest text-white uppercase group-hover:text-brand-gold transition-colors font-medium">
                      {product.name}
                    </h3>
                    <div className="flex justify-between items-center text-[10px] tracking-wider text-zinc-500">
                      <span>{product.categoryLabel}</span>
                      <span className="text-white font-medium text-xs">${product.price.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Ratings & Colors */}
                  <div className="flex justify-between items-center pt-1 border-t border-zinc-900/60 mt-1">
                    <div className="flex items-center space-x-1.5">
                      {product.colors.map((c) => (
                        <span
                          key={c.name}
                          style={{ backgroundColor: c.value }}
                          className="w-2.5 h-2.5 rounded-full border border-zinc-800"
                          title={c.name}
                        />
                      ))}
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                      <span className="text-[10px] text-zinc-400 font-medium">{product.rating}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleQuickAddToCart(product)}
                    className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-2.5 text-center text-[10px] font-bold tracking-[0.2em] transition-colors rounded uppercase flex items-center justify-center space-x-2"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>ADD TO CART</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-out Filters Drawer (Left Side) */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            onClick={() => setIsFilterDrawerOpen(false)}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          <div className="absolute inset-y-0 left-0 max-w-full flex">
            <div className="w-screen max-w-xs bg-brand-dark border-r border-zinc-800 flex flex-col justify-between p-6 animate-slide-in-right">
              {/* Header */}
              <div className="pb-6 border-b border-zinc-900 flex items-center justify-between">
                <h2 className="font-serif text-lg tracking-[0.1em] text-white">FILTERS</h2>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="text-zinc-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Filters */}
              <div className="flex-1 overflow-y-auto py-4 space-y-6 text-xs">
                {/* Categories */}
                <div className="space-y-3">
                  <h4 className="text-zinc-500 font-semibold tracking-wider uppercase">CATEGORY</h4>
                  <div className="flex flex-col space-y-2 font-light">
                    {categories.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => setSelectedCategory(c.id === selectedCategory ? "" : c.id)}
                        className={`text-left hover:text-brand-gold tracking-wide transition-colors ${
                          selectedCategory === c.id ? "text-brand-gold font-bold" : "text-zinc-300"
                        }`}
                      >
                        {c.title}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Brands */}
                <div className="space-y-3 border-t border-zinc-900 pt-4">
                  <h4 className="text-zinc-500 font-semibold tracking-wider uppercase">BRAND</h4>
                  <div className="flex flex-col space-y-2 font-light">
                    {brands.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => setSelectedBrand(b.id === selectedBrand ? "" : b.id)}
                        className={`text-left hover:text-brand-gold tracking-wide transition-colors ${
                          selectedBrand === b.id ? "text-brand-gold font-bold" : "text-zinc-300"
                        }`}
                      >
                        {b.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Ranges */}
                <div className="space-y-3 border-t border-zinc-900 pt-4">
                  <h4 className="text-zinc-500 font-semibold tracking-wider uppercase">PRICE RANGE</h4>
                  <div className="flex flex-col space-y-2 font-light">
                    {[
                      { label: "ALL PRICES", value: "all" },
                      { label: "UNDER $500", value: "under-500" },
                      { label: "$500 - $1,000", value: "500-1000" },
                      { label: "OVER $1,000", value: "over-1000" },
                    ].map((p) => (
                      <button
                        key={p.value}
                        onClick={() => setPriceRange(p.value)}
                        className={`text-left hover:text-brand-gold tracking-wide transition-colors ${
                          priceRange === p.value ? "text-brand-gold font-bold" : "text-zinc-300"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sizes */}
                <div className="space-y-3 border-t border-zinc-900 pt-4">
                  <h4 className="text-zinc-500 font-semibold tracking-wider uppercase">SIZE</h4>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {allSizes.map((s) => (
                      <button
                        key={s}
                        onClick={() => setSelectedSize(s === selectedSize ? "" : s)}
                        className={`border px-2.5 py-1.5 font-semibold tracking-wide transition-colors rounded ${
                          selectedSize === s
                            ? "border-brand-gold text-brand-gold bg-brand-gold/5"
                            : "border-zinc-800 text-zinc-400 hover:text-white"
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="space-y-3 border-t border-zinc-900 pt-4">
                  <h4 className="text-zinc-500 font-semibold tracking-wider uppercase">COLOR</h4>
                  <div className="flex flex-col space-y-2 font-light">
                    {allColors.map((colorName) => (
                      <button
                        key={colorName}
                        onClick={() => setSelectedColor(colorName === selectedColor ? "" : colorName)}
                        className={`text-left hover:text-brand-gold tracking-wide transition-colors flex items-center space-x-2 ${
                          selectedColor === colorName ? "text-brand-gold font-bold" : "text-zinc-300"
                        }`}
                      >
                        <span
                          style={{
                            backgroundColor:
                              products.flatMap((p) => p.colors).find((c) => c.name === colorName)?.value ||
                              "white",
                          }}
                          className="w-2.5 h-2.5 rounded-full border border-zinc-800"
                        />
                        <span>{colorName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Actions */}
              <div className="pt-6 border-t border-zinc-900 flex gap-3">
                <button
                  onClick={clearAllFilters}
                  className="flex-1 border border-zinc-800 text-zinc-400 hover:text-white py-3 text-center tracking-[0.15em] font-semibold transition-colors rounded"
                >
                  RESET
                </button>
                <button
                  onClick={() => setIsFilterDrawerOpen(false)}
                  className="flex-1 bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-3 text-center tracking-[0.15em] font-semibold transition-colors rounded"
                >
                  APPLY
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Shop;

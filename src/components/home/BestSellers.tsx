import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, Star, ShoppingBag, Eye, X, Plus, Minus } from "lucide-react";
import { products as fallbackProducts, type Product } from "../../data/data";
import { ProductService } from "../../services/product.service";
import { useApp } from "../../context/AppContext";
import { gsap, useGSAP, motionTokens } from "../../animations";

const BestSellers: React.FC = () => {
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const [activeTab, setActiveTab] = useState<string>("ALL");
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [liveProducts, setLiveProducts] = useState<Product[]>(fallbackProducts);

  useEffect(() => {
    ProductService.getProducts()
      .then((data) => {
        if (data && data.length > 0) {
          setLiveProducts(data);
        }
      })
      .catch((e) => console.warn("Live products note for best sellers:", e));
  }, []);

  const sectionRef = useRef<HTMLElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  // Quick View Modal States
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);

  const tabs = ["ALL", "WOMEN", "MEN", "ACCESSORIES", "NEW ARRIVALS"];

  // Initial Section Reveal
  useGSAP(
    () => {
      if (window.matchMedia(motionTokens.mediaQueries.reducedMotion).matches) {
        return;
      }

      gsap.from("[data-bestsellers-header] > *", {
        opacity: 0,
        y: motionTokens.distance.subtle,
        duration: motionTokens.duration.standard,
        stagger: motionTokens.stagger.subtle,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          once: true,
        },
      });
    },
    { scope: sectionRef }
  );

  // Tab switch card transition
  useGSAP(
    () => {
      if (window.matchMedia(motionTokens.mediaQueries.reducedMotion).matches) {
        return;
      }

      gsap.fromTo(
        "[data-bestseller-card]",
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: motionTokens.duration.fast,
          stagger: motionTokens.stagger.tight,
          ease: motionTokens.ease.editorial,
        }
      );
    },
    { scope: sectionRef, dependencies: [activeTab] }
  );

  // Quick View Modal Animation
  useGSAP(
    () => {
      if (!quickViewProduct || window.matchMedia(motionTokens.mediaQueries.reducedMotion).matches) {
        return;
      }

      gsap.fromTo(
        "[data-quickview-backdrop]",
        { opacity: 0 },
        { opacity: 1, duration: motionTokens.duration.fast, ease: motionTokens.ease.smooth }
      );

      gsap.fromTo(
        "[data-quickview-modal]",
        { opacity: 0, scale: 0.95, y: 12 },
        { opacity: 1, scale: 1, y: 0, duration: motionTokens.duration.standard, ease: motionTokens.ease.editorial }
      );
    },
    { scope: modalRef, dependencies: [quickViewProduct] }
  );


  const filteredProducts = liveProducts.filter((p) => {
    if (activeTab === "ALL") return p.isBestSeller;
    if (activeTab === "WOMEN") return (p.category === "women" || p.department === "women") && p.isBestSeller;
    if (activeTab === "MEN") return (p.category === "men" || p.department === "men") && p.isBestSeller;
    if (activeTab === "ACCESSORIES") return (p.category === "accessories" || p.department === "accessories") && p.isBestSeller;
    if (activeTab === "NEW ARRIVALS") return p.isNewArrival;
    return true;
  });

  const openQuickView = (product: Product) => {
    setQuickViewProduct(product);
    setSelectedColor(product.colors[0]?.name || "");
    setSelectedSize(product.sizes[0] || "");
    setQuantity(1);
  };

  const handleQuickAddToCart = (product: Product) => {
    const color = product.colors[0]?.name || "Default";
    const size = product.sizes[0] || "One Size";
    addToCart(product, 1, color, size);
  };

  const handleModalAddToCart = () => {
    if (quickViewProduct) {
      addToCart(quickViewProduct, quantity, selectedColor, selectedSize);
      setQuickViewProduct(null);
    }
  };

  return (
    <section ref={sectionRef} className="bg-brand-black w-full py-20 md:py-24 border-t border-zinc-900">
      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div data-bestsellers-header className="text-center mb-10 space-y-2">
          <h2 className="font-serif text-3xl md:text-5xl text-white tracking-[0.2em] uppercase">
            Best Sellers
          </h2>
          <p className="text-[10px] md:text-xs text-zinc-500 tracking-[0.25em] font-semibold uppercase">
            Curated Icons | Our Most Coveted Designs
          </p>
        </div>

        {/* Filters Tab Bar */}
        <div className="flex justify-center items-center flex-wrap gap-4 md:gap-8 mb-12 border-b border-zinc-900 pb-4">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-xs tracking-[0.2em] font-semibold pb-2 transition-all relative ${
                activeTab === tab
                  ? "text-brand-gold border-b-2 border-brand-gold"
                  : "text-zinc-500 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredProducts.map((product) => {
            const isWishlisted = isInWishlist(product.id);
            return (
              <div
                key={product.id}
                data-bestseller-card
                className="group flex flex-col justify-between border border-zinc-900 bg-brand-dark/20 p-4 rounded transition-all duration-300 hover:border-zinc-800 hover:bg-brand-dark/50"
              >
                {/* Image Container with Actions */}
                <div className="relative aspect-[4/5] overflow-hidden bg-brand-black rounded mb-4">
                  <Link to={`/shop`}>
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Wishlist Button */}
                  <button
                    onClick={() => toggleWishlist(product)}
                    className="absolute top-3 right-3 p-2 bg-black/60 rounded-full border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-red-500 transition-colors z-10"
                    aria-label="Wishlist"
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? "text-red-500 fill-red-500" : ""}`} />
                  </button>

                  {/* Quick View Trigger on Hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none group-hover:pointer-events-auto">
                    <button
                      onClick={() => openQuickView(product)}
                      className="bg-brand-dark/90 hover:bg-brand-dark text-white text-[10px] tracking-widest font-semibold px-4 py-2 rounded border border-zinc-700 flex items-center space-x-2 transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5 text-brand-gold" />
                      <span>QUICK VIEW</span>
                    </button>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 flex-grow flex flex-col justify-between">
                  <div className="space-y-1">
                    <h3 className="font-serif text-sm tracking-widest text-white uppercase group-hover:text-brand-gold transition-colors font-medium">
                      <Link to={`/shop`}>{product.name}</Link>
                    </h3>
                    <div className="flex justify-between items-center text-[10px] tracking-wider text-zinc-500">
                      <span>{product.categoryLabel}</span>
                      <span className="text-white font-medium text-xs">${product.price.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Color dots & Rating */}
                  <div className="flex justify-between items-center pt-2 border-t border-zinc-900/60">
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

                  {/* Quick Add To Cart Button */}
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

        {/* View All CTA */}
        <div className="text-center mt-14">
          <Link
            to="/shop"
            className="inline-block border border-zinc-800 hover:border-brand-gold text-white text-xs font-semibold tracking-[0.2em] px-8 py-3.5 rounded transition-all duration-300"
          >
            VIEW ALL PRODUCTS
          </Link>
        </div>
      </div>

      {/* Quick View Modal */}
      {quickViewProduct && (
        <div ref={modalRef} className="fixed inset-0 z-50 overflow-y-auto">
          <div
            data-quickview-backdrop
            onClick={() => setQuickViewProduct(null)}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
          />

          <div className="flex min-h-full items-center justify-center p-4">
            <div data-quickview-modal className="relative w-full max-w-3xl bg-brand-dark border border-zinc-800 rounded p-6 md:p-8">
              {/* Close Button */}
              <button
                onClick={() => setQuickViewProduct(null)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                {/* Modal Product Image */}
                <div className="aspect-[4/5] bg-brand-black rounded overflow-hidden">
                  <img
                    src={quickViewProduct.images[0]}
                    alt={quickViewProduct.name}
                    className="w-full h-full object-cover object-center"
                  />
                </div>

                {/* Modal Details */}
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] tracking-widest text-brand-gold font-bold uppercase">
                      {quickViewProduct.brand}
                    </span>
                    <h2 className="font-serif text-2xl text-white uppercase tracking-wider mt-1">
                      {quickViewProduct.name}
                    </h2>
                    <p className="text-lg font-semibold text-white mt-2">
                      ${quickViewProduct.price.toLocaleString()}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-400 leading-relaxed font-light">
                    {quickViewProduct.description}
                  </p>

                  {/* Colors */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase">
                      COLOR: {selectedColor}
                    </span>
                    <div className="flex gap-2">
                      {quickViewProduct.colors.map((c) => (
                        <button
                          key={c.name}
                          onClick={() => setSelectedColor(c.name)}
                          style={{ backgroundColor: c.value }}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            selectedColor === c.name ? "border-brand-gold scale-110" : "border-zinc-800"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Sizes */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-zinc-500 font-semibold tracking-widest uppercase">
                      SIZE: {selectedSize}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {quickViewProduct.sizes.map((s) => (
                        <button
                          key={s}
                          onClick={() => setSelectedSize(s)}
                          className={`px-3 py-1.5 text-xs font-semibold rounded border transition-colors ${
                            selectedSize === s
                              ? "border-brand-gold text-brand-gold bg-brand-gold/10"
                              : "border-zinc-800 text-zinc-400 hover:text-white"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Quantity & CTA */}
                  <div className="pt-4 flex items-center gap-4">
                    <div className="flex items-center border border-zinc-800 rounded bg-brand-black">
                      <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="p-2 text-zinc-400 hover:text-white"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-4 text-xs font-semibold text-white">{quantity}</span>
                      <button
                        onClick={() => setQuantity(quantity + 1)}
                        className="p-2 text-zinc-400 hover:text-white"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <button
                      onClick={handleModalAddToCart}
                      className="flex-1 bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-3 rounded text-xs font-bold tracking-[0.2em] transition-colors uppercase flex items-center justify-center space-x-2"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>ADD TO CART</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default BestSellers;

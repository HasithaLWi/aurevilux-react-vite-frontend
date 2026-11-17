import React, { useState, useEffect, useCallback } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  Star,
  ShoppingBag,
  Plus,
  Minus,
  ArrowLeft,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  Truck,
  RefreshCw,
  Clock,
  Ruler,
  X,
  Send,
  LogIn,
} from "lucide-react";
import { products as fallbackProducts } from "../data/data";
import type { Product } from "../data/data";
import { useApp } from "../context/AppContext";
import { ProductService } from "../services/product.service";
import { AuthService } from "../services/auth.service";
import { useLuxuryAlert } from "../context/LuxuryAlertContext";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useApp();
  const { showAlert } = useLuxuryAlert();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">("desc");
  const [showSizeGuide, setShowSizeGuide] = useState<boolean>(false);
  const [relatedProductsList, setRelatedProductsList] = useState<Product[]>([]);
  const [isImgTransitioning, setIsImgTransitioning] = useState<boolean>(false);

  // Review Form state
  const [reviewerName, setReviewerName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");

  // Load product details dynamically from backend API
  useEffect(() => {
    if (!id) return;
    let isMounted = true;

    async function loadProduct() {
      try {
        const apiProduct = await ProductService.getProductBySlug(id!);
        if (apiProduct && isMounted) {
          setProduct(apiProduct);
          setActiveImgIndex(0);
          setSelectedColor(apiProduct.colors?.[0]?.name || "");
          setSelectedSize(apiProduct.sizes?.[0] || "");

          // Load related products from API
          try {
            const catSlug =
              typeof apiProduct.category === "object" && apiProduct.category
                ? (apiProduct.category as any).slug || (apiProduct.category as any)._id
                : apiProduct.category;

            const related = await ProductService.getProducts({
              category: catSlug,
              limit: 8,
            });
            if (isMounted) {
              const currentId = apiProduct.id || (apiProduct as any)._id;
              const filtered = related
                .filter(
                  (p) =>
                    p.slug !== id &&
                    p.id !== id &&
                    (p as any)._id !== currentId
                )
                .slice(0, 4);
              setRelatedProductsList(filtered);
            }
          } catch {
            // fallback handled below
          }
          return;
        }
      } catch (error) {
        console.warn(
          "Could not load product from API, using catalog fallback:",
          error
        );
      }

      // Offline / Local catalog fallback
      const foundProduct = fallbackProducts.find(
        (p) => p.id === id || p.slug === id
      );
      if (foundProduct && isMounted) {
        setProduct(foundProduct);
        setActiveImgIndex(0);
        setSelectedColor(foundProduct.colors?.[0]?.name || "");
        setSelectedSize(foundProduct.sizes?.[0] || "");

        const localRelated = fallbackProducts
          .filter((p) => p.category === foundProduct.category && p.id !== foundProduct.id)
          .slice(0, 4);
        setRelatedProductsList(localRelated);
      }
    }

    loadProduct();
    return () => {
      isMounted = false;
    };
  }, [id]);

  // Preload & GPU-decode all product gallery assets immediately when product loads
  useEffect(() => {
    if (!product) return;

    // 1. Preload & GPU decode all product view angles
    if (product.images && product.images.length > 0) {
      product.images.forEach((imgSrc) => {
        const img = new Image();
        img.src = imgSrc;
        if ("decode" in img) {
          img.decode().catch(() => {});
        }
      });
    }

    // 2. Preload custom backdrop if specified on product record
    if ((product as any)?.backgroundImage) {
      const bgImg = new Image();
      bgImg.src = (product as any).backgroundImage;
      if ("decode" in bgImg) {
        bgImg.decode().catch(() => {});
      }
    }
  }, [product]);

  // Derived state (safe when product is null)
  const images = product?.images && product.images.length > 0
    ? product.images
    : ["/images/products/VELVET LUNA DRESS.jpeg"];
  const activeImage = images[activeImgIndex] || images[0];

  const isWishlisted = product ? isInWishlist(product.id) : false;
  const stockCount = (product as any)?.stockCount ?? 10;
  const isOutOfStock = product ? stockCount === 0 || product.inStock === false : false;
  const selectedSizeInfo = (product as any)?.sizeStock?.find(
    (s: { size: string; quantity: number }) => s.size === selectedSize
  );
  const maxAvailableForSize = selectedSizeInfo ? selectedSizeInfo.quantity : stockCount;
  const isSelectedSizeSoldOut = selectedSizeInfo ? selectedSizeInfo.quantity <= 0 : false;
  const isLoggedIn = AuthService.isAuthenticated();

  // Clamp quantity whenever selected size or available stock changes
  useEffect(() => {
    if (!product) return;
    if (maxAvailableForSize <= 0) {
      setQuantity(1);
    } else if (quantity > maxAvailableForSize) {
      setQuantity(maxAvailableForSize);
    }
  }, [product, selectedSize, maxAvailableForSize]);

  // Handle smooth gallery transitions
  const handleSelectImage = useCallback((index: number) => {
    if (index === activeImgIndex) return;
    setIsImgTransitioning(true);
    setTimeout(() => {
      setActiveImgIndex(index);
      setIsImgTransitioning(false);
    }, 150);
  }, [activeImgIndex]);

  const handleNextImage = useCallback(() => {
    handleSelectImage((activeImgIndex + 1) % images.length);
  }, [activeImgIndex, images.length, handleSelectImage]);

  const handlePrevImage = useCallback(() => {
    handleSelectImage((activeImgIndex - 1 + images.length) % images.length);
  }, [activeImgIndex, images.length, handleSelectImage]);

  // Keyboard navigation for image gallery
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        handlePrevImage();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        handleNextImage();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNextImage, handlePrevImage]);

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center space-y-4 bg-brand-black text-zinc-400">
        <div className="w-8 h-8 border-2 border-brand-gold border-t-transparent rounded-full animate-spin" />
        <p className="font-serif tracking-widest text-base uppercase">
          FINDING PIECE DETAILS IN ATELIER...
        </p>
        <button
          onClick={() => navigate("/shop")}
          className="text-xs text-brand-gold underline tracking-widest uppercase font-semibold"
        >
          Back To Catalog
        </button>
      </div>
    );
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    setReviewSubmitting(true);
    const pid = product.slug || product.id || (product as any)._id;
    try {
      await ProductService.addReview(pid, {
        name: reviewerName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewSuccess("Thank you! Your atelier review has been recorded.");
      setReviewerName("");
      setReviewComment("");
      showAlert(
        "success",
        "Your review has been submitted successfully.",
        "Review Posted"
      );
      // Re-fetch product to update reviews list dynamically
      try {
        const refreshed = await ProductService.getProductBySlug(pid);
        if (refreshed) setProduct(refreshed);
      } catch {}
    } catch (err: any) {
      showAlert(
        "error",
        err.response?.data?.message ||
          err.message ||
          "Failed to submit review. Please try again."
      );
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    if (product.colors && product.colors.length > 0 && !selectedColor) {
      showAlert("warning", "Please select a color before adding to bag.");
      return;
    }
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      showAlert("warning", "Please select a size before adding to bag.");
      return;
    }
    if (isSelectedSizeSoldOut) {
      showAlert(
        "warning",
        `Size ${selectedSize} is currently sold out in the atelier.`,
        "Size Unavailable"
      );
      return;
    }
    if (quantity > maxAvailableForSize) {
      showAlert(
        "warning",
        `Only ${maxAvailableForSize} piece(s) available in size ${selectedSize}. Please adjust your quantity.`,
        "Inventory Limit Exceeded"
      );
      setQuantity(Math.max(1, maxAvailableForSize));
      return;
    }
    addToCart(product, quantity, selectedColor, selectedSize);
    showAlert(
      "success",
      `${product.name} (${selectedSize || "Standard"}) added to your shopping bag.`,
      "Added to Bag"
    );
  };

  return (
    <div className="bg-brand-black text-white min-h-screen select-none overflow-x-hidden">
      {/* ========================================================================= */}
      {/* 1. FULL-WIDTH HERO GALLERY STAGE (70% GALLERY / 30% SHOPPING PANEL)       */}
      {/* ========================================================================= */}
      <section className="relative w-full min-h-screen flex flex-col justify-between pt-24 md:pt-28 pb-8 overflow-hidden">
        {/* ========================================================================= */}
        {/* TECHNIQUE A: SYNCHRONIZED FULL-SCREEN BACKGROUND (USES SAME FRONT IMAGE)  */}
        {/* ========================================================================= */}
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img
            key={`backdrop-${activeImgIndex}`}
            src={activeImage}
            alt={`${product.name} Atmospheric Backdrop`}
            fetchPriority="high"
            className={`absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 ease-out gpu-accelerated ${
              isImgTransitioning
                ? "opacity-20 scale-100"
                : "opacity-60 md:opacity-75 scale-105"
            }`}
          />

          {/* Right-side gradient scrim: provides 100% contrast for the shopping controls panel */}
          <div className="absolute right-0 top-0 bottom-0 w-full lg:w-[48%] bg-gradient-to-l from-brand-black via-brand-black/90 to-transparent pointer-events-none z-10" />

          {/* Left-edge soft vignette: makes vertical thumbnails pop */}
          <div className="absolute left-0 top-0 bottom-0 w-28 sm:w-36 bg-gradient-to-r from-brand-black/85 via-brand-black/40 to-transparent pointer-events-none z-10" />

          {/* Top and Bottom edge fades */}
          <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-black via-brand-black/50 to-transparent pointer-events-none z-10" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-brand-black via-brand-black/50 to-transparent pointer-events-none z-10" />

          {/* Soft Glowing Ambient Lights */}
          <div className="absolute left-[15%] top-[25%] w-[450px] h-[450px] bg-brand-burgundy/20 blur-[140px] rounded-full pointer-events-none z-10" />
          <div className="absolute right-[20%] top-[20%] w-[380px] h-[380px] bg-purple-950/20 blur-[130px] rounded-full pointer-events-none z-10" />
        </div>

        {/* BREADCRUMB & RETURN ACTION (HEADER STRIP) */}
        <div className="relative z-20 w-full px-6 md:px-12 flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 border-b border-zinc-900/60 gap-3">
          <div className="flex items-center space-x-2 text-[9px] md:text-[10px] tracking-[0.25em] font-semibold text-zinc-500 uppercase flex-wrap">
            <Link to="/" className="hover:text-white transition-colors">
              HOME
            </Link>
            <span>/</span>
            <Link to="/shop" className="hover:text-white transition-colors">
              SHOP
            </Link>
            {product.category && (
              <>
                <span>/</span>
                <Link
                  to={`/shop?category=${
                    typeof product.category === "object" && product.category
                      ? (product.category as any).slug
                      : product.category
                  }`}
                  className="hover:text-white transition-colors uppercase"
                >
                  {typeof product.category === "object" && product.category
                    ? (product.category as any).title
                    : product.category}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="text-zinc-300 font-medium truncate max-w-[200px] sm:max-w-xs">
              {product.name}
            </span>
          </div>

          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-xs font-semibold tracking-widest text-zinc-400 hover:text-white transition-colors ml-auto sm:ml-0"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-[10px] tracking-[0.2em]">RETURN</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MAIN STAGE CANVAS: 70% LEFT GALLERY + 30% RIGHT SHOPPING CONTROLS         */}
        {/* ========================================================================= */}
        <div className="relative z-10 w-full px-6 md:px-12 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center my-auto py-6">
          {/* ======================================================================= */}
          {/* LEFT COLUMN (70%): VERTICAL THUMBNAIL GALLERY + CENTERPIECE PRODUCT     */}
          {/* ======================================================================= */}
          <div className="lg:col-span-7 xl:col-span-8 relative flex flex-col justify-between h-full min-h-[500px] sm:min-h-[580px] lg:min-h-[660px]">
            {/* STAGE CONTAINER WITH FLOATING THUMBNAIL STRIP */}
            <div className="relative flex-1 flex items-center justify-center w-full">
              {/* VERTICAL THUMBNAIL STRIP (FAR LEFT) */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20 flex flex-col items-center space-y-3">
                {/* Up Chevron Navigation */}
                <div className="flex flex-col items-center space-y-1 pb-1">
                  <span className="text-[9px] font-mono text-zinc-400 font-semibold tracking-widest">
                    {String(activeImgIndex + 1).padStart(2, "0")}
                  </span>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    aria-label="Previous view angle"
                    className="text-zinc-500 hover:text-brand-gold transition-colors p-1"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                </div>

                {/* Vertical Thumbnails Stack (Up to 5) */}
                <div className="flex flex-col space-y-2.5 max-h-[420px] overflow-y-auto scrollbar-none py-1">
                  {images.map((imgSrc, idx) => {
                    const isActive = idx === activeImgIndex;
                    return (
                      <button
                        key={`thumb-${idx}`}
                        type="button"
                        onClick={() => handleSelectImage(idx)}
                        aria-label={`Select angle ${idx + 1}`}
                        className={`group relative w-12 h-16 sm:w-16 sm:h-20 rounded overflow-hidden bg-brand-dark/80 transition-all duration-300 flex-shrink-0 ${
                          isActive
                            ? "border-2 border-brand-gold ring-2 ring-brand-gold/30 scale-105 shadow-[0_8px_20px_rgba(0,0,0,0.8)]"
                            : "border border-zinc-800/80 hover:border-zinc-500 opacity-60 hover:opacity-100"
                        }`}
                      >
                        <img
                          src={imgSrc}
                          alt={`${product.name} thumbnail ${idx + 1}`}
                          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                      </button>
                    );
                  })}
                </div>

                {/* Down Chevron Navigation */}
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next view angle"
                  className="text-zinc-500 hover:text-brand-gold transition-colors p-1 pt-1"
                >
                  <ChevronDown className="w-4 h-4" />
                </button>
              </div>

              {/* =================================================================== */}
              {/* TECHNIQUE B: CENTERPIECE FRONT PRODUCT IMAGE (WEBP / PNG CUTOUT)    */}
              {/* =================================================================== */}
              <div className="flex-1 flex flex-col items-center justify-center pl-16 sm:pl-20 md:pl-24 pr-2 w-full h-full relative">
                <div className="relative w-full flex items-center justify-center">
                  <img
                    key={`main-product-img-${activeImgIndex}`}
                    src={activeImage}
                    alt={product.name}
                    fetchPriority="high"
                    loading="eager"
                    className={`max-h-[52vh] sm:max-h-[62vh] lg:max-h-[70vh] w-auto max-w-full object-contain object-center drop-shadow-[0_25px_60px_rgba(0,0,0,0.95)] gpu-accelerated transition-all duration-500 ease-out select-none ${
                      isImgTransitioning
                        ? "opacity-40 scale-95"
                        : "opacity-100 scale-100"
                    }`}
                  />
                </div>

                {/* Subtle dark polished reflection plane at the base */}
                <div className="w-3/5 sm:w-2/5 h-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent blur-md rounded-full mt-[-6px] pointer-events-none" />
              </div>
            </div>

            {/* BOTTOM GALLERY PAGINATION HUD (< 01 — 05 >) */}
            <div className="flex items-center space-x-3 pl-16 sm:pl-20 md:pl-24 pt-2 text-[9px] tracking-[0.25em] text-zinc-400 uppercase font-mono">
              <button
                type="button"
                onClick={handlePrevImage}
                aria-label="Previous view angle"
                className="w-6 h-6 rounded-full border border-zinc-800 hover:border-brand-gold hover:text-brand-gold flex items-center justify-center text-zinc-400 transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="font-semibold text-zinc-300">
                {String(activeImgIndex + 1).padStart(2, "0")} —{" "}
                {String(images.length).padStart(2, "0")}
              </span>

              <button
                type="button"
                onClick={handleNextImage}
                aria-label="Next view angle"
                className="w-6 h-6 rounded-full border border-zinc-800 hover:border-brand-gold hover:text-brand-gold flex items-center justify-center text-zinc-400 transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* ======================================================================= */}
          {/* RIGHT COLUMN (30%): LUXURY SHOPPING CONTROLS & INFORMATION PANEL        */}
          {/* ======================================================================= */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-5 lg:space-y-6 lg:pl-4">
            {/* Brand Eyebrow */}
            <div className="space-y-1.5">
              <span className="text-[10px] md:text-xs tracking-[0.3em] text-brand-gold font-bold uppercase block">
                {product.brand || "ATELIER SELECTION"}
              </span>

              {/* Product Headline */}
              <h1 className="font-serif text-3xl sm:text-4xl xl:text-5xl text-white tracking-wide uppercase leading-[1.05] text-luxury-shadow">
                {product.name}
              </h1>

              {/* Ratings and Reviews Count */}
              <div className="flex items-center space-x-3 pt-1">
                <div className="flex text-amber-500 space-x-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < Math.floor(product.rating || 5)
                          ? "fill-amber-500 text-amber-500"
                          : "text-zinc-800"
                      }`}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("reviews");
                    const revSection = document.getElementById("atelier-tabs-section");
                    revSection?.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="text-[10px] text-zinc-400 hover:text-brand-gold tracking-widest font-mono uppercase transition-colors"
                >
                  {product.rating || 5} (
                  {product.reviews?.length || product.reviewsCount || 0} REVIEWS)
                </button>
              </div>

              {/* Price */}
              <div className="text-2xl sm:text-3xl text-brand-gold font-serif font-semibold pt-1">
                ${product.price.toLocaleString()}
              </div>
            </div>

            {/* Editorial Description */}
            <p className="text-xs sm:text-sm text-zinc-300 font-light leading-relaxed max-w-md">
              {product.description}
            </p>

            {/* COLOR SELECTOR */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2.5">
                <span className="text-[10px] tracking-[0.2em] text-zinc-500 font-bold uppercase block">
                  COLOR :{" "}
                  <span className="text-zinc-200">
                    {selectedColor || product.colors[0]?.name}
                  </span>
                </span>
                <div className="flex items-center space-x-3">
                  {product.colors.map((c) => {
                    const isSelected = selectedColor === c.name;
                    return (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        style={{ backgroundColor: c.value }}
                        className={`w-7 h-7 rounded-full transition-all duration-300 relative ${
                          isSelected
                            ? "ring-2 ring-brand-gold ring-offset-2 ring-offset-brand-black scale-110 shadow-lg shadow-black"
                            : "border border-zinc-700/80 hover:scale-105"
                        }`}
                        title={c.name}
                        aria-label={`Select color ${c.name}`}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* SIZE SELECTOR WITH STOCK BADGES */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2.5">
                <div className="flex justify-between items-center max-w-sm">
                  <span className="text-[10px] tracking-[0.2em] text-zinc-500 font-bold uppercase block">
                    SIZE :{" "}
                    <span className="text-zinc-200">
                      {selectedSize || "Select Size"}
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowSizeGuide(true)}
                    className="flex items-center space-x-1 text-[9px] text-brand-gold hover:text-white tracking-widest uppercase transition-colors"
                  >
                    <Ruler className="w-3 h-3" />
                    <span>SIZE GUIDE</span>
                  </button>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  {product.sizes.map((s) => {
                    const sizeInfo = (product as any)?.sizeStock?.find(
                      (entry: { size: string; quantity: number }) =>
                        entry.size === s
                    );
                    const isSizeSoldOut = sizeInfo ? sizeInfo.quantity <= 0 : false;
                    const isLowStock =
                      sizeInfo && sizeInfo.quantity > 0 && sizeInfo.quantity <= 3;
                    const isSelected = selectedSize === s;

                    return (
                      <button
                        key={s}
                        type="button"
                        disabled={isSizeSoldOut}
                        onClick={() => setSelectedSize(s)}
                        className={`relative border min-w-[58px] px-3 py-2 text-xs font-semibold tracking-wider transition-all rounded flex flex-col items-center justify-center ${
                          isSizeSoldOut
                            ? "border-zinc-900 bg-zinc-950/60 text-zinc-600 line-through cursor-not-allowed opacity-40"
                            : isSelected
                            ? "border-brand-gold text-brand-gold bg-brand-gold/10 shadow-md shadow-brand-gold/15"
                            : "border-zinc-800 text-zinc-300 hover:text-white hover:border-zinc-600 bg-zinc-900/40"
                        }`}
                        title={
                          isSizeSoldOut
                            ? `Size ${s} is sold out`
                            : isLowStock
                            ? `Only ${sizeInfo?.quantity} left in Atelier`
                            : `Size ${s}`
                        }
                      >
                        <span>{s}</span>
                        {isSizeSoldOut && (
                          <span className="text-[7px] text-zinc-600 uppercase tracking-widest no-underline font-mono">
                            SOLD OUT
                          </span>
                        )}
                        {!isSizeSoldOut && isLowStock && (
                          <span className="text-[7px] text-brand-gold uppercase tracking-widest font-mono">
                            ONLY {sizeInfo?.quantity}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* QUANTITY SELECTOR */}
            {!isOutOfStock ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center max-w-[210px]">
                  <span className="text-[10px] tracking-[0.2em] text-zinc-500 font-bold uppercase block">
                    QUANTITY
                  </span>
                  {selectedSizeInfo && (
                    <span className="text-[9px] font-mono text-zinc-500 uppercase">
                      MAX: {maxAvailableForSize}
                    </span>
                  )}
                </div>

                <div className="inline-flex items-center border border-zinc-800 bg-zinc-950/60 rounded">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1 || isSelectedSizeSoldOut}
                    className="px-3 py-2 text-zinc-400 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-opacity"
                    title="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-5 text-sm font-semibold font-mono">
                    {isSelectedSizeSoldOut ? 0 : quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity(Math.min(quantity + 1, maxAvailableForSize))
                    }
                    disabled={
                      quantity >= maxAvailableForSize || isSelectedSizeSoldOut
                    }
                    className="px-3 py-2 text-zinc-400 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-opacity"
                    title={
                      quantity >= maxAvailableForSize
                        ? `Max available in size ${selectedSize}: ${maxAvailableForSize}`
                        : "Increase quantity"
                    }
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {maxAvailableForSize <= 3 && maxAvailableForSize > 0 && (
                  <div className="flex items-center space-x-1.5 text-[10px] text-brand-gold tracking-wide pt-1">
                    <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                    <span>
                      Only {maxAvailableForSize} left in size {selectedSize}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-3 bg-red-950/20 border border-red-900/40 rounded text-red-400 text-xs font-mono uppercase tracking-wider">
                Currently Archived / Out of Stock at Atelier
              </div>
            )}

            {/* ACTION CTAS: ADD TO BAG & WISHLIST */}
            <div className="flex gap-3 max-w-md pt-2">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={
                  isOutOfStock ||
                  isSelectedSizeSoldOut ||
                  quantity > maxAvailableForSize
                }
                className={`flex-1 py-4 px-6 text-center text-xs font-bold tracking-[0.2em] rounded uppercase flex items-center justify-center space-x-2.5 transition-all shadow-lg ${
                  isOutOfStock ||
                  isSelectedSizeSoldOut ||
                  quantity > maxAvailableForSize
                    ? "bg-zinc-800/80 text-zinc-500 cursor-not-allowed border border-zinc-700 shadow-none"
                    : "btn-luxury bg-brand-burgundy hover:bg-brand-burgundyHover text-white shadow-brand-burgundy/25 hover:shadow-brand-burgundy/40"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {isOutOfStock
                    ? "SOLD OUT / ARCHIVED"
                    : isSelectedSizeSoldOut
                    ? `SIZE ${selectedSize} SOLD OUT`
                    : quantity > maxAvailableForSize
                    ? `ONLY ${maxAvailableForSize} AVAILABLE`
                    : "ADD TO SHOPPING BAG"}
                </span>
              </button>

              <button
                type="button"
                onClick={() => toggleWishlist(product)}
                aria-label={
                  isWishlisted
                    ? "Remove from curated wishlist"
                    : "Save to curated wishlist"
                }
                className={`w-12 h-12 rounded border flex items-center justify-center transition-all ${
                  isWishlisted
                    ? "border-red-500 text-red-500 bg-red-500/10"
                    : "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-600 bg-zinc-900/30"
                }`}
              >
                <Heart
                  className={`w-4 h-4 ${
                    isWishlisted ? "fill-red-500" : ""
                  }`}
                />
              </button>
            </div>

            {/* CONFIDENCE ASSURANCES (3 MOCK PILLS) */}
            <div className="grid grid-cols-3 gap-3 pt-6 border-t border-zinc-800/80 text-[8px] sm:text-[9px] tracking-wider text-zinc-400 uppercase font-light">
              <div className="flex items-center space-x-2">
                <Shield className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                <span>Insured Shipping</span>
              </div>
              <div className="flex items-center space-x-2">
                <Truck className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                <span>Complimentary Delivery</span>
              </div>
              <div className="flex items-center space-x-2">
                <RefreshCw className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                <span>Easy Exchanges</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2. BELOW-THE-FOLD ATELIER DETAILS & SPEC SHEETS                           */}
      {/* ========================================================================= */}
      <section
        id="atelier-tabs-section"
        className="max-w-7xl mx-auto px-6 md:px-12 py-16 space-y-16 border-t border-zinc-900"
      >
        {/* Tab Selection */}
        <div className="space-y-8">
          <div className="flex border-b border-zinc-900 overflow-x-auto whitespace-nowrap scrollbar-none gap-8 pb-3">
            {[
              { id: "desc", label: "DESCRIPTION" },
              { id: "specs", label: "SPECIFICATIONS" },
              {
                id: "reviews",
                label: `PATRON REVIEWS (${
                  product.reviews?.length || product.reviewsCount || 0
                })`,
              },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`text-xs font-semibold tracking-[0.2em] pb-1 transition-colors relative ${
                  activeTab === tab.id
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <div className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-brand-burgundy" />
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Display */}
          <div className="min-h-[160px] text-sm leading-relaxed text-zinc-400 font-light max-w-4xl">
            {activeTab === "desc" && (
              <div className="space-y-4">
                <p>{product.longDescription || product.description}</p>
                <p className="text-zinc-500 text-xs italic">
                  Crafted to define confident style, this product is manufactured
                  under the highest standards of luxury ateliers, utilizing
                  vetted, environmentally sound processes.
                </p>
              </div>
            )}

            {activeTab === "specs" && (
              <div className="border border-zinc-900 rounded overflow-hidden">
                {(product.specifications || []).length > 0 ? (
                  product.specifications.map((spec, idx) => (
                    <div
                      key={idx}
                      className={`grid grid-cols-3 p-4 text-xs tracking-wider border-b border-zinc-900/60 last:border-0 ${
                        idx % 2 === 0 ? "bg-brand-dark/20" : "bg-transparent"
                      }`}
                    >
                      <span className="font-semibold text-zinc-500 uppercase">
                        {spec.label}
                      </span>
                      <span className="col-span-2 text-zinc-300">
                        {spec.value}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-zinc-500 text-xs italic">
                    Standard atelier specifications apply to this couture piece.
                  </div>
                )}
              </div>
            )}

            {activeTab === "reviews" && (
              <div className="space-y-8">
                {/* Reviews List */}
                {product.reviews && product.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {product.reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="space-y-3 pb-6 border-b border-zinc-900 last:border-0"
                      >
                        <div className="flex justify-between items-center text-xs">
                          <div>
                            <h4 className="font-serif text-white uppercase tracking-wider font-semibold">
                              {rev.name}
                            </h4>
                            <span className="text-[10px] text-zinc-500 mt-1 block font-mono">
                              {rev.date}
                            </span>
                          </div>
                          <div className="flex text-amber-500">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-3 h-3 ${
                                  i < rev.rating
                                    ? "fill-amber-500 text-amber-500"
                                    : "text-zinc-800"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-xs text-zinc-400 font-light">
                          {rev.comment}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-zinc-500 italic text-xs tracking-wider">
                    NO REVIEWS YET. BE THE FIRST PATRON TO LEAVE A COMMENT.
                  </p>
                )}

                {/* Add Review Form */}
                <div className="pt-6 border-t border-zinc-900 space-y-4">
                  {isLoggedIn ? (
                    <>
                      <h4 className="font-serif text-sm uppercase tracking-wider text-white">
                        Record Patron Review
                      </h4>
                      {reviewSuccess && (
                        <p className="text-xs text-emerald-500">{reviewSuccess}</p>
                      )}
                      <form
                        onSubmit={handleReviewSubmit}
                        className="space-y-4 max-w-lg"
                      >
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <input
                            type="text"
                            placeholder="Your Name"
                            value={reviewerName}
                            onChange={(e) => setReviewerName(e.target.value)}
                            required
                            className="bg-brand-black border border-zinc-800 focus:border-brand-gold text-xs px-3 py-2.5 rounded text-white outline-none"
                          />
                          <div className="flex items-center space-x-2 text-xs">
                            <span className="text-zinc-500 uppercase font-mono">
                              Rating:
                            </span>
                            <select
                              value={reviewRating}
                              onChange={(e) =>
                                setReviewRating(Number(e.target.value))
                              }
                              className="bg-brand-black border border-zinc-800 text-white rounded px-2 py-2 text-xs outline-none"
                            >
                              <option value={5}>5 Stars - Exceptional</option>
                              <option value={4}>4 Stars - Very Good</option>
                              <option value={3}>3 Stars - Satisfactory</option>
                              <option value={2}>2 Stars - Fair</option>
                              <option value={1}>1 Star - Poor</option>
                            </select>
                          </div>
                        </div>
                        <textarea
                          rows={3}
                          placeholder="Share your experience with this piece..."
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          required
                          className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold text-xs p-3 rounded text-white outline-none"
                        />
                        <button
                          type="submit"
                          disabled={reviewSubmitting}
                          className="bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-[10px] font-bold tracking-widest px-6 py-2.5 rounded uppercase flex items-center space-x-2 transition-colors"
                        >
                          <Send className="w-3 h-3" />
                          <span>
                            {reviewSubmitting ? "Submitting..." : "Post Review"}
                          </span>
                        </button>
                      </form>
                    </>
                  ) : (
                    <div className="flex items-center gap-4 p-5 bg-zinc-900/30 border border-zinc-800 rounded-lg">
                      <LogIn className="w-5 h-5 text-brand-gold flex-shrink-0" />
                      <div>
                        <p className="text-xs text-zinc-300 font-semibold tracking-wider uppercase">
                          Sign In to Leave a Review
                        </p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">
                          Only authenticated patrons may share their experience with
                          this piece.
                        </p>
                      </div>
                      <Link
                        to="/login"
                        className="ml-auto px-4 py-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-[10px] font-bold tracking-widest uppercase rounded transition-colors flex-shrink-0"
                      >
                        Sign In
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RELATED PIECES SHOWCASE */}
        {relatedProductsList.length > 0 && (
          <div className="border-t border-zinc-900 pt-16 space-y-8">
            <h2 className="font-serif text-2xl tracking-widest text-white uppercase text-center sm:text-left">
              Complementary Atelier Pieces
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {relatedProductsList.map((p) => {
                const pWishlisted = isInWishlist(p.id);
                return (
                  <div
                    key={p.id}
                    className="group flex flex-col justify-between border border-zinc-900 bg-brand-dark/20 p-4 rounded hover:border-zinc-800 hover:bg-brand-dark/50 transition-all duration-300"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden bg-brand-black rounded mb-4">
                      <img
                        src={p.images[0]}
                        alt={p.name}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                      />
                      <button
                        type="button"
                        onClick={() => toggleWishlist(p)}
                        className="absolute top-3 right-3 p-2 bg-black/60 rounded-full border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-red-500 transition-colors z-10"
                        aria-label="Wishlist complementary item"
                      >
                        <Heart
                          className={`w-3.5 h-3.5 ${
                            pWishlisted ? "text-red-500 fill-red-500" : ""
                          }`}
                        />
                      </button>
                    </div>

                    <div className="space-y-2 flex-grow flex flex-col justify-between">
                      <div className="space-y-1">
                        <h3 className="font-serif text-xs tracking-wider text-white uppercase group-hover:text-brand-gold transition-colors font-medium">
                          <Link to={`/product/${p.slug || p.id}`}>{p.name}</Link>
                        </h3>
                        <div className="flex justify-between items-center text-[9px] tracking-wider text-zinc-500">
                          <span>{p.brand}</span>
                          <span className="text-white font-medium font-mono">
                            ${p.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          addToCart(
                            p,
                            1,
                            p.colors?.[0]?.name || "Default",
                            p.sizes?.[0] || "One Size"
                          )
                        }
                        className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-2 text-center text-[9px] font-bold tracking-[0.2em] transition-colors rounded uppercase flex items-center justify-center space-x-1.5 mt-2"
                      >
                        <ShoppingBag className="w-3 h-3" />
                        <span>ADD TO CART</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* ========================================================================= */}
      {/* 3. SIZE GUIDE MODAL                                                       */}
      {/* ========================================================================= */}
      {showSizeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-xl bg-brand-dark border border-zinc-800 rounded-lg p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="flex items-center space-x-2">
                <Ruler className="w-4 h-4 text-brand-gold" />
                <h3 className="font-serif text-lg tracking-wider text-white uppercase">
                  Atelier Size &amp; Measurement Guide
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="text-zinc-500 hover:text-white transition-colors"
                aria-label="Close size guide"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              All AureviLux couture and ready-to-wear pieces adhere to precise
              European and International atelier measurements. For tailored
              comfort, measure closely against the body.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-zinc-800 text-[10px] font-mono uppercase text-brand-gold">
                    <th className="py-2.5 px-3">Size (EU)</th>
                    <th className="py-2.5 px-3">US</th>
                    <th className="py-2.5 px-3">UK</th>
                    <th className="py-2.5 px-3">Bust/Chest (cm)</th>
                    <th className="py-2.5 px-3">Waist (cm)</th>
                  </tr>
                </thead>
                <tbody className="text-zinc-300 font-mono text-[11px] divide-y divide-zinc-900/60">
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">36 / XS</td>
                    <td className="py-2 px-3">2</td>
                    <td className="py-2 px-3">6</td>
                    <td className="py-2 px-3">80 - 84</td>
                    <td className="py-2 px-3">62 - 66</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">37 / S</td>
                    <td className="py-2 px-3">4</td>
                    <td className="py-2 px-3">8</td>
                    <td className="py-2 px-3">84 - 88</td>
                    <td className="py-2 px-3">66 - 70</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">38 / M</td>
                    <td className="py-2 px-3">6</td>
                    <td className="py-2 px-3">10</td>
                    <td className="py-2 px-3">88 - 92</td>
                    <td className="py-2 px-3">70 - 74</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">39 / L</td>
                    <td className="py-2 px-3">8</td>
                    <td className="py-2 px-3">12</td>
                    <td className="py-2 px-3">92 - 96</td>
                    <td className="py-2 px-3">74 - 78</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-semibold text-white">40 / XL</td>
                    <td className="py-2 px-3">10</td>
                    <td className="py-2 px-3">14</td>
                    <td className="py-2 px-3">96 - 102</td>
                    <td className="py-2 px-3">78 - 84</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowSizeGuide(false)}
                className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-[10px] font-bold tracking-widest uppercase rounded transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

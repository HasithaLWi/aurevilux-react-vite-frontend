import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  Heart,
  Star,
  ShoppingBag,
  Plus,
  Minus,
  ArrowLeft,
  Shield,
  Truck,
  RefreshCw,
  Send,
} from "lucide-react";
import { products } from "../data/data";
import type { Product } from "../data/data";
import { useApp } from "../context/AppContext";
import { ProductService } from "../services/product.service";

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, toggleWishlist, isInWishlist } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "reviews">(
    "desc",
  );

  // Review Form state
  const [reviewerName, setReviewerName] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");

  // Load product details
  useEffect(() => {
    if (!id) return;
    async function loadProduct() {
      try {
        const apiProduct = await ProductService.getProductBySlug(id!);
        if (apiProduct) {
          setProduct(apiProduct);
          setActiveImage(apiProduct.images?.[0] || "");
          setSelectedColor(apiProduct.colors?.[0]?.name || "");
          setSelectedSize(apiProduct.sizes?.[0] || "");
          return;
        }
      } catch (error) {
        console.warn(
          "Could not load product from API, using offline mock details:",
          error,
        );
      }

      // Fallback to local catalog
      const foundProduct = products.find((p) => p.id === id || p.slug === id);
      if (foundProduct) {
        setProduct(foundProduct);
        setActiveImage(foundProduct.images[0]);
        setSelectedColor(foundProduct.colors[0]?.name || "");
        setSelectedSize(foundProduct.sizes[0] || "");
      }
    }
    loadProduct();
  }, [id]);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4 bg-brand-black text-zinc-400">
        <p className="font-serif tracking-widest text-lg">
          FINDING PIECE DETAILS...
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

  // Related products (same category, excluding current product)
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || !reviewComment.trim()) return;

    setReviewSubmitting(true);
    try {
      await ProductService.addReview(product.slug || product.id, {
        name: reviewerName.trim(),
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewSuccess("Thank you! Your atelier review has been recorded.");
      setReviewerName("");
      setReviewComment("");
    } catch {
      // Local addition fallback
      const newReview = {
        id: `rev-${Date.now()}`,
        name: reviewerName.trim(),
        rating: reviewRating,
        date: "Just now",
        comment: reviewComment.trim(),
      };
      setProduct({
        ...product,
        reviewsCount: (product.reviews?.length || 0) + 1,
        reviews: [newReview, ...(product.reviews || [])],
      });
      setReviewSuccess("Review submitted successfully.");
      setReviewerName("");
      setReviewComment("");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const isWishlisted = isInWishlist(product.id);
  const isOutOfStock =
    (product.stockCount ?? 10) === 0 || product.inStock === false;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    addToCart(product, quantity, selectedColor, selectedSize);
  };

  return (
    <div className="bg-brand-black min-h-screen pt-28 pb-16 px-6 md:px-12 max-w-7xl mx-auto space-y-16">
      {/* Breadcrumb & Return button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-zinc-900 pb-6 gap-4">
        <div className="flex items-center space-x-2 text-[10px] tracking-widest font-semibold text-zinc-500 uppercase flex-wrap">
          <Link to="/" className="hover:text-white">
            HOME
          </Link>
          <span>/</span>
          <Link to="/shop" className="hover:text-white">
            SHOP
          </Link>
          <span>/</span>
          <Link
            to={`/shop?category=${product.department || product.category}`}
            className="hover:text-white"
          >
            {product.department || product.category}
          </Link>
          {product.subcategory && (
            <>
              <span>/</span>
              <span className="text-zinc-400">{product.subcategory}</span>
            </>
          )}
          <span>/</span>
          <span className="text-zinc-300">{product.name}</span>
        </div>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center space-x-2 text-xs font-semibold tracking-widest text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4 text-brand-gold" />
          <span>RETURN</span>
        </button>
      </div>

      {/* Main product view split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
        {/* Left Side: Images Gallery */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[4/5] bg-brand-dark rounded overflow-hidden border border-zinc-900">
            <img
              src={activeImage || product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover object-center"
            />
          </div>

          {/* Thumbnail list */}
          {product.images && product.images.length > 1 && (
            <div className="flex space-x-4 overflow-x-auto pb-2 scrollbar-none">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-24 relative rounded overflow-hidden bg-brand-dark flex-shrink-0 border transition-all ${
                    activeImage === img
                      ? "border-brand-gold scale-[1.02]"
                      : "border-zinc-900 hover:border-zinc-700"
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name}-${idx}`}
                    className="w-full h-full object-cover object-center"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Options & Information */}
        <div className="lg:col-span-5 space-y-6 md:space-y-8">
          <div className="space-y-2">
            <span className="text-[10px] tracking-[0.3em] text-brand-burgundy font-bold uppercase block">
              {product.brand}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl text-white tracking-wider uppercase leading-tight">
              {product.name}
            </h1>

            {/* Ratings and reviews */}
            <div className="flex items-center space-x-4 pt-1">
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
              <span className="text-xs text-zinc-500 tracking-wider">
                {product.rating} (
                {product.reviews?.length || product.reviewsCount || 0} REVIEWS)
              </span>
            </div>

            {/* Price */}
            <div className="text-brand-gold font-serif text-2xl pt-2 font-semibold">
              ${product.price.toLocaleString()}
            </div>
          </div>

          <p className="text-sm text-zinc-400 font-light leading-relaxed">
            {product.description}
          </p>

          {/* Color Selector */}
          {product.colors && product.colors.length > 0 && (
            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.2em] text-zinc-500 font-bold uppercase block">
                COLOR: <span className="text-zinc-300">{selectedColor}</span>
              </span>
              <div className="flex space-x-3">
                {product.colors.map((c) => (
                  <button
                    key={c.name}
                    onClick={() => setSelectedColor(c.name)}
                    style={{ backgroundColor: c.value }}
                    className={`w-8 h-8 rounded-full border ${
                      selectedColor === c.name
                        ? "border-brand-gold scale-110 shadow-lg shadow-black"
                        : "border-zinc-800 hover:scale-105"
                    } transition-all`}
                    title={c.name}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Size Selector */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="space-y-3">
              <div className="flex justify-between items-center max-w-sm">
                <span className="text-[10px] tracking-[0.2em] text-zinc-500 font-bold uppercase block">
                  SIZE: <span className="text-zinc-300">{selectedSize}</span>
                </span>
                <span className="text-[9px] text-zinc-500 tracking-widest uppercase">
                  SIZE GUIDE
                </span>
              </div>
              <div className="flex flex-wrap gap-3">
                {product.sizes.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSelectedSize(s)}
                    className={`border min-w-[50px] px-4 py-2 text-xs font-semibold tracking-wider transition-all rounded ${
                      selectedSize === s
                        ? "border-brand-gold text-brand-gold bg-brand-gold/5 shadow"
                        : "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity selector */}
          {!isOutOfStock ? (
            <div className="space-y-3">
              <span className="text-[10px] tracking-[0.2em] text-zinc-500 font-bold uppercase block">
                QUANTITY
              </span>
              <div className="inline-flex items-center border border-zinc-800 bg-brand-black/50 rounded">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-zinc-400 hover:text-white"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-5 text-sm font-semibold">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-zinc-400 hover:text-white"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-red-950/20 border border-red-900/40 rounded text-red-400 text-xs font-mono uppercase tracking-wider">
              Currently Archived / Out of Stock at Atelier
            </div>
          )}

          {/* Add / Wishlist actions */}
          <div className="flex gap-4 max-w-md pt-4">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              className={`flex-1 py-4 text-center text-xs font-bold tracking-[0.2em] transition-colors rounded uppercase flex items-center justify-center space-x-3 shadow-lg ${
                isOutOfStock
                  ? "bg-zinc-800/80 text-zinc-500 cursor-not-allowed border border-zinc-700 shadow-none"
                  : "bg-brand-burgundy hover:bg-brand-burgundyHover text-white shadow-brand-burgundy/15"
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>
                {isOutOfStock ? "SOLD OUT / ARCHIVED" : "ADD TO SHOPPING BAG"}
              </span>
            </button>
            <button
              onClick={() => toggleWishlist(product)}
              className={`px-4 border rounded flex items-center justify-center transition-all ${
                isWishlisted
                  ? "border-red-500 text-red-500 bg-red-500/5"
                  : "border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isWishlisted ? "fill-red-500" : ""}`}
              />
            </button>
          </div>

          {/* Delivery & Assurance */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-zinc-900 text-[9px] tracking-wider text-zinc-500 uppercase font-light">
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-brand-gold flex-shrink-0" />
              <span>Insured Shipping</span>
            </div>
            <div className="flex items-center space-x-2">
              <Truck className="w-4 h-4 text-brand-gold flex-shrink-0" />
              <span>Complimentary Delivery</span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-brand-gold flex-shrink-0" />
              <span>Easy Exchanges</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabbed Spec Sheets */}
      <div className="border-t border-zinc-900 pt-12 space-y-8">
        {/* Tab Buttons */}
        <div className="flex border-b border-zinc-900 overflow-x-auto whitespace-nowrap scrollbar-none gap-8 pb-3">
          {[
            { id: "desc", label: "DESCRIPTION" },
            { id: "specs", label: "SPECIFICATIONS" },
            {
              id: "reviews",
              label: `REVIEWS (${product.reviews?.length || 0})`,
            },
          ].map((tab) => (
            <button
              key={tab.id}
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

        {/* Tab Content */}
        <div className="min-h-[150px] text-sm leading-relaxed text-zinc-400 font-light max-w-4xl">
          {activeTab === "desc" && (
            <div className="space-y-4">
              <p>{product.longDescription || product.description}</p>
              <p>
                Crafted to define confident style, this product is manufactured
                under the highest standards of luxury ateliers, utilizing
                vetted, environmentally sound processes.
              </p>
            </div>
          )}

          {activeTab === "specs" && (
            <div className="border border-zinc-900 rounded overflow-hidden">
              {(product.specifications || []).map((spec, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-3 p-4 text-xs tracking-wider border-b border-zinc-900/60 last:border-0 ${
                    idx % 2 === 0 ? "bg-brand-dark/20" : "bg-transparent"
                  }`}
                >
                  <span className="font-semibold text-zinc-500 uppercase">
                    {spec.label}
                  </span>
                  <span className="col-span-2 text-zinc-300">{spec.value}</span>
                </div>
              ))}
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
                          <span className="text-[10px] text-zinc-500 mt-1 block">
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
                  NO REVIEWS YET. BE THE FIRST TO LEAVE A COMMENT.
                </p>
              )}

              {/* Add Review Form */}
              <div className="pt-6 border-t border-zinc-900 space-y-4">
                <h4 className="font-serif text-sm uppercase tracking-wider text-white">
                  Add Your Review
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
                      <span className="text-zinc-500 uppercase">Rating:</span>
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
                    className="bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-[10px] font-bold tracking-widest px-6 py-2.5 rounded uppercase flex items-center space-x-2"
                  >
                    <Send className="w-3 h-3" />
                    <span>
                      {reviewSubmitting ? "Submitting..." : "Post Review"}
                    </span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="border-t border-zinc-900 pt-16 space-y-8">
          <h2 className="font-serif text-2xl tracking-widest text-white uppercase text-center sm:text-left">
            Related Products
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedProducts.map((p) => {
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
                      onClick={() => toggleWishlist(p)}
                      className="absolute top-3 right-3 p-2 bg-black/60 rounded-full border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-red-500 transition-colors z-10"
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
                        <Link to={`/product/${p.id}`}>{p.name}</Link>
                      </h3>
                      <div className="flex justify-between items-center text-[9px] tracking-wider text-zinc-500">
                        <span>{p.brand}</span>
                        <span className="text-white font-medium">
                          ${p.price.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        addToCart(
                          p,
                          1,
                          p.colors?.[0]?.name || "Default",
                          p.sizes?.[0] || "One Size",
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
    </div>
  );
}

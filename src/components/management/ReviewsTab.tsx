import React, { useState } from "react";
import { Star, Trash2, Award, MessageSquare, Sparkles, Search, Filter, X } from "lucide-react";
import type { ReviewModerationItem } from "../../services/admin.service";
import type { WebsiteFeedback } from "../../types";
import { AdminService } from "../../services/admin.service";
import { LuxuryPagination } from "../common/LuxuryPagination";

interface ReviewsTabProps {
  productReviews: ReviewModerationItem[];
  setProductReviews: React.Dispatch<React.SetStateAction<ReviewModerationItem[]>>;
  websiteFeedback: WebsiteFeedback[];
  setWebsiteFeedback: React.Dispatch<React.SetStateAction<WebsiteFeedback[]>>;
}

export const ReviewsTab: React.FC<ReviewsTabProps> = ({
  productReviews,
  setProductReviews,
  websiteFeedback,
  setWebsiteFeedback,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<"products" | "website">("website");

  // Website Feedback Filters & Pagination
  const [searchWebsite, setSearchWebsite] = useState("");
  const [statusWebsite, setStatusWebsite] = useState("all");
  const [ratingWebsite, setRatingWebsite] = useState("all");
  const [currentPageWebsite, setCurrentPageWebsite] = useState(1);
  const itemsPerPageWebsite = 6;

  // Product Reviews Filters & Pagination
  const [searchProduct, setSearchProduct] = useState("");
  const [ratingProduct, setRatingProduct] = useState("all");
  const [currentPageProduct, setCurrentPageProduct] = useState(1);
  const itemsPerPageProduct = 8;

  // Delete product review
  const handleDeleteProductReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to remove this piece review?")) return;
    try {
      await AdminService.deleteReview(reviewId);
      setProductReviews((prev) => prev.filter((r) => r.reviewId !== reviewId));
    } catch (e: any) {
      alert("Failed to delete piece review: " + (e.response?.data?.message || e.message));
    }
  };

  // Toggle Feature as Testimonial
  const handleToggleFeatureFeedback = async (id: string) => {
    try {
      const updated = await AdminService.toggleFeatureFeedback(id);
      setWebsiteFeedback((prev) =>
        prev.map((f) =>
          f._id === id || f.id === id
            ? { ...f, isFeatured: updated.isFeatured, status: updated.status }
            : f
        )
      );
    } catch (e: any) {
      alert("Failed to update testimonial feature status: " + (e.response?.data?.message || e.message));
    }
  };

  // Delete feedback
  const handleDeleteFeedback = async (id: string) => {
    if (!confirm("Remove this boutique client feedback?")) return;
    try {
      await AdminService.deleteFeedback(id);
      setWebsiteFeedback((prev) => prev.filter((f) => f._id !== id && f.id !== id));
    } catch (e: any) {
      alert("Failed to delete feedback: " + (e.response?.data?.message || e.message));
    }
  };

  // Filtered Website Feedback
  const filteredWebsite = websiteFeedback.filter((fb) => {
    if (searchWebsite.trim()) {
      const q = searchWebsite.toLowerCase();
      const matchName = (fb.name || "").toLowerCase().includes(q);
      const matchEmail = (fb.email || "").toLowerCase().includes(q);
      const matchComment = (fb.comment || "").toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchComment) return false;
    }

    if (statusWebsite === "featured" && !fb.isFeatured) return false;
    if (statusWebsite === "standard" && fb.isFeatured) return false;

    if (ratingWebsite !== "all") {
      const r = Number(fb.rating || 5);
      if (ratingWebsite === "5" && r !== 5) return false;
      if (ratingWebsite === "4" && r !== 4) return false;
      if (ratingWebsite === "3" && r !== 3) return false;
      if (ratingWebsite === "1-2" && r > 2) return false;
    }

    return true;
  });

  const totalPagesWebsite = Math.ceil(filteredWebsite.length / itemsPerPageWebsite) || 1;
  const paginatedWebsite = filteredWebsite.slice(
    (currentPageWebsite - 1) * itemsPerPageWebsite,
    currentPageWebsite * itemsPerPageWebsite
  );

  // Filtered Product Reviews
  const filteredProducts = productReviews.filter((r) => {
    if (searchProduct.trim()) {
      const q = searchProduct.toLowerCase();
      const matchPiece = (r.productName || "").toLowerCase().includes(q);
      const matchBrand = (r.productBrand || "").toLowerCase().includes(q);
      const matchPatron = (r.name || "").toLowerCase().includes(q);
      const matchComment = (r.comment || "").toLowerCase().includes(q);
      if (!matchPiece && !matchBrand && !matchPatron && !matchComment) return false;
    }

    if (ratingProduct !== "all") {
      const rNum = Number(r.rating || 5);
      if (ratingProduct === "5" && rNum !== 5) return false;
      if (ratingProduct === "4" && rNum !== 4) return false;
      if (ratingProduct === "3" && rNum !== 3) return false;
      if (ratingProduct === "1-2" && rNum > 2) return false;
    }

    return true;
  });

  const totalPagesProducts = Math.ceil(filteredProducts.length / itemsPerPageProduct) || 1;
  const paginatedProducts = filteredProducts.slice(
    (currentPageProduct - 1) * itemsPerPageProduct,
    currentPageProduct * itemsPerPageProduct
  );

  return (
    <div className="space-y-6 w-full text-left">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
            CLIENT REVIEWS & FEEDBACK
          </span>
          <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
            Reviews Moderation & Testimonials
          </h1>
        </div>
        <div className="bg-[#101014] border border-zinc-900 rounded p-1 flex">
          <button
            onClick={() => setActiveSubTab("website")}
            className={`px-3.5 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 ${
              activeSubTab === "website"
                ? "bg-brand-burgundy text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Website Testimonials ({filteredWebsite.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab("products")}
            className={`px-3.5 py-1.5 rounded text-[10px] uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 ${
              activeSubTab === "products"
                ? "bg-brand-burgundy text-white"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Product Reviews ({filteredProducts.length})</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: WEBSITE & BOUTIQUE FEEDBACK (FOR TESTIMONIALS) */}
      {activeSubTab === "website" && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search testimonials by patron, email, or quote content..."
                value={searchWebsite}
                onChange={(e) => {
                  setSearchWebsite(e.target.value);
                  setCurrentPageWebsite(1);
                }}
                className="w-full bg-[#101014] border border-zinc-900 text-xs pl-9 pr-9 py-2.5 rounded text-white placeholder-zinc-500 outline-none focus:border-brand-gold/50"
              />
              {searchWebsite && (
                <button
                  onClick={() => {
                    setSearchWebsite("");
                    setCurrentPageWebsite(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Status Selector */}
              <div className="flex items-center gap-1.5 bg-[#101014] border border-zinc-900 rounded px-2.5 py-1">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <select
                  value={statusWebsite}
                  onChange={(e) => {
                    setStatusWebsite(e.target.value);
                    setCurrentPageWebsite(1);
                  }}
                  className="bg-transparent text-xs text-zinc-300 outline-none uppercase tracking-wider py-1.5 cursor-pointer"
                >
                  <option value="all" className="bg-[#101014] text-white">All Feedback</option>
                  <option value="featured" className="bg-[#101014] text-white">Featured Only</option>
                  <option value="standard" className="bg-[#101014] text-white">Standard Only</option>
                </select>
              </div>

              {/* Rating Selector */}
              <select
                value={ratingWebsite}
                onChange={(e) => {
                  setRatingWebsite(e.target.value);
                  setCurrentPageWebsite(1);
                }}
                className="bg-[#101014] border border-zinc-900 text-xs px-3 py-2.5 rounded text-zinc-300 outline-none uppercase tracking-wider cursor-pointer"
              >
                <option value="all" className="bg-[#101014] text-white">All Ratings</option>
                <option value="5" className="bg-[#101014] text-white">5 Stars</option>
                <option value="4" className="bg-[#101014] text-white">4 Stars</option>
                <option value="3" className="bg-[#101014] text-white">3 Stars</option>
                <option value="1-2" className="bg-[#101014] text-white">1-2 Stars</option>
              </select>

              {(searchWebsite || statusWebsite !== "all" || ratingWebsite !== "all") && (
                <button
                  onClick={() => {
                    setSearchWebsite("");
                    setStatusWebsite("all");
                    setRatingWebsite("all");
                    setCurrentPageWebsite(1);
                  }}
                  className="text-[10px] text-zinc-400 hover:text-brand-gold uppercase tracking-widest px-2 py-2 underline"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWebsite.length === 0 ? (
              <div className="col-span-full py-16 text-center border border-dashed border-zinc-800 rounded bg-[#101014]">
                <p className="text-zinc-500 text-xs uppercase tracking-wider font-serif">
                  No boutique website feedback matches your current filter.
                </p>
              </div>
            ) : (
              paginatedWebsite.map((fb) => (
                <div
                  key={fb._id || fb.id}
                  className={`bg-[#101014] border p-5 rounded-lg space-y-3 flex flex-col justify-between transition-colors ${
                    fb.isFeatured
                      ? "border-brand-gold/50 shadow-md shadow-brand-gold/5"
                      : "border-zinc-900"
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-serif text-white font-bold uppercase text-sm">
                          {fb.name}
                        </h4>
                        <span className="text-[10px] text-zinc-500 font-mono block">
                          {fb.role || "Haute Patron"} &bull; {fb.email}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-brand-gold">
                        {Array.from({ length: fb.rating || 5 }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-zinc-300 italic font-light leading-relaxed">
                      "{fb.comment}"
                    </p>
                  </div>

                  <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
                    <button
                      onClick={() => handleToggleFeatureFeedback(fb._id || fb.id || "")}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all ${
                        fb.isFeatured
                          ? "bg-brand-gold text-black shadow-sm"
                          : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{fb.isFeatured ? "Featured on Homepage" : "Feature as Testimonial"}</span>
                    </button>
                    <button
                      onClick={() => handleDeleteFeedback(fb._id || fb.id || "")}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded"
                      title="Delete Feedback"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          <LuxuryPagination
            currentPage={currentPageWebsite}
            totalPages={totalPagesWebsite}
            totalItems={filteredWebsite.length}
            itemsPerPage={itemsPerPageWebsite}
            onPageChange={setCurrentPageWebsite}
            itemName="testimonials"
          />
        </div>
      )}

      {/* SUBTAB 2: PRODUCT REVIEWS MODERATION */}
      {activeSubTab === "products" && (
        <div className="space-y-5">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reviews by piece, brand, patron, or commentary..."
                value={searchProduct}
                onChange={(e) => {
                  setSearchProduct(e.target.value);
                  setCurrentPageProduct(1);
                }}
                className="w-full bg-[#101014] border border-zinc-900 text-xs pl-9 pr-9 py-2.5 rounded text-white placeholder-zinc-500 outline-none focus:border-brand-gold/50"
              />
              {searchProduct && (
                <button
                  onClick={() => {
                    setSearchProduct("");
                    setCurrentPageProduct(1);
                  }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
              {/* Rating Selector */}
              <div className="flex items-center gap-1.5 bg-[#101014] border border-zinc-900 rounded px-2.5 py-1">
                <Filter className="w-3.5 h-3.5 text-zinc-500" />
                <select
                  value={ratingProduct}
                  onChange={(e) => {
                    setRatingProduct(e.target.value);
                    setCurrentPageProduct(1);
                  }}
                  className="bg-transparent text-xs text-zinc-300 outline-none uppercase tracking-wider py-1.5 cursor-pointer"
                >
                  <option value="all" className="bg-[#101014] text-white">All Ratings</option>
                  <option value="5" className="bg-[#101014] text-white">5 Stars</option>
                  <option value="4" className="bg-[#101014] text-white">4 Stars</option>
                  <option value="3" className="bg-[#101014] text-white">3 Stars</option>
                  <option value="1-2" className="bg-[#101014] text-white">1-2 Stars</option>
                </select>
              </div>

              {(searchProduct || ratingProduct !== "all") && (
                <button
                  onClick={() => {
                    setSearchProduct("");
                    setRatingProduct("all");
                    setCurrentPageProduct(1);
                  }}
                  className="text-[10px] text-zinc-400 hover:text-brand-gold uppercase tracking-widest px-2 py-2 underline"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="bg-[#101014] border border-zinc-900 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-zinc-900/60 text-zinc-500 uppercase text-[9px] tracking-widest font-semibold border-b border-zinc-900">
                  <tr>
                    <th className="py-3 px-4">Piece</th>
                    <th className="py-3 px-4">Patron</th>
                    <th className="py-3 px-4">Rating</th>
                    <th className="py-3 px-4">Review Comment</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900 font-light">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-zinc-500">
                        No piece reviews match your search or filter.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((r) => (
                      <tr key={r.reviewId} className="hover:bg-zinc-900/30 transition-colors">
                        <td className="py-3 px-4 font-serif text-white uppercase font-medium">
                          {r.productName}
                          <span className="text-[9px] text-brand-gold uppercase block font-sans">
                            {r.productBrand}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-300 font-medium">{r.name}</td>
                        <td className="py-3 px-4">
                          <div className="flex items-center text-brand-gold">
                            {Array.from({ length: r.rating || 5 }).map((_, i) => (
                              <Star key={i} className="w-3 h-3 fill-current" />
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-zinc-400 max-w-sm truncate italic">
                          "{r.comment}"
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleDeleteProductReview(r.reviewId)}
                            className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-900 rounded border border-zinc-800"
                            title="Purge Review"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-4 pb-4">
              <LuxuryPagination
                currentPage={currentPageProduct}
                totalPages={totalPagesProducts}
                totalItems={filteredProducts.length}
                itemsPerPage={itemsPerPageProduct}
                onPageChange={setCurrentPageProduct}
                itemName="reviews"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

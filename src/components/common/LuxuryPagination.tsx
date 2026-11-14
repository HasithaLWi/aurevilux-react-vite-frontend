import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface LuxuryPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  itemName?: string;
}

export const LuxuryPagination: React.FC<LuxuryPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  itemName = "records",
}) => {
  if (totalItems === 0 || totalPages <= 1) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="pt-6 pb-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-zinc-900 mt-6 w-full text-xs">
      <span className="text-zinc-500 font-mono tracking-wider text-[11px]">
        Showing <strong className="text-white">{startItem}</strong> &ndash;{" "}
        <strong className="text-white">{endItem}</strong> of{" "}
        <strong className="text-brand-gold">{totalItems}</strong> {itemName}
      </span>

      <div className="flex items-center space-x-1.5">
        {/* Previous Button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-2 rounded border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Page Buttons */}
        {getPageNumbers().map((p, idx) => {
          if (p === "...") {
            return (
              <span
                key={`ellipsis-${idx}`}
                className="px-2 py-1 text-zinc-600 font-mono select-none"
              >
                &hellip;
              </span>
            );
          }

          const pageNum = Number(p);
          const isActive = pageNum === currentPage;

          return (
            <button
              key={`page-${pageNum}`}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-8 h-8 px-2 text-[11px] rounded font-mono font-semibold tracking-wider transition-all ${
                isActive
                  ? "bg-brand-gold text-brand-black font-bold shadow-sm shadow-brand-gold/30"
                  : "border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 bg-zinc-950"
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next Button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="p-2 rounded border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors"
          aria-label="Next page"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};


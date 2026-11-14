import React, { useState } from "react";
import { Search, Filter, X } from "lucide-react";
import { LuxuryPagination } from "../common/LuxuryPagination";

interface ReturnItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  item: string;
  reason: string;
  amount: number;
  status: "Pending Inspection" | "Approved" | "Refunded" | "Declined";
  date: string;
}

export const ReturnsTab: React.FC = () => {
  const [returnsList, setReturnsList] = useState<ReturnItem[]>([
    {
      id: "RET-9041",
      orderNumber: "AUR-2026-104921",
      customerName: "Camille Laurent",
      customerEmail: "camille@paris.com",
      item: "Velvet Luna Wing Gown (Size M)",
      reason: "Bespoke sizing adjustment requested",
      amount: 2850,
      status: "Pending Inspection",
      date: "Nov 12, 2026",
    },
    {
      id: "RET-9038",
      orderNumber: "AUR-2026-891042",
      customerName: "Julian Vance",
      customerEmail: "julian@vance.ch",
      item: "Serpentine Saddle Bag",
      reason: "Alternate leather finish preferred",
      amount: 1890,
      status: "Approved",
      date: "Nov 10, 2026",
    },
    {
      id: "RET-9035",
      orderNumber: "AUR-2026-773190",
      customerName: "Eleanor Dupont",
      customerEmail: "eleanor@dupont.fr",
      item: "Solaris Tourbillon Chronometer",
      reason: "Requested alternate rose-gold strap finish",
      amount: 14200,
      status: "Pending Inspection",
      date: "Nov 08, 2026",
    },
    {
      id: "RET-9029",
      orderNumber: "AUR-2026-551209",
      customerName: "Arthur Pendelton",
      customerEmail: "arthur@london.co.uk",
      item: "Cashmere Double-Breasted Atelier Coat",
      reason: "Sleeve alteration consultation required",
      amount: 3400,
      status: "Refunded",
      date: "Nov 04, 2026",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const handleUpdateStatus = (id: string, newStatus: ReturnItem["status"]) => {
    setReturnsList((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );
  };

  const filteredReturns = returnsList
    .filter((r) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const idMatch = r.id.toLowerCase().includes(q);
        const orderMatch = r.orderNumber.toLowerCase().includes(q);
        const nameMatch = r.customerName.toLowerCase().includes(q);
        const emailMatch = r.customerEmail.toLowerCase().includes(q);
        const itemMatch = r.item.toLowerCase().includes(q);
        const reasonMatch = r.reason.toLowerCase().includes(q);
        if (!idMatch && !orderMatch && !nameMatch && !emailMatch && !itemMatch && !reasonMatch) {
          return false;
        }
      }

      if (statusFilter !== "all" && r.status !== statusFilter) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "highest") return b.amount - a.amount;
      if (sortBy === "lowest") return a.amount - b.amount;
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const totalPages = Math.ceil(filteredReturns.length / itemsPerPage) || 1;
  const paginatedReturns = filteredReturns.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5">
        <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
          CONCIERGE REVERSE LOGISTICS
        </span>
        <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
          Returns & Exchange Protocol ({filteredReturns.length})
        </h1>
      </div>

      {/* Control Bar: Search & Selectors (No sidebars) */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by Return ID, Order Ref, patron, or item name..."
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
          {/* Status Selector */}
          <div className="flex items-center gap-1.5 bg-[#101014] border border-zinc-900 rounded px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-zinc-300 outline-none uppercase tracking-wider py-1.5 cursor-pointer"
            >
              <option value="all" className="bg-[#101014] text-white">All Statuses</option>
              <option value="Pending Inspection" className="bg-[#101014] text-white">Pending Inspection</option>
              <option value="Approved" className="bg-[#101014] text-white">Approved</option>
              <option value="Refunded" className="bg-[#101014] text-white">Refunded</option>
              <option value="Declined" className="bg-[#101014] text-white">Declined</option>
            </select>
          </div>

          {/* Sort Selector */}
          <select
            value={sortBy}
            onChange={(e) => {
              setSortBy(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#101014] border border-zinc-900 text-xs px-3 py-2.5 rounded text-zinc-300 outline-none uppercase tracking-wider cursor-pointer"
          >
            <option value="newest" className="bg-[#101014] text-white">Newest First</option>
            <option value="highest" className="bg-[#101014] text-white">Refund: High to Low</option>
            <option value="lowest" className="bg-[#101014] text-white">Refund: Low to High</option>
          </select>

          {(searchTerm || statusFilter !== "all" || sortBy !== "newest") && (
            <button
              onClick={handleClearFilters}
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
                <th className="py-3 px-4">Return ID</th>
                <th className="py-3 px-4">Order Ref</th>
                <th className="py-3 px-4">Patron</th>
                <th className="py-3 px-4">Acquisition & Reason</th>
                <th className="py-3 px-4">Refund Valuation</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Concierge Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 font-light">
              {filteredReturns.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No returns records match your search or filter.
                  </td>
                </tr>
              ) : (
                paginatedReturns.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-900/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-white">{r.id}</td>
                    <td className="py-3 px-4 font-mono text-zinc-400">{r.orderNumber}</td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-zinc-200">{r.customerName}</p>
                      <span className="text-[10px] text-zinc-500">{r.customerEmail}</span>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-white">{r.item}</p>
                      <span className="text-[10px] text-zinc-400 italic">"{r.reason}"</span>
                    </td>
                    <td className="py-3 px-4 font-serif text-brand-gold font-bold">
                      ${r.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          r.status === "Approved"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : r.status === "Refunded"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                            : r.status === "Declined"
                            ? "bg-red-500/10 text-red-400 border border-red-500/30"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {r.status === "Pending Inspection" && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, "Approved")}
                            className="px-2 py-1 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800 text-emerald-300 rounded text-[10px] uppercase font-bold"
                          >
                            Approve Return
                          </button>
                        )}
                        {r.status === "Approved" && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, "Refunded")}
                            className="px-2 py-1 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-800 text-blue-300 rounded text-[10px] uppercase font-bold"
                          >
                            Execute Refund
                          </button>
                        )}
                        {r.status !== "Declined" && r.status !== "Refunded" && (
                          <button
                            onClick={() => handleUpdateStatus(r.id, "Declined")}
                            className="px-2 py-1 bg-zinc-900 hover:bg-red-950/60 border border-zinc-800 text-zinc-400 hover:text-red-400 rounded text-[10px] uppercase"
                          >
                            Decline
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Complete Luxury Pagination */}
        <div className="px-4 pb-4">
          <LuxuryPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredReturns.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemName="return cases"
          />
        </div>
      </div>
    </div>
  );
};

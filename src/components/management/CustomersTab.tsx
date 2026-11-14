import React, { useState } from "react";
import { Search, Eye, EyeOff, Filter, X } from "lucide-react";
import type { CustomerRecord } from "../../types";
import { AdminService } from "../../services/admin.service";
import { LuxuryPagination } from "../common/LuxuryPagination";

interface CustomersTabProps {
  customers: CustomerRecord[];
  setCustomers: React.Dispatch<React.SetStateAction<CustomerRecord[]>>;
}

export const CustomersTab: React.FC<CustomersTabProps> = ({
  customers,
  setCustomers,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [authFilter, setAuthFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleToggleActive = async (cust: CustomerRecord) => {
    const nextState = !cust.isActive;
    try {
      await AdminService.toggleCustomerActive(cust._id);
    } catch (e: any) {
      alert("Failed to toggle customer status: " + (e.response?.data?.message || e.message));
      return;
    }

    setCustomers((prev) =>
      prev.map((c) => (c._id === cust._id ? { ...c, isActive: nextState } : c))
    );
  };

  const filtered = customers
    .filter((c) => {
      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const matchName = (c.name || "").toLowerCase().includes(q);
        const matchEmail = (c.email || "").toLowerCase().includes(q);
        const matchUser = (c.username || "").toLowerCase().includes(q);
        if (!matchName && !matchEmail && !matchUser) return false;
      }

      if (statusFilter === "active" && c.isActive === false) return false;
      if (statusFilter === "suspended" && c.isActive !== false) return false;

      if (authFilter === "google" && c.authProvider !== "google") return false;
      if (authFilter === "local" && c.authProvider === "google") return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === "spend-desc") {
        return Number(b.totalSpend || 0) - Number(a.totalSpend || 0);
      }
      if (sortBy === "orders-desc") {
        return Number(b.ordersCount || 0) - Number(a.ordersCount || 0);
      }
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginated = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setAuthFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5">
        <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
          PATRON REGISTER
        </span>
        <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
          Registered Clients ({filtered.length})
        </h1>
      </div>

      {/* Control Bar: Search & Selectors (No sidebars) */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search clients by name, email, or username..."
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
              <option value="all" className="bg-[#101014] text-white">All Accounts</option>
              <option value="active" className="bg-[#101014] text-white">Active Only</option>
              <option value="suspended" className="bg-[#101014] text-white">Suspended Only</option>
            </select>
          </div>

          {/* Auth Provider */}
          <select
            value={authFilter}
            onChange={(e) => {
              setAuthFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#101014] border border-zinc-900 text-xs px-3 py-2.5 rounded text-zinc-300 outline-none uppercase tracking-wider cursor-pointer"
          >
            <option value="all" className="bg-[#101014] text-white">All Providers</option>
            <option value="google" className="bg-[#101014] text-white">Google OAuth2</option>
            <option value="local" className="bg-[#101014] text-white">Email & Password</option>
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
            <option value="newest" className="bg-[#101014] text-white">Newest Members</option>
            <option value="oldest" className="bg-[#101014] text-white">Oldest Members</option>
            <option value="spend-desc" className="bg-[#101014] text-white">Spend: High to Low</option>
            <option value="orders-desc" className="bg-[#101014] text-white">Orders: High to Low</option>
            <option value="name" className="bg-[#101014] text-white">Alphabetical (A-Z)</option>
          </select>

          {(searchTerm || statusFilter !== "all" || authFilter !== "all" || sortBy !== "newest") && (
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
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Authentication</th>
                <th className="py-3 px-4">Member Since</th>
                <th className="py-3 px-4">Orders Placed</th>
                <th className="py-3 px-4">Cumulative Spend</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 font-light">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-zinc-500">
                    No clients found matching query.
                  </td>
                </tr>
              ) : (
                paginated.map((c) => (
                  <tr
                    key={c._id}
                    className={`hover:bg-zinc-900/30 transition-colors ${
                      !c.isActive ? "opacity-60 bg-zinc-950/40" : ""
                    }`}
                  >
                    <td className="py-3 px-4 flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800 flex-shrink-0 flex items-center justify-center font-serif text-brand-gold font-bold">
                        {c.avatarUrl ? (
                          <img src={c.avatarUrl} alt={c.name} className="w-full h-full object-cover" />
                        ) : (
                          c.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{c.name}</p>
                        <span className="text-[10px] text-zinc-500 font-mono block">
                          {c.email}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase font-semibold ${
                          c.authProvider === "google"
                            ? "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                            : "bg-zinc-800 text-zinc-300"
                        }`}
                      >
                        {c.authProvider === "google" ? "Google OAuth2" : "Email & Password"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-400 text-[10px]">
                      {new Date(c.createdAt || Date.now()).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4 font-mono text-zinc-200">
                      {c.ordersCount || 0} orders
                    </td>
                    <td className="py-3 px-4 font-serif text-brand-gold font-bold">
                      ${Number(c.totalSpend || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                          c.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                            : "bg-red-500/10 text-red-400 border border-red-500/30"
                        }`}
                      >
                        {c.isActive ? "Active Client" : "Suspended"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider inline-flex items-center gap-1 transition-colors ${
                          c.isActive
                            ? "bg-zinc-900 hover:bg-red-950/50 text-zinc-400 hover:text-red-400 border border-zinc-800"
                            : "bg-emerald-950/40 text-emerald-300 border border-emerald-800"
                        }`}
                      >
                        {c.isActive ? (
                          <>
                            <EyeOff className="w-3 h-3" />
                            <span>Suspend</span>
                          </>
                        ) : (
                          <>
                            <Eye className="w-3 h-3" />
                            <span>Reactivate</span>
                          </>
                        )}
                      </button>
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
            totalItems={filtered.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemName="clients"
          />
        </div>
      </div>
    </div>
  );
};

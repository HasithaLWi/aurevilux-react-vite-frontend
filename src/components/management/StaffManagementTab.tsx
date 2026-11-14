import React, { useState } from "react";
import {
  UserPlus,
  Trash2,
  CheckCircle,
  Copy,
  Clock,
  Eye,
  EyeOff,
  X,
  Loader2,
  Search,
  Filter,
} from "lucide-react";
import { AdminService } from "../../services/admin.service";
import { LuxuryPagination } from "../common/LuxuryPagination";

interface StaffMember {
  _id: string;
  id?: string;
  name: string;
  email: string;
  username: string;
  roles: string[];
  isActive: boolean;
  avatarUrl?: string;
  createdAt: string;
}

interface PendingInvite {
  _id: string;
  email: string;
  role: string;
  token: string;
  invitedBy: string;
  expiresAt: string;
  used: boolean;
}

interface StaffManagementTabProps {
  currentUserRole: string; // "SUPERADMIN" | "ADMIN" | "STAFF"
  staffList: StaffMember[];
  setStaffList: React.Dispatch<React.SetStateAction<StaffMember[]>>;
  pendingInvites: PendingInvite[];
  setPendingInvites: React.Dispatch<React.SetStateAction<PendingInvite[]>>;
}

export const StaffManagementTab: React.FC<StaffManagementTabProps> = ({
  currentUserRole,
  staffList,
  setStaffList,
  pendingInvites,
  setPendingInvites,
}) => {
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [isSending, setIsSending] = useState(false);
  const [generatedInviteUrl, setGeneratedInviteUrl] = useState("");
  const [copied, setCopied] = useState(false);

  // Search, Filter & Pagination states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const isSuperAdmin = currentUserRole === "SUPERADMIN" || currentUserRole === "SUPER_ADMIN";
  const isAdmin = currentUserRole === "ADMIN" || isSuperAdmin;

  const handleOpenInvite = () => {
    setInviteEmail("");
    setInviteRole("STAFF");
    setGeneratedInviteUrl("");
    setCopied(false);
    setShowInviteModal(true);
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    if (inviteRole === "ADMIN" && !isSuperAdmin) {
      alert("Authority Denied: Only SuperAdmin accounts can invite Atelier Administrators.");
      return;
    }

    setIsSending(true);
    try {
      const res = await AdminService.inviteStaff(inviteEmail.trim(), inviteRole);
      if (res && res.data) {
        setGeneratedInviteUrl(res.data.inviteUrl);
        setPendingInvites((prev) => [
          {
            _id: `inv-${Date.now()}`,
            email: res.data.email,
            role: res.data.role,
            token: res.data.token,
            invitedBy: "You",
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            used: false,
          },
          ...prev,
        ]);
      }
    } catch (err: any) {
      alert("Failed to send staff invitation: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyLink = () => {
    if (!generatedInviteUrl) return;
    navigator.clipboard.writeText(generatedInviteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleToggleActive = async (member: StaffMember) => {
    const isTargetSuper = member.roles.includes("SUPERADMIN") || member.roles.includes("SUPER_ADMIN");
    const isTargetAdmin = member.roles.includes("ADMIN");

    if (isTargetSuper && !isSuperAdmin) {
      alert("Authority Denied: SuperAdmin accounts cannot be suspended.");
      return;
    }
    if (isTargetAdmin && !isSuperAdmin) {
      alert("Authority Denied: Only SuperAdmin can suspend Administrators.");
      return;
    }

    try {
      await AdminService.toggleStaffActive(member._id);
    } catch (e) {
      console.warn("Toggle staff API note:", e);
    }

    setStaffList((prev) =>
      prev.map((s) => (s._id === member._id ? { ...s, isActive: !s.isActive } : s))
    );
  };

  const handleDeleteStaff = async (member: StaffMember) => {
    const isTargetSuper = member.roles.includes("SUPERADMIN") || member.roles.includes("SUPER_ADMIN");
    const isTargetAdmin = member.roles.includes("ADMIN");

    if (isTargetSuper) {
      alert("SuperAdmin accounts cannot be deleted.");
      return;
    }
    if (isTargetAdmin && !isSuperAdmin) {
      alert("Authority Denied: Only SuperAdmin can remove Administrators.");
      return;
    }

    if (!confirm(`Are you sure you want to remove "${member.name}" from the atelier personnel roster?`)) {
      return;
    }

    try {
      await AdminService.deleteStaff(member._id);
    } catch (e) {
      console.warn("Delete staff API note:", e);
    }

    setStaffList((prev) => prev.filter((s) => s._id !== member._id));
  };

  const filteredStaff = staffList
    .filter((m) => {
      const primaryRole = m.roles?.[0] || "STAFF";

      if (searchTerm.trim()) {
        const q = searchTerm.toLowerCase();
        const nameMatch = (m.name || "").toLowerCase().includes(q);
        const emailMatch = (m.email || "").toLowerCase().includes(q);
        const userMatch = (m.username || "").toLowerCase().includes(q);
        if (!nameMatch && !emailMatch && !userMatch) return false;
      }

      if (roleFilter !== "all") {
        if (roleFilter === "SUPERADMIN" && primaryRole !== "SUPERADMIN" && primaryRole !== "SUPER_ADMIN") return false;
        if (roleFilter === "ADMIN" && primaryRole !== "ADMIN") return false;
        if (roleFilter === "STAFF" && primaryRole !== "STAFF") return false;
      }

      if (statusFilter === "active" && m.isActive === false) return false;
      if (statusFilter === "suspended" && m.isActive !== false) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "oldest") {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      if (sortBy === "name") {
        return (a.name || "").localeCompare(b.name || "");
      }
      if (sortBy === "role") {
        const roleOrder: Record<string, number> = { SUPERADMIN: 1, SUPER_ADMIN: 1, ADMIN: 2, STAFF: 3 };
        const roleA = roleOrder[a.roles?.[0] || "STAFF"] || 99;
        const roleB = roleOrder[b.roles?.[0] || "STAFF"] || 99;
        return roleA - roleB;
      }
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

  const totalPages = Math.ceil(filteredStaff.length / itemsPerPage) || 1;
  const paginatedStaff = filteredStaff.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleClearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setSortBy("newest");
    setCurrentPage(1);
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
            PERSONNEL & ROLE-BASED ACCESS
          </span>
          <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
            Atelier Staff Management ({filteredStaff.length})
          </h1>
        </div>
        {isAdmin && (
          <button
            onClick={handleOpenInvite}
            className="bg-brand-burgundy hover:bg-brand-burgundyHover text-white px-4 py-2 rounded text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Personnel</span>
          </button>
        )}
      </div>

      {/* Control Bar: Search & Selectors (No sidebars) */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search staff by name, email, or username..."
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
          {/* Role Filter */}
          <div className="flex items-center gap-1.5 bg-[#101014] border border-zinc-900 rounded px-2.5 py-1">
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-transparent text-xs text-zinc-300 outline-none uppercase tracking-wider py-1.5 cursor-pointer"
            >
              <option value="all" className="bg-[#101014] text-white">All Roles</option>
              <option value="SUPERADMIN" className="bg-[#101014] text-white">SuperAdmin</option>
              <option value="ADMIN" className="bg-[#101014] text-white">Administrator</option>
              <option value="STAFF" className="bg-[#101014] text-white">Atelier Staff</option>
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#101014] border border-zinc-900 text-xs px-3 py-2.5 rounded text-zinc-300 outline-none uppercase tracking-wider cursor-pointer"
          >
            <option value="all" className="bg-[#101014] text-white">All Statuses</option>
            <option value="active" className="bg-[#101014] text-white">Authorized</option>
            <option value="suspended" className="bg-[#101014] text-white">Suspended</option>
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
            <option value="newest" className="bg-[#101014] text-white">Newest First</option>
            <option value="oldest" className="bg-[#101014] text-white">Oldest First</option>
            <option value="role" className="bg-[#101014] text-white">By Privilege Tier</option>
            <option value="name" className="bg-[#101014] text-white">Alphabetical (A-Z)</option>
          </select>

          {(searchTerm || roleFilter !== "all" || statusFilter !== "all" || sortBy !== "newest") && (
            <button
              onClick={handleClearFilters}
              className="text-[10px] text-zinc-400 hover:text-brand-gold uppercase tracking-widest px-2 py-2 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="bg-[#101014] border border-zinc-900 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-zinc-900/60 text-zinc-500 uppercase text-[9px] tracking-widest font-semibold border-b border-zinc-900">
              <tr>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Privilege Tier</th>
                <th className="py-3 px-4">Account Status</th>
                <th className="py-3 px-4">Joined Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900 font-light">
              {filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-zinc-500">
                    No personnel match your search or filter.
                  </td>
                </tr>
              ) : (
                paginatedStaff.map((m) => {
                  const primaryRole = m.roles?.[0] || "STAFF";
                  const isSuper = primaryRole === "SUPERADMIN" || primaryRole === "SUPER_ADMIN";
                  const isTargetAdmin = primaryRole === "ADMIN";
                  return (
                    <tr
                      key={m._id}
                      className={`hover:bg-zinc-900/30 transition-colors ${
                        !m.isActive ? "opacity-60 bg-zinc-950/40" : ""
                      }`}
                    >
                      <td className="py-3 px-4 flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center font-serif text-brand-gold font-bold flex-shrink-0">
                          {m.avatarUrl ? (
                            <img src={m.avatarUrl} alt={m.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            m.name?.charAt(0) || "A"
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{m.name}</p>
                          <span className="text-[10px] text-zinc-500 font-mono block">
                            {m.email}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`text-[9px] px-2 py-0.5 rounded font-mono uppercase font-bold tracking-wider ${
                            isSuper
                              ? "bg-brand-gold/10 text-brand-gold border border-brand-gold/30"
                              : isTargetAdmin
                              ? "bg-brand-burgundy/20 text-brand-burgundy border border-brand-burgundy/40"
                              : "bg-zinc-800 text-zinc-300 border border-zinc-700"
                          }`}
                        >
                          {primaryRole}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase ${
                            m.isActive
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-red-500/10 text-red-400 border border-red-500/30"
                          }`}
                        >
                          {m.isActive ? "Authorized" : "Suspended"}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono text-zinc-400 text-[10px]">
                        {new Date(m.createdAt || Date.now()).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {!isSuper && (
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => handleToggleActive(m)}
                              className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded border border-zinc-800"
                              title={m.isActive ? "Suspend Member" : "Reactivate"}
                            >
                              {m.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(m)}
                              className="p-1.5 bg-zinc-900 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 rounded border border-zinc-800 hover:border-red-900"
                              title="Remove Personnel"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
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
            totalItems={filteredStaff.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemName="staff members"
          />
        </div>
      </div>

      {/* Pending Invites Section */}
      <div className="bg-[#101014] border border-zinc-900 rounded-lg p-5 space-y-3">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-brand-gold" />
            <h4 className="font-serif text-sm text-white uppercase tracking-wider font-semibold">
              Pending Atelier Invitations ({pendingInvites.length})
            </h4>
          </div>
          <span className="text-[10px] text-zinc-500">Links valid for 7 days</span>
        </div>

        {pendingInvites.length === 0 ? (
          <p className="text-zinc-500 text-xs py-4 text-center">No pending employee invitations.</p>
        ) : (
          <div className="divide-y divide-zinc-900">
            {pendingInvites.map((inv, idx) => (
              <div key={idx} className="py-2.5 flex justify-between items-center text-xs">
                <div>
                  <span className="text-white font-medium">{inv.email}</span>
                  <span className="text-zinc-500 text-[10px] font-mono block">
                    Invited as {inv.role} &bull; Expires:{" "}
                    {new Date(inv.expiresAt).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-[9px] bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded uppercase font-semibold">
                  Awaiting Acceptance
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-[#101014] border border-zinc-800 rounded-lg max-w-md w-full p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-base text-white uppercase tracking-wider font-bold">
                Invite Atelier Personnel
              </h3>
              <button
                onClick={() => setShowInviteModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {generatedInviteUrl ? (
              <div className="space-y-4">
                <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Invitation dispatched to {inviteEmail} via SMTP!</span>
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Direct Registration Link
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={generatedInviteUrl}
                      className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-zinc-300 font-mono select-all outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className="px-3 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-white rounded text-xs flex items-center gap-1 font-semibold"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>{copied ? "Copied" : "Copy"}</span>
                    </button>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 bg-brand-burgundy text-white text-xs font-bold uppercase rounded tracking-wider"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-3.5">
                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Employee Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="personnel@aurevilux.com"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                    Atelier Role Assignment
                  </label>
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as any)}
                    className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none uppercase"
                  >
                    <option value="STAFF">STAFF (Catalog & Order Fulfillment)</option>
                    {isSuperAdmin && <option value="ADMIN">ADMIN (Full Administrative Control)</option>}
                  </select>
                  {!isSuperAdmin && (
                    <span className="text-[10px] text-zinc-500 mt-1 block">
                      Note: Only SuperAdmin accounts can grant Admin privileges.
                    </span>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setShowInviteModal(false)}
                    className="px-4 py-2 border border-zinc-800 text-zinc-400 hover:text-white text-xs uppercase rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSending}
                    className="px-4 py-2 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold uppercase rounded tracking-wider flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>Dispatch Invitation</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

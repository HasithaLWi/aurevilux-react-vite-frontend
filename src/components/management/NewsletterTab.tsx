import React, { useState } from "react";
import {
  Send,
  Users,
  CheckCircle,
  Loader2,
  Search,
  X,
  UserMinus,
  UserCheck,
  Trash2,
  ArrowUpDown,
  Mail,
} from "lucide-react";
import type { NewsletterSubscriber } from "../../types";
import { AdminService } from "../../services/admin.service";
import { LuxuryPagination } from "../common/LuxuryPagination";
import { useLuxuryAlert } from "../../context/LuxuryAlertContext";

interface NewsletterTabProps {
  subscribers: NewsletterSubscriber[];
  setSubscribers?: React.Dispatch<React.SetStateAction<NewsletterSubscriber[]>>;
}

export const NewsletterTab: React.FC<NewsletterTabProps> = ({
  subscribers,
  setSubscribers,
}) => {
  const { showAlert, confirm } = useLuxuryAlert();
  // Broadcast states
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // Filtering states
  const [searchEmail, setSearchEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [domainFilter, setDomainFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "email_asc" | "email_desc">("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Action states
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  // Manual Unsubscribe bar
  const [manualEmail, setManualEmail] = useState("");
  const [isManualLoading, setIsManualLoading] = useState(false);

  // Summary counts
  const totalSubscribers = subscribers.length;
  const activeSubscribers = subscribers.filter((s) => s.isActive !== false).length;
  const inactiveSubscribers = totalSubscribers - activeSubscribers;

  // Handle Atelier Broadcast Dispatch
  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;

    setIsSending(true);
    setFeedbackMsg("");
    try {
      const res = await AdminService.broadcastNewsletter(subject, content);
      showAlert("success", `Haute Transmission successfully dispatched to ${res.recipientsCount || activeSubscribers} active patrons!`);
      setFeedbackMsg(
        `Haute Transmission successfully dispatched to ${res.recipientsCount || activeSubscribers} active patrons via SMTP with personalized unsubscribe links!`
      );
      setSubject("");
      setContent("");
    } catch (err: any) {
      showAlert("error", "Failed to broadcast newsletter: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSending(false);
    }
  };

  // Toggle active/unsubscribed status
  const handleToggleStatus = async (subscriber: NewsletterSubscriber) => {
    const id = subscriber._id || subscriber.id;
    if (!id) return;

    setActionLoadingId(id);
    setActionFeedback(null);

    try {
      const updated = await AdminService.toggleNewsletterSubscriber(id);
      if (setSubscribers) {
        setSubscribers((prev) =>
          prev.map((s) => ((s._id || s.id) === id ? { ...s, isActive: updated.isActive } : s))
        );
      }
      showAlert(
        "info",
        updated.isActive
          ? `Subscriber ${subscriber.email} reactivated successfully.`
          : `Subscriber ${subscriber.email} unsubscribed.`
      );
    } catch (err: any) {
      showAlert("error", "Failed to update subscriber: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Delete subscriber permanently
  const handleDeleteSubscriber = async (subscriber: NewsletterSubscriber) => {
    const id = subscriber._id || subscriber.id;
    if (!id) return;

    const confirmDelete = await confirm({
      title: "Remove Newsletter Subscriber",
      message: `Are you sure you wish to permanently remove ${subscriber.email} from the atelier newsletter registry?`,
      confirmText: "Remove Subscriber",
      cancelText: "Keep Subscriber",
      variant: "danger",
    });
    if (!confirmDelete) return;

    setActionLoadingId(id);
    try {
      await AdminService.deleteNewsletterSubscriber(id);
      if (setSubscribers) {
        setSubscribers((prev) => prev.filter((s) => (s._id || s.id) !== id));
      }
      showAlert("success", `Subscriber ${subscriber.email} permanently removed.`);
    } catch (err: any) {
      showAlert("error", "Failed to remove subscriber: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoadingId(null);
    }
  };

  // Manual Unsubscribe by Email
  const handleManualUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualEmail.trim()) return;

    setIsManualLoading(true);
    setActionFeedback(null);
    try {
      await AdminService.unsubscribeNewsletter(manualEmail.trim());
      if (setSubscribers) {
        setSubscribers((prev) =>
          prev.map((s) =>
            s.email.toLowerCase() === manualEmail.trim().toLowerCase()
              ? { ...s, isActive: false }
              : s
          )
        );
      }
      showAlert("success", `Successfully unsubscribed ${manualEmail.trim()}.`);
      setManualEmail("");
    } catch (err: any) {
      showAlert("error", "Failed to unsubscribe email: " + (err.response?.data?.message || err.message));
    } finally {
      setIsManualLoading(false);
    }
  };

  // Filter & Sort Logic
  const filteredSubscribers = subscribers
    .filter((s) => {
      // 1. Search text filter
      if (searchEmail.trim()) {
        if (!s.email.toLowerCase().includes(searchEmail.toLowerCase())) return false;
      }
      // 2. Status filter
      if (statusFilter === "active" && s.isActive === false) return false;
      if (statusFilter === "inactive" && s.isActive !== false) return false;

      // 3. Domain filter
      if (domainFilter === "gmail" && !s.email.toLowerCase().endsWith("@gmail.com")) return false;
      if (
        domainFilter === "outlook" &&
        !s.email.toLowerCase().endsWith("@outlook.com") &&
        !s.email.toLowerCase().endsWith("@hotmail.com")
      )
        return false;
      if (domainFilter === "yahoo" && !s.email.toLowerCase().endsWith("@yahoo.com")) return false;
      if (
        domainFilter === "corporate" &&
        (s.email.toLowerCase().endsWith("@gmail.com") ||
          s.email.toLowerCase().endsWith("@outlook.com") ||
          s.email.toLowerCase().endsWith("@hotmail.com") ||
          s.email.toLowerCase().endsWith("@yahoo.com"))
      )
        return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "newest") {
        const dateA = a.subscribedAt ? new Date(a.subscribedAt).getTime() : 0;
        const dateB = b.subscribedAt ? new Date(b.subscribedAt).getTime() : 0;
        return dateB - dateA;
      }
      if (sortBy === "oldest") {
        const dateA = a.subscribedAt ? new Date(a.subscribedAt).getTime() : 0;
        const dateB = b.subscribedAt ? new Date(b.subscribedAt).getTime() : 0;
        return dateA - dateB;
      }
      if (sortBy === "email_asc") {
        return a.email.localeCompare(b.email);
      }
      if (sortBy === "email_desc") {
        return b.email.localeCompare(a.email);
      }
      return 0;
    });

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage) || 1;
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 w-full text-left">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5 flex flex-col sm:flex-row justify-between sm:items-end gap-4">
        <div>
          <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
            ATELIER DISPATCH
          </span>
          <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
            Newsletter & Private Transmissions
          </h1>
        </div>

        {/* Counter Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-[#101014] border border-zinc-800 px-3 py-1.5 rounded text-center">
            <span className="text-[9px] uppercase tracking-wider text-zinc-500 block">Total</span>
            <span className="text-sm font-serif font-bold text-white">{totalSubscribers}</span>
          </div>
          <div className="bg-emerald-950/30 border border-emerald-900/50 px-3 py-1.5 rounded text-center">
            <span className="text-[9px] uppercase tracking-wider text-emerald-400 block">Active</span>
            <span className="text-sm font-serif font-bold text-emerald-300">{activeSubscribers}</span>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 px-3 py-1.5 rounded text-center">
            <span className="text-[9px] uppercase tracking-wider text-zinc-400 block">Unsubscribed</span>
            <span className="text-sm font-serif font-bold text-zinc-400">{inactiveSubscribers}</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Broadcast Composer (2 cols) */}
        <div className="lg:col-span-2 bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-zinc-900 pb-3">
              <h3 className="font-serif text-base text-white uppercase tracking-wider font-semibold">
                Compose Atelier Broadcast
              </h3>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
                Dispatches responsive HTML editorial via Nodemailer SMTP service with auto-generated unsubscribe links
              </p>
            </div>

            {feedbackMsg && (
              <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded flex items-center gap-2">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                <span>{feedbackMsg}</span>
              </div>
            )}

            <form onSubmit={handleBroadcast} className="space-y-4">
              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Dispatch Subject Line *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Private Invitation: The Autumn/Winter Runway Capsule"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2.5 rounded text-white outline-none focus:border-brand-gold"
                />
              </div>

              <div>
                <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block mb-1">
                  Editorial Announcement (HTML or Text) *
                </label>
                <textarea
                  rows={8}
                  required
                  placeholder="<p>Esteemed Patrons,</p><p>We are delighted to reveal the private Autumn/Winter collection, now live on Aurevilux...</p>"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full bg-brand-black border border-zinc-800 text-xs p-3 rounded text-white outline-none focus:border-brand-gold font-mono"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-2">
                <span className="text-[10px] text-zinc-500 font-mono">
                  Targeting {activeSubscribers} active patrons (individual delivery &amp; privacy preserved)
                </span>
                <button
                  type="submit"
                  disabled={isSending || activeSubscribers === 0}
                  className="bg-brand-burgundy hover:bg-brand-burgundyHover text-white px-5 py-2.5 rounded text-xs font-bold tracking-widest uppercase flex items-center gap-2 transition-colors disabled:opacity-50"
                >
                  {isSending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Transmitting...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Broadcast Transmission</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Quick Manual Unsubscribe Tool */}
          <div className="pt-4 border-t border-zinc-900">
            <h4 className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold mb-2">
              Manual Unsubscribe Tool
            </h4>
            <form onSubmit={handleManualUnsubscribe} className="flex gap-2">
              <input
                type="email"
                required
                placeholder="patron@example.com to unsubscribe..."
                value={manualEmail}
                onChange={(e) => setManualEmail(e.target.value)}
                className="flex-1 bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold font-mono placeholder-zinc-600"
              />
              <button
                type="submit"
                disabled={isManualLoading || !manualEmail.trim()}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white rounded text-xs font-bold uppercase tracking-wider transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {isManualLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>Unsubscribe</span>
              </button>
            </form>
          </div>
        </div>

        {/* Subscriber Roster (1 col) */}
        <div className="bg-[#101014] border border-zinc-900 rounded-lg p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <div>
                <h3 className="font-serif text-base text-white uppercase tracking-wider font-semibold">
                  Subscribers Roster
                </h3>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  Showing {filteredSubscribers.length} of {totalSubscribers} patrons
                </span>
              </div>
              <Users className="w-4 h-4 text-brand-gold" />
            </div>

            {/* Action Feedback alert */}
            {actionFeedback && (
              <div className="p-2.5 bg-brand-dark border border-brand-gold/50 rounded text-brand-gold text-[11px] flex items-center gap-2 animate-fade-in">
                <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{actionFeedback}</span>
              </div>
            )}

            {/* Email Filter Controls */}
            <div className="space-y-2.5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by email address..."
                  value={searchEmail}
                  onChange={(e) => {
                    setSearchEmail(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-brand-black border border-zinc-800 text-[11px] pl-8 pr-7 py-2 rounded text-white placeholder-zinc-500 outline-none focus:border-brand-gold/50 font-mono"
                />
                {searchEmail && (
                  <button
                    onClick={() => {
                      setSearchEmail("");
                      setCurrentPage(1);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Status and Domain Filters Grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* Status Filter */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold block">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value as any);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-brand-black border border-zinc-800 text-[10px] px-2 py-1.5 rounded text-zinc-300 outline-none uppercase tracking-wider cursor-pointer"
                  >
                    <option value="all">All ({totalSubscribers})</option>
                    <option value="active">Active ({activeSubscribers})</option>
                    <option value="inactive">Unsubscribed ({inactiveSubscribers})</option>
                  </select>
                </div>

                {/* Domain Filter */}
                <div className="space-y-1">
                  <label className="text-[9px] uppercase tracking-wider text-zinc-500 font-semibold block">
                    Domain
                  </label>
                  <select
                    value={domainFilter}
                    onChange={(e) => {
                      setDomainFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full bg-brand-black border border-zinc-800 text-[10px] px-2 py-1.5 rounded text-zinc-300 outline-none uppercase tracking-wider cursor-pointer"
                  >
                    <option value="all">All Domains</option>
                    <option value="gmail">Gmail</option>
                    <option value="outlook">Outlook</option>
                    <option value="yahoo">Yahoo</option>
                    <option value="corporate">Private / Custom</option>
                  </select>
                </div>
              </div>

              {/* Sort Order Selector */}
              <div className="flex items-center gap-2">
                <ArrowUpDown className="w-3 h-3 text-zinc-500 shrink-0" />
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value as any);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-brand-black border border-zinc-800 text-[10px] px-2 py-1.5 rounded text-zinc-300 outline-none uppercase tracking-wider cursor-pointer"
                >
                  <option value="newest">Sort: Newest Subscribed</option>
                  <option value="oldest">Sort: Oldest Subscribed</option>
                  <option value="email_asc">Sort: Email (A - Z)</option>
                  <option value="email_desc">Sort: Email (Z - A)</option>
                </select>
              </div>
            </div>

            {/* Subscribers List with Action Buttons */}
            <div className="space-y-2 divide-y divide-zinc-900 min-h-[220px]">
              {filteredSubscribers.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <Mail className="w-6 h-6 mx-auto text-zinc-600" />
                  <p className="text-zinc-500 text-xs">No patrons match your search filter.</p>
                </div>
              ) : (
                paginatedSubscribers.map((s) => {
                  const id = s._id || s.id || s.email;
                  const isActioning = actionLoadingId === id;
                  const isActive = s.isActive !== false;

                  return (
                    <div
                      key={id}
                      className="pt-2.5 pb-1 flex flex-col gap-1.5 group transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-200 font-mono text-[11px] truncate max-w-[210px]">
                          {s.email}
                        </span>
                        <span
                          className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                            isActive
                              ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                              : "bg-zinc-800 text-zinc-400 border border-zinc-700/40"
                          }`}
                        >
                          {isActive ? "Active" : "Unsubscribed"}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-[10px] text-zinc-500">
                        <span className="font-mono text-[9px]">
                          {s.subscribedAt
                            ? new Date(s.subscribedAt).toLocaleDateString()
                            : "Atelier Patron"}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {/* Unsubscribe / Reactivate Action Button */}
                          <button
                            type="button"
                            disabled={isActioning}
                            onClick={() => handleToggleStatus(s)}
                            className={`px-2 py-0.5 rounded text-[9px] uppercase tracking-wider font-semibold transition-colors flex items-center gap-1 border disabled:opacity-50 ${
                              isActive
                                ? "bg-red-950/30 hover:bg-red-900/50 border-red-900/50 text-red-300"
                                : "bg-emerald-950/30 hover:bg-emerald-900/50 border-emerald-900/50 text-emerald-300"
                            }`}
                          >
                            {isActioning ? (
                              <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            ) : isActive ? (
                              <UserMinus className="w-2.5 h-2.5" />
                            ) : (
                              <UserCheck className="w-2.5 h-2.5" />
                            )}
                            <span>{isActive ? "Unsubscribe" : "Reactivate"}</span>
                          </button>

                          {/* Delete from registry button */}
                          <button
                            type="button"
                            disabled={isActioning}
                            onClick={() => handleDeleteSubscriber(s)}
                            title="Remove from registry"
                            className="p-1 text-zinc-500 hover:text-red-400 transition-colors disabled:opacity-50"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Pagination */}
          <LuxuryPagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredSubscribers.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            itemName="patrons"
          />
        </div>
      </div>
    </div>
  );
};

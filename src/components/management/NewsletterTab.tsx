import React, { useState } from "react";
import { Send, Users, CheckCircle, Loader2, Search, Filter, X } from "lucide-react";
import type { NewsletterSubscriber } from "../../types";
import { AdminService } from "../../services/admin.service";
import { LuxuryPagination } from "../common/LuxuryPagination";

interface NewsletterTabProps {
  subscribers: NewsletterSubscriber[];
}

export const NewsletterTab: React.FC<NewsletterTabProps> = ({ subscribers }) => {
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  const [searchEmail, setSearchEmail] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !content.trim()) return;

    setIsSending(true);
    setFeedbackMsg("");
    try {
      const res = await AdminService.broadcastNewsletter(subject, content);
      setFeedbackMsg(
        `Haute Transmission successfully dispatched to ${res.recipientsCount || subscribers.length} patrons via SMTP!`
      );
      setSubject("");
      setContent("");
    } catch (err: any) {
      alert("Failed to broadcast newsletter: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSending(false);
    }
  };

  const filteredSubscribers = subscribers.filter((s) => {
    if (searchEmail.trim()) {
      if (!s.email.toLowerCase().includes(searchEmail.toLowerCase())) return false;
    }
    if (statusFilter === "active" && s.isActive === false) return false;
    if (statusFilter === "inactive" && s.isActive !== false) return false;
    return true;
  });

  const totalPages = Math.ceil(filteredSubscribers.length / itemsPerPage) || 1;
  const paginatedSubscribers = filteredSubscribers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6 w-full text-left">
      {/* Header */}
      <div className="border-b border-zinc-900 pb-5">
        <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold">
          ATELIER DISPATCH
        </span>
        <h1 className="font-serif text-2xl md:text-3xl uppercase text-white tracking-wider mt-1">
          Newsletter & Private Transmissions
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Email Broadcast Composer (2 cols) */}
        <div className="lg:col-span-2 bg-[#101014] border border-zinc-900 rounded-lg p-6 space-y-4">
          <div className="border-b border-zinc-900 pb-3">
            <h3 className="font-serif text-base text-white uppercase tracking-wider font-semibold">
              Compose Atelier Broadcast
            </h3>
            <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-0.5">
              Dispatches responsive HTML editorial via Nodemailer SMTP service
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

            <div className="flex justify-between items-center pt-2">
              <span className="text-[10px] text-zinc-500 font-mono">
                Targeting {subscribers.filter((s) => s.isActive !== false).length} active patrons
              </span>
              <button
                type="submit"
                disabled={isSending}
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

        {/* Subscriber Roster (1 col) */}
        <div className="bg-[#101014] border border-zinc-900 rounded-lg p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
              <div>
                <h3 className="font-serif text-base text-white uppercase tracking-wider font-semibold">
                  Subscribers Roster
                </h3>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">
                  {filteredSubscribers.length} / {subscribers.length} patrons
                </span>
              </div>
              <Users className="w-4 h-4 text-brand-gold" />
            </div>

            {/* Quick Search & Filter Selectors */}
            <div className="space-y-2">
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
                  className="w-full bg-brand-black border border-zinc-800 text-[11px] pl-8 pr-7 py-1.5 rounded text-white placeholder-zinc-500 outline-none focus:border-brand-gold/50"
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

              <div className="flex items-center gap-2">
                <Filter className="w-3 h-3 text-zinc-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="w-full bg-brand-black border border-zinc-800 text-[10px] px-2 py-1 rounded text-zinc-300 outline-none uppercase tracking-wider cursor-pointer"
                >
                  <option value="all">All Subscribers</option>
                  <option value="active">Active Only</option>
                  <option value="inactive">Unsubscribed</option>
                </select>
              </div>
            </div>

            {/* Subscribers List */}
            <div className="space-y-2 divide-y divide-zinc-900 min-h-[220px]">
              {filteredSubscribers.length === 0 ? (
                <p className="text-zinc-500 text-xs py-8 text-center">
                  No subscribers match your search.
                </p>
              ) : (
                paginatedSubscribers.map((s) => (
                  <div key={s._id || s.id} className="pt-2 text-xs flex justify-between items-center">
                    <span className="text-zinc-300 font-mono text-[11px] truncate max-w-[170px]">
                      {s.email}
                    </span>
                    <span
                      className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                        s.isActive !== false
                          ? "bg-emerald-950/40 text-emerald-400 border border-emerald-800/40"
                          : "bg-zinc-800 text-zinc-400"
                      }`}
                    >
                      {s.isActive !== false ? "Active" : "Opted Out"}
                    </span>
                  </div>
                ))
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

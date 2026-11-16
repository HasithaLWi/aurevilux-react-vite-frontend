import React, { useState, useEffect } from "react";
import { Star, X, Sparkles, Send, Loader2, CheckCircle2 } from "lucide-react";
import { FeedbackService } from "../../services/feedback.service";
import { AuthService } from "../../services/auth.service";
import { useLuxuryAlert } from "../../context/LuxuryAlertContext";

export const FloatingFeedbackPrompt: React.FC = () => {
  const { showAlert } = useLuxuryAlert();
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    // Check if user already dismissed, snoozed, or submitted
    const savedState = localStorage.getItem("aurevilux_feedback_prompt_state");
    const snoozeUntil = localStorage.getItem("aurevilux_feedback_prompt_snooze");

    if (savedState === "submitted" || savedState === "dismissed") {
      return;
    }

    if (snoozeUntil && parseInt(snoozeUntil, 10) > Date.now()) {
      return;
    }

    // Auto-fill user credentials if authenticated
    const user = AuthService.getStoredUser();
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }

    // Delay 10 seconds before displaying to preserve serene initial impression
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 10000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("aurevilux_feedback_prompt_state", "dismissed");
  };

  const handleSnooze = () => {
    setIsVisible(false);
    // Snooze for 3 days
    const threeDays = Date.now() + 3 * 24 * 60 * 60 * 1000;
    localStorage.setItem("aurevilux_feedback_prompt_snooze", threeDays.toString());
  };

  const handleStarClick = (num: number) => {
    setRating(num);
    setIsExpanded(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !comment.trim()) {
      showAlert("warning", "Please provide your name, contact email, and brief impression.");
      return;
    }

    setIsSubmitting(true);
    try {
      await FeedbackService.submitFeedback({
        name: name.trim(),
        email: email.trim(),
        role: "Boutique Patron",
        rating,
        comment: comment.trim(),
      });
      setIsSubmitted(true);
      localStorage.setItem("aurevilux_feedback_prompt_state", "submitted");
      showAlert("success", "Thank you for your refined impressions.", "Atelier Feedback Received");

      setTimeout(() => {
        setIsVisible(false);
      }, 3500);
    } catch (err: any) {
      showAlert("error", "Unable to record feedback: " + (err.response?.data?.message || err.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className="fixed bottom-6 right-6 z-40 max-w-sm w-full animate-fade-in text-left select-none"
      style={{ filter: "drop-shadow(0 20px 30px rgba(0,0,0,0.8))" }}
    >
      <div className="bg-[#0e0e12]/95 backdrop-blur-xl border border-brand-gold/30 rounded-xl p-5 shadow-2xl space-y-4 relative overflow-hidden transition-all duration-300">
        {/* Subtle Ambient Golden Accent */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-brand-gold/60 to-transparent" />

        {/* Dismiss Button */}
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-zinc-500 hover:text-white p-1 rounded transition-colors"
          title="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>

        {isSubmitted ? (
          <div className="py-4 text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-brand-gold mx-auto stroke-[1.5]" />
            <span className="text-[10px] tracking-[0.25em] text-brand-gold uppercase font-bold block">
              IMPRESSIONS CONVEYED
            </span>
            <p className="text-xs text-zinc-300 font-light">
              Your perspective has been personally received by our atelier curation directors.
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="space-y-1 pr-6">
              <div className="flex items-center gap-1.5 text-brand-gold">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="text-[9px] uppercase tracking-[0.3em] font-bold">
                  ATELIER EXPERIENCE
                </span>
              </div>
              <h4 className="font-serif text-sm text-white uppercase tracking-wider font-semibold">
                How is your journey through Aurevilux today?
              </h4>
              <p className="text-[11px] text-zinc-400 font-light">
                Rate your bespoke browsing experience to assist our stylists.
              </p>
            </div>

            {/* 5-Star Rating Buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => handleStarClick(star)}
                  className="p-1 text-zinc-600 hover:text-brand-gold transition-colors"
                >
                  <Star
                    className={`w-5 h-5 ${
                      (hoverRating || rating) >= star
                        ? "fill-brand-gold text-brand-gold"
                        : "text-zinc-700"
                    }`}
                  />
                </button>
              ))}
              <span className="text-[10px] font-mono text-zinc-500 ml-2">
                {rating}/5 Stars
              </span>
            </div>

            {/* Expandable Form upon Interaction */}
            {isExpanded ? (
              <form onSubmit={handleSubmit} className="space-y-3 pt-2 border-t border-zinc-900 animate-fade-in">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    required
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#08080a] border border-zinc-800 text-xs px-2.5 py-1.5 rounded text-white outline-none focus:border-brand-gold/70"
                  />
                  <input
                    type="email"
                    required
                    placeholder="Your Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#08080a] border border-zinc-800 text-xs px-2.5 py-1.5 rounded text-white outline-none focus:border-brand-gold/70"
                  />
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="Share a thought on our collections, curation, or service..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full bg-[#08080a] border border-zinc-800 text-xs p-2.5 rounded text-white outline-none focus:border-brand-gold/70 resize-none leading-relaxed"
                />

                <div className="flex items-center justify-between pt-1">
                  <button
                    type="button"
                    onClick={handleSnooze}
                    className="text-[10px] text-zinc-500 hover:text-zinc-300 uppercase tracking-widest"
                  >
                    Remind Later
                  </button>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-1.5 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-[10px] font-bold uppercase tracking-widest rounded flex items-center gap-1.5 shadow-md shadow-brand-burgundy/20 transition-all"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Send className="w-3 h-3 text-brand-gold" />
                    )}
                    <span>Submit</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex items-center justify-between pt-1 text-[10px] text-zinc-500">
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="text-brand-gold hover:underline uppercase tracking-widest font-semibold"
                >
                  Write Note &rarr;
                </button>
                <button
                  type="button"
                  onClick={handleSnooze}
                  className="hover:text-zinc-300 uppercase tracking-widest"
                >
                  Remind Later
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

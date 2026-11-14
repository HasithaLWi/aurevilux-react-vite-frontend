import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Mail,
  RotateCcw,
} from "lucide-react";
import { NewsletterService } from "../services/newsletter.service";

export default function Unsubscribe() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const queryEmail = searchParams.get("email") || "";
  const [email, setEmail] = useState(queryEmail);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isReactivated, setIsReactivated] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleUnsubscribe = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!email.trim() || isLoading) return;

    setIsLoading(true);
    setErrorMessage("");

    try {
      const res = await NewsletterService.unsubscribe(email.trim());
      setSuccessMessage(
        res.message ||
          `The email address ${email.trim()} has been successfully unsubscribed from Aurevilux dispatches.`
      );
      setIsSuccess(true);
      setIsReactivated(false);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
          "Unable to process unsubscribe request. Please verify your email address or contact atelier concierge."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivate = async () => {
    if (!email.trim() || isLoading) return;
    setIsLoading(true);
    setErrorMessage("");

    try {
      await NewsletterService.subscribe(email.trim());
      setIsReactivated(true);
      setIsSuccess(false);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message || "Failed to reactivate membership. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-16 bg-brand-black">
      <div className="max-w-md w-full bg-[#101014] border border-zinc-800 rounded-xl p-8 sm:p-10 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <span className="text-[10px] tracking-[0.3em] uppercase text-brand-gold font-mono font-medium">
            Atelier Dispatch Preferences
          </span>
          <h1 className="text-2xl font-serif text-white tracking-widest uppercase font-bold">
            Aurevilux
          </h1>
          <p className="text-xs text-zinc-400 tracking-wider">
            Manage your Inner Circle membership transmissions
          </p>
        </div>

        {/* State: Successfully Reactivated */}
        {isReactivated ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950/40 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
                Membership Restored
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Welcome back to The Inner Circle. Your subscription for <strong className="text-zinc-200">{email}</strong> has been restored. You will continue receiving privileged dispatches.
              </p>
            </div>
            <button
              onClick={() => navigate("/")}
              className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-3 rounded text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors shadow-lg shadow-brand-burgundy/20"
            >
              <span>Return to Boutique</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : isSuccess ? (
          /* State: Successfully Unsubscribed */
          <div className="space-y-6 text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-zinc-900 border border-zinc-700 flex items-center justify-center text-zinc-300">
              <ShieldCheck className="w-7 h-7 text-brand-gold" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
                Unsubscribed Successfully
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {successMessage}
              </p>
              <p className="text-[11px] text-zinc-500 pt-1 leading-relaxed">
                We respect your confidentiality. You will no longer receive private trunk show notices or seasonal dispatches.
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <button
                onClick={handleReactivate}
                disabled={isLoading}
                className="w-full border border-brand-gold/40 hover:border-brand-gold text-brand-gold py-2.5 rounded text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                <span>Accident? Reactivate Membership</span>
              </button>

              <button
                onClick={() => navigate("/")}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-300 py-2.5 rounded text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors border border-zinc-800"
              >
                <span>Return to Storefront</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* State: Confirmation Form */
          <form onSubmit={handleUnsubscribe} className="space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-950/30 border border-red-900/60 rounded text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            <p className="text-xs text-zinc-400 leading-relaxed">
              We regret to see you depart. Please confirm the email address below to cease receiving Aurevilux Atelier private editorials:
            </p>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                Patron Email Address *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="patron@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold text-xs pl-9 pr-3 py-2.5 rounded text-white outline-none font-mono"
                />
              </div>
            </div>

            <div className="pt-2 space-y-2">
              <button
                type="submit"
                disabled={isLoading || !email.trim()}
                className="w-full bg-red-950/40 hover:bg-red-900/60 border border-red-900/60 text-red-300 py-3 rounded text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Unsubscribe from Membership</span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white py-2.5 rounded text-xs font-medium tracking-wider uppercase transition-colors border border-zinc-800"
              >
                Keep My Membership
              </button>
            </div>

            <div className="text-center pt-2">
              <Link
                to="/"
                className="text-[11px] text-zinc-500 hover:text-brand-gold uppercase tracking-wider transition-colors"
              >
                Return to boutique
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

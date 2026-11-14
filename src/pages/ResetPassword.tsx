import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { AuthService } from "../services/auth.service";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // If token or email is missing in URL parameters
  if (!token || !email) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-brand-black">
        <div className="max-w-md w-full bg-[#101014] border border-zinc-800 rounded-lg p-8 text-center space-y-6 shadow-2xl">
          <div className="w-12 h-12 mx-auto rounded-full bg-red-950/40 border border-red-800/60 flex items-center justify-center text-red-400">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="font-serif text-xl font-bold tracking-wider text-white uppercase">
              Invalid Recovery Link
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              This password reset link is invalid or incomplete. Security recovery parameters are missing. Please request a new recovery link through the atelier sign-in portal.
            </p>
          </div>
          <button
            onClick={() => navigate("/login")}
            className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-3 rounded text-xs font-bold tracking-widest uppercase transition-colors"
          >
            Return to Atelier Sign In
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please re-enter your credentials.");
      return;
    }

    setIsLoading(true);

    try {
      await AuthService.resetPassword({
        token,
        email,
        password,
      });
      setIsSuccess(true);
    } catch (err: any) {
      setErrorMessage(
        err.response?.data?.message ||
          "Failed to reset password. The link may have expired or is invalid. Please request a new link."
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
            Haute Security Verification
          </span>
          <h1 className="text-2xl font-serif text-white tracking-widest uppercase font-bold">
            Aurevilux
          </h1>
          <p className="text-xs text-zinc-400 tracking-wider">
            Establish new confidential password credentials
          </p>
        </div>

        {/* Success Screen */}
        {isSuccess ? (
          <div className="space-y-6 text-center py-4">
            <div className="w-14 h-14 mx-auto rounded-full bg-emerald-950/40 border border-emerald-600/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-serif text-lg font-bold text-white uppercase tracking-wider">
                Credentials Updated
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Your account password for <strong className="text-zinc-200">{email}</strong> has been successfully updated and secured. You may now sign in using your new credentials.
              </p>
            </div>
            <button
              onClick={() => navigate("/login")}
              className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-3 rounded text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors shadow-lg shadow-brand-burgundy/20"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          /* Password Reset Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-950/30 border border-red-900/60 rounded text-red-300 text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 mt-0.5 shrink-0 text-red-400" />
                <span className="leading-snug">{errorMessage}</span>
              </div>
            )}

            {/* Target Account Badge */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                Atelier Account
              </label>
              <div className="w-full bg-zinc-900/80 border border-zinc-800 text-xs px-3 py-2.5 rounded text-zinc-300 font-mono">
                {email}
              </div>
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                New Confidential Password *
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Minimum 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold text-xs px-3 py-2.5 rounded text-white outline-none font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold text-xs px-3 py-2.5 rounded text-white outline-none font-mono pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-3 rounded text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-4 shadow-lg shadow-brand-burgundy/15"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Update Password Credentials</span>
              <ShieldCheck className="w-4 h-4" />
            </button>

            {/* Return link */}
            <div className="text-center pt-2">
              <Link
                to="/login"
                className="text-[11px] text-zinc-500 hover:text-brand-gold uppercase tracking-wider transition-colors"
              >
                Cancel and return to sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
import React, { useState } from "react";
import { Lock, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface SecurityTabProps {
  authProvider?: "local" | "google";
  onChangePassword: (
    currentPw: string,
    newPw: string,
    confirmPw: string
  ) => Promise<void>;
  showToast: (message: string, type?: "success" | "error") => void;
}

export const SecurityTab: React.FC<SecurityTabProps> = ({
  authProvider = "local",
  onChangePassword,
  showToast,
}) => {
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onChangePassword(
      passwordForm.currentPassword,
      passwordForm.newPassword,
      passwordForm.confirmPassword
    );
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  return (
    <div className="space-y-8 animate-fade-in w-full max-w-5xl">
      <div className="border-b border-zinc-900 pb-4">
        <h2 className="font-serif text-2xl text-white uppercase tracking-wider">
          Cabinet Security & Access
        </h2>
        <p className="text-xs text-zinc-500 mt-0.5">
          Configure account access credentials, password updates, and multi-factor authentication.
        </p>
      </div>

      {/* Authentication & Password Security */}
      {authProvider === "google" ? (
        <div className="border border-brand-gold/30 bg-zinc-950/80 p-6 md:p-8 rounded-lg space-y-4 w-full relative overflow-hidden">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-5 h-5 text-brand-gold" />
            </div>
            <div>
              <h3 className="font-serif text-sm uppercase tracking-wider text-white font-bold">
                Google Single Sign-On Security
              </h3>
              <p className="text-[11px] text-zinc-400">
                Your private suite account is authenticated via Google OAuth 2.0.
              </p>
            </div>
          </div>
          <div className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-4 rounded border border-zinc-800 space-y-2">
            <p>
              Your login credentials, biometric passkeys, two-step verification, and password policies are safeguarded directly by Google Security Infrastructure.
            </p>
            <p className="text-zinc-500 text-[11px]">
              To update your authentication methods or security key, please visit your{" "}
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noopener noreferrer"
                className="text-brand-gold underline hover:text-white"
              >
                Google Security Dashboard &rarr;
              </a>
            </p>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="border border-zinc-900 bg-zinc-950/60 p-6 md:p-8 rounded-lg space-y-5 w-full"
        >
          <h3 className="font-serif text-sm uppercase tracking-wider text-white border-b border-zinc-900 pb-3 flex items-center space-x-2">
            <Lock className="w-4 h-4 text-brand-gold" />
            <span>Update Account Password</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPw ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={passwordForm.currentPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      currentPassword: e.target.value,
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-white rounded outline-none focus:border-brand-gold/50 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showCurrentPw ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showNewPw ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={passwordForm.newPassword}
                  onChange={(e) =>
                    setPasswordForm({
                      ...passwordForm,
                      newPassword: e.target.value,
                    })
                  }
                  className="w-full bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-white rounded outline-none focus:border-brand-gold/50 pr-8"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  {showNewPw ? (
                    <EyeOff className="w-3.5 h-3.5" />
                  ) : (
                    <Eye className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[9.5px] uppercase tracking-widest text-zinc-400 font-semibold">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={passwordForm.confirmPassword}
                onChange={(e) =>
                  setPasswordForm({
                    ...passwordForm,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full bg-zinc-900 border border-zinc-800 px-3.5 py-2.5 text-xs text-white rounded outline-none focus:border-brand-gold/50"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-900 flex justify-end">
            <button
              type="submit"
              className="bg-brand-gold hover:bg-brand-goldHover text-brand-black px-6 py-2.5 text-xs font-bold tracking-widest rounded uppercase transition-colors"
            >
              Change Password
            </button>
          </div>
        </form>
      )}

      {/* Two-Factor Authentication */}
      <div className="border border-zinc-900 bg-zinc-950/60 p-6 md:p-8 rounded-lg flex flex-col sm:flex-row items-center justify-between gap-6 w-full">
        <div className="space-y-1.5">
          <h3 className="text-sm font-serif uppercase tracking-wider text-white font-semibold">
            Two-Factor Authentication (2FA)
          </h3>
          <p className="text-[10px] text-zinc-400 font-light leading-relaxed max-w-lg">
            Require a biometric or SMS one-time verification token when signing into the private client suite.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setTwoFactorEnabled(!twoFactorEnabled);
            showToast(
              twoFactorEnabled
                ? "TWO-FACTOR AUTHENTICATION DISABLED"
                : "TWO-FACTOR AUTHENTICATION ACTIVATED"
            );
          }}
          className={`flex-shrink-0 px-5 py-2.5 text-[9.5px] font-bold tracking-widest rounded border transition-colors uppercase ${
            twoFactorEnabled
              ? "bg-emerald-950/30 border-emerald-800 text-emerald-400"
              : "bg-zinc-900 border-zinc-800 text-white hover:border-brand-gold"
          }`}
        >
          {twoFactorEnabled ? "Activated (Disable)" : "Activate (Enable)"}
        </button>
      </div>

      {/* Active Sessions */}
      <div className="border border-zinc-900 bg-zinc-950/40 p-6 rounded-lg space-y-4 w-full">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <h3 className="font-serif text-sm uppercase tracking-wider text-white">
            Active Login Sessions
          </h3>
          <button
            onClick={() => showToast("SIGNED OUT OF ALL OTHER SESSIONS")}
            className="text-[9px] tracking-widest text-red-400 hover:text-white uppercase font-bold"
          >
            Sign Out Others
          </button>
        </div>
        <div className="text-xs text-zinc-400 flex justify-between items-center">
          <div>
            <p className="font-semibold text-white">
              Current Browser Session &middot; Windows Desktop
            </p>
            <p className="text-[10px] text-zinc-500">
              Chrome &middot; Active Now
            </p>
          </div>
          <span className="text-[9px] text-emerald-400 font-mono font-bold uppercase">
            Active
          </span>
        </div>
      </div>
    </div>
  );
};


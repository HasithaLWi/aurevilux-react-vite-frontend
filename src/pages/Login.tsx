import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Lock,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";
import { AuthService } from "../services/auth.service";
import { api } from "../services/api";
import { GoogleLogin } from "@react-oauth/google";

interface LoginProps {
  initialTab?: "signin" | "register";
}

export default function Login({ initialTab }: LoginProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<"signin" | "register">(
    initialTab ||
    (location.pathname.includes("register") ? "register" : "signin"),
  );
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isBackendOffline, setIsBackendOffline] = useState(false);
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");

  // Check backend server health on mount
  useEffect(() => {
    api
      .get("/health")
      .then(() => setIsBackendOffline(false))
      .catch(() => setIsBackendOffline(true));
  }, []);

  // Sign In inputs
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");

  // Register inputs
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");

  // Staff Invite parameters
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [inviteDetails, setInviteDetails] = useState<{
    email: string;
    role: string;
    invitedBy: string;
  } | null>(null);
  const [inviteName, setInviteName] = useState("");
  const [inviteUsername, setInviteUsername] = useState("");
  const [invitePassword, setInvitePassword] = useState("");
  const [inviteConfirmPassword, setInviteConfirmPassword] = useState("");

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMessage, setForgotMessage] = useState("");
  const [isForgotLoading, setIsForgotLoading] = useState(false);

  // Check query params for employee invite link
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get("inviteToken");
    if (token) {
      setInviteToken(token);
      AuthService.verifyInvite(token)
        .then((data) => {
          setInviteDetails(data);
          setInviteUsername(data.email.split("@")[0]);
        })
        .catch((err) => {
          setAuthError(
            err.response?.data?.message ||
            "This staff invitation link is invalid or has expired.",
          );
        });
    }
  }, [location.search]);

  // Handle standard Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setIsLoading(true);

    try {
      const result = await AuthService.login({
        username: usernameOrEmail.trim(),
        password,
      });

      const roles = result.roles || [];
      const isStaffOrAdmin = roles.some((r: string) =>
        ["SUPERADMIN", "SUPER_ADMIN", "ADMIN", "STAFF"].includes(r),
      );

      setAuthSuccess(`Welcome back, ${result.username}! Clearance verified.`);
      setTimeout(() => {
        if (isStaffOrAdmin) {
          navigate("/admin");
        } else {
          navigate("/account");
        }
      }, 900);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Cannot connect to Aurevilux server."
          : "Invalid credentials provided. Please check your username and password.");
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle standard Register (Default: CUSTOMER role)
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    setIsLoading(true);

    try {
      await AuthService.register({
        name: regName.trim(),
        email: regEmail.trim(),
        username: regUsername.trim() || regEmail.split("@")[0],
        password: regPassword,
      });

      // Auto login after registration
      const result = await AuthService.login({
        username: regUsername.trim() || regEmail.split("@")[0],
        password: regPassword,
      });

      setAuthSuccess(
        `Atelier membership created for ${result.name || result.username}! Entering...`,
      );
      setTimeout(() => {
        navigate("/account");
      }, 1000);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Cannot connect to Aurevilux server."
          : "Registration failed. Please verify your details.");
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Staff Invite Link Registration (Assigns ADMIN or STAFF)
  const handleInviteRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");

    if (invitePassword !== inviteConfirmPassword) {
      setAuthError("Passwords do not match. Please re-enter.");
      return;
    }
    if (!inviteToken) return;

    setIsLoading(true);
    try {
      const result = await AuthService.registerWithInvite({
        token: inviteToken,
        name: inviteName.trim(),
        username: inviteUsername.trim(),
        password: invitePassword,
      });

      setAuthSuccess(
        result.message || "Registration successful. Your account is pending administrator approval.",
      );
      // Do NOT redirect to admin — account needs approval first
      setTimeout(() => {
        navigate("/login");
      }, 3000);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        "Failed to activate staff invitation credentials.";
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Official Google Identity Services Success Handler (Real Google ID Token)
  const handleGoogleSuccess = async (credentialResponse: any) => {
    if (!credentialResponse?.credential) {
      setAuthError(
        "Failed to obtain verified authentication token from Google.",
      );
      return;
    }

    setAuthError("");
    setAuthSuccess("");
    setIsLoading(true);

    try {
      const result = await AuthService.googleAuth({
        credential: credentialResponse.credential,
      });

      const roles = result.roles || [];
      const isStaffOrAdmin = roles.some((r: string) =>
        ["SUPERADMIN", "SUPER_ADMIN", "ADMIN", "STAFF"].includes(r),
      );

      setAuthSuccess(
        `Signed in with Google as ${result.email}! Access granted.`,
      );
      setTimeout(() => {
        if (isStaffOrAdmin) {
          navigate("/admin");
        } else {
          navigate("/account");
        }
      }, 900);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK"
          ? "Cannot reach authentication"
          : "Google authentication failed. Please verify your account.");
      setAuthError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  // Forgot Password Submit
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setIsForgotLoading(true);
    setForgotMessage("");
    try {
      const res = await AuthService.forgotPassword(forgotEmail.trim());
      setForgotMessage(
        res.message ||
        "Recovery transmission dispatched to your email via SMTP.",
      );
    } catch (err: any) {
      setForgotMessage(
        err.response?.data?.message ||
        "If the email is registered, instructions have been sent.",
      );
    } finally {
      setIsForgotLoading(false);
    }
  };

  return (
    <div className="bg-brand-black min-h-[90vh] pt-32 pb-20 px-6 md:px-12 flex items-center justify-center relative overflow-hidden text-left">
      {/* Background glow effects */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] bg-brand-burgundy/15 blur-[100px] pointer-events-none rounded-full" />
      <div className="absolute right-[10%] bottom-[10%] w-[250px] h-[250px] bg-brand-gold/5 blur-[80px] pointer-events-none rounded-full" />

      <div className="max-w-md w-full relative z-10 bg-[#0e0e12] border border-zinc-900 rounded-xl p-8 shadow-2xl space-y-6">
        {/* Atelier Brand Identity */}
        <div className="text-center space-y-1.5 border-b border-zinc-900 pb-5">
          <span className="text-[10px] tracking-[0.35em] text-brand-gold font-bold uppercase block">
            A U R E V I L U X
          </span>
          <h2 className="font-serif text-2xl text-white uppercase tracking-wider font-bold">
            {inviteToken ? "Staff Activation" : "Client & Atelier Portal"}
          </h2>
          <p className="text-[11px] text-zinc-500 font-light">
            {inviteToken
              ? "Privileged personnel credentials setup"
              : "Private access to haute couture acquisitions and atelier management"}
          </p>
        </div>

        {/* FEEDBACK ALERTS */}
        {isBackendOffline && (
          <div className="p-3.5 bg-[#1a1215] border border-red-800/80 text-red-200 text-xs rounded-lg flex items-start gap-2.5 shadow-lg">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-semibold uppercase tracking-wider text-red-300 block">
                Server is Offline
              </span>
              <p className="text-[11px] text-zinc-400 font-light leading-relaxed">
                Please try again later or contact the support team.
              </p>
            </div>
          </div>
        )}

        {authError && (
          <div className="p-3 bg-red-950/40 border border-red-900 text-red-300 text-xs rounded flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {authSuccess && (
          <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{authSuccess}</span>
          </div>
        )}

        {/* CASE 1: STAFF INVITE ACTIVATION */}
        {inviteToken && inviteDetails ? (
          <form onSubmit={handleInviteRegister} className="space-y-4">
            <div className="p-3.5 bg-brand-burgundy/10 border border-brand-burgundy/30 rounded text-xs space-y-1">
              <span className="text-[10px] font-mono uppercase text-brand-gold font-bold block">
                INVITATION VERIFIED
              </span>
              <p className="text-zinc-300">
                Email:{" "}
                <strong className="text-white">{inviteDetails.email}</strong>
              </p>
              <p className="text-zinc-300">
                Granted Atelier Role:{" "}
                <span className="text-brand-gold font-mono font-bold uppercase">
                  {inviteDetails.role}
                </span>
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Marc Jacobs"
                value={inviteName}
                onChange={(e) => setInviteName(e.target.value)}
                className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold px-3 py-2.5 rounded text-white text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                Choose Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={invitePassword}
                onChange={(e) => setInvitePassword(e.target.value)}
                className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold px-3 py-2.5 rounded text-white text-xs outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                Confirm Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={inviteConfirmPassword}
                onChange={(e) => setInviteConfirmPassword(e.target.value)}
                className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold px-3 py-2.5 rounded text-white text-xs outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-3 rounded text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Activate Atelier Credentials</span>
            </button>
          </form>
        ) : (
          /* CASE 2: STANDARD SIGN IN & REGISTER */
          <div className="space-y-5">
            {/* Mode Switcher Tabs */}
            <div className="flex border-b border-zinc-900">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("signin");
                  setAuthError("");
                }}
                className={`flex-1 pb-3 text-xs tracking-widest uppercase font-bold text-center transition-colors ${activeTab === "signin"
                    ? "text-brand-gold border-b-2 border-brand-gold"
                    : "text-zinc-500 hover:text-zinc-300"
                  }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("register");
                  setAuthError("");
                }}
                className={`flex-1 pb-3 text-xs tracking-widest uppercase font-bold text-center transition-colors ${activeTab === "register"
                    ? "text-brand-gold border-b-2 border-brand-gold"
                    : "text-zinc-500 hover:text-zinc-300"
                  }`}
              >
                Create Account
              </button>
            </div>

            {/* Official Google OAuth2 GIS Button (Real popup, verified ID token) */}
            <div className="w-full flex justify-center py-0.5">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setAuthError(
                    "Google authentication failed or was cancelled.",
                  );
                }}
                theme="filled_black"
                shape="rectangular"
                size="large"
                width="380"
                text="continue_with"
              />
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-zinc-900 w-full" />
              <span className="bg-[#0e0e12] px-3 text-[10px] text-zinc-500 uppercase tracking-widest font-mono">
                or
              </span>
              <div className="border-t border-zinc-900 w-full" />
            </div>

            {/* TAB: SIGN IN FORM */}
            {activeTab === "signin" ? (
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                    Username or Email
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. sophia"
                      value={usernameOrEmail}
                      onChange={(e) => setUsernameOrEmail(e.target.value)}
                      className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold text-xs pl-9 pr-3 py-2.5 rounded text-white outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowForgotModal(true)}
                      className="text-[10px] text-brand-gold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-zinc-600 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold text-xs pl-9 pr-9 py-2.5 rounded text-white outline-none font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-3 rounded text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-3 shadow-lg shadow-brand-burgundy/15"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Sign In to Atelier</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            ) : (
              /* TAB: REGISTER FORM */
              <form onSubmit={handleRegister} className="space-y-3.5">
                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Sophia Montgomery"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold text-xs px-3 py-2.5 rounded text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="sophia@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold text-xs px-3 py-2.5 rounded text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                    Username (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="sophia_m"
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold text-xs px-3 py-2.5 rounded text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold block">
                    Password *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Minimum 6 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold text-xs px-3 py-2.5 rounded text-white outline-none font-mono"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-3 rounded text-xs font-bold tracking-widest uppercase flex items-center justify-center gap-2 transition-colors disabled:opacity-50 mt-3 shadow-lg shadow-brand-burgundy/15"
                >
                  {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Join Atelier Membership</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
          <div className="bg-[#101014] border border-zinc-800 rounded-lg max-w-sm w-full p-6 space-y-4 text-left">
            <div className="flex justify-between items-center border-b border-zinc-800 pb-3">
              <h3 className="font-serif text-sm text-white uppercase tracking-wider font-bold">
                Password Recovery
              </h3>
              <button
                onClick={() => setShowForgotModal(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {forgotMessage && (
              <div className="p-3 bg-zinc-900 border border-zinc-800 text-brand-gold text-xs rounded">
                {forgotMessage}
              </div>
            )}

            <form onSubmit={handleForgotSubmit} className="space-y-3">
              <p className="text-xs text-zinc-400 font-light">
                Enter your registered atelier email to receive password recovery
                instructions via SMTP.
              </p>
              <input
                type="email"
                required
                placeholder="your.email@example.com"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                className="w-full bg-brand-black border border-zinc-800 text-xs px-3 py-2 rounded text-white outline-none focus:border-brand-gold"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotModal(false)}
                  className="px-3 py-1.5 border border-zinc-800 text-zinc-400 text-xs uppercase rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isForgotLoading}
                  className="px-4 py-1.5 bg-brand-burgundy hover:bg-brand-burgundyHover text-white text-xs font-bold uppercase rounded flex items-center gap-1.5"
                >
                  {isForgotLoading && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  )}
                  <span>Send Recovery</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

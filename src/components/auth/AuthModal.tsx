import React, { useState } from "react";
import { X, Lock, User, Mail, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import { AuthService } from "../../services/auth.service";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      const data = await AuthService.login({ username: username.trim(), password });
      setSuccessMessage(`Welcome back, ${data.username}! Sign in successful.`);
      setTimeout(() => {
        onSuccess?.();
        onClose();
      }, 1000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to connect to backend server.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsLoading(true);

    try {
      await AuthService.register({
        name: name.trim(),
        email: email.trim(),
        username: username.trim(),
        password,
      });
      setSuccessMessage("Account created successfully! Switching to sign in...");
      setTimeout(() => {
        setMode("login");
        setSuccessMessage("");
      }, 1500);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Registration failed.";
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity"
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md bg-brand-dark border border-zinc-800 rounded-xl p-8 shadow-2xl animate-scale-in">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-zinc-400 hover:text-white transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Brand Heading */}
          <div className="text-center space-y-2 mb-8">
            <span className="font-serif text-2xl tracking-[0.25em] text-white">
              AUREVILUX
            </span>
            <p className="text-[10px] text-brand-gold tracking-[0.2em] uppercase font-semibold">
              ATELIER ACCESS &bull; PRIVATE CLIENT PORTAL
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex border-b border-zinc-800 mb-6">
            <button
              onClick={() => {
                setMode("login");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 pb-3 text-xs tracking-[0.2em] font-semibold transition-colors ${
                mode === "login"
                  ? "text-brand-gold border-b-2 border-brand-gold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              SIGN IN
            </button>
            <button
              onClick={() => {
                setMode("register");
                setErrorMessage("");
                setSuccessMessage("");
              }}
              className={`flex-1 pb-3 text-xs tracking-[0.2em] font-semibold transition-colors ${
                mode === "register"
                  ? "text-brand-gold border-b-2 border-brand-gold"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              JOIN MEMBERSHIP
            </button>
          </div>

          {/* Feedback Alerts */}
          {errorMessage && (
            <div className="mb-6 p-3 bg-red-950/40 border border-red-800/60 rounded text-red-300 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="mb-6 p-3 bg-emerald-950/40 border border-emerald-800/60 rounded text-emerald-300 text-xs flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-400" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Forms */}
          {mode === "login" ? (
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-widest text-zinc-400 font-semibold uppercase">
                  USERNAME
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold text-white text-xs pl-10 pr-4 py-3 rounded outline-none tracking-wider placeholder-zinc-600 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] tracking-widest text-zinc-400 font-semibold uppercase">
                  PASSWORD
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold text-white text-xs pl-10 pr-10 py-3 rounded outline-none tracking-wider placeholder-zinc-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-3.5 rounded text-xs font-bold tracking-[0.2em] transition-all shadow-lg shadow-brand-burgundy/20 uppercase mt-4 disabled:opacity-50"
              >
                {isLoading ? "AUTHENTICATING..." : "SIGN IN"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] tracking-widest text-zinc-400 font-semibold uppercase">
                  FULL NAME
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Sophia Montgomery"
                    className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold text-white text-xs pl-10 pr-4 py-2.5 rounded outline-none tracking-wider placeholder-zinc-600 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] tracking-widest text-zinc-400 font-semibold uppercase">
                  EMAIL ADDRESS
                </label>
                <div className="relative flex items-center">
                  <Mail className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="sophia@example.com"
                    className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold text-white text-xs pl-10 pr-4 py-2.5 rounded outline-none tracking-wider placeholder-zinc-600 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] tracking-widest text-zinc-400 font-semibold uppercase">
                  CHOOSE USERNAME
                </label>
                <div className="relative flex items-center">
                  <User className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="sophia_m"
                    className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold text-white text-xs pl-10 pr-4 py-2.5 rounded outline-none tracking-wider placeholder-zinc-600 transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] tracking-widest text-zinc-400 font-semibold uppercase">
                  PASSWORD
                </label>
                <div className="relative flex items-center">
                  <Lock className="w-4 h-4 text-zinc-500 absolute left-3 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a strong password"
                    className="w-full bg-brand-black border border-zinc-800 focus:border-brand-gold text-white text-xs pl-10 pr-10 py-2.5 rounded outline-none tracking-wider placeholder-zinc-600 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 text-zinc-500 hover:text-zinc-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-burgundy hover:bg-brand-burgundyHover text-white py-3.5 rounded text-xs font-bold tracking-[0.2em] transition-all shadow-lg shadow-brand-burgundy/20 uppercase mt-2 disabled:opacity-50"
              >
                {isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
              </button>
            </form>
          )}

          {/* Test Hint */}
          <div className="mt-6 pt-4 border-t border-zinc-900 text-center">
            <p className="text-[9px] text-zinc-600 tracking-wider">
              CONNECTS TO BACKEND AT <code className="text-brand-gold">http://localhost:5000/api/v1</code>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;

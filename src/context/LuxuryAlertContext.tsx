import React, { createContext, useContext, useState, useCallback, useRef } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────
export type AlertType = "success" | "error" | "warning" | "info";

export interface LuxuryAlertItem {
  id: string;
  type: AlertType;
  title?: string;
  message: string;
  duration?: number;
}

export interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

interface LuxuryAlertContextType {
  alerts: LuxuryAlertItem[];
  showAlert: (type: AlertType, message: string, title?: string, duration?: number) => void;
  dismissAlert: (id: string) => void;
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const LuxuryAlertContext = createContext<LuxuryAlertContextType | undefined>(undefined);

// ─── Toast Component ──────────────────────────────────────────────────────────
const alertIcons: Record<AlertType, string> = {
  success: "✓",
  error: "✕",
  warning: "⚠",
  info: "ℹ",
};

const alertColors: Record<AlertType, { border: string; icon: string; bg: string }> = {
  success: { border: "border-emerald-500/40", icon: "text-emerald-400", bg: "bg-emerald-500/10" },
  error: { border: "border-red-500/40", icon: "text-red-400", bg: "bg-red-500/10" },
  warning: { border: "border-amber-500/40", icon: "text-amber-400", bg: "bg-amber-500/10" },
  info: { border: "border-brand-gold/40", icon: "text-brand-gold", bg: "bg-brand-gold/10" },
};

const LuxuryToast: React.FC<{ alert: LuxuryAlertItem; onDismiss: (id: string) => void }> = ({
  alert,
  onDismiss,
}) => {
  const colors = alertColors[alert.type];

  return (
    <div
      className={`flex items-start gap-3 px-5 py-4 rounded-lg border ${colors.border} ${colors.bg} backdrop-blur-xl shadow-2xl shadow-black/40 animate-slide-in-right min-w-[320px] max-w-[440px]`}
      role="alert"
    >
      <span className={`text-lg mt-0.5 ${colors.icon} flex-shrink-0`}>
        {alertIcons[alert.type]}
      </span>
      <div className="flex-1 min-w-0">
        {alert.title && (
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-white/90 mb-0.5">
            {alert.title}
          </p>
        )}
        <p className="text-xs text-zinc-300 leading-relaxed">{alert.message}</p>
      </div>
      <button
        onClick={() => onDismiss(alert.id)}
        className="text-zinc-500 hover:text-white text-xs flex-shrink-0 mt-0.5 transition-colors"
      >
        ✕
      </button>
    </div>
  );
};

// ─── Confirm Dialog Component ─────────────────────────────────────────────────
const variantStyles: Record<string, { button: string; icon: string }> = {
  danger: { button: "bg-red-600 hover:bg-red-700", icon: "text-red-400" },
  warning: { button: "bg-amber-600 hover:bg-amber-700", icon: "text-amber-400" },
  info: { button: "bg-brand-burgundy hover:bg-brand-burgundy/80", icon: "text-brand-gold" },
};

const LuxuryConfirmDialog: React.FC<{
  options: ConfirmOptions;
  onResolve: (result: boolean) => void;
}> = ({ options, onResolve }) => {
  const variant = options.variant || "info";
  const styles = variantStyles[variant];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onResolve(false)}
      />
      {/* Dialog */}
      <div className="relative bg-[#0e0e12] border border-zinc-800 rounded-xl p-8 max-w-md w-full shadow-2xl shadow-black/60 animate-scale-in">
        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0 ${styles.icon}`}
          >
            <span className="text-xl">
              {variant === "danger" ? "⚠" : variant === "warning" ? "⚠" : "ℹ"}
            </span>
          </div>
          <div className="flex-1">
            {options.title && (
              <h3 className="font-serif text-base tracking-widest text-white uppercase mb-1.5">
                {options.title}
              </h3>
            )}
            <p className="text-sm text-zinc-400 leading-relaxed">{options.message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={() => onResolve(false)}
            className="px-5 py-2.5 border border-zinc-800 hover:border-zinc-600 text-zinc-400 hover:text-white rounded-lg text-xs tracking-widest uppercase font-semibold transition-colors"
          >
            {options.cancelText || "Cancel"}
          </button>
          <button
            onClick={() => onResolve(true)}
            className={`px-5 py-2.5 ${styles.button} text-white rounded-lg text-xs tracking-widest uppercase font-semibold transition-colors`}
          >
            {options.confirmText || "Confirm"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── Provider ─────────────────────────────────────────────────────────────────
export const LuxuryAlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alerts, setAlerts] = useState<LuxuryAlertItem[]>([]);
  const [confirmState, setConfirmState] = useState<{
    options: ConfirmOptions;
    resolve: (result: boolean) => void;
  } | null>(null);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.filter((a) => a.id !== id));
    const t = timeoutsRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timeoutsRef.current.delete(id);
    }
  }, []);

  const showAlert = useCallback(
    (type: AlertType, message: string, title?: string, duration = 5000) => {
      const id = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const newAlert: LuxuryAlertItem = { id, type, message, title, duration };
      setAlerts((prev) => [...prev.slice(-4), newAlert]); // Max 5 visible

      if (duration > 0) {
        const timeout = setTimeout(() => dismissAlert(id), duration);
        timeoutsRef.current.set(id, timeout);
      }
    },
    [dismissAlert]
  );

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        options,
        resolve: (result) => {
          setConfirmState(null);
          resolve(result);
        },
      });
    });
  }, []);

  return (
    <LuxuryAlertContext.Provider value={{ alerts, showAlert, dismissAlert, confirm }}>
      {children}
      {/* Toast Container — top right */}
      {alerts.length > 0 && (
        <div className="fixed top-4 right-4 z-[9998] space-y-3">
          {alerts.map((alert) => (
            <LuxuryToast key={alert.id} alert={alert} onDismiss={dismissAlert} />
          ))}
        </div>
      )}
      {/* Confirm Dialog */}
      {confirmState && (
        <LuxuryConfirmDialog options={confirmState.options} onResolve={confirmState.resolve} />
      )}
    </LuxuryAlertContext.Provider>
  );
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useLuxuryAlert = () => {
  const context = useContext(LuxuryAlertContext);
  if (!context) {
    throw new Error("useLuxuryAlert must be used within a LuxuryAlertProvider");
  }
  return context;
};

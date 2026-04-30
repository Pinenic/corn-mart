"use client";
// components/ui/Toast.jsx
// Fixed notification stack rendered at the bottom-right of the viewport.
// Driven entirely by toastStore — nothing needs to be passed as props.
// Mount this once inside Providers.jsx and it works everywhere.

import { useEffect, useState } from "react";
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import useToastStore from "@/lib/store/toastStore";

const ICONS = {
  success: CheckCircle,
  error:   AlertCircle,
  warning: AlertTriangle,
  info:    Info,
};

const STYLES = {
  success: {
    border:      "var(--color-success)",
    iconBg:      "var(--color-success-bg)",
    iconColor:   "var(--color-success)",
    titleColor:  "var(--color-success)",
  },
  error: {
    border:      "var(--color-danger)",
    iconBg:      "var(--color-danger-bg)",
    iconColor:   "var(--color-danger)",
    titleColor:  "var(--color-danger)",
  },
  warning: {
    border:      "var(--color-warning)",
    iconBg:      "var(--color-warning-bg)",
    iconColor:   "var(--color-warning)",
    titleColor:  "var(--color-warning)",
  },
  info: {
    border:      "var(--color-accent)",
    iconBg:      "var(--color-accent-subtle)",
    iconColor:   "var(--color-accent)",
    titleColor:  "var(--color-accent-text)",
  },
};

function ToastItem({ toast, onDismiss }) {
  const [visible, setVisible]   = useState(false);
  const [leaving, setLeaving]   = useState(false);

  const Icon  = ICONS[toast.type]  ?? Info;
  const style = STYLES[toast.type] ?? STYLES.info;

  // Animate in on mount
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setLeaving(true);
    setTimeout(() => onDismiss(toast.id), 250);
  };

  return (
    <div
      role="alert"
      aria-live="polite"
      style={{
        transform:  visible && !leaving ? "translateX(0) scale(1)" : "translateX(110%) scale(0.95)",
        opacity:    visible && !leaving ? 1 : 0,
        transition: "transform 0.25s cubic-bezier(0.16,1,0.3,1), opacity 0.25s ease",
        willChange: "transform, opacity",
      }}
    >
      <div
        className="flex items-start gap-3 bg-white rounded-xl shadow-lg border-l-[3px] px-4 py-3 min-w-[280px] max-w-[360px]"
        style={{
          borderLeftColor: style.border,
          boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
          border: `0.5px solid var(--color-border)`,
          borderLeft: `3px solid ${style.border}`,
        }}
      >
        {/* Icon */}
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: style.iconBg }}
        >
          <Icon size={14} style={{ color: style.iconColor }} />
        </div>

        {/* Message */}
        <p
          className="flex-1 text-[13px] font-medium leading-snug pt-0.5"
          style={{ color: "var(--color-text-primary)" }}
        >
          {toast.message}
        </p>

        {/* Dismiss */}
        <button
          onClick={dismiss}
          className="flex-shrink-0 w-5 h-5 flex items-center justify-center rounded-md transition-colors mt-0.5 hover:bg-[var(--color-bg)]"
          style={{ color: "var(--color-text-tertiary)" }}
          aria-label="Dismiss notification"
        >
          <X size={12} />
        </button>
      </div>

      {/* Progress bar showing time remaining */}
      {toast.duration && (
        <div
          className="mx-4 h-0.5 rounded-full mt-1 overflow-hidden"
          style={{ background: "var(--color-border)" }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background:     style.border,
              width:          "100%",
              transformOrigin:"left",
              animation:      `toast-progress ${toast.duration}ms linear forwards`,
            }}
          />
        </div>
      )}
    </div>
  );
}

export function ToastContainer() {
  const { toasts, dismiss } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <>
      <style>{`
        @keyframes toast-progress {
          from { transform: scaleX(1); }
          to   { transform: scaleX(0); }
        }
      `}</style>

      {/* Fixed stack — bottom-right on desktop, bottom-center on mobile */}
      <div
        className="fixed z-[9999] flex flex-col gap-2 bottom-4 right-4 md:bottom-6 md:right-6 left-4 md:left-auto"
        aria-label="Notifications"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
        ))}
      </div>
    </>
  );
}

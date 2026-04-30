"use client";
// components/auth/AuthPrimitives.jsx
// Reusable building blocks for all auth forms.

import { useState } from "react";
import { Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

// ── AuthCard ─────────────────────────────────────────────────
export function AuthCard({ children, className }) {
  return (
    <div className={cn("w-full space-y-6", className)}>
      {children}
    </div>
  );
}

// ── AuthHeading ──────────────────────────────────────────────
export function AuthHeading({ title, subtitle }) {
  return (
    <div className="space-y-1.5 mb-2">
      <h1 className="text-[26px] font-bold tracking-tight"
        style={{ color: "var(--color-text-primary)" }}>
        {title}
      </h1>
      {subtitle && (
        <p className="text-[14px]" style={{ color: "var(--color-text-secondary)" }}>
          {subtitle}
        </p>
      )}
    </div>
  );
}

// ── FormField ────────────────────────────────────────────────
export function FormField({ label, error, hint, children }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-[12px] font-semibold"
          style={{ color: "var(--color-text-secondary)" }}>
          {label}
        </label>
      )}
      {children}
      {error && (
        <div className="flex items-center gap-1.5 text-[11px]"
          style={{ color: "var(--color-danger)" }}>
          <AlertCircle size={11} />
          <span>{error}</span>
        </div>
      )}
      {hint && !error && (
        <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>{hint}</p>
      )}
    </div>
  );
}

// ── TextInput ────────────────────────────────────────────────
export function TextInput({ error, className, ...props }) {
  return (
    <input
      className={cn(
        "w-full h-11 px-3.5 rounded-xl border text-[13px] outline-none transition-all",
        "placeholder:text-[var(--color-text-muted)]",
        "focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10",
        error && "border-[var(--color-danger)] bg-[var(--color-danger-bg)]",
        className
      )}
      style={{
        borderColor: error ? undefined : "var(--color-border-md)",
        color: "var(--color-text-primary)",
        background: error ? undefined : "white",
      }}
      {...props}
    />
  );
}

// ── PasswordInput ────────────────────────────────────────────
export function PasswordInput({ error, className, ...props }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className={cn(
          "w-full h-11 pl-3.5 pr-11 rounded-xl border text-[13px] outline-none transition-all",
          "placeholder:text-[var(--color-text-muted)]",
          "focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10",
          error && "border-[var(--color-danger)] bg-[var(--color-danger-bg)]",
          className
        )}
        style={{
          borderColor: error ? undefined : "var(--color-border-md)",
          color: "var(--color-text-primary)",
          background: error ? undefined : "white",
        }}
        {...props}
      />
      <button
        type="button"
        onClick={() => setShow(v => !v)}
        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg)] transition-colors"
        style={{ color: "var(--color-text-muted)" }}
      >
        {show ? <EyeOff size={14} /> : <Eye size={14} />}
      </button>
    </div>
  );
}

// ── PasswordStrength ─────────────────────────────────────────
function getStrength(pw) {
  if (!pw) return { score: 0, label: "" };
  let score = 0;
  if (pw.length >= 8)              score++;
  if (/[A-Z]/.test(pw))           score++;
  if (/[0-9]/.test(pw))           score++;
  if (/[^A-Za-z0-9]/.test(pw))   score++;
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  const colors = ["", "var(--color-danger)", "var(--color-warning)", "#2563eb", "var(--color-success)"];
  return { score, label: labels[score], color: colors[score] };
}

export function PasswordStrength({ password }) {
  const { score, label, color } = getStrength(password);
  if (!password) return null;
  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="flex-1 h-1 rounded-full transition-all duration-300"
            style={{ background: i <= score ? color : "var(--color-border-md)" }} />
        ))}
      </div>
      <p className="text-[11px] font-semibold" style={{ color: color || "var(--color-text-muted)" }}>
        {label}
      </p>
    </div>
  );
}

// ── SubmitButton ─────────────────────────────────────────────
export function SubmitButton({ children, loading, disabled, className }) {
  return (
    <button
      type="submit"
      disabled={loading || disabled}
      className={cn(
        "w-full h-11 rounded-xl text-[14px] font-bold text-white transition-all",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "hover:opacity-90 active:scale-[0.98]",
        "flex items-center justify-center gap-2",
        className
      )}
      style={{ background: "var(--color-accent)" }}
    >
      {loading && <Loader2 size={15} className="animate-spin" />}
      {children}
    </button>
  );
}

// ── Divider ──────────────────────────────────────────────────
export function Divider({ label = "or" }) {
  return (
    <div className="relative flex items-center gap-3">
      <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
      <span className="text-[11px] font-medium px-1" style={{ color: "var(--color-text-muted)" }}>{label}</span>
      <div className="flex-1 h-px" style={{ background: "var(--color-border)" }} />
    </div>
  );
}

// ── AlertBanner ──────────────────────────────────────────────
export function AlertBanner({ type = "error", message, onClose }) {
  if (!message) return null;
  const isError   = type === "error";
  const isSuccess = type === "success";
  return (
    <div className={cn(
      "flex items-start gap-3 p-3.5 rounded-xl border text-[13px]"
    )} style={{
      background:   isError ? "var(--color-danger-bg)"  : isSuccess ? "var(--color-success-bg)" : "var(--color-info-bg)",
      borderColor:  isError ? "var(--color-danger)"     : isSuccess ? "var(--color-success)"    : "var(--color-info)",
      color:        isError ? "var(--color-danger)"     : isSuccess ? "var(--color-success)"    : "var(--color-info)",
    }}>
      {isSuccess
        ? <CheckCircle2 size={15} className="flex-shrink-0 mt-0.5" />
        : <AlertCircle  size={15} className="flex-shrink-0 mt-0.5" />
      }
      <p className="flex-1 text-[var(--color-text-primary)] text-[13px]">{message}</p>
    </div>
  );
}

// ── CheckboxField ────────────────────────────────────────────
export function CheckboxField({ id, label, error, ...props }) {
  return (
    <div className="space-y-1">
      <label htmlFor={id} className="flex items-start gap-2.5 cursor-pointer">
        <input
          id={id}
          type="checkbox"
          className="mt-0.5 w-4 h-4 rounded border-[var(--color-border-md)] accent-[var(--color-accent)] cursor-pointer flex-shrink-0"
          {...props}
        />
        <span className="text-[13px] leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
          {label}
        </span>
      </label>
      {error && (
        <p className="text-[11px] pl-6.5" style={{ color: "var(--color-danger)" }}>{error}</p>
      )}
    </div>
  );
}

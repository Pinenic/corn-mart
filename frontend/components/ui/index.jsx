"use client";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

// ─────────────────────────────────────────────
//  Shared UI primitives
// ─────────────────────────────────────────────

/** Status badge with semantic colour variants */
export function Badge({ variant = "default", children, className = "" }) {
  const styles = {
    default: {
      background: "var(--color-bg)",
      color: "var(--color-text-secondary)",
    },
    success: {
      background: "var(--color-success-bg)",
      color: "var(--color-success)",
    },
    warning: {
      background: "var(--color-warning-bg)",
      color: "var(--color-warning)",
    },
    danger: {
      background: "var(--color-danger-bg)",
      color: "var(--color-danger)",
    },
    info: {
      background: "var(--color-info-bg)",
      color: "var(--color-info)",
    },
  };

  return (
    <span
      className={`inline-flex items-center text-[11px] w-fit font-semibold px-4 py-0.5 rounded-lg ${className}`}
      style={styles[variant] ?? styles.default}
    >
      {children}
    </span>
  );
}

/** Surface card with optional padding */
export function Card({ children, className = "", noPadding = false }) {
  return (
    <div
      className={`bg-white rounded-xl border ${noPadding ? "" : "p-4 md:p-5"} ${className}`}
      style={{ borderColor: "var(--color-border)" }}
    >
      {children}
    </div>
  );
}

/** KPI metric card */
export function KpiCard({ label, value, change, changeType = "up", icon: Icon }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-2">
        <p
          className="text-[12px] font-medium uppercase tracking-wide"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          {label}
        </p>
        {Icon && (
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: "var(--color-accent-subtle)",
              color: "var(--color-accent)",
            }}
          >
            <Icon size={14} />
          </div>
        )}
      </div>
      <p
        className="text-[24px] font-semibold tracking-tight mt-1.5"
        style={{ color: "var(--color-text-primary)" }}
      >
        {value}
      </p>
      {change && (
        <p
          className="text-[11px] mt-1 font-medium"
          style={{
            color:
              changeType === "up"
                ? "var(--color-success)"
                : "var(--color-danger)",
          }}
        >
          {changeType === "up" ? "▲" : "▼"} {change}
        </p>
      )}
    </Card>
  );
}

/** Page header with optional action slot */
export function PageHeader({ title, description, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-5 md:mb-6">
      <div>
        <h2
          className="text-[18px] font-semibold tracking-tight"
          style={{ color: "var(--color-text-primary)" }}
        >
          {title}
        </h2>
        {description && (
          <p
            className="text-[13px] mt-0.5"
            style={{ color: "var(--color-text-secondary)" }}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
}

/** Section header with optional link */
export function SectionHeader({ title, linkLabel, onLinkClick }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h3
        className="text-[13.5px] font-semibold"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </h3>
      {linkLabel && (
        <button
          onClick={onLinkClick}
          className="text-[12px] font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--color-accent)" }}
        >
          {linkLabel}
        </button>
      )}
    </div>
  );
}

/** Primary button */
export function Button({
  children,
  variant = "primary",
  size = "md",
  onClick,
  className = "",
  type = "button",
  disabled = false,
  ...props
}) {
  const base =
    "inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizes = {
    sm: "text-[12px] px-3 h-8",
    md: "text-[13px] px-4 h-9",
    lg: "text-[14px] px-5 h-10",
  };

  const variants = {
    primary: {
      background: "var(--color-accent)",
      color: "#fff",
      border: "none",
    },
    secondary: {
      background: "var(--color-surface)",
      color: "var(--color-text-primary)",
      border: "0.5px solid var(--color-border-md)",
    },
    ghost: {
      background: "transparent",
      color: "var(--color-text-secondary)",
      border: "none",
    },
    danger: {
      background: "var(--color-danger-bg)",
      color: "var(--color-danger)",
      border: "0.5px solid var(--color-danger)",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size]} ${className}`}
      style={variants[variant] ?? variants.primary}
      {...props}
    >
      {children}
    </button>
  );
}

/** Input field */
export function Input({ className = "", ...props }) {
  return (
    <input
      className={`h-9 w-full rounded-lg border bg-white px-3 text-[13px] outline-none transition-colors duration-150 focus:border-[var(--color-accent)] ${className}`}
      style={{
        borderColor: "var(--color-border-md)",
        color: "var(--color-text-primary)",
      }}
      {...props}
    />
  );
}

/** Select dropdown */
export function Select({ children, className = "", ...props }) {
  return (
    <select
      className={`h-9 rounded-lg border bg-white px-3 text-[13px] outline-none transition-colors duration-150 appearance-none cursor-pointer ${className}`}
      style={{
        borderColor: "var(--color-border-md)",
        color: "var(--color-text-primary)",
      }}
      {...props}
    >
      {children}
    </select>
  );
}

/** Empty state placeholder */
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      {Icon && (
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{
            background: "var(--color-bg)",
            color: "var(--color-text-tertiary)",
          }}
        >
          <Icon size={22} />
        </div>
      )}
      <p
        className="text-[14px] font-medium"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </p>
      {description && (
        <p
          className="text-[13px] mt-1 max-w-xs"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Spinner({ size = 20, className }) {
  return <Loader2 size={size} className={cn("animate-spin text-[var(--color-primary)]", className)} />;
}

// export function EmptyState({ icon: Icon, title, description, action, className }) {
//   return (
//     <div className={cn("flex flex-col items-center justify-center py-20 text-center px-6", className)}>
//       {Icon && <div className="w-14 h-14 rounded-2xl bg-[var(--color-bg)] flex items-center justify-center mb-4 text-[var(--color-text-muted)]"><Icon size={26} /></div>}
//       <p className="text-[15px] font-semibold text-[var(--color-text-primary)] mb-1">{title}</p>
//       {description && <p className="text-[13px] text-[var(--color-text-secondary)] max-w-xs">{description}</p>}
//       {action && <div className="mt-5">{action}</div>}
//     </div>
//   );
// }


export function Skeleton({ className }) {
  return <div className={cn("animate-pulse rounded-xl bg-[var(--color-bg)]", className)} />;
}

// Status badge for orders
const ORDER_STATUS = {
  pending:    { label: "Pending",    variant: "warning" },
  confirmed:  { label: "Confirmed",  variant: "info"    },
  processing: { label: "Processing", variant: "info"    },
  shipped:    { label: "Shipped",    variant: "primary"  },
  delivered:  { label: "Delivered",  variant: "success" },
  cancelled:  { label: "Cancelled",  variant: "danger"  },
  refunded:   { label: "Refunded",   variant: "danger"  },
};
export function OrderStatusBadge({ status }) {
  const cfg = ORDER_STATUS[status?.toLowerCase()] ?? { label: status, variant: "default" };
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}
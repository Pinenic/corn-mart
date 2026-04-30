"use client";
// components/ui/QueryState.jsx
// Wraps any async data section with consistent loading / error / empty UI.
//
// Usage:
//   <QueryState isLoading={isLoading} error={error} isEmpty={!data?.length}>
//     <ActualContent />
//   </QueryState>
//
// Also exports Skeleton primitives so individual pages can build
// custom skeleton layouts that match their real content shape.

import { AlertCircle, RefreshCw, Inbox } from "lucide-react";
import { ApiError } from "@/lib/api/errors";

// ── Skeleton primitives ───────────────────────────────────────
export function SkeletonLine({ width = "100%", height = 14, className = "" }) {
  return (
    <div
      className={`rounded-md animate-pulse ${className}`}
      style={{
        width,
        height,
        background: "var(--color-bg)",
        minWidth: 40,
      }}
    />
  );
}

export function SkeletonCard({ rows = 3, className = "" }) {
  return (
    <div
      className={`bg-white rounded-xl border p-4 md:p-5 ${className}`}
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonLine
            key={i}
            width={i === 0 ? "60%" : i === rows - 1 ? "40%" : "100%"}
            height={i === 0 ? 18 : 13}
          />
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div
      className="bg-white rounded-xl border overflow-hidden"
      style={{ borderColor: "var(--color-border)" }}
    >
      {/* Header */}
      <div
        className="grid px-4 py-3 border-b gap-4"
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          borderColor: "var(--color-border)",
          background: "var(--color-bg)",
        }}
      >
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={i} height={11} width="60%" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
        {Array.from({ length: rows }).map((_, ri) => (
          <div
            key={ri}
            className="grid px-4 py-3.5 gap-4 items-center"
            style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
          >
            {Array.from({ length: cols }).map((_, ci) => (
              <SkeletonLine
                key={ci}
                height={13}
                width={ci === 0 ? "70%" : ci === cols - 1 ? "40%" : "85%"}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonKpiGrid({ count = 4 }) {
  return (
    <div className={`grid grid-cols-2 lg:grid-cols-${count} gap-3`}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-xl border p-4"
          style={{ borderColor: "var(--color-border)" }}
        >
          <SkeletonLine width="50%" height={11} className="mb-3" />
          <SkeletonLine width="60%" height={24} className="mb-2" />
          <SkeletonLine width="40%" height={11} />
        </div>
      ))}
    </div>
  );
}

// ── Error card ────────────────────────────────────────────────
export function ErrorCard({ error, onRetry, className = "" }) {
  const message = error instanceof ApiError
    ? error.message
    : "Something went wrong. Please try again.";

  const isNetwork = error instanceof ApiError && error.isNetwork;
  const isTimeout = error instanceof ApiError && error.isTimeout;

  return (
    <div
      className={`bg-white rounded-xl border p-6 flex flex-col items-center text-center gap-3 ${className}`}
      style={{ borderColor: "var(--color-border)" }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: "var(--color-danger-bg)", color: "var(--color-danger)" }}
      >
        <AlertCircle size={20} />
      </div>
      <div>
        <p className="text-[14px] font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
          {isNetwork ? "No connection" : isTimeout ? "Request timed out" : "Something went wrong"}
        </p>
        <p className="text-[13px] max-w-sm" style={{ color: "var(--color-text-secondary)" }}>
          {message}
        </p>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 h-8 px-4 rounded-lg text-[12px] font-semibold transition-colors"
          style={{
            background: "var(--color-accent-subtle)",
            color: "var(--color-accent-text)",
          }}
        >
          <RefreshCw size={13} />
          Try again
        </button>
      )}
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────
export function EmptyCard({ icon: Icon = Inbox, title, description, action, className = "" }) {
  return (
    <div
      className={`bg-white rounded-xl border flex flex-col items-center justify-center py-16 px-6 text-center ${className}`}
      style={{ borderColor: "var(--color-border)" }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ background: "var(--color-bg)", color: "var(--color-text-tertiary)" }}
      >
        <Icon size={22} />
      </div>
      <p className="text-[14px] font-medium mb-1" style={{ color: "var(--color-text-primary)" }}>
        {title}
      </p>
      {description && (
        <p className="text-[13px] max-w-xs" style={{ color: "var(--color-text-secondary)" }}>
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ── QueryState — the main wrapper ─────────────────────────────
/**
 * QueryState
 *
 * Props:
 *   isLoading   — show skeleton while true (first load, no cached data)
 *   error       — show error card when truthy
 *   isEmpty     — show empty state when truthy (after successful load)
 *   onRetry     — callback for the "Try again" button on the error card
 *   skeleton    — custom JSX to show while loading (falls back to SkeletonCard)
 *   emptyIcon   — icon for the empty state
 *   emptyTitle  — heading for the empty state
 *   emptyDesc   — description for the empty state
 *   emptyAction — action button/link for the empty state
 *   children    — actual content, shown when not loading/error/empty
 */
export function QueryState({
  isLoading,
  error,
  isEmpty = false,
  onRetry,
  skeleton,
  emptyIcon,
  emptyTitle  = "Nothing here yet",
  emptyDesc,
  emptyAction,
  children,
}) {
  if (isLoading) {
    return skeleton ?? <SkeletonCard rows={4} />;
  }

  if (error) {
    return <ErrorCard error={error} onRetry={onRetry} />;
  }

  if (isEmpty) {
    return (
      <EmptyCard
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDesc}
        action={emptyAction}
      />
    );
  }

  return children;
}

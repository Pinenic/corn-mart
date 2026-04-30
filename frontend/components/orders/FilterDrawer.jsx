"use client";

import { X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";

const STATUSES = ["Pending", "Processing", "Shipping", "Delivered", "Cancelled"];
const PAYMENT_STATUSES = ["Paid", "Awaiting payment", "Refunded"];

export function FilterDrawer({ filters, onChange, onClose, onReset }) {
  const toggle = (key, value) => {
    const current = filters[key] || [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, [key]: next });
  };

  const activeCount = [
    ...(filters.status || []),
    ...(filters.paymentStatus || []),
    filters.dateFrom ? [1] : [],
    filters.dateTo ? [1] : [],
    filters.amountMin ? [1] : [],
    filters.amountMax ? [1] : [],
  ].flat().length;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/25"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel — slides from right, narrower than detail drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-white"
        style={{
          width: "min(360px, 100vw)",
          borderLeft: "0.5px solid var(--color-border)",
          animation: "slideInRight 0.2s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: "0 0 40px rgba(0,0,0,0.1)",
        }}
        role="dialog"
        aria-modal="true"
        aria-label="Filter orders"
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <h2 className="text-[15px] font-semibold flex-1" style={{ color: "var(--color-text-primary)" }}>
            Filters
            {activeCount > 0 && (
              <span
                className="ml-2 text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
                style={{ background: "var(--color-accent)", color: "#fff" }}
              >
                {activeCount}
              </span>
            )}
          </h2>
          {activeCount > 0 && (
            <button
              onClick={onReset}
              className="flex items-center gap-1.5 text-[12px] font-medium transition-opacity hover:opacity-70"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg)]"
            style={{ color: "var(--color-text-secondary)" }}
            aria-label="Close filters"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6">

          {/* Order status */}
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Order status
            </p>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => {
                const active = (filters.status || []).includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggle("status", s)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all duration-150"
                    style={{
                      background: active ? "var(--color-accent-subtle)" : "white",
                      color: active ? "var(--color-accent-text)" : "var(--color-text-secondary)",
                      borderColor: active ? "var(--color-accent)" : "var(--color-border-md)",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date range */}
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Date range
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] mb-1 block" style={{ color: "var(--color-text-secondary)" }}>From</label>
                <input
                  type="date"
                  value={filters.dateFrom || ""}
                  onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
                  style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)" }}
                />
              </div>
              <div>
                <label className="text-[11px] mb-1 block" style={{ color: "var(--color-text-secondary)" }}>To</label>
                <input
                  type="date"
                  value={filters.dateTo || ""}
                  onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
                  style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)" }}
                />
              </div>
            </div>
            {/* Quick date presets */}
            <div className="flex gap-1.5 mt-2.5 flex-wrap">
              {[
                { label: "Today",      from: today(0),  to: today(0)   },
                { label: "Last 7 days", from: today(-7), to: today(0)  },
                { label: "This month", from: monthStart(), to: today(0) },
              ].map((p) => (
                <button
                  key={p.label}
                  onClick={() => onChange({ ...filters, dateFrom: p.from, dateTo: p.to })}
                  className="px-2.5 py-1 rounded-md text-[11px] font-medium border transition-colors hover:bg-[var(--color-bg)]"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Order amount */}
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Order amount
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] mb-1 block" style={{ color: "var(--color-text-secondary)" }}>Min ($)</label>
                <input
                  type="number"
                  placeholder="0"
                  min="0"
                  value={filters.amountMin || ""}
                  onChange={(e) => onChange({ ...filters, amountMin: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
                  style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)" }}
                />
              </div>
              <div>
                <label className="text-[11px] mb-1 block" style={{ color: "var(--color-text-secondary)" }}>Max ($)</label>
                <input
                  type="number"
                  placeholder="Any"
                  min="0"
                  value={filters.amountMax || ""}
                  onChange={(e) => onChange({ ...filters, amountMax: e.target.value })}
                  className="w-full h-9 px-3 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
                  style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)" }}
                />
              </div>
            </div>
          </div>

          {/* Payment status */}
          <div>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider mb-3"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Payment status
            </p>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_STATUSES.map((s) => {
                const active = (filters.paymentStatus || []).includes(s);
                return (
                  <button
                    key={s}
                    onClick={() => toggle("paymentStatus", s)}
                    className="px-3 py-1.5 rounded-lg text-[12px] font-medium border transition-all duration-150"
                    style={{
                      background: active ? "var(--color-accent-subtle)" : "white",
                      color: active ? "var(--color-accent-text)" : "var(--color-text-secondary)",
                      borderColor: active ? "var(--color-accent)" : "var(--color-border-md)",
                    }}
                  >
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div
          className="flex gap-2 px-5 py-4 border-t flex-shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <Button variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" className="flex-1" onClick={onClose}>
            Apply filters{activeCount > 0 ? ` (${activeCount})` : ""}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

// Date helpers
function today(offsetDays = 0) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split("T")[0];
}

function monthStart() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
}

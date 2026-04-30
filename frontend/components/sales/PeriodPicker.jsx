"use client";

import { PERIODS } from "@/lib/analytics-data";

export function PeriodPicker({ value, onChange, include12M = false }) {
  const options = include12M
    ? [...PERIODS, { key: "12M", label: "12 months", days: 365 }]
    : PERIODS;

  return (
    <div
      className="flex rounded-lg border overflow-hidden flex-shrink-0"
      style={{ borderColor: "var(--color-border-md)" }}
    >
      {options.map((p) => {
        const active = value.key === p.key;
        return (
          <button
            key={p.key}
            onClick={() => onChange(p)}
            className="px-3 h-7 text-[11px] font-semibold transition-colors whitespace-nowrap"
            style={{
              background:  active ? "var(--color-accent)"        : "white",
              color:       active ? "#fff"                        : "var(--color-text-secondary)",
              borderRight: "0.5px solid var(--color-border)",
            }}
          >
            {p.key}
          </button>
        );
      })}
    </div>
  );
}

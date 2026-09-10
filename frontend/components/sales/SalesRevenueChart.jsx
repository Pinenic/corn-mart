"use client";
import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card } from "@/components/ui";
import { cn, formatPrice } from "@/lib/utils";

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-[var(--radius-sm)] border border-[var(--color-border)] shadow-lg px-3 py-2">
      <p className="text-[11px] text-[var(--color-text-secondary)] mb-0.5">{label}</p>
      <p className="text-[13px] font-bold text-[var(--color-text-primary)]">
        {formatPrice(payload[0].value)}
      </p>
    </div>
  );
}

export function SalesRevenueChart({ series = [] }) {
  const [range, setRange] = useState("month"); // "month" | "prevMonth"

  const { thisMonth, lastMonth } = useMemo(() => {
    const half = Math.floor(series.length / 2) || 1;
    return {
      thisMonth: series.slice(half),
      lastMonth: series.slice(0, half),
    };
  }, [series]);

  const active = range === "month" ? thisMonth : lastMonth;

  const chartData = active.map((d) => ({
    label: new Date(d.date).toLocaleDateString(undefined, { day: "numeric", month: "short" }),
    revenue: d.revenue ?? d.sales ?? 0,
  }));

  return (
    <Card noPadding className="p-5">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[15px] font-bold text-[var(--color-text-primary)]">Revenue Overview</h3>
        <div className="flex items-center gap-1 bg-[var(--color-bg)] rounded-[var(--radius-sm)] p-0.5">
          {[
            { key: "month", label: "This Month" },
            { key: "prevMonth", label: "Last Month" },
          ].map((opt) => (
            <button
              key={opt.key}
              onClick={() => setRange(opt.key)}
              className={cn(
                "text-[11px] font-semibold px-2.5 py-1 rounded-[var(--radius-sm)] transition-colors",
                range === opt.key
                  ? "bg-white text-[var(--color-accent)] shadow-sm"
                  : "text-[var(--color-text-tertiary)]"
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-[12px] text-[var(--color-text-tertiary)] mb-4">
        {range === "month" ? "This month" : "Last month"}
      </p>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
            <CartesianGrid vertical={false} stroke="var(--color-border)" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: "var(--color-text-tertiary)" }}
              axisLine={false}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis tick={{ fontSize: 10, fill: "var(--color-text-tertiary)" }} axisLine={false} tickLine={false} width={40} />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--color-accent-subtle)" }} />
            <Bar dataKey="revenue" fill="var(--color-accent)" radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

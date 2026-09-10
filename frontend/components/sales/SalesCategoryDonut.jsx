"use client";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card } from "@/components/ui";

// Derived from the Corn Mart palette — greens + gold rather than the
// old unrelated blue/purple/gray set, so a multi-slice donut still
// reads as part of the same brand.
const SLICE_COLORS = ["#1b5e35", "#f5a623", "#4caf50", "#2a7a47", "#e09410", "#8fbf9a"];

export function SalesCategoryDonut({ categories = [] }) {
  const top = categories.slice(0, 6);

  return (
    <Card noPadding className="p-5">
      <h3 className="text-[15px] font-bold text-[var(--color-text-primary)] mb-1">Sales by Category</h3>
      <p className="text-[12px] text-[var(--color-text-tertiary)] mb-2">This month</p>

      {top.length === 0 ? (
        <div className="h-52 flex items-center justify-center text-[13px] text-[var(--color-text-tertiary)]">
          No category sales yet
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <div className="w-36 h-36 flex-shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={top}
                  dataKey="share_pct"
                  nameKey="name"
                  innerRadius={40}
                  outerRadius={62}
                  paddingAngle={2}
                  isAnimationActive={false}
                >
                  {top.map((entry, i) => (
                    <Cell key={entry.name} fill={SLICE_COLORS[i % SLICE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(v) => `${v}%`} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="flex-1 space-y-2 min-w-0">
            {top.map((cat, i) => (
              <div key={cat.name} className="flex items-center gap-2 text-[12px]">
                <span
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: SLICE_COLORS[i % SLICE_COLORS.length] }}
                />
                <span className="text-[var(--color-text-secondary)] truncate flex-1">{cat.name}</span>
                <span className="font-semibold text-[var(--color-text-primary)]">{cat.share_pct}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

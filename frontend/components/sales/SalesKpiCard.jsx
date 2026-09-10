"use client";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Card } from "@/components/ui";
import { cn } from "@/lib/utils";

/**
 * @param {string} label
 * @param {string} value - preformatted display value
 * @param {number} changePct
 * @param {Array<{x, y}>} sparkline - simple {x,y} points, y = the metric's daily value
 * @param {React.ComponentType} icon
 * @param {string} accent - CSS color (hex or var()) for the icon badge + sparkline
 */
export function SalesKpiCard({ label, value, changePct, sparkline = [], icon: Icon, accent }) {
  const up = (changePct ?? 0) >= 0;

  return (
    <Card className="relative overflow-hidden">
      <div className="flex items-start justify-between gap-2 mb-3">
        <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">{label}</p>
        {Icon && (
          <div
            className="w-8 h-8 rounded-[var(--radius-md)] flex items-center justify-center flex-shrink-0"
            style={{ background: `${accent}18`, color: accent }}
          >
            <Icon size={15} />
          </div>
        )}
      </div>

      <p className="text-[24px] font-bold text-[var(--color-text-primary)] mb-1.5">{value}</p>

      {typeof changePct === "number" && (
        <span
          className={cn(
            "inline-flex items-center text-[11px] font-semibold px-1.5 py-0.5 rounded-md",
            up ? "text-[var(--color-success)] bg-[var(--color-success-bg)]" : "text-[var(--color-danger)] bg-[var(--color-danger-bg)]"
          )}
        >
          {up ? "▲" : "▼"} {Math.abs(changePct)}%
        </span>
      )}
      <span className="text-[11px] text-[var(--color-text-tertiary)] ml-1.5">vs last period</span>

      {sparkline.length > 1 && (
        <div className="h-10 -mx-1 -mb-1 mt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sparkline} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={`spark-${label.replace(/\s+/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={accent} stopOpacity={0.35} />
                  <stop offset="100%" stopColor={accent} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="y"
                stroke={accent}
                strokeWidth={1.75}
                fill={`url(#spark-${label.replace(/\s+/g, "")})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}

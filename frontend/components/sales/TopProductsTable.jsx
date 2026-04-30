"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  TrendingUp,
  TrendingDown,
  Minus,
} from "lucide-react";
import { Badge } from "@/components/ui";
import { PRODUCT_PERFORMANCE } from "@/lib/analytics-data";

function Sparkline({ data, color = "#0057ff" }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      const { Chart, registerables } = await import("chart.js");
      Chart.register(...registerables);
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      chartRef.current = new Chart(ctx, {
        type: "line",
        data: {
          labels: data.map((_, i) => i),
          datasets: [
            {
              data,
              borderColor: color,
              borderWidth: 1.5,
              pointRadius: 0,
              fill: true,
              backgroundColor: color + "18",
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false }, tooltip: { enabled: false } },
          scales: { x: { display: false }, y: { display: false } },
          animation: { duration: 400 },
        },
      });
    };
    load();
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
        chartRef.current = null;
      }
    };
  }, [data, color]);

  return (
    <div style={{ width: 72, height: 32 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

function TrendBadge({ trend, pct }) {
  if (trend === "up")
    return (
      <span
        className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
        style={{
          background: "var(--color-success-bg)",
          color: "var(--color-success)",
        }}
      >
        <TrendingUp size={10} /> +{pct}%
      </span>
    );
  if (trend === "down")
    return (
      <span
        className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
        style={{
          background: "var(--color-danger-bg)",
          color: "var(--color-danger)",
        }}
      >
        <TrendingDown size={10} /> {pct}%
      </span>
    );
  return (
    <span
      className="inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-full"
      style={{
        background: "var(--color-bg)",
        color: "var(--color-text-tertiary)",
      }}
    >
      <Minus size={10} /> Flat
    </span>
  );
}

export function TopProductsTable({product_performance}) {
  const [expanded, setExpanded] = useState(null);
  const [sortBy, setSortBy] = useState("revenue"); // revenue | units | views
  const [performance, setPerformance] = useState(product_performance || null)

  const sorted = [...performance.products].sort((a, b) =>
    sortBy === "units"
      ? b.units_sold - a.units_sold
      : sortBy === "views"
      ? b.views - a.views
      : b.revenue - a.revenue
  );

  const SPARKLINE_COLORS = {
    up: "#0057ff",
    flat: "#6b7280",
    down: "#dc2626",
  };

  return (
    <div>
      {/* Sort tabs */}
      <div className="flex gap-1.5 mb-3">
        {[
          { key: "revenue", label: "By revenue" },
          { key: "units", label: "By units" },
          // { key: "views", label: "By views" },
        ].map((s) => (
          <button
            key={s.key}
            onClick={() => setSortBy(s.key)}
            className="px-3 py-1 rounded-lg text-[11px] font-semibold border transition-all"
            style={{
              background:
                sortBy === s.key ? "var(--color-accent-subtle)" : "transparent",
              color:
                sortBy === s.key
                  ? "var(--color-accent-text)"
                  : "var(--color-text-secondary)",
              borderColor:
                sortBy === s.key ? "transparent" : "var(--color-border)",
            }}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* Desktop header */}
      <div
        className="hidden md:grid px-4 py-2 border-b text-[10px] font-semibold uppercase tracking-wider"
        style={{
          gridTemplateColumns: "28px 36px 1fr 80px 80px 80px",
          borderColor: "var(--color-border)",
          color: "var(--color-text-tertiary)",
        }}
      >
        <span>#</span>
        <span></span>
        <span>Product</span>
        <span className="text-right">Revenue</span>
        <span className="text-right">Units</span>
        <span className="text-right">Returns</span>
        {/* <span className="text-right">Views</span> */}
        {/* <span className="text-center">12-wk trend</span> */}
      </div>

      <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
        {sorted.map((p, rank) => {
          const isOpen = expanded === p.id;
          const sparkColor = SPARKLINE_COLORS[p.trend];
          const returnRate =
            Math.round((p.returns / p.unitsSold) * 100 * 10) / 10;

          return (
            <div key={p.id}>
              {/* Main row */}
              <div
                className="cursor-pointer transition-colors hover:bg-[var(--color-bg)] px-4 py-3"
                onClick={() => setExpanded(isOpen ? null : p.id)}
              >
                {/* Mobile layout */}
                <div className="md:hidden flex items-center gap-3">
                  <span
                    className="text-[11px] font-bold w-5 text-center flex-shrink-0"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {rank + 1}
                  </span>
                  <span className="text-2xl">{p.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className="text-[13px] font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {p.name}
                      </p>
                      <TrendBadge trend={p.trend} pct={Math.abs(p.trendPct)} />
                    </div>
                    <p
                      className="text-[11px]"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      {p.units_sold} sold · ${p.revenue.toLocaleString()} ·{" "}
                      {returnRate}% returns
                    </p>
                  </div>
                  {/* <Sparkline data={p.weeklyUnits} color={sparkColor} />
                  {isOpen ? (
                    <ChevronUp
                      size={14}
                      style={{ color: "var(--color-text-tertiary)" }}
                    />
                  ) : (
                    <ChevronDown
                      size={14}
                      style={{ color: "var(--color-text-tertiary)" }}
                    />
                  )} */}
                </div>

                {/* Desktop layout */}
                <div
                  className="hidden md:grid items-center gap-2"
                  style={{
                    gridTemplateColumns:
                      "28px 36px 1fr 80px 80px 80px",
                  }}
                >
                  <span
                    className="text-[11px] font-bold"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    {rank + 1}
                  </span>
                  <span className="text-2xs"><img src={p.thumbnail_url} alt="img" className="h-10 w-10 rounded"/></span>
                  <div className="min-w-0">
                    <p
                      className="text-[13px] font-semibold truncate"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {p.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p
                        className="text-[10px]"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        {p.category}
                      </p>
                      <TrendBadge trend={p.trend} pct={Math.abs(p.trendPct)} />
                    </div>
                  </div>
                  <p
                    className="text-[13px] font-semibold text-right"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    K{p.revenue.toLocaleString()}
                  </p>
                  <p
                    className="text-[13px] text-right"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {p.units_sold.toLocaleString()}
                  </p>
                  <p
                    className="text-[12px] text-right"
                    style={{
                      color:
                        returnRate > 10
                          ? "var(--color-danger)"
                          : "var(--color-text-secondary)",
                    }}
                  >
                    {returnRate}%
                  </p>
                  {/* <p
                    className="text-[12px] text-right"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    {p.views.toLocaleString()}
                  </p> */}
                  {/* <div className="flex justify-center">
                    <Sparkline data={p.weeklyUnits} color={sparkColor} />
                  </div> */}
                </div>
              </div>

              {/* Expanded: variant breakdown */}
              {isOpen && (
                <div
                  className="px-4 pb-4 pt-1"
                  style={{ background: "var(--color-bg)" }}
                >
                  <p
                    className="text-[11px] font-semibold uppercase tracking-wider mb-2"
                    style={{ color: "var(--color-text-tertiary)" }}
                  >
                    Variant breakdown
                  </p>
                  <div
                    className="rounded-xl border overflow-hidden"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    {/* Variant table header */}
                    <div
                      className="grid px-3 py-2 text-[10px] font-semibold uppercase tracking-wider bg-white border-b"
                      style={{
                        gridTemplateColumns: "1fr 80px 80px 80px",
                        borderColor: "var(--color-border)",
                        color: "var(--color-text-tertiary)",
                      }}
                    >
                      <span>Variant</span>
                      <span className="text-right">Units</span>
                      <span className="text-right">Revenue</span>
                      <span className="text-right">Return %</span>
                    </div>
                    {p.variants.map((v, vi) => {
                      // Width of bar relative to top variant
                      const maxSold = Math.max(
                        ...p.variants.map((x) => x.sold)
                      );
                      const barPct = Math.round((v.sold / maxSold) * 100);
                      return (
                        <div
                          key={vi}
                          className="px-3 py-2.5 border-b last:border-0 bg-white"
                          style={{ borderColor: "var(--color-border)" }}
                        >
                          <div
                            className="grid items-center gap-2"
                            style={{
                              gridTemplateColumns: "1fr 80px 80px 80px",
                            }}
                          >
                            <div>
                              <p
                                className="text-[12px] font-medium"
                                style={{ color: "var(--color-text-primary)" }}
                              >
                                {v.name}
                              </p>
                              {/* Inline bar */}
                              <div
                                className="mt-1 h-1 rounded-full overflow-hidden"
                                style={{ background: "var(--color-bg)" }}
                              >
                                <div
                                  className="h-full rounded-full"
                                  style={{
                                    width: `${barPct}%`,
                                    background: "var(--color-accent)",
                                    opacity: 0.6,
                                  }}
                                />
                              </div>
                            </div>
                            <p
                              className="text-[12px] text-right"
                              style={{ color: "var(--color-text-secondary)" }}
                            >
                              {v.sold}
                            </p>
                            <p
                              className="text-[12px] font-semibold text-right"
                              style={{ color: "var(--color-text-primary)" }}
                            >
                              ${v.revenue.toLocaleString()}
                            </p>
                            <p
                              className="text-[12px] text-right"
                              style={{
                                color:
                                  v.returnRate > 10
                                    ? "var(--color-danger)"
                                    : "var(--color-text-tertiary)",
                              }}
                            >
                              {v.returnRate}%
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

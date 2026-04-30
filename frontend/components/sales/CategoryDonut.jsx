"use client";

import { useEffect, useRef, useState } from "react";
import { CATEGORY_BREAKDOWN } from "@/lib/analytics-data";
const CATEGORY_COLOR = {
   "Electronics": "#0057ff" ,
   "Health & Beauty": "#7c3aed" ,
   "Home & Garden": "#059669" ,
   "Cloths & Accessories": "#d97706" ,
   "Business & Industrial": "#6a6767" ,
   "Toys & Collectibles": "#dc2626" ,
};

export function CategoryDonut({ breakdown }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);
  const [active, setActive] = useState(null);

  const total = breakdown?.reduce((s, c) => s + c.revenue, 0);

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
        type: "doughnut",
        data: {
          labels: breakdown?.map((c) => c.name),
          datasets: [
            {
              data: breakdown?.map((c) => c.revenue),
              backgroundColor: breakdown?.map((c) => CATEGORY_COLOR[c.name]),
              borderWidth: 2,
              borderColor: "#fff",
              hoverOffset: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: "68%",
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: "white",
              titleColor: "#0f1117",
              bodyColor: "#6b7280",
              borderColor: "rgba(0,0,0,0.08)",
              borderWidth: 1,
              padding: 10,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) =>
                  ` K${Number(ctx.raw).toLocaleString()} (${Math.round(
                    (ctx.raw / total) * 100
                  )}%)`,
              },
            },
          },
          onHover: (_, elements) => {
            setActive(elements.length > 0 ? elements[0].index : null);
          },
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
  }, []);

  return (
    <div className="flex flex-col md:flex-row items-center gap-5">
      {/* Chart */}
      <div
        className="relative flex-shrink-0"
        style={{ width: 160, height: 160 }}
      >
        <canvas ref={canvasRef} />
        {/* Centre label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <p
            className="text-[11px]"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Total
          </p>
          <p
            className="text-[15px] font-bold"
            style={{ color: "var(--color-text-primary)" }}
          >
            K{(total / 1000).toFixed(0)}k
          </p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex-1 space-y-2 w-full">
        {breakdown?.map((c, i) => {
          const pct = Math.round((c.revenue / total) * 100);
          return (
            <div
              key={c.name}
              className="flex items-center gap-2.5 p-2 rounded-lg transition-colors"
              style={{
                background: active === i ? "var(--color-bg)" : "transparent",
              }}
            >
              <div
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ background: CATEGORY_COLOR[c.name] }}
              />
              <span
                className="text-[12px] flex-1"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {c.name}
              </span>
              <span
                className="text-[11px] font-semibold"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {pct}%
              </span>
              <span
                className="text-[12px] font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                K{c.revenue.toLocaleString()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

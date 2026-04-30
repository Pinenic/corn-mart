"use client";

import { useEffect, useRef, useState, memo } from "react";
import { sliceSeries, groupByWeek, MONTHLY_SERIES } from "@/lib/analytics-data";

/**
 * RevenueChart
 * Props:
 *   period — { key, label, days }
 *   metric — "revenue" | "orders" | "aov"
 */
function RevenueChartComponent({ period, metric = "revenue", series }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const METRIC_CONFIG = {
    revenue: { label: "Revenue",     prefix: "K", color: "#0057ff", fill: "rgba(0,87,255,0.08)" },
    orders:  { label: "Orders",      prefix: "",  color: "#7c3aed", fill: "rgba(124,58,237,0.08)" },
    // aov:     { label: "Avg. Order",  prefix: "K", color: "#059669", fill: "rgba(5,150,105,0.08)" },
  };

  useEffect(() => {
    let data, labels;

    if (period.key === "12M") {
      data   = series?.map((m) => m[metric === "orders" ? "orders" : "revenue"]);
      labels = series?.map((m) => m.month);
    } else if (period.days <= 30) {
      // const series = sliceSeries(period);
      data   = series?.map((d) => d[metric]);
      labels = series?.map((d) => {
        const dt = new Date(d.date);
        return dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      });
    } else {
      const seriez = groupByWeek(series);
      data   = seriez.map((d) => d[metric]);
      labels = seriez.map((d) => d.label);
    }

    const cfg = METRIC_CONFIG[metric];

    const loadChart = async () => {
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
          labels,
          datasets: [{
            label:            cfg.label,
            data,
            borderColor:      cfg.color,
            backgroundColor:  cfg.fill,
            borderWidth:      2,
            pointRadius:      0,
            pointHoverRadius: 4,
            pointHoverBackgroundColor: cfg.color,
            fill:             true,
            tension:          0.4,
          }],
        },
        options: {
          responsive:          true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: { display: false },
            tooltip: {
              enabled: true,
              backgroundColor: "white",
              titleColor:   "#0f1117",
              bodyColor:    "#6b7280",
              borderColor:  "rgba(0,0,0,0.08)",
              borderWidth:  1,
              padding:      10,
              cornerRadius: 8,
              callbacks: {
                label: (ctx) =>
                  ` ${cfg.prefix}${Number(ctx.raw).toLocaleString()}`,
              },
            },
          },
          scales: {
            x: {
              grid:  { display: false },
              ticks: {
                color:    "#9ca3af",
                font:     { size: 10 },
                maxTicksLimit: period.days <= 7 ? 7 : 8,
                maxRotation: 0,
              },
              border: { display: false },
            },
            y: {
              grid:  { color: "rgba(0,0,0,0.04)", drawBorder: false },
              ticks: {
                color:    "#9ca3af",
                font:     { size: 10 },
                maxTicksLimit: 5,
                callback: (v) => cfg.prefix === "$" ? `$${(v / 1000).toFixed(0)}k` : v,
              },
              border: { display: false },
            },
          },
        },
      });
    };

    loadChart();
    return () => { 
      if (chartRef.current) { 
        chartRef.current.destroy(); 
        chartRef.current = null; 
      } 
    };
  }, [period.key, period.days, metric, series]);

  return (
    <div className="relative" style={{ height: 220 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export const RevenueChart = memo(RevenueChartComponent, (prev, next) => {
  return prev.period?.key === next.period?.key && 
         prev.period?.days === next.period?.days && 
         prev.metric === next.metric &&
         prev.series === next.series;
});

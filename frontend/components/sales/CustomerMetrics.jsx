"use client";

import { useEffect, useRef } from "react";
import { Users, UserCheck, UserMinus, DollarSign } from "lucide-react";
import { CUSTOMER_METRICS } from "@/lib/analytics-data";
import { Card } from "@/components/ui";

function CohortChart() {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    const load = async () => {
      const { Chart, registerables } = await import("chart.js");
      Chart.register(...registerables);
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      const { cohorts } = CUSTOMER_METRICS;

      chartRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels: cohorts.map((c) => c.month),
          datasets: [
            {
              label:           "New customers",
              data:            cohorts.map((c) => c.new),
              backgroundColor: "#0057ff",
              borderRadius:    4,
              borderSkipped:   false,
              stack:           "a",
            },
            {
              label:           "Returning",
              data:            cohorts.map((c) => c.returning),
              backgroundColor: "rgba(0,87,255,0.2)",
              borderRadius:    4,
              borderSkipped:   false,
              stack:           "a",
            },
          ],
        },
        options: {
          responsive: true, maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: "top", align: "end",
              labels: { boxWidth: 10, boxHeight: 10, font: { size: 11 }, color: "#6b7280", padding: 12 },
            },
            tooltip: {
              backgroundColor: "white",
              titleColor: "#0f1117", bodyColor: "#6b7280",
              borderColor: "rgba(0,0,0,0.08)", borderWidth: 1,
              padding: 10, cornerRadius: 8,
            },
          },
          scales: {
            x: { stacked: true, grid: { display: false }, ticks: { color: "#9ca3af", font: { size: 11 } }, border: { display: false } },
            y: { stacked: true, grid: { color: "rgba(0,0,0,0.04)" }, ticks: { color: "#9ca3af", font: { size: 10 }, maxTicksLimit: 5 }, border: { display: false } },
          },
        },
      });
    };
    load();
    return () => { if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; } };
  }, []);

  return (
    <div style={{ height: 180 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export function CustomerMetrics() {
  const m = CUSTOMER_METRICS;
  const returningPct = Math.round((m.returning / m.total) * 100);

  const stats = [
    { label: "Total customers",  value: m.total.toLocaleString(),          icon: Users,      color: "#0057ff"  },
    { label: "New this period",  value: m.newThisPeriod.toLocaleString(),  icon: UserCheck,  color: "#16a34a"  },
    { label: "Avg. LTV",         value: `$${m.ltv}`,                       icon: DollarSign, color: "#7c3aed"  },
    { label: "Churn rate",       value: `${m.churnRate}%`,                 icon: UserMinus,  color: "#dc2626"  },
  ];

  return (
    <div className="space-y-5">
      {/* Summary stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label}
              className="bg-white rounded-xl border p-4"
              style={{ borderColor: "var(--color-border)" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: s.color + "18", color: s.color }}>
                  <Icon size={14} />
                </div>
              </div>
              <p className="text-[22px] font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
                {s.value}
              </p>
              <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>{s.label}</p>
            </div>
          );
        })}
      </div>

      {/* New vs Returning stacked bar */}
      <div className="bg-white rounded-xl border p-5" style={{ borderColor: "var(--color-border)" }}>
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
            New vs returning customers
          </p>
          <span className="text-[12px] font-medium px-2 py-0.5 rounded-full"
            style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent-text)" }}>
            {returningPct}% returning
          </span>
        </div>
        <CohortChart />
      </div>

      {/* Acquisition channels */}
      <div className="bg-white rounded-xl border p-5" style={{ borderColor: "var(--color-border)" }}>
        <p className="text-[14px] font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
          Acquisition channels
        </p>
        <div className="space-y-3">
          {m.channels.map((ch, i) => {
            const colors = ["#0057ff","#7c3aed","#059669","#d97706","#dc2626"];
            const color  = colors[i] || "#9ca3af";
            return (
              <div key={ch.name}>
                <div className="flex justify-between text-[12px] mb-1.5">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                    <span style={{ color: "var(--color-text-secondary)" }}>{ch.name}</span>
                  </div>
                  <div className="flex gap-3">
                    <span className="font-medium" style={{ color: "var(--color-text-primary)" }}>
                      {ch.count.toLocaleString()}
                    </span>
                    <span className="w-8 text-right" style={{ color: "var(--color-text-tertiary)" }}>
                      {ch.pct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-bg)" }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${ch.pct}%`, background: color }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

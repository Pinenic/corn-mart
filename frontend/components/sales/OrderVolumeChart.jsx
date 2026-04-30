"use client";

import { useEffect, useRef, memo } from "react";
import { sliceSeries, groupByWeek, MONTHLY_SERIES } from "@/lib/analytics-data";

function OrderVolumeChartComponent({ period }) {
  const canvasRef = useRef(null);
  const chartRef  = useRef(null);

  useEffect(() => {
    let curr, prev, labels;

    if (period.key === "12M") {
      labels = MONTHLY_SERIES.map((m) => m.month);
      curr   = MONTHLY_SERIES.map((m) => m.orders);
      prev   = MONTHLY_SERIES.map((m) => Math.round(m.orders * 0.82)); // simulated prev year
    } else if (period.days <= 30) {
      const currSeries = sliceSeries(period);
      const prevSeries = sliceSeries(period).map((d) => ({
        ...d, orders: Math.round(d.orders * (0.75 + Math.random() * 0.3)),
      }));
      labels = currSeries.map((d) => new Date(d.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }));
      curr   = currSeries.map((d) => d.orders);
      prev   = prevSeries.map((d) => d.orders);
    } else {
      const currSeries = groupByWeek(sliceSeries(period));
      labels = currSeries.map((d) => d.label);
      curr   = currSeries.map((d) => d.orders);
      prev   = currSeries.map((d) => Math.round(d.orders * (0.72 + Math.random() * 0.25)));
    }

    const load = async () => {
      const { Chart, registerables } = await import("chart.js");
      Chart.register(...registerables);
      if (chartRef.current) { chartRef.current.destroy(); chartRef.current = null; }
      const ctx = canvasRef.current?.getContext("2d");
      if (!ctx) return;

      chartRef.current = new Chart(ctx, {
        type: "bar",
        data: {
          labels,
          datasets: [
            {
              label:           "This period",
              data:            curr,
              backgroundColor: "#0057ff",
              borderRadius:    4,
              borderSkipped:   false,
              barPercentage:   0.55,
            },
            {
              label:           "Previous period",
              data:            prev,
              backgroundColor: "rgba(0,87,255,0.15)",
              borderRadius:    4,
              borderSkipped:   false,
              barPercentage:   0.55,
            },
          ],
        },
        options: {
          responsive:          true,
          maintainAspectRatio: false,
          interaction: { mode: "index", intersect: false },
          plugins: {
            legend: {
              display: true,
              position: "top",
              align:    "end",
              labels: {
                boxWidth:  10,
                boxHeight: 10,
                borderRadius: 3,
                padding:   12,
                font: { size: 11 },
                color: "#6b7280",
              },
            },
            tooltip: {
              backgroundColor: "white",
              titleColor:   "#0f1117",
              bodyColor:    "#6b7280",
              borderColor:  "rgba(0,0,0,0.08)",
              borderWidth:  1,
              padding:      10,
              cornerRadius: 8,
            },
          },
          scales: {
            x: {
              grid:  { display: false },
              ticks: { color: "#9ca3af", font: { size: 10 }, maxTicksLimit: 8, maxRotation: 0 },
              border: { display: false },
            },
            y: {
              grid:  { color: "rgba(0,0,0,0.04)" },
              ticks: { color: "#9ca3af", font: { size: 10 }, maxTicksLimit: 5 },
              border: { display: false },
            },
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
  }, [period.key, period.days]);

  return (
    <div style={{ height: 200 }}>
      <canvas ref={canvasRef} />
    </div>
  );
}

export const OrderVolumeChart = memo(OrderVolumeChartComponent, (prev, next) => {
  return prev.period?.key === next.period?.key && 
         prev.period?.days === next.period?.days;
});

"use client";

import { useState } from "react";
import { VARIANT_HEATMAP, PRODUCT_PERFORMANCE } from "@/lib/analytics-data";

// Map a value 0–1 to a blue intensity colour
function cellColor(intensity) {
  // 0 = near-white, 1 = deep accent blue
  const r = Math.round(238 - intensity * (238 - 0));
  const g = Math.round(243 - intensity * (243 - 87));
  const b = Math.round(255 - intensity * (255 - 255));
  return `rgb(${r},${g},${b})`;
}

function cellTextColor(intensity) {
  return intensity > 0.5 ? "#ffffff" : "#0040cc";
}

export function VariantHeatmap() {
  // Default to first product that has heatmap data
  const availableProducts = PRODUCT_PERFORMANCE.filter((p) => VARIANT_HEATMAP[p.id]);
  const [selectedId, setSelectedId] = useState(availableProducts[0]?.id);

  const product  = availableProducts.find((p) => p.id === selectedId);
  const heatmap  = VARIANT_HEATMAP[selectedId];

  if (!heatmap || !product) return null;

  // Flatten all values to find max for normalisation
  const allValues = heatmap.data.flat();
  const maxVal    = Math.max(...allValues, 1);

  return (
    <div>
      {/* Product selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {availableProducts.map((p) => (
          <button
            key={p.id}
            onClick={() => setSelectedId(p.id)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-[12px] font-medium transition-all"
            style={{
              background:  selectedId === p.id ? "var(--color-accent-subtle)" : "transparent",
              color:       selectedId === p.id ? "var(--color-accent-text)"   : "var(--color-text-secondary)",
              borderColor: selectedId === p.id ? "transparent"                : "var(--color-border)",
            }}
          >
            <span className="text-base">{p.emoji}</span>
            {p.name}
          </button>
        ))}
      </div>

      {/* Axis labels */}
      <div className="flex items-center gap-2 mb-2">
        <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
          <span className="font-semibold">{heatmap.yLabel}</span> × <span className="font-semibold">{heatmap.xLabel}</span>
          {" · "}colour intensity = units sold
        </p>
        <div className="ml-auto flex items-center gap-1">
          <span className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>Low</span>
          {[0.05, 0.2, 0.4, 0.6, 0.8, 1].map((v) => (
            <div key={v} className="w-4 h-3 rounded-sm" style={{ background: cellColor(v) }} />
          ))}
          <span className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>High</span>
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr>
              {/* Top-left corner */}
              <th className="w-28 pr-2" />
              {heatmap.xValues.map((x) => (
                <th key={x} className="text-[11px] font-semibold pb-1.5 px-1 text-center whitespace-nowrap"
                  style={{ color: "var(--color-text-secondary)" }}>
                  {x}
                </th>
              ))}
              <th className="pl-2 text-[11px] font-semibold pb-1.5"
                style={{ color: "var(--color-text-tertiary)" }}>
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {heatmap.yValues.map((y, yi) => {
              const rowTotal = heatmap.data[yi].reduce((s, v) => s + v, 0);
              return (
                <tr key={y}>
                  {/* Y-axis label */}
                  <td className="text-[11px] font-medium pr-3 py-1 whitespace-nowrap text-right"
                    style={{ color: "var(--color-text-secondary)" }}>
                    {y}
                  </td>
                  {/* Cells */}
                  {heatmap.data[yi].map((val, xi) => {
                    const intensity = val / maxVal;
                    return (
                      <td key={xi} className="p-0.5">
                        <div
                          className="rounded-lg flex items-center justify-center text-[11px] font-semibold transition-transform hover:scale-105 cursor-default"
                          style={{
                            width:      44,
                            height:     36,
                            background: val === 0 ? "var(--color-bg)" : cellColor(intensity),
                            color:      val === 0 ? "var(--color-text-tertiary)" : cellTextColor(intensity),
                          }}
                          title={`${y} / ${heatmap.xValues[xi]}: ${val} sold`}
                        >
                          {val === 0 ? "—" : val}
                        </div>
                      </td>
                    );
                  })}
                  {/* Row total */}
                  <td className="pl-2 text-[12px] font-semibold"
                    style={{ color: "var(--color-text-secondary)" }}>
                    {rowTotal}
                  </td>
                </tr>
              );
            })}
            {/* Column totals */}
            <tr>
              <td className="text-[11px] font-semibold pt-1.5 pr-3 text-right"
                style={{ color: "var(--color-text-tertiary)" }}>Total</td>
              {heatmap.xValues.map((_, xi) => {
                const colTotal = heatmap.data.reduce((s, row) => s + row[xi], 0);
                return (
                  <td key={xi} className="pt-1.5 px-0.5">
                    <p className="text-[11px] font-semibold text-center" style={{ color: "var(--color-text-secondary)" }}>
                      {colTotal}
                    </p>
                  </td>
                );
              })}
              <td className="pl-2 pt-1.5 text-[12px] font-bold" style={{ color: "var(--color-text-primary)" }}>
                {heatmap.data.flat().reduce((s, v) => s + v, 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Top combination callout */}
      {(() => {
        let maxVal2 = 0, maxY = 0, maxX = 0;
        heatmap.data.forEach((row, yi) => row.forEach((val, xi) => {
          if (val > maxVal2) { maxVal2 = val; maxY = yi; maxX = xi; }
        }));
        return (
          <div className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl"
            style={{ background: "var(--color-accent-subtle)" }}>
            <span className="text-lg">{product.emoji}</span>
            <p className="text-[12px]" style={{ color: "var(--color-accent-text)" }}>
              Top combination:{" "}
              <strong>{heatmap.yValues[maxY]} / {heatmap.xValues[maxX]}</strong>
              {" — "}{maxVal2} units sold
            </p>
          </div>
        );
      })()}
    </div>
  );
}

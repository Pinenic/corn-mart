"use client";

import { useState } from "react";
import {
  Download,
  DollarSign,
  ShoppingCart,
  TrendingUp,
  BarChart2,
} from "lucide-react";
import { Card, PageHeader, Button } from "@/components/ui";
import {
  QueryState,
  SkeletonKpiGrid,
  SkeletonCard,
} from "@/components/ui/QueryState";
import { PeriodPicker } from "@/components/sales/PeriodPicker";
import { RevenueChart } from "@/components/sales/RevenueChart";
import { OrderVolumeChart } from "@/components/sales/OrderVolumeChart";
import { CategoryDonut } from "@/components/sales/CategoryDonut";
import { TopProductsTable } from "@/components/sales/TopProductsTable";
import { VariantHeatmap } from "@/components/sales/VariantHeatmap";
import { CustomerMetrics } from "@/components/sales/CustomerMetrics";
import { PERIODS } from "@/lib/analytics-data";
import {
  useAnalyticsOverview,
  useRevenueSeries,
  useOrdersByStatus,
  useCategoryBreakdown,
  useProductPerformance,
} from "@/lib/hooks/useAnalytics";

const TABS = [
  { key: "overview", label: "Overview" },
  // { key: "products", label: "Products" },
  // { key: "variants",  label: "Variants"  },
  // { key: "customers", label: "Customers" },
];

const METRIC_OPTS = [
  { key: "revenue", label: "Revenue", icon: DollarSign },
  { key: "orders", label: "Orders", icon: ShoppingCart },
  { key: "aov", label: "Avg. order", icon: BarChart2 },
];

const STATUS_COLORS = {
  delivered: "#16a34a",
  shipped: "#2563eb",
  processing: "#0057ff",
  pending: "#d97706",
  cancelled: "#dc2626",
  refunded: "#9ca3af",
};

export default function SalesPage() {
  const [tab, setTab] = useState("overview");
  const [period, setPeriod] = useState(PERIODS[1]);
  const [metric, setMetric] = useState("revenue");

  const periodKey = period.key === "12M" ? "12m" : period.key.toLowerCase();

  // ── Live hooks ────────────────────────────────────────────
  const {
    data: kpiData,
    isLoading: kpiLoading,
    error: kpiError,
    mutate: kpiMutate,
  } = useAnalyticsOverview({ period: periodKey });

  const { data: revSeries } = useRevenueSeries({ period: periodKey });
  const { data: statusCounts } = useOrdersByStatus();
  const { data: categoryData } = useCategoryBreakdown({ period: periodKey });
  const { data: productData } = useProductPerformance({ period: periodKey });
  // console.log(revSeries);
  // console.log(categoryData);

  // ── Derived ───────────────────────────────────────────────
  const kpis = kpiData
    ? [
        {
          key: "revenue",
          label: "Revenue",
          value: `K${(kpiData.revenue?.current ?? 0).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
          change: `${Math.abs(kpiData.revenue?.change_pct ?? 0).toFixed(
            1
          )}% vs prev. period`,
          changeType: (kpiData.revenue?.change_pct ?? 0) >= 0 ? "up" : "down",
          icon: DollarSign,
        },
        {
          key: "orders",
          label: "Orders",
          value: (kpiData.orders?.current ?? 0).toLocaleString(),
          change: `${Math.abs(kpiData.orders?.change_pct ?? 0).toFixed(
            1
          )}% vs prev. period`,
          changeType: (kpiData.orders?.change_pct ?? 0) >= 0 ? "up" : "down",
          icon: ShoppingCart,
        },
        {
          key: "aov",
          label: "Avg. order value",
          value: `K${(kpiData.aov?.current ?? 0).toFixed(2)}`,
          change: `K${Math.abs(
            (kpiData.aov?.current ?? 0) - (kpiData.aov?.previous ?? 0)
          ).toFixed(2)} vs prev. period`,
          changeType: (kpiData.aov?.change_pct ?? 0) >= 0 ? "up" : "down",
          icon: BarChart2,
        },
        {
          key: "followers",
          label: "Followers",
          value: "—",
          change: "See followers tab",
          changeType: "up",
          icon: TrendingUp,
        },
      ]
    : null;

  const statusDist = statusCounts
    ? Object.entries(statusCounts)
        .filter(([k]) => k !== "all")
        .map(([k, count]) => ({
          label: k.charAt(0).toUpperCase() + k.slice(1),
          count,
          color: STATUS_COLORS[k] ?? "#9ca3af",
        }))
        .filter((s) => s.count > 0)
        .sort((a, b) => b.count - a.count)
    : null;

  const totalOrders = statusDist?.reduce((s, d) => s + d.count, 0) ?? 0;

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Store performance, growth and product insights"
        action={
          <Button variant="secondary" size="sm">
            <Download size={13} /> Export
          </Button>
        }
      />

      {/* Tabs + period picker */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div
          className="flex gap-1 border rounded-xl p-1"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-bg)",
          }}
        >
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
              style={{
                background: tab === t.key ? "white" : "transparent",
                color:
                  tab === t.key
                    ? "var(--color-text-primary)"
                    : "var(--color-text-secondary)",
                boxShadow:
                  tab === t.key ? "0 1px 3px rgba(0,0,0,0.07)" : "none",
              }}
            >
              {t.label}
            </button>
          ))}
        </div>
        <PeriodPicker value={period} onChange={setPeriod} include12M />
      </div>

      {/* ─── OVERVIEW TAB ─── */}
      {tab === "overview" && (
        <div className="space-y-5">
          {/* KPI cards */}
          <QueryState
            isLoading={kpiLoading}
            error={kpiError}
            onRetry={kpiMutate}
            skeleton={<SkeletonKpiGrid count={4} />}
          >
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {kpis?.map((k) => {
                const Icon = k.icon;
                return (
                  <div
                    key={k.key}
                    className="bg-white rounded-xl border p-4"
                    style={{ borderColor: "var(--color-border)" }}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <p
                        className="text-[11px] font-medium uppercase tracking-wide"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        {k.label}
                      </p>
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{
                          background: "var(--color-accent-subtle)",
                          color: "var(--color-accent)",
                        }}
                      >
                        <Icon size={13} />
                      </div>
                    </div>
                    <p
                      className="text-[22px] font-bold tracking-tight"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {k.value}
                    </p>
                    <p
                      className="text-[11px] mt-1 font-medium"
                      style={{
                        color:
                          k.changeType === "up"
                            ? "var(--color-success)"
                            : "var(--color-danger)",
                      }}
                    >
                      {k.changeType === "up" ? "▲" : "▼"} {k.change}
                    </p>
                  </div>
                );
              })}
            </div>
          </QueryState>

          {/* Revenue chart — passes live series, falls back to mock internally */}
          <Card>
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div>
                <p
                  className="text-[14px] font-semibold"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  Revenue over time
                </p>
                <p
                  className="text-[12px]"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {period.label}
                </p>
              </div>
              <div
                className="flex rounded-lg border overflow-hidden"
                style={{ borderColor: "var(--color-border-md)" }}
              >
                {METRIC_OPTS.map((m) => {
                  const active = metric === m.key;
                  return (
                    <button
                      key={m.key}
                      onClick={() => setMetric(m.key)}
                      className="px-3 h-7 text-[11px] font-semibold transition-colors border-r last:border-0"
                      style={{
                        background: active
                          ? "var(--color-accent-subtle)"
                          : "white",
                        color: active
                          ? "var(--color-accent-text)"
                          : "var(--color-text-secondary)",
                        borderColor: "var(--color-border)",
                      }}
                    >
                      {m.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <RevenueChart period={period} metric={metric} series={revSeries} />
          </Card>

          {/* Order volume + Category donut */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card>
              <p
                className="text-[14px] font-semibold mb-1"
                style={{ color: "var(--color-text-primary)" }}
              >
                Order volume
              </p>
              <p
                className="text-[12px] mb-4"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Current vs previous period
              </p>
              {/* <OrderVolumeChart period={period} currSeries={revSeries} /> */}
              
              <p className="flex text-center font-bold text-gray w-full justify-center items-center my-auto py-8">Coming Soon</p>
            </Card>
            <Card>
              <p
                className="text-[14px] font-semibold mb-4"
                style={{ color: "var(--color-text-primary)" }}
              >
                Revenue by category
              </p>
              <CategoryDonut breakdown={categoryData?.categories ?? null} />
            </Card>
          </div>

          {/* Order status distribution */}
          <Card>
            <p
              className="text-[14px] font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              Order status distribution
            </p>
            {statusDist ? (
              <div className="space-y-3">
                {statusDist.map((s) => {
                  const pct =
                    totalOrders > 0
                      ? Math.round((s.count / totalOrders) * 100)
                      : 0;
                  return (
                    <div key={s.label}>
                      <div className="flex items-center justify-between text-[12px] mb-1.5">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ background: s.color }}
                          />
                          <span
                            style={{ color: "var(--color-text-secondary)" }}
                          >
                            {s.label}
                          </span>
                        </div>
                        <div className="flex gap-3 items-center">
                          <span
                            className="font-semibold"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {s.count.toLocaleString()}
                          </span>
                          <span
                            className="w-8 text-right"
                            style={{ color: "var(--color-text-tertiary)" }}
                          >
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div
                        className="h-2 rounded-full overflow-hidden"
                        style={{ background: "var(--color-bg)" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: s.color }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <SkeletonCard rows={5} />
            )}
          </Card>
        </div>
      )}

      {/* ─── PRODUCTS TAB ─── */}
      {tab === "products" && (
        <div className="space-y-5">
          <Card noPadding>
            <div
              className="px-5 py-4 border-b"
              style={{ borderColor: "var(--color-border)" }}
            >
              <p
                className="text-[14px] font-semibold"
                style={{ color: "var(--color-text-primary)" }}
              >
                Product performance
              </p>
              <p
                className="text-[12px] mt-0.5"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Click any row to expand variant breakdown · sparkline = 12-week
                unit trend
              </p>
            </div>
            <TopProductsTable product_performance={productData} />
          </Card>
          <Card>
            <p
              className="text-[14px] font-semibold mb-4"
              style={{ color: "var(--color-text-primary)" }}
            >
              Revenue share by category
            </p>
            <CategoryDonut breakdown={categoryData?.categories ?? null} />
          </Card>
        </div>
      )}

      {/* ─── VARIANTS TAB ─── */}
      {/* {tab === "variants" && (
        <div className="space-y-5">
          <Card>
            <div className="mb-4">
              <p className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>Variant popularity heatmap</p>
              <p className="text-[12px] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
                Each cell shows units sold for that option combination. Darker = higher demand.
              </p>
            </div>
            <VariantHeatmap />
          </Card>
          <Card>
            <p className="text-[14px] font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>High return rate variants</p>
            <p className="text-[12px] mb-4" style={{ color: "var(--color-text-tertiary)" }}>
              Variants with a return rate above 10% — review sizing, descriptions or quality.
            </p>
            <div className="space-y-2">
              {[
                { product: "Linen Shirt",   variant: "Terracotta / Small", rate: 19.2, emoji: "👔" },
                { product: "Linen Shirt",   variant: "Beige / Large",      rate: 14.7, emoji: "👔" },
                { product: "Linen Shirt",   variant: "White / Medium",     rate: 13.2, emoji: "👔" },
                { product: "Studio Buds X", variant: "Rose Gold",          rate: 8.1,  emoji: "🎧" },
                { product: "Studio Buds X", variant: "Pearl White",        rate: 7.6,  emoji: "🎧" },
              ].map((v, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
                  style={{
                    borderColor: v.rate >= 15 ? "var(--color-danger)"  : v.rate >= 10 ? "var(--color-warning)" : "var(--color-border)",
                    background:  v.rate >= 15 ? "var(--color-danger-bg)" : v.rate >= 10 ? "var(--color-warning-bg)" : "transparent",
                  }}>
                  <span className="text-xl">{v.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>{v.product}</p>
                    <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{v.variant}</p>
                  </div>
                  <span className="text-[13px] font-bold"
                    style={{ color: v.rate >= 15 ? "var(--color-danger)" : v.rate >= 10 ? "var(--color-warning)" : "var(--color-text-secondary)" }}>
                    {v.rate}%
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )} */}

      {/* ─── CUSTOMERS TAB ─── */}
      {tab === "customers" && <CustomerMetrics />}
    </div>
  );
}

// "use client";

// import { useState } from "react";
// import { Download, DollarSign, ShoppingCart, TrendingUp, BarChart2 } from "lucide-react";
// import { Card, PageHeader, Button } from "@/components/ui";
// import { PeriodPicker } from "@/components/sales/PeriodPicker";
// import { RevenueChart } from "@/components/sales/RevenueChart";
// import { OrderVolumeChart } from "@/components/sales/OrderVolumeChart";
// import { CategoryDonut } from "@/components/sales/CategoryDonut";
// import { TopProductsTable } from "@/components/sales/TopProductsTable";
// import { VariantHeatmap } from "@/components/sales/VariantHeatmap";
// import { CustomerMetrics } from "@/components/sales/CustomerMetrics";
// import { computeKpis, PERIODS, ORDER_STATUS_DIST } from "@/lib/analytics-data";

// const TABS = [
//   { key: "overview",  label: "Overview"  },
//   { key: "products",  label: "Products"  },
//   { key: "variants",  label: "Variants"  },
//   { key: "customers", label: "Customers" },
// ];

// const METRIC_OPTS = [
//   { key: "revenue", label: "Revenue",    icon: DollarSign  },
//   { key: "orders",  label: "Orders",     icon: ShoppingCart },
//   { key: "aov",     label: "Avg. order", icon: BarChart2   },
// ];

// export default function SalesPage() {
//   const [tab,    setTab]    = useState("overview");
//   const [period, setPeriod] = useState(PERIODS[1]); // 30D default
//   const [metric, setMetric] = useState("revenue");

//   const kpis = computeKpis(period);
//   const totalOrders = ORDER_STATUS_DIST.reduce((s, d) => s + d.count, 0);

//   return (
//     <div>
//       {/* Header */}
//       <PageHeader
//         title="Analytics"
//         description="Store performance, growth and product insights"
//         action={
//           <Button variant="secondary" size="sm">
//             <Download size={13} /> Export
//           </Button>
//         }
//       />

//       {/* Global period picker */}
//       <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
//         {/* Tabs */}
//         <div className="flex gap-1 border rounded-xl p-1" style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}>
//           {TABS.map((t) => (
//             <button key={t.key} onClick={() => setTab(t.key)}
//               className="px-3 py-1.5 rounded-lg text-[13px] font-medium transition-all"
//               style={{
//                 background: tab === t.key ? "white" : "transparent",
//                 color:      tab === t.key ? "var(--color-text-primary)" : "var(--color-text-secondary)",
//                 boxShadow:  tab === t.key ? "0 1px 3px rgba(0,0,0,0.07)" : "none",
//               }}>
//               {t.label}
//             </button>
//           ))}
//         </div>

//         <PeriodPicker value={period} onChange={setPeriod} include12M />
//       </div>

//       {/* ─── OVERVIEW TAB ─── */}
//       {tab === "overview" && (
//         <div className="space-y-5">

//           {/* KPI cards */}
//           <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
//             {kpis.map((k) => {
//               const Icon = k.key === "revenue" ? DollarSign : k.key === "orders" ? ShoppingCart : k.key === "aov" ? BarChart2 : TrendingUp;
//               return (
//                 <div key={k.key} className="bg-white rounded-xl border p-4" style={{ borderColor: "var(--color-border)" }}>
//                   <div className="flex items-start justify-between mb-2">
//                     <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: "var(--color-text-tertiary)" }}>
//                       {k.label}
//                     </p>
//                     <div className="w-7 h-7 rounded-lg flex items-center justify-center"
//                       style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent)" }}>
//                       <Icon size={13} />
//                     </div>
//                   </div>
//                   <p className="text-[22px] font-bold tracking-tight" style={{ color: "var(--color-text-primary)" }}>
//                     {k.value}
//                   </p>
//                   <p className="text-[11px] mt-1 font-medium"
//                     style={{ color: k.changeType === "up" ? "var(--color-success)" : "var(--color-danger)" }}>
//                     {k.changeType === "up" ? "▲" : "▼"} {k.change}
//                   </p>
//                 </div>
//               );
//             })}
//           </div>

//           {/* Revenue chart */}
//           <Card>
//             <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
//               <div>
//                 <p className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
//                   Revenue over time
//                 </p>
//                 <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
//                   {period.label}
//                 </p>
//               </div>
//               {/* Metric selector */}
//               <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "var(--color-border-md)" }}>
//                 {METRIC_OPTS.map((m) => {
//                   const active = metric === m.key;
//                   return (
//                     <button key={m.key} onClick={() => setMetric(m.key)}
//                       className="px-3 h-7 text-[11px] font-semibold transition-colors border-r last:border-0"
//                       style={{
//                         background:  active ? "var(--color-accent-subtle)" : "white",
//                         color:       active ? "var(--color-accent-text)"   : "var(--color-text-secondary)",
//                         borderColor: "var(--color-border)",
//                       }}>
//                       {m.label}
//                     </button>
//                   );
//                 })}
//               </div>
//             </div>
//             <RevenueChart period={period} metric={metric} />
//           </Card>

//           {/* Order volume + Category donut */}
//           <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
//             <Card>
//               <p className="text-[14px] font-semibold mb-1" style={{ color: "var(--color-text-primary)" }}>
//                 Order volume
//               </p>
//               <p className="text-[12px] mb-4" style={{ color: "var(--color-text-tertiary)" }}>
//                 Current vs previous period
//               </p>
//               <OrderVolumeChart period={period} />
//             </Card>

//             <Card>
//               <p className="text-[14px] font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
//                 Revenue by category
//               </p>
//               <CategoryDonut />
//             </Card>
//           </div>

//           {/* Order status breakdown */}
//           <Card>
//             <p className="text-[14px] font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
//               Order status distribution
//             </p>
//             <div className="space-y-3">
//               {ORDER_STATUS_DIST.map((s) => {
//                 const pct = Math.round((s.count / totalOrders) * 100);
//                 return (
//                   <div key={s.label}>
//                     <div className="flex items-center justify-between text-[12px] mb-1.5">
//                       <div className="flex items-center gap-2">
//                         <div className="w-2 h-2 rounded-full" style={{ background: s.color }} />
//                         <span style={{ color: "var(--color-text-secondary)" }}>{s.label}</span>
//                       </div>
//                       <div className="flex gap-3 items-center">
//                         <span className="font-semibold" style={{ color: "var(--color-text-primary)" }}>
//                           {s.count.toLocaleString()}
//                         </span>
//                         <span className="w-8 text-right" style={{ color: "var(--color-text-tertiary)" }}>{pct}%</span>
//                       </div>
//                     </div>
//                     <div className="h-2 rounded-full overflow-hidden" style={{ background: "var(--color-bg)" }}>
//                       <div className="h-full rounded-full transition-all duration-700"
//                         style={{ width: `${pct}%`, background: s.color }} />
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </Card>
//         </div>
//       )}

//       {/* ─── PRODUCTS TAB ─── */}
//       {tab === "products" && (
//         <div className="space-y-5">
//           <Card noPadding>
//             <div className="px-5 py-4 border-b" style={{ borderColor: "var(--color-border)" }}>
//               <p className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
//                 Product performance
//               </p>
//               <p className="text-[12px] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
//                 Click any row to expand variant breakdown · sparkline = 12-week unit trend
//               </p>
//             </div>
//             <TopProductsTable />
//           </Card>

//           {/* Category revenue breakdown below table */}
//           <Card>
//             <p className="text-[14px] font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
//               Revenue share by category
//             </p>
//             <CategoryDonut />
//           </Card>
//         </div>
//       )}

//       {/* ─── VARIANTS TAB ─── */}
//       {tab === "variants" && (
//         <div className="space-y-5">
//           <Card>
//             <div className="mb-4">
//               <p className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
//                 Variant popularity heatmap
//               </p>
//               <p className="text-[12px] mt-0.5" style={{ color: "var(--color-text-tertiary)" }}>
//                 Each cell shows units sold for that option combination. Darker = higher demand.
//               </p>
//             </div>
//             <VariantHeatmap />
//           </Card>

//           {/* Variant return rates callout */}
//           <Card>
//             <p className="text-[14px] font-semibold mb-4" style={{ color: "var(--color-text-primary)" }}>
//               High return rate variants
//             </p>
//             <p className="text-[12px] mb-4" style={{ color: "var(--color-text-tertiary)" }}>
//               Variants with a return rate above 10% — review sizing guides, descriptions or quality.
//             </p>
//             <div className="space-y-2">
//               {[
//                 { product: "Linen Shirt", variant: "Terracotta / Small", rate: 19.2, emoji: "👔" },
//                 { product: "Linen Shirt", variant: "Beige / Large",      rate: 14.7, emoji: "👔" },
//                 { product: "Linen Shirt", variant: "White / Medium",     rate: 13.2, emoji: "👔" },
//                 { product: "Studio Buds X", variant: "Rose Gold",        rate: 8.1,  emoji: "🎧" },
//                 { product: "Studio Buds X", variant: "Pearl White",      rate: 7.6,  emoji: "🎧" },
//               ].map((v, i) => (
//                 <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl border"
//                   style={{ borderColor: v.rate >= 15 ? "var(--color-danger)" : v.rate >= 10 ? "var(--color-warning)" : "var(--color-border)", background: v.rate >= 15 ? "var(--color-danger-bg)" : v.rate >= 10 ? "var(--color-warning-bg)" : "transparent" }}>
//                   <span className="text-xl">{v.emoji}</span>
//                   <div className="flex-1 min-w-0">
//                     <p className="text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>{v.product}</p>
//                     <p className="text-[11px]" style={{ color: "var(--color-text-secondary)" }}>{v.variant}</p>
//                   </div>
//                   <span className="text-[13px] font-bold"
//                     style={{ color: v.rate >= 15 ? "var(--color-danger)" : v.rate >= 10 ? "var(--color-warning)" : "var(--color-text-secondary)" }}>
//                     {v.rate}%
//                   </span>
//                 </div>
//               ))}
//             </div>
//           </Card>
//         </div>
//       )}

//       {/* ─── CUSTOMERS TAB ─── */}
//       {tab === "customers" && <CustomerMetrics />}
//     </div>
//   );
// }

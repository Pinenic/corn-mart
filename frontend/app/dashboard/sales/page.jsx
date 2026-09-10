"use client";
import { useState } from "react";
import Link from "next/link";
import { DollarSign, ShoppingBag, Heart, TrendingUp, BarChart3 } from "lucide-react";
import { PageHeader } from "@/components/ui";
import { PeriodPicker } from "@/components/sales/PeriodPicker";
import { SalesKpiCard } from "@/components/sales/SalesKpiCard";
import { SalesRevenueChart } from "@/components/sales/SalesRevenueChart";
import { SalesCategoryDonut } from "@/components/sales/SalesCategoryDonut";
import { SalesRecentOrders } from "@/components/sales/SalesRecentOrders";
import { SalesTopProducts } from "@/components/sales/SalesTopProducts";
import { SalesActivityFeed } from "@/components/sales/SalesActivityFeed";
import { PERIODS } from "@/lib/analytics-data";
import { formatPrice } from "@/lib/utils";
import { useProfile } from "@/lib/store/useProfile";
import {
  useAnalyticsOverview,
  useRevenueSeries,
  useSalesSeries,
  useFollowerGrowth,
  useCategoryBreakdown,
  useProductPerformance,
  useRecentOrders,
  useActivityFeed,
} from "@/lib/hooks/useAnalytics";

export default function SalesPage() {
  const [period, setPeriod] = useState(PERIODS[1]); // default 30 days
  const periodKey = period.key.toLowerCase();

  const { profile } = useProfile();
  const { data: overview } = useAnalyticsOverview({ period: periodKey });
  const { data: revSeries } = useRevenueSeries({ period: periodKey });
  const { data: salesSeries } = useSalesSeries({ period: periodKey });
  const { data: followerSeries } = useFollowerGrowth({ period: periodKey });
  const { data: categoryData } = useCategoryBreakdown({ period: periodKey });
  const { data: productData } = useProductPerformance({ period: periodKey });
  const { data: recentOrders } = useRecentOrders({ limit: 5 });
  const { data: activity } = useActivityFeed({ limit: 8 });

  // Sparkline series need a plain {x,y} shape — reuse whatever daily
  // series already exists for each metric rather than fetching more.
  const toSpark = (arr, key) => (arr ?? []).map((d, i) => ({ x: i, y: d[key] ?? 0 }));

  const firstName = profile?.full_name?.split(" ")[0] ?? "there";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* ── Greeting header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--color-text-primary)]">
            Hello, {firstName} 👋
          </h1>
          <p className="text-[13px] text-[var(--color-text-secondary)] mt-0.5">
            Here&apos;s what&apos;s happening in your store this {period.label.includes("day") ? "period" : "month"}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <PeriodPicker value={period} onChange={setPeriod} include12M />
          {/* <Link
            href="/dashboard/insights"
            className="h-9 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] text-[12px] font-semibold text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)] transition-colors flex items-center gap-1.5"
          >
            <BarChart3 size={13} />
            Deeper insights
          </Link> */}
        </div>
      </div>

      {/* ── KPI cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SalesKpiCard
          label="Total Revenue"
          value={formatPrice(overview?.revenue?.current ?? 0)}
          changePct={overview?.revenue?.change_pct}
          sparkline={toSpark(revSeries, "revenue")}
          icon={DollarSign}
          accent="#1b5e35"
        />
        <SalesKpiCard
          label="Total Orders"
          value={String(overview?.orders?.current ?? 0)}
          changePct={overview?.orders?.change_pct}
          sparkline={toSpark(revSeries, "orders")}
          icon={ShoppingBag}
          accent="#f5a623"
        />
        <SalesKpiCard
          label="New Followers"
          value={String(overview?.followers?.current ?? 0)}
          changePct={overview?.followers?.change_pct}
          sparkline={toSpark(followerSeries, "new_followers")}
          icon={Heart}
          accent="#4caf50"
        />
        <SalesKpiCard
          label="Total Sales"
          value={formatPrice(overview?.total_sales?.current ?? 0)}
          changePct={overview?.total_sales?.change_pct}
          sparkline={toSpark(salesSeries, "sales")}
          icon={TrendingUp}
          accent="#2a7a47"
        />
      </div>

      {/* ── Revenue chart + Category donut ── */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        <SalesRevenueChart series={revSeries ?? []} />
        <SalesCategoryDonut categories={categoryData?.categories ?? []} />
      </div>

      {/* ── Recent orders / Top products / Activity feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SalesRecentOrders orders={recentOrders ?? []} />
        <SalesTopProducts products={productData?.products ?? []} />
        <SalesActivityFeed events={activity?.events ?? []} stockAlerts={activity?.stock_alerts ?? []} />
      </div>
    </div>
  );
}
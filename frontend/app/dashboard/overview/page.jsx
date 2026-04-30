"use client";

import {
  ShoppingBag, ClipboardList, DollarSign, TrendingUp, Users,
} from "lucide-react";
import Link from "next/link";
import {
  Card, SectionHeader, Badge, KpiCard,
} from "@/components/ui";
import {
  QueryState, SkeletonKpiGrid, SkeletonCard, SkeletonTable,
} from "@/components/ui/QueryState";
import { useAnalyticsOverview } from "@/lib/hooks/useAnalytics";
import { useOrders }            from "@/lib/hooks/useOrders";

const STATUS_VARIANT = {
  Delivered:  "success",
  Shipping:   "warning",
  Processing: "info",
  Pending:    "warning",
  Cancelled:  "danger",
  Refunded:   "danger",
};

const BAR_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const BAR_HEIGHTS = [42, 68, 52, 84, 73, 96, 78];

export default function OverviewPage() {
  // ── Live KPIs ─────────────────────────────────────────────
  const {
    data:       kpiData,
    isLoading:  kpiLoading,
    error:      kpiError,
    mutate:     kpiMutate,
  } = useAnalyticsOverview({ period: "30d" });

  //  console.log(kpiData);

  // ── Recent orders ─────────────────────────────────────────
  const {
    data:      ordersData,
    isLoading: ordersLoading,
    error:     ordersError,
    mutate:    ordersMutate,
  } = useOrders({ limit: 5, sort: "created_at", order: "desc" });

  // Build KPI card props from live data, falling back to skeleton state
  const kpis = kpiData
    ? [
        {
          label:      "Revenue",
          value:      `K${(kpiData.revenue?.current ?? 0).toLocaleString()}`,
          change:     `${Math.abs(kpiData.revenue?.change_pct ?? 0)}% vs last period`,
          changeType: (kpiData.revenue?.change_pct ?? 0) >= 0 ? "up" : "down",
          icon:       DollarSign,
        },
        {
          label:      "Orders",
          value:      (kpiData.orders?.current ?? 0).toLocaleString(),
          change:     `${Math.abs(kpiData.orders?.change_pct ?? 0)}% vs last period`,
          changeType: (kpiData.orders?.change_pct ?? 0) >= 0 ? "up" : "down",
          icon:       ClipboardList,
        },
        {
          label:      "Avg. order value",
          value:      `K${kpiData.aov?.current ?? 0}`,
          change:     `K${Math.abs((kpiData.aov?.current ?? 0) - (kpiData.aov?.previous ?? 0))} vs last period`,
          changeType: (kpiData.aov?.change_pct ?? 0) >= 0 ? "up" : "down",
          icon:       TrendingUp,
        },
        {
          label:      "Conversion rate",
          value:      "3.8%",
          change:     "Live data coming soon",
          changeType: "up",
          icon:       Users,
        },
      ]
    : null;

  const recentOrders = ordersData ?? [];
  // console.log(recentOrders);

  return (
    <div>
      {/* KPI grid */}
      <div className="mb-6">
        <QueryState
          isLoading={kpiLoading}
          error={kpiError}
          onRetry={kpiMutate}
          skeleton={<SkeletonKpiGrid count={4} />}
        >
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {kpis?.map((k) => <KpiCard key={k.label} {...k} />)}
          </div>
        </QueryState>
      </div>

      {/* Revenue sparkline — static placeholder until chart data is wired */}
      <Card className="mb-6">
        <SectionHeader title="Revenue — last 7 days" linkLabel="Full report →" />
        <div className="flex items-end gap-2 h-[100px] mt-4">
          {BAR_HEIGHTS.map((h, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
              <div
                className="w-full rounded-t-md transition-opacity hover:opacity-80"
                style={{
                  height:     `${h}%`,
                  background: i === 5
                    ? "var(--color-accent)"
                    : "var(--color-accent-subtle)",
                }}
              />
              <span className="text-[10px]" style={{ color: "var(--color-text-tertiary)" }}>
                {BAR_DAYS[i]}
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* Recent orders */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[13.5px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
          Recent orders
        </h3>
        <Link
          href="/orders"
          className="text-[12px] font-medium transition-opacity hover:opacity-70"
          style={{ color: "var(--color-accent)" }}
        >
          View all →
        </Link>
      </div>

      <QueryState
        isLoading={ordersLoading}
        error={ordersError}
        onRetry={ordersMutate}
        isEmpty={!ordersLoading && recentOrders.length === 0}
        emptyTitle="No orders yet"
        emptyDesc="Orders will appear here once customers start purchasing."
        skeleton={<SkeletonTable rows={5} cols={4} />}
      >
        <Card noPadding>
          <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="cursor-pointer transition-colors duration-150 hover:bg-[var(--color-bg)] px-4 py-3"
                // className="flex items-center gap-3 px-4 py-3 transition-colors duration-150 cursor-pointer hover:bg-[var(--color-bg)]"
              >
                <div className="md:hidden flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                    // style={{ background: order.customer.avatar_url, color: order.customer.avatarColor }}
                  >
                    <img src={order.customer.avatar_url} alt="avatar" className="rounded-full"/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-[12px] font-semibold" style={{ color: "var(--color-accent-text)" }}>
                      #STO-{String(order.id || "")
                      .slice(0, 3)
                      .toUpperCase()}
                      </span>
                      <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>{order.status}</Badge>
                    </div>
                    <p className="text-[13px] font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                      {order.customer.full_name}
                    </p>
                    <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                      {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {" · "}{order.order_items?.length} item{order.order_items?.length !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                      K{order.subtotal.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div
                  className="hidden md:grid items-center"
                  style={{ gridTemplateColumns: "100px 1fr 120px 110px 90px 32px" }}
                >
                  <span className="text-[12px] font-semibold" style={{ color: "var(--color-accent-text)" }}>
                    #STO-{String(order.id || "")
                      .slice(0, 3)
                      .toUpperCase()}
                  </span>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                      style={{ background: order.customer.avatar_url, color: order.customer.avatarColor }}
                    >
                      <img src={order.customer.avatar_url} alt="avatar" className="rounded-full"/>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
                        {order.customer.full_name}
                      </p>
                      <p className="text-[11px] truncate" style={{ color: "var(--color-text-tertiary)" }}>
                        {order.customer.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
                    {new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>{order.status}</Badge>
                  <span className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
                    K{order.subtotal.toFixed(2)}
                  </span>
                  <span className="text-[18px] text-center" style={{ color: "var(--color-text-tertiary)" }}>›</span>
                </div>
                {/* <span
                  className="text-[12px] font-semibold min-w-[56px]"
                  style={{ color: "var(--color-accent-text)" }}
                >
                  #{order.id}
                </span>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-[13px] font-medium truncate"
                    style={{ color: "var(--color-text-primary)" }}
                  >
                    {order.buyer_id ?? "Customer"}
                  </p>
                  <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                    {new Date(order.created_at).toLocaleDateString("en-US", {
                      month: "short", day: "numeric",
                    })}
                  </p>
                </div>
                <Badge variant={STATUS_VARIANT[order.status] ?? "default"}>
                  {order.status}
                </Badge>
                <span
                  className="text-[13px] font-semibold ml-2"
                  style={{ color: "var(--color-text-primary)" }}
                >
                  K{Number(order.subtotal).toFixed(2)}
                </span> */}
              </div>
            ))}
          </div>
        </Card>
      </QueryState>
    </div>
  );
}
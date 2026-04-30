"use client";
// lib/hooks/useAnalytics.js

import { useApi } from "./useApi";
import useAuthStore from "@/lib/store/useAuthStore";

// Shared helper — builds the params object for analytics endpoints
function analyticsParams(period, dateFrom, dateTo) {
  return {
    period: period ?? "30d",
    dateFrom: dateFrom ?? undefined,
    dateTo: dateTo ?? undefined,
  };
}

// ── Overview KPIs ─────────────────────────────────────────────
// Returns { revenue, orders, aov } each with { current, previous, change_pct }
export function useAnalyticsOverview({ period, dateFrom, dateTo } = {}) {
  // for testing console.log("firing...")
  const storeId = useAuthStore((s) => s.storeId);
  const path = storeId ? `/stores/${storeId}/analytics/overview` : null;

  return useApi(path, analyticsParams(period, dateFrom, dateTo));
}

// ── Revenue time series ────────────────────────────────────────
// Returns array of { date, revenue, orders }
export function useRevenueSeries({ period, dateFrom, dateTo } = {}) {
  const storeId = useAuthStore((s) => s.storeId);
  const path = storeId ? `/stores/${storeId}/analytics/revenue` : null;

  return useApi(path, analyticsParams(period, dateFrom, dateTo));
}

// ── Orders by status ──────────────────────────────────────────
// Returns { pending, processing, shipped, delivered, cancelled, refunded }
export function useOrdersByStatus() {
  const storeId = useAuthStore((s) => s.storeId);
  const path = storeId ? `/stores/${storeId}/analytics/orders-by-status` : null;

  // Status counts don't need period filtering — they're lifetime totals
  return useApi(path);
}

// ── Product performance ────────────────────────────────────────
export function useProductPerformance({ period, dateFrom, dateTo } = {}) {
  const storeId = useAuthStore((s) => s.storeId);
  const path = storeId ? `/stores/${storeId}/analytics/products` : null;

  return useApi(path, analyticsParams(period, dateFrom, dateTo));
}

// ── Follower growth ────────────────────────────────────────────
export function useFollowerGrowth({ period } = {}) {
  const storeId = useAuthStore((s) => s.storeId);
  const path = storeId ? `/stores/${storeId}/analytics/followers` : null;

  return useApi(path, { period: period ?? "30d" });
}

// ── Category breakdown ────────────────────────────────────────
export function useCategoryBreakdown({ period, dateFrom, dateTo } = {}) {
  const storeId = useAuthStore((s) => s.storeId);
  const path = storeId ? `/stores/${storeId}/analytics/categories` : null;

  return useApi(path, analyticsParams(period, dateFrom, dateTo));
}

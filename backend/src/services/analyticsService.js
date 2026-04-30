// src/services/analyticsService.js
// All analytics queries for the Sales / Analytics dashboard feature.
// Uses supabaseAdmin for aggregations that cross ownership boundaries.
//
// Performance note:
// These queries hit the database on every request. For production,
// consider:
//   1. Caching results in Redis with a 5–15 min TTL
//   2. Running nightly aggregations into a summary table
//   3. Supabase Edge Functions for heavy computations

import { supabaseAdmin } from "../config/supabase.js";

// Build a date range from a period shorthand or explicit dates
function buildDateRange(period, dateFrom, dateTo) {
  if (dateFrom && dateTo) {
    return { from: new Date(dateFrom), to: new Date(dateTo) };
  }
  const to = new Date();
  const from = new Date();
  switch (period) {
    case "7d":
      from.setDate(to.getDate() - 7);
      break;
    case "90d":
      from.setDate(to.getDate() - 90);
      break;
    case "12m":
      from.setMonth(to.getMonth() - 12);
      break;
    default:
      from.setDate(to.getDate() - 30); // 30d
  }
  return { from, to };
}

const analyticsService = {
  // ── Overview KPIs ──────────────────────────────────────────

  async getOverview(storeId, { period, dateFrom, dateTo }) {
    const { from, to } = buildDateRange(period, dateFrom, dateTo);
    const prevFrom = new Date(from);
    prevFrom.setDate(prevFrom.getDate() - (to - from) / 86400000);

    // Current period
    const { data: curr, error } = await supabaseAdmin
      .from("store_orders")
      .select("subtotal, status, created_at")
      .eq("store_id", storeId)
      .neq("status", "cancelled")
      .neq("status", "refunded")
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString());

    if (error) throw error;

    // Previous period (for % change)
    const { data: prev } = await supabaseAdmin
      .from("store_orders")
      .select("subtotal, status, created_at")
      .eq("store_id", storeId)
      .neq("status", "cancelled")
      .neq("status", "refunded")
      .gte("created_at", prevFrom.toISOString())
      .lt("created_at", from.toISOString());

    const sumRevenue = (arr) => arr.reduce((s, o) => s + Number(o.subtotal), 0);
    const currRevenue = sumRevenue(curr || []);
    const prevRevenue = sumRevenue(prev || []);
    const currOrders = (curr || []).length;
    const prevOrders = (prev || []).length;
    const currAov = currOrders ? currRevenue / currOrders : 0;
    const prevAov = prevOrders ? prevRevenue / prevOrders : 0;

    const pct = (a, b) => (b === 0 ? 0 : ((a - b) / b) * 100);

    return {
      revenue: {
        current: Math.round(currRevenue * 100) / 100,
        previous: Math.round(prevRevenue * 100) / 100,
        change_pct: Math.round(pct(currRevenue, prevRevenue) * 10) / 10,
      },
      orders: {
        current: currOrders,
        previous: prevOrders,
        change_pct: Math.round(pct(currOrders, prevOrders) * 10) / 10,
      },
      aov: {
        current: Math.round(currAov * 100) / 100,
        previous: Math.round(prevAov * 100) / 100,
        change_pct: Math.round(pct(currAov, prevAov) * 10) / 10,
      },
    };
  },

  // ── Revenue time series ────────────────────────────────────

  async getRevenueSeries(storeId, { period, dateFrom, dateTo }) {
    const { from, to } = buildDateRange(period, dateFrom, dateTo);

    const { data, error } = await supabaseAdmin
      .from("store_orders")
      .select("subtotal, created_at")
      .eq("store_id", storeId)
      .neq("status", "cancelled")
      .neq("status", "refunded")
      .gte("created_at", from.toISOString())
      .lte("created_at", to.toISOString())
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Group by day
    const grouped = {};
    (data || []).forEach((o) => {
      const day = o.created_at.split("T")[0];
      if (!grouped[day]) grouped[day] = { date: day, revenue: 0, orders: 0 };
      grouped[day].revenue += Number(o.subtotal);
      grouped[day].orders++;
    });

    // Fill in missing days with zeros
    const series = [];
    const cursor = new Date(from);
    while (cursor <= to) {
      const day = cursor.toISOString().split("T")[0];
      series.push(grouped[day] || { date: day, revenue: 0, orders: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    return series;
  },

  // ── Orders by status ───────────────────────────────────────

  async getOrdersByStatus(storeId) {
    const { data, error } = await supabaseAdmin
      .from("store_orders")
      .select("status")
      .eq("store_id", storeId);

    if (error) throw error;

    const counts = {};
    (data || []).forEach((o) => {
      counts[o.status] = (counts[o.status] || 0) + 1;
    });
    return counts;
  },

  // ── Product performance ────────────────────────────────────
  // Aggregates revenue and units sold per product using the order_items table.
  // Returns the top products by revenue for the requested period.

  async getProductPerformance(storeId, { period, dateFrom, dateTo }) {
    const { from, to } = buildDateRange(period, dateFrom, dateTo);

    // Join order_items → store_orders (to filter by store + date) → products
    const { data, error } = await supabaseAdmin
      .from("order_items")
      .select(
        `
        quantity,
        unit_price,
        subtotal,
        product:product_id (
          id, name, thumbnail_url, category
        ),
        store_order:store_order_id (
          store_id,
          status,
          created_at
        )
      `
      )
      .eq("store_order.store_id", storeId)
      .neq("store_order.status", "cancelled")
      .neq("store_order.status", "refunded")
      .gte("store_order.created_at", from.toISOString())
      .lte("store_order.created_at", to.toISOString());

    if (error) throw error;

    // Aggregate by product_id
    const productMap = {};
    (data || []).forEach((item) => {
      if (!item.product) return; // guard against deleted products
      const pid = item.product.id;
      if (!productMap[pid]) {
        productMap[pid] = {
          product_id: pid,
          name: item.product.name,
          thumbnail_url: item.product.thumbnail_url,
          category: item.product.category,
          units_sold: 0,
          revenue: 0,
          order_count: 0,
        };
      }
      productMap[pid].units_sold += item.quantity;
      productMap[pid].revenue += Number(item.subtotal ?? 0);
      productMap[pid].order_count += 1;
    });

    // Sort by revenue descending, return top 20
    const products = Object.values(productMap)
      .map((p) => ({ ...p, revenue: Math.round(p.revenue * 100) / 100 }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 20);

    return {
      products,
      period_from: from.toISOString(),
      period_to: to.toISOString(),
    };
  },

  // ── Follower growth ────────────────────────────────────────

  async getFollowerGrowth(storeId, { period }) {
    const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const from = new Date();
    from.setDate(from.getDate() - days);

    const { data, error } = await supabaseAdmin
      .from("store_follows")
      .select("created_at")
      .eq("store_id", storeId)
      .gte("created_at", from.toISOString())
      .order("created_at", { ascending: true });

    if (error) throw error;

    // Group by day
    const grouped = {};
    (data || []).forEach((f) => {
      const day = f.created_at.split("T")[0];
      grouped[day] = (grouped[day] || 0) + 1;
    });

    const series = [];
    const cursor = new Date(from);
    const today = new Date();
    while (cursor <= today) {
      const day = cursor.toISOString().split("T")[0];
      series.push({ date: day, new_followers: grouped[day] || 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    return series;
  },

  // ── Category revenue breakdown ─────────────────────────────
  // Aggregates revenue per product category using the order_items table.

  async getCategoryBreakdown(storeId, { period, dateFrom, dateTo }) {
    const { from, to } = buildDateRange(period, dateFrom, dateTo);

    const { data, error } = await supabaseAdmin
      .from("order_items")
      .select(
        `
        subtotal,
        product:product_id ( category ),
        store_order:store_order_id (
          store_id,
          status,
          created_at
        )
      `
      )
      .eq("store_order.store_id", storeId)
      .neq("store_order.status", "cancelled")
      .neq("store_order.status", "refunded")
      .gte("store_order.created_at", from.toISOString())
      .lte("store_order.created_at", to.toISOString());

    if (error) throw error;

    // Aggregate by category
    const categoryMap = {};
    let total = 0;

    (data || []).forEach((item) => {
      const cat = item.product?.category || "Uncategorised";
      const amount = Number(item.subtotal ?? 0);
      categoryMap[cat] = (categoryMap[cat] || 0) + amount;
      total += amount;
    });

    // Build sorted array with percentage share
    const categories = Object.entries(categoryMap)
      .map(([name, revenue]) => ({
        name,
        revenue: Math.round(revenue * 100) / 100,
        share_pct: total > 0 ? Math.round((revenue / total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      categories,
      total: Math.round(total * 100) / 100,
    };
  },
};

export default analyticsService;

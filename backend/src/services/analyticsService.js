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

const pct = (a, b) => (b === 0 ? 0 : ((a - b) / b) * 100);
const round2 = (n) => Math.round(n * 100) / 100;

// Shared: sum of order_items.subtotal for a store within a date range,
// via the same order_items → store_orders join used by
// getProductPerformance / getCategoryBreakdown. This is the basis for
// the "Total Sales" KPI — deliberately a distinct number from the
// revenue KPI (which sums store_orders.subtotal directly), per product
// sales rather than order totals. In most cases these will track each
// other closely, but they are not guaranteed to be identical (e.g. if
// order-level subtotal is ever adjusted independently of its line items).
async function sumOrderItemsRevenue(storeId, from, to) {
  const { data, error } = await supabaseAdmin
    .from("order_items")
    .select(
      `
      subtotal,
      store_order:store_order_id!inner (
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
  return (data || []).reduce((sum, item) => sum + Number(item.subtotal ?? 0), 0);
}

const analyticsService = {
  // ── Overview KPIs ──────────────────────────────────────────
  // Returns revenue, orders, aov (existing), plus total_sales and
  // followers — each as { current, previous, change_pct } so every
  // KPI card on the dashboard can render its headline number and
  // "vs last period" badge from a single request.

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

    // Total Sales — sum of order_items.subtotal, current vs previous period
    const [currSales, prevSales] = await Promise.all([
      sumOrderItemsRevenue(storeId, from, to),
      sumOrderItemsRevenue(storeId, prevFrom, from),
    ]);

    // New Followers — count of store_follows rows, current vs previous period
    const [{ count: currFollowers }, { count: prevFollowers }] = await Promise.all([
      supabaseAdmin
        .from("store_follows")
        .select("*", { count: "exact", head: true })
        .eq("store_id", storeId)
        .gte("created_at", from.toISOString())
        .lte("created_at", to.toISOString()),
      supabaseAdmin
        .from("store_follows")
        .select("*", { count: "exact", head: true })
        .eq("store_id", storeId)
        .gte("created_at", prevFrom.toISOString())
        .lt("created_at", from.toISOString()),
    ]);

    return {
      revenue: {
        current: round2(currRevenue),
        previous: round2(prevRevenue),
        change_pct: Math.round(pct(currRevenue, prevRevenue) * 10) / 10,
      },
      orders: {
        current: currOrders,
        previous: prevOrders,
        change_pct: Math.round(pct(currOrders, prevOrders) * 10) / 10,
      },
      aov: {
        current: round2(currAov),
        previous: round2(prevAov),
        change_pct: Math.round(pct(currAov, prevAov) * 10) / 10,
      },
      total_sales: {
        current: round2(currSales),
        previous: round2(prevSales),
        change_pct: Math.round(pct(currSales, prevSales) * 10) / 10,
      },
      followers: {
        current: currFollowers ?? 0,
        previous: prevFollowers ?? 0,
        change_pct: Math.round(pct(currFollowers ?? 0, prevFollowers ?? 0) * 10) / 10,
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

  // ── Total Sales time series (sparkline for the Total Sales KPI) ──
  // Same day-grouping shape as getRevenueSeries, but summed from
  // order_items.subtotal via the join — mirrors sumOrderItemsRevenue
  // but broken out by day instead of a single total.

  async getSalesSeries(storeId, { period, dateFrom, dateTo }) {
    const { from, to } = buildDateRange(period, dateFrom, dateTo);

    const { data, error } = await supabaseAdmin
      .from("order_items")
      .select(
        `
        subtotal,
        store_order:store_order_id!inner (
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

    const grouped = {};
    (data || []).forEach((item) => {
      const day = item.store_order?.created_at?.split("T")[0];
      if (!day) return;
      grouped[day] = (grouped[day] || 0) + Number(item.subtotal ?? 0);
    });

    const series = [];
    const cursor = new Date(from);
    while (cursor <= to) {
      const day = cursor.toISOString().split("T")[0];
      series.push({ date: day, sales: round2(grouped[day] || 0) });
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
        store_order:store_order_id!inner (
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
      .map((p) => ({ ...p, revenue: round2(p.revenue) }))
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
        store_order:store_order_id!inner (
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
        revenue: round2(revenue),
        share_pct: total > 0 ? Math.round((revenue / total) * 1000) / 10 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      categories,
      total: round2(total),
    };
  },

  // ── Recent orders ──────────────────────────────────────────
  // Powers the "Recent Orders" list on the redesigned dashboard.
  //
  // ASSUMPTION FLAGGED: customer_name is read from a `shipping_info`
  // JSONB column on store_orders (`shipping_info.name`), based on the
  // checkout flow's shape on the frontend I have visibility into. I
  // don't have the store_orders table schema directly — if the real
  // column name or shape differs, this mapping needs adjusting.

  async getRecentOrders(storeId, { limit = 5 } = {}) {
    const { data, error } = await supabaseAdmin
      .from("store_orders")
      .select("id, subtotal, status, created_at, shipping_info")
      .eq("store_id", storeId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return (data || []).map((o) => ({
      id: o.id,
      order_number: `#ORD-${o.id.slice(0, 4).toUpperCase()}`,
      customer_name: o.shipping_info?.name ?? "Customer",
      amount: round2(Number(o.subtotal ?? 0)),
      status: o.status,
      created_at: o.created_at,
    }));
  },

  // ── Activity feed ──────────────────────────────────────────
  // Built only from events that have real timestamps: new orders and
  // new followers. Deliberately does NOT include a "payment received"
  // event type — this platform has no payment gateway integration, so
  // that event never actually happens. Out-of-stock products have no
  // timestamp anywhere (products only carry a current stock count, not
  // a stock-change history) so they're returned separately as
  // `stock_alerts` rather than faked into the dated `events` list.

  async getActivityFeed(storeId, { limit = 8 } = {}) {
    const [{ data: orders }, { data: follows }, { data: products }] = await Promise.all([
      supabaseAdmin
        .from("store_orders")
        .select("id, subtotal, status, created_at, shipping_info")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabaseAdmin
        .from("store_follows")
        .select("created_at")
        .eq("store_id", storeId)
        .order("created_at", { ascending: false })
        .limit(limit),
      supabaseAdmin
        .from("products")
        .select("id, name, stock")
        .eq("store_id", storeId)
        .lte("stock", 0),
    ]);

    const orderEvents = (orders || []).map((o) => ({
      type: "order",
      message: `New order #ORD-${o.id.slice(0, 4).toUpperCase()} received`,
      amount: round2(Number(o.subtotal ?? 0)),
      created_at: o.created_at,
    }));

    const followEvents = (follows || []).map((f) => ({
      type: "follower",
      message: "New follower",
      created_at: f.created_at,
    }));

    const events = [...orderEvents, ...followEvents]
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, limit);

    const stock_alerts = (products || []).map((p) => ({
      type: "out_of_stock",
      product_id: p.id,
      message: `${p.name} is out of stock`,
    }));

    return { events, stock_alerts };
  },
};

export default analyticsService;
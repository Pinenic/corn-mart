// ─────────────────────────────────────────────────────────────
//  Analytics data — drives the entire Sales / Analytics feature
//  All series are daily data points for the last 90 days
//  structured so the period picker can slice any window.
// ─────────────────────────────────────────────────────────────

// ── Helpers ──────────────────────────────────────────────────
function daysAgo(n) {
  const d = new Date("2026-03-18"); // today anchor
  d.setDate(d.getDate() - n);
  return d.toISOString().split("T")[0];
}

function label(dateStr, format = "short") {
  const d = new Date(dateStr);
  if (format === "short")  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  if (format === "month")  return d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  return dateStr;
}

// ── 90-day daily time series ──────────────────────────────────
// Revenue and order count per day
const REVENUE_SEED = [
  820,740,910,680,770,1020,1340,890,760,840,
  920,1100,1280,1450,980,870,760,850,990,1120,
  1340,1560,1280,1100,940,870,790,880,1020,1190,
  1380,1640,1890,1420,1100,980,860,940,1080,1260,
  1490,1750,2100,1680,1320,1140,1020,1100,1290,1520,
  1810,2240,2680,2100,1650,1420,1280,1390,1650,1940,
  2310,2780,3340,2610,2050,1780,1610,1740,2080,2460,
  2940,3530,4210,3280,2570,2230,2010,2170,2600,3080,
  3690,4420,5290,4120,3230,2800,2530,2720,3260,4480,
];

const ORDERS_SEED = [
  9,8,10,7,8,11,14,10,8,9,
  10,12,14,16,11,10,8,9,11,12,
  15,17,14,12,10,10,9,10,11,13,
  15,18,21,16,12,11,10,11,12,14,
  17,19,23,18,15,13,12,12,14,17,
  20,25,29,23,18,16,14,15,18,21,
  26,31,37,29,23,20,18,20,23,27,
  33,40,47,37,29,25,23,24,29,35,
  41,50,60,47,36,31,28,30,37,50,
];

export const DAILY_SERIES = REVENUE_SEED.map((rev, i) => ({
  date:    daysAgo(89 - i),
  revenue: rev,
  orders:  ORDERS_SEED[i],
  aov:     Math.round(rev / ORDERS_SEED[i]),
}));

// ── Period slicing helper ─────────────────────────────────────
export const PERIODS = [
  { key: "7D",  label: "7 days",   days: 7  },
  { key: "30D", label: "30 days",  days: 30 },
  { key: "90D", label: "90 days",  days: 90 },
];

export function sliceSeries(period) {
  return DAILY_SERIES.slice(-period.days);
}

// Group daily into weekly buckets for longer views
export function groupByWeek(series) {
  const weeks = [];
  for (let i = 0; i < series.length; i += 7) {
    const chunk = series.slice(i, i + 7);
    weeks.push({
      date:    chunk[0].date,
      label:   label(chunk[0].date, "short"),
      revenue: chunk.reduce((s, d) => s + d.revenue, 0),
      orders:  chunk.reduce((s, d) => s + d.orders, 0),
      aov:     Math.round(chunk.reduce((s, d) => s + d.revenue, 0) / chunk.reduce((s, d) => s + d.orders, 0)),
    });
  }
  return weeks;
}

// ── Monthly buckets (12 months for year view) ─────────────────
export const MONTHLY_SERIES = [
  { month: "Apr '25", revenue: 9820,  orders: 108, prev_revenue: 8940  },
  { month: "May '25", revenue: 11340, orders: 125, prev_revenue: 9820  },
  { month: "Jun '25", revenue: 10680, orders: 118, prev_revenue: 11340 },
  { month: "Jul '25", revenue: 12100, orders: 133, prev_revenue: 10680 },
  { month: "Aug '25", revenue: 13450, orders: 148, prev_revenue: 12100 },
  { month: "Sep '25", revenue: 14820, orders: 163, prev_revenue: 13450 },
  { month: "Oct '25", revenue: 16340, orders: 180, prev_revenue: 14820 },
  { month: "Nov '25", revenue: 21890, orders: 241, prev_revenue: 16340 },
  { month: "Dec '25", revenue: 28760, orders: 316, prev_revenue: 21890 },
  { month: "Jan '26", revenue: 18930, orders: 208, prev_revenue: 28760 },
  { month: "Feb '26", revenue: 21840, orders: 240, prev_revenue: 18930 },
  { month: "Mar '26", revenue: 24520, orders: 270, prev_revenue: 21840 },
];

// ── KPI summary cards ─────────────────────────────────────────
export function computeKpis(period) {
  const curr  = sliceSeries(period);
  const prev  = DAILY_SERIES.slice(-(period.days * 2), -period.days);
  const sum   = (arr, k) => arr.reduce((s, d) => s + d[k], 0);
  const pct   = (a, b)   => b === 0 ? 0 : Math.round(((a - b) / b) * 100 * 10) / 10;

  const currRev    = sum(curr, "revenue");
  const prevRev    = sum(prev, "revenue");
  const currOrd    = sum(curr, "orders");
  const prevOrd    = sum(prev, "orders");
  const currAov    = currOrd ? Math.round(currRev / currOrd) : 0;
  const prevAov    = prevOrd ? Math.round(prevRev / prevOrd) : 0;

  return [
    {
      key:        "revenue",
      label:      "Total revenue",
      value:      `$${currRev.toLocaleString()}`,
      change:     `${Math.abs(pct(currRev, prevRev))}% vs prev period`,
      changeType: currRev >= prevRev ? "up" : "down",
      raw:        currRev,
    },
    {
      key:        "orders",
      label:      "Total orders",
      value:      currOrd.toLocaleString(),
      change:     `${Math.abs(pct(currOrd, prevOrd))}% vs prev period`,
      changeType: currOrd >= prevOrd ? "up" : "down",
      raw:        currOrd,
    },
    {
      key:        "aov",
      label:      "Avg. order value",
      value:      `$${currAov}`,
      change:     `$${Math.abs(currAov - prevAov)} vs prev period`,
      changeType: currAov >= prevAov ? "up" : "down",
      raw:        currAov,
    },
    {
      key:        "conversion",
      label:      "Conversion rate",
      value:      "3.8%",
      change:     "0.4% vs prev period",
      changeType: "up",
      raw:        3.8,
    },
  ];
}

// ── Product performance ───────────────────────────────────────
export const PRODUCT_PERFORMANCE = [
  {
    id:          "prod-001",
    name:        "Air Runner Pro",
    emoji:       "👟",
    category:    "Footwear",
    brand:       "Stridelab",
    unitsSold:   312,
    revenue:     40549,
    returns:     8,
    views:       4820,
    // 12-week sparkline
    weeklyUnits: [18,22,25,28,31,26,24,28,32,36,40,42],
    trend:       "up",    // up | down | flat
    trendPct:    18.4,
    variants: [
      { name: "Black / Size 42", sold: 98,  revenue: 12739, returnRate: 2.0 },
      { name: "White / Size 41", sold: 76,  revenue:  9879, returnRate: 1.3 },
      { name: "Navy / Size 40",  sold: 88,  revenue: 11439, returnRate: 1.1 },
      { name: "Black / Size 38", sold: 50,  revenue:  5999, returnRate: 4.0 },
    ],
  },
  {
    id:          "prod-002",
    name:        "Studio Buds X",
    emoji:       "🎧",
    category:    "Electronics",
    brand:       "Sonara",
    unitsSold:   201,
    revenue:     17889,
    returns:     12,
    views:       3640,
    weeklyUnits: [14,16,18,19,20,18,16,18,20,20,21,21],
    trend:       "flat",
    trendPct:    1.2,
    variants: [
      { name: "Midnight Black", sold: 98,  revenue:  8722, returnRate: 5.1 },
      { name: "Pearl White",    sold: 66,  revenue:  5874, returnRate: 7.6 },
      { name: "Rose Gold",      sold: 37,  revenue:  3478, returnRate: 8.1 },
    ],
  },
  {
    id:          "prod-003",
    name:        "Canvas Tote",
    emoji:       "👜",
    category:    "Accessories",
    brand:       "Earthkin",
    unitsSold:   155,
    revenue:      5270,
    returns:       3,
    views:        2180,
    weeklyUnits: [10,11,12,13,14,14,13,14,13,12,13,12],
    trend:       "flat",
    trendPct:    0.8,
    variants: [
      { name: "Natural", sold: 62, revenue: 2108, returnRate: 0 },
      { name: "Black",   sold: 48, revenue: 1632, returnRate: 2.1 },
      { name: "Olive",   sold: 28, revenue:  952, returnRate: 0 },
      { name: "Sand",    sold: 17, revenue:  578, returnRate: 0 },
    ],
  },
  {
    id:          "prod-004",
    name:        "Slate Watch",
    emoji:       "⌚",
    category:    "Accessories",
    brand:       "Meridian",
    unitsSold:   178,
    revenue:     35422,
    returns:      5,
    views:        5920,
    weeklyUnits: [8,10,12,14,16,18,17,16,18,20,22,24],
    trend:       "up",
    trendPct:    33.3,
    variants: [
      { name: "Graphite / Black Leather", sold: 89, revenue: 17711, returnRate: 1.1 },
      { name: "Silver / Brown Leather",   sold: 62, revenue: 12338, returnRate: 3.2 },
      { name: "Gold / Steel Mesh",        sold: 27, revenue:  6183, returnRate: 3.7 },
    ],
  },
  {
    id:          "prod-005",
    name:        "Linen Shirt",
    emoji:       "👔",
    category:    "Apparel",
    brand:       "Earthkin",
    unitsSold:    98,
    revenue:      5390,
    returns:      14,
    views:        1840,
    weeklyUnits: [12,14,15,14,11,10,9,8,7,6,5,3],
    trend:       "down",
    trendPct:    -60.0,
    variants: [
      { name: "White / Medium",     sold: 38, revenue: 2090, returnRate: 13.2 },
      { name: "Beige / Large",      sold: 34, revenue: 1870, returnRate: 14.7 },
      { name: "Terracotta / Small", sold: 26, revenue: 1430, returnRate: 19.2 },
    ],
  },
  {
    id:          "prod-006",
    name:        "Bamboo Lamp",
    emoji:       "🪔",
    category:    "Home & Living",
    brand:       "Earthkin",
    unitsSold:   134,
    revenue:     10452,
    returns:       2,
    views:        2340,
    weeklyUnits: [8,9,10,10,11,11,12,12,13,12,13,13],
    trend:       "up",
    trendPct:    12.5,
    variants: [
      { name: "Natural",      sold: 64, revenue: 4992, returnRate: 0 },
      { name: "Dark",         sold: 48, revenue: 3744, returnRate: 1.6 },
      { name: "White-washed", sold: 22, revenue: 1848, returnRate: 4.5 },
    ],
  },
];

// ── Category breakdown ────────────────────────────────────────
export const CATEGORY_BREAKDOWN = [
  { "Electronics": "#0057ff" },
  { "Health & Beauty": "#7c3aed" },
  { "Home & Garden": "#059669" },
  { "Cloths & Accessories": "#d97706" },
  { "Business & Industrial": "#dc2626" },
];

// ── Order status distribution ─────────────────────────────────
export const ORDER_STATUS_DIST = [
  { label: "Delivered",  count: 890, color: "#16a34a" },
  { label: "Shipping",   count:  56, color: "#d97706" },
  { label: "Processing", count:  18, color: "#0057ff" },
  { label: "Cancelled",  count:  38, color: "#dc2626" },
  { label: "Pending",    count:   4, color: "#9ca3af" },
];

// ── Customer metrics ──────────────────────────────────────────
export const CUSTOMER_METRICS = {
  total:      3091,
  newThisPeriod:  312,
  returning:  1890,
  churnRate:  4.2,
  ltv:        218,
  // Acquisition channels
  channels: [
    { name: "Organic search", pct: 38, count: 1175 },
    { name: "Direct",         pct: 24, count:  742 },
    { name: "Social media",   pct: 21, count:  649 },
    { name: "Referral",       pct: 10, count:  309 },
    { name: "Email",          pct:  7, count:  216 },
  ],
  // Monthly new vs returning (last 6 months)
  cohorts: [
    { month: "Oct", new: 180, returning: 310 },
    { month: "Nov", new: 241, returning: 420 },
    { month: "Dec", new: 316, returning: 540 },
    { month: "Jan", new: 208, returning: 380 },
    { month: "Feb", new: 240, returning: 430 },
    { month: "Mar", new: 312, returning: 490 },
  ],
};

// ── Variant heatmap data ──────────────────────────────────────
// For a selected product: options on axes, cell = units sold
export const VARIANT_HEATMAP = {
  "prod-001": {
    xLabel: "Size",
    yLabel: "Color",
    xValues: ["38","39","40","41","42","43","44","45"],
    yValues: ["Black","White","Navy"],
    // [y][x] = units sold
    data: [
      [50, 30, 28, 35, 98, 18, 12, 8 ],  // Black
      [12, 18, 22, 76, 20, 14, 10, 6 ],  // White
      [8,  14, 88, 16, 12,  8,  6, 4 ],  // Navy
    ],
  },
  "prod-002": {
    xLabel: "Color",
    yLabel: "—",
    xValues: ["Midnight Black","Pearl White","Rose Gold"],
    yValues: ["Units"],
    data: [[98, 66, 37]],
  },
  "prod-004": {
    xLabel: "Finish",
    yLabel: "Strap",
    xValues: ["Graphite","Silver","Gold"],
    yValues: ["Black Leather","Brown Leather","Steel Mesh"],
    data: [
      [89, 28, 10],
      [14, 62,  8],
      [8,  18, 27],
    ],
  },
};

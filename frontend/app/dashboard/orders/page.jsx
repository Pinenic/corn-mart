"use client";

import { useState } from "react";
import {
  Search,
  SlidersHorizontal,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Download,
} from "lucide-react";
import { Card, PageHeader, Badge, Button } from "@/components/ui";
import { QueryState, SkeletonTable } from "@/components/ui/QueryState";
import { OrderDetailDrawer } from "@/components/orders/OrderDetailDrawer";
import { FilterDrawer } from "@/components/orders/FilterDrawer";
import {
  useOrders,
  useOrderCounts,
  useUpdateOrderStatus,
} from "@/lib/hooks/useOrders";

const STATUS_TABS = [
  "All",
  "Pending",
  "Processing",
  "Shipped",
  "Delivered",
  "Cancelled",
];
const STATUS_CONFIG = {
  Delivered: { variant: "success" },
  Shipped: { variant: "warning" },
  Processing: { variant: "info" },
  Pending: { variant: "warning" },
  Cancelled: { variant: "danger" },
  Refunded: { variant: "danger" },
};

function SortIcon({ field, sort }) {
  if (sort.field !== field)
    return <ArrowUpDown size={12} style={{ opacity: 0.3 }} />;
  return sort.dir === "asc" ? (
    <ChevronUp size={12} style={{ color: "var(--color-accent)" }} />
  ) : (
    <ChevronDown size={12} style={{ color: "var(--color-accent)" }} />
  );
}

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("All");
  const [sort, setSort] = useState({ field: "created_at", dir: "desc" });
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelected] = useState(null);
  const [showFilters, setFilters] = useState(false);
  const [advFilters, setAdvFilters] = useState({
    status: [],
    paymentStatus: [],
    dateFrom: "",
    dateTo: "",
    amountMin: "",
    amountMax: "",
  });

  const activeFilterCount = [
    ...(advFilters.status || []),
    ...(advFilters.paymentStatus || []),
    advFilters.dateFrom ? [1] : [],
    advFilters.dateTo ? [1] : [],
    advFilters.amountMin ? [1] : [],
    advFilters.amountMax ? [1] : [],
  ].flat().length;

  // ── Data ────────────────────────────────────────────────────
  const { data: counts } = useOrderCounts();

  const {
    data: ordersRaw,
    meta,
    isLoading,
    isRefreshing,
    error,
    mutate,
  } = useOrders({
    page,
    limit: 20,
    status: activeTab === "All" ? "all" : activeTab.toLowerCase(),
    dateFrom: advFilters.dateFrom || undefined,
    dateTo: advFilters.dateTo || undefined,
    search: search.trim() || undefined,
    sort: sort.field,
    order: sort.dir,
  });

  const orders = ordersRaw ?? [];
  const totalPages = meta?.totalPages ?? 1;

  const { updateStatus } = useUpdateOrderStatus();

  const cycleSort = (field) => {
    setSort((p) =>
      p.field === field
        ? { field, dir: p.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "desc" }
    );
    setPage(1);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setPage(1);
    setAdvFilters((f) => ({ ...f, status: [] }));
  };

  const handleStatusUpdate = async (orderId, status) => {
    const updated = await updateStatus(orderId, status);
    if (updated) {
      mutate(); // revalidate the list
      setSelected(null);
    }
  };

  return (
    <div>
      <PageHeader
        title="Orders"
        description={
          meta
            ? `${meta.total.toLocaleString()} order${
                meta.total !== 1 ? "s" : ""
              }`
            : "Orders"
        }
        action={
          <Button variant="secondary" size="sm">
            <Download size={13} /> Export
          </Button>
        }
      />

      {/* Search + filter bar */}
      <div className="flex gap-2 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-text-tertiary)" }}
          />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search by order ID, customer…"
            className="w-full h-9 pl-9 pr-3 rounded-lg border text-[13px] outline-none transition-colors focus:border-[var(--color-accent)]"
            style={{
              borderColor: "var(--color-border-md)",
              color: "var(--color-text-primary)",
              background: "white",
            }}
          />
        </div>
        <Button
          variant="secondary"
          onClick={() => setFilters(true)}
          style={
            activeFilterCount > 0
              ? {
                  borderColor: "var(--color-accent)",
                  color: "var(--color-accent-text)",
                  background: "var(--color-accent-subtle)",
                }
              : {}
          }
        >
          <SlidersHorizontal size={14} />
          Filters
          {activeFilterCount > 0 && (
            <span
              className="ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
              style={{ background: "var(--color-accent)", color: "#fff" }}
            >
              {activeFilterCount}
            </span>
          )}
        </Button>
      </div>

      {/* Status tabs */}
      <div
        className="flex gap-1.5 mb-4 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {STATUS_TABS.map((tab) => {
          const key = tab === "All" ? "all" : tab.toLowerCase();
          const count = tab === "All" ? counts?.all : counts?.[key];
          const active = activeTab === tab;
          return (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all border flex-shrink-0"
              style={{
                background: active ? "var(--color-accent-subtle)" : "white",
                color: active
                  ? "var(--color-accent-text)"
                  : "var(--color-text-secondary)",
                borderColor: active ? "transparent" : "var(--color-border)",
              }}
            >
              {tab}
              {count !== undefined && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                  style={{
                    background: active
                      ? "var(--color-accent)"
                      : "var(--color-bg)",
                    color: active ? "#fff" : "var(--color-text-tertiary)",
                  }}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Orders table */}
      <QueryState
        isLoading={isLoading}
        error={error}
        onRetry={mutate}
        isEmpty={!isLoading && orders.length === 0}
        emptyTitle="No orders found"
        emptyDesc="Try adjusting your search or filters."
        emptyAction={
          (search || activeFilterCount > 0) && (
            <button
              onClick={() => {
                setSearch("");
                setAdvFilters({
                  status: [],
                  paymentStatus: [],
                  dateFrom: "",
                  dateTo: "",
                  amountMin: "",
                  amountMax: "",
                });
                setActiveTab("All");
              }}
              className="text-[13px] font-medium"
              style={{ color: "var(--color-accent)" }}
            >
              Clear filters
            </button>
          )
        }
        skeleton={<SkeletonTable rows={6} cols={5} />}
      >
        <Card noPadding>
          {/* Desktop table header */}
          <div
            className="hidden md:grid px-4 py-2.5 border-b"
            style={{
              gridTemplateColumns: "100px 1fr 120px 110px 90px 32px",
              borderColor: "var(--color-border)",
            }}
          >
            {[
              { label: "Order", field: "id" },
              { label: "Customer", field: "buyer_id" },
              { label: "Date", field: "created_at" },
              { label: "Status", field: null },
              { label: "Amount", field: "subtotal" },
              { label: "", field: null },
            ].map(({ label, field }) => (
              <button
                key={label}
                onClick={() => field && cycleSort(field)}
                disabled={!field}
                className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-left disabled:cursor-default"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                {label}
                {field && <SortIcon field={field} sort={sort} />}
              </button>
            ))}
          </div>

          <div
            className="divide-y"
            style={{
              borderColor: "var(--color-border)",
              opacity: isRefreshing ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {orders.map((order) => {
              const cfg = STATUS_CONFIG[order.status] ?? { variant: "default" };
              const totalItems = 1; // Would come from order items join

              return (
                <div
                  key={order.id}
                  className="cursor-pointer transition-colors hover:bg-[var(--color-bg)] px-4 py-3"
                  onClick={() => setSelected(order)}
                >
                  {/* Mobile */}
                  <div className="md:hidden flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
                      style={{
                        background: order.customer.avatarBg,
                        color: order.customer.avatarColor,
                      }}
                    >
                      <img
                        src={order.customer.avatar_url}
                        alt="avatar"
                        className="rounded-full"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span
                          className="text-[12px] font-semibold"
                          style={{ color: "var(--color-accent-text)" }}
                        >
                          #STO-
                          {String(order.id || "")
                            .slice(0, 3)
                            .toUpperCase()}
                        </span>
                        <Badge variant={cfg.variant}>{order.status}</Badge>
                      </div>
                      <p
                        className="text-[13px] font-medium truncate"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        {order.customer.full_name}
                      </p>
                      <p
                        className="text-[11px]"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        {new Date(order.created_at).toLocaleDateString(
                          "en-US",
                          { month: "short", day: "numeric" }
                        )}
                        {" · "}
                        {order.order_items?.length} item
                        {order.order_items?.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p
                        className="text-[14px] font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        K{order.subtotal.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  {/* Desktop */}
                  <div
                    className="hidden md:grid items-center"
                    style={{
                      gridTemplateColumns: "100px 1fr 120px 110px 90px 32px",
                    }}
                  >
                    <span
                      className="text-[12px] font-semibold"
                      style={{ color: "var(--color-accent-text)" }}
                    >
                      #STO-
                      {String(order.id || "")
                        .slice(0, 3)
                        .toUpperCase()}
                    </span>
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                        style={{
                          background: order.customer.avatar_url,
                          color: order.customer.avatarColor,
                        }}
                      >
                        <img
                          src={order.customer.avatar_url}
                          alt="avatar"
                          className="rounded-full"
                        />
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-[13px] font-medium truncate"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {order.customer.full_name}
                        </p>
                        <p
                          className="text-[11px] truncate"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          {order.customer.email}
                        </p>
                      </div>
                    </div>
                    <span
                      className="text-[12px]"
                      style={{ color: "var(--color-text-secondary)" }}
                    >
                      {new Date(order.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                    <Badge variant={cfg.variant}>{order.status}</Badge>
                    <span
                      className="text-[13px] font-semibold"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      K{Number(order.subtotal).toFixed(2)}
                    </span>
                    <span
                      className="text-[18px] text-center"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      ›
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div
              className="flex items-center justify-between px-4 py-3 border-t"
              style={{ borderColor: "var(--color-border)" }}
            >
              <p
                className="text-[12px]"
                style={{ color: "var(--color-text-tertiary)" }}
              >
                Showing {(page - 1) * 20 + 1}–
                {Math.min(page * 20, meta?.total ?? 0)} of{" "}
                {(meta?.total ?? 0).toLocaleString()}
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border text-[13px] transition-colors disabled:opacity-40 hover:bg-[var(--color-bg)]"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  ‹
                </button>
                {Array.from(
                  { length: Math.min(totalPages, 5) },
                  (_, i) => i + 1
                ).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-medium border transition-colors"
                    style={{
                      background:
                        n === page ? "var(--color-accent)" : "transparent",
                      color:
                        n === page ? "#fff" : "var(--color-text-secondary)",
                      borderColor:
                        n === page
                          ? "var(--color-accent)"
                          : "var(--color-border)",
                    }}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded-lg border text-[13px] transition-colors disabled:opacity-40 hover:bg-[var(--color-bg)]"
                  style={{
                    borderColor: "var(--color-border)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </Card>
      </QueryState>

      {/* Drawers */}
      {selectedOrder && (
        <OrderDetailDrawer
          order={selectedOrder}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusUpdate}
        />
      )}
      {showFilters && (
        <FilterDrawer
          filters={advFilters}
          onChange={setAdvFilters}
          onClose={() => setFilters(false)}
          onReset={() =>
            setAdvFilters({
              status: [],
              paymentStatus: [],
              dateFrom: "",
              dateTo: "",
              amountMin: "",
              amountMax: "",
            })
          }
        />
      )}
    </div>
  );
}

// "use client";

// import { useState, useMemo } from "react";
// import { Search, SlidersHorizontal, ChevronUp, ChevronDown, ArrowUpDown, Download } from "lucide-react";
// import { Card, PageHeader, Badge, Button } from "@/components/ui";
// import { OrderDetailDrawer } from "@/components/orders/OrderDetailDrawer";
// import { FilterDrawer } from "@/components/orders/FilterDrawer";
// import { ORDERS, STATUS_CONFIG, STATUS_COUNTS } from "@/lib/orders-data";

// const STATUS_TABS = ["All", "Pending", "Processing", "Shipping", "Delivered", "Cancelled"];
// const PAGE_SIZE = 6;

// const SORT_FIELDS = { id: "id", date: "date", amount: "total", customer: "customer" };

// function SortIcon({ field, sort }) {
//   if (sort.field !== field) return <ArrowUpDown size={12} style={{ opacity: 0.3 }} />;
//   return sort.dir === "asc"
//     ? <ChevronUp size={12} style={{ color: "var(--color-accent)" }} />
//     : <ChevronDown size={12} style={{ color: "var(--color-accent)" }} />;
// }

// export default function OrdersPage() {
//   const [search, setSearch]               = useState("");
//   const [activeTab, setActiveTab]         = useState("All");
//   const [sort, setSort]                   = useState({ field: "date", dir: "desc" });
//   const [page, setPage]                   = useState(1);
//   const [selectedOrder, setSelectedOrder] = useState(null);
//   const [showFilters, setShowFilters]     = useState(false);
//   const [filters, setFilters]             = useState({
//     status: [], paymentStatus: [], dateFrom: "", dateTo: "", amountMin: "", amountMax: "",
//   });

//   const activeFilterCount = [
//     ...(filters.status || []),
//     ...(filters.paymentStatus || []),
//     filters.dateFrom ? [1] : [],
//     filters.dateTo ? [1] : [],
//     filters.amountMin ? [1] : [],
//     filters.amountMax ? [1] : [],
//   ].flat().length;

//   const resetFilters = () =>
//     setFilters({ status: [], paymentStatus: [], dateFrom: "", dateTo: "", amountMin: "", amountMax: "" });

//   const cycleSort = (field) => {
//     setSort((prev) =>
//       prev.field === field
//         ? { field, dir: prev.dir === "asc" ? "desc" : "asc" }
//         : { field, dir: "desc" }
//     );
//     setPage(1);
//   };

//   const filtered = useMemo(() => {
//     let list = [...ORDERS];

//     // Status tab
//     if (activeTab !== "All") list = list.filter((o) => o.status === activeTab);

//     // Advanced filter: status (overrides tab if set)
//     if (filters.status?.length) list = list.filter((o) => filters.status.includes(o.status));

//     // Advanced filter: payment
//     if (filters.paymentStatus?.length)
//       list = list.filter((o) => filters.paymentStatus.includes(o.paymentStatus));

//     // Date range
//     if (filters.dateFrom) list = list.filter((o) => o.date >= filters.dateFrom);
//     if (filters.dateTo)   list = list.filter((o) => o.date <= filters.dateTo);

//     // Amount range
//     if (filters.amountMin) list = list.filter((o) => o.total >= Number(filters.amountMin));
//     if (filters.amountMax) list = list.filter((o) => o.total <= Number(filters.amountMax));

//     // Search
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       list = list.filter(
//         (o) =>
//           o.id.includes(q) ||
//           o.customer.name.toLowerCase().includes(q) ||
//           o.customer.email.toLowerCase().includes(q)
//       );
//     }

//     // Sort
//     list.sort((a, b) => {
//       let av, bv;
//       switch (sort.field) {
//         case "date":     av = a.date;    bv = b.date;    break;
//         case "amount":   av = a.total;   bv = b.total;   break;
//         case "customer": av = a.customer.name; bv = b.customer.name; break;
//         default:         av = a.id;      bv = b.id;
//       }
//       if (av < bv) return sort.dir === "asc" ? -1 : 1;
//       if (av > bv) return sort.dir === "asc" ? 1 : -1;
//       return 0;
//     });

//     return list;
//   }, [search, activeTab, sort, filters]);

//   const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
//   const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setPage(1);
//     // Clear status filter when switching tabs
//     setFilters((f) => ({ ...f, status: [] }));
//   };

//   return (
//     <div>
//       <PageHeader
//         title="Orders"
//         description={`${filtered.length.toLocaleString()} order${filtered.length !== 1 ? "s" : ""}`}
//         action={
//           <Button variant="secondary" size="sm">
//             <Download size={13} /> Export
//           </Button>
//         }
//       />

//       {/* ── Search + filter bar ── */}
//       <div className="flex gap-2 mb-4 flex-wrap">
//         <div className="relative flex-1 min-w-[180px]">
//           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
//             style={{ color: "var(--color-text-tertiary)" }} />
//           <input
//             value={search}
//             onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//             placeholder="Search by order ID, customer name or email…"
//             className="w-full h-9 pl-9 pr-3 rounded-lg border text-[13px] outline-none transition-colors focus:border-[var(--color-accent)]"
//             style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)", background: "white" }}
//           />
//         </div>
//         <Button
//           variant="secondary"
//           onClick={() => setShowFilters(true)}
//           style={activeFilterCount > 0 ? { borderColor: "var(--color-accent)", color: "var(--color-accent-text)", background: "var(--color-accent-subtle)" } : {}}
//         >
//           <SlidersHorizontal size={14} />
//           Filters
//           {activeFilterCount > 0 && (
//             <span className="ml-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full"
//               style={{ background: "var(--color-accent)", color: "#fff" }}>
//               {activeFilterCount}
//             </span>
//           )}
//         </Button>
//       </div>

//       {/* ── Status tabs ── */}
//       <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
//         {STATUS_TABS.map((tab) => {
//           const active = activeTab === tab;
//           const count  = STATUS_COUNTS[tab] ?? 0;
//           return (
//             <button
//               key={tab}
//               onClick={() => handleTabChange(tab)}
//               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all duration-150 border flex-shrink-0"
//               style={{
//                 background:   active ? "var(--color-accent-subtle)" : "white",
//                 color:        active ? "var(--color-accent-text)"   : "var(--color-text-secondary)",
//                 borderColor:  active ? "transparent"                : "var(--color-border)",
//               }}
//             >
//               {tab}
//               <span
//                 className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
//                 style={{
//                   background: active ? "var(--color-accent)" : "var(--color-bg)",
//                   color:      active ? "#fff"                : "var(--color-text-tertiary)",
//                 }}
//               >
//                 {count}
//               </span>
//             </button>
//           );
//         })}
//       </div>

//       {/* ── Orders table ── */}
//       <Card noPadding>
//         {/* Desktop table header */}
//         <div
//           className="hidden md:grid px-4 py-2.5 border-b"
//           style={{
//             gridTemplateColumns: "100px 1fr 120px 110px 90px 32px",
//             borderColor: "var(--color-border)",
//           }}
//         >
//           {[
//             { label: "Order",    field: "id"       },
//             { label: "Customer", field: "customer" },
//             { label: "Date",     field: "date"     },
//             { label: "Status",   field: null       },
//             { label: "Amount",   field: "amount"   },
//             { label: "",         field: null       },
//           ].map(({ label, field }) => (
//             <button
//               key={label}
//               onClick={() => field && cycleSort(field)}
//               disabled={!field}
//               className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider text-left disabled:cursor-default"
//               style={{ color: "var(--color-text-tertiary)" }}
//             >
//               {label}
//               {field && <SortIcon field={field} sort={sort} />}
//             </button>
//           ))}
//         </div>

//         {/* Rows */}
//         <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
//           {paginated.length === 0 ? (
//             <div className="py-16 text-center">
//               <p className="text-[14px] font-medium" style={{ color: "var(--color-text-secondary)" }}>
//                 No orders found
//               </p>
//               <p className="text-[13px] mt-1" style={{ color: "var(--color-text-tertiary)" }}>
//                 Try adjusting your search or filters
//               </p>
//               {(search || activeFilterCount > 0) && (
//                 <button
//                   onClick={() => { setSearch(""); resetFilters(); setActiveTab("All"); }}
//                   className="mt-3 text-[13px] font-medium"
//                   style={{ color: "var(--color-accent)" }}
//                 >
//                   Clear all filters
//                 </button>
//               )}
//             </div>
//           ) : paginated.map((order) => {
//             const cfg = STATUS_CONFIG[order.status];
//             const totalItems = order.items.reduce((s, i) => s + i.qty, 0);
//             return (
//               <div
//                 key={order.id}
//                 className="cursor-pointer transition-colors duration-150 hover:bg-[var(--color-bg)] px-4 py-3"
//                 onClick={() => setSelectedOrder(order)}
//               >
//                 {/* Mobile */}
//                 <div className="md:hidden flex items-center gap-3">
//                   <div
//                     className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0"
//                     style={{ background: order.customer.avatarBg, color: order.customer.avatarColor }}
//                   >
//                     {order.customer.avatar}
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="flex items-center gap-2 mb-0.5">
//                       <span className="text-[12px] font-semibold" style={{ color: "var(--color-accent-text)" }}>
//                         #{order.id}
//                       </span>
//                       <Badge variant={cfg.variant}>{order.status}</Badge>
//                     </div>
//                     <p className="text-[13px] font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
//                       {order.customer.name}
//                     </p>
//                     <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
//                       {new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
//                       {" · "}{totalItems} item{totalItems !== 1 ? "s" : ""}
//                     </p>
//                   </div>
//                   <div className="text-right flex-shrink-0">
//                     <p className="text-[14px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
//                       ${order.total.toFixed(2)}
//                     </p>
//                   </div>
//                 </div>

//                 {/* Desktop */}
//                 <div
//                   className="hidden md:grid items-center"
//                   style={{ gridTemplateColumns: "100px 1fr 120px 110px 90px 32px" }}
//                 >
//                   <span className="text-[12px] font-semibold" style={{ color: "var(--color-accent-text)" }}>
//                     #{order.id}
//                   </span>
//                   <div className="flex items-center gap-2.5 min-w-0">
//                     <div
//                       className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
//                       style={{ background: order.customer.avatarBg, color: order.customer.avatarColor }}
//                     >
//                       {order.customer.avatar}
//                     </div>
//                     <div className="min-w-0">
//                       <p className="text-[13px] font-medium truncate" style={{ color: "var(--color-text-primary)" }}>
//                         {order.customer.name}
//                       </p>
//                       <p className="text-[11px] truncate" style={{ color: "var(--color-text-tertiary)" }}>
//                         {order.customer.email}
//                       </p>
//                     </div>
//                   </div>
//                   <span className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>
//                     {new Date(order.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
//                   </span>
//                   <Badge variant={cfg.variant}>{order.status}</Badge>
//                   <span className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
//                     ${order.total.toFixed(2)}
//                   </span>
//                   <span className="text-[18px] text-center" style={{ color: "var(--color-text-tertiary)" }}>›</span>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* ── Pagination ── */}
//         {totalPages > 1 && (
//           <div
//             className="flex items-center justify-between px-4 py-3 border-t"
//             style={{ borderColor: "var(--color-border)" }}
//           >
//             <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
//               Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
//             </p>
//             <div className="flex items-center gap-1">
//               <button
//                 onClick={() => setPage((p) => Math.max(1, p - 1))}
//                 disabled={page === 1}
//                 className="w-8 h-8 flex items-center justify-center rounded-lg border text-[13px] transition-colors disabled:opacity-40 hover:bg-[var(--color-bg)]"
//                 style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
//               >
//                 ‹
//               </button>
//               {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
//                 <button
//                   key={n}
//                   onClick={() => setPage(n)}
//                   className="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-medium transition-colors border"
//                   style={{
//                     background:   n === page ? "var(--color-accent)"        : "transparent",
//                     color:        n === page ? "#fff"                        : "var(--color-text-secondary)",
//                     borderColor:  n === page ? "var(--color-accent)"         : "var(--color-border)",
//                   }}
//                 >
//                   {n}
//                 </button>
//               ))}
//               <button
//                 onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
//                 disabled={page === totalPages}
//                 className="w-8 h-8 flex items-center justify-center rounded-lg border text-[13px] transition-colors disabled:opacity-40 hover:bg-[var(--color-bg)]"
//                 style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}
//               >
//                 ›
//               </button>
//             </div>
//           </div>
//         )}
//       </Card>

//       {/* ── Order detail drawer ── */}
//       {selectedOrder && (
//         <OrderDetailDrawer
//           order={selectedOrder}
//           onClose={() => setSelectedOrder(null)}
//         />
//       )}

//       {/* ── Filter drawer ── */}
//       {showFilters && (
//         <FilterDrawer
//           filters={filters}
//           onChange={setFilters}
//           onClose={() => setShowFilters(false)}
//           onReset={resetFilters}
//         />
//       )}
//     </div>
//   );
// }

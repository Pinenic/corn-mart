"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  Plus,
  LayoutGrid,
  List,
  Tag,
  ChevronDown,
  ArrowUpDown,
  ChevronUp,
} from "lucide-react";
import { Card, PageHeader, Badge, Button } from "@/components/ui";
import {
  QueryState,
  SkeletonTable,
  SkeletonCard,
} from "@/components/ui/QueryState";
import { EditProductDrawer } from "@/components/products/EditProductDrawer";
import {
  useProducts,
  useUpdateProduct,
  useDeleteProduct,
} from "@/lib/hooks/useProducts";
import { useCategoriesFlat } from "@/lib/hooks/useCategories";

const STATUS_FILTERS = [
  "All",
  "Active",
  // "Low stock",
  // "Out of stock",
  "Inactive",
];
const PAGE_SIZE = 20;

function getStockStatus(product) {
  if (!product.is_active) return { label: "Inactive", variant: "default" };
  if (product.stock === 0) return { label: "Out of stock", variant: "danger" };
  if (product.stock <= 3) return { label: "Low stock", variant: "warning" };
  return { label: "Active", variant: "success" };
}

function SortIcon({ field, sort }) {
  if (sort.field !== field)
    return <ArrowUpDown size={12} style={{ opacity: 0.3 }} />;
  return sort.dir === "asc" ? (
    <ChevronUp size={12} style={{ color: "var(--color-accent)" }} />
  ) : (
    <ChevronDown size={12} style={{ color: "var(--color-accent)" }} />
  );
}

export default function ProductsPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [statusFilter, setStatus] = useState("All");
  const [view, setView] = useState("grid");
  const [sort, setSort] = useState({ field: "created_at", dir: "desc" });
  const [page, setPage] = useState(1);
  const [editProduct, setEdit] = useState(null);

  // Map UI status filter to API status param
  const apiStatus =
    statusFilter === "Active"
      ? "active"
      : statusFilter === "Inactive"
      ? "inactive"
      : "all";

  // ── Data ─────────────────────────────────────────────────
  const {
    data: productsRaw,
    meta,
    isLoading,
    isRefreshing,
    error,
    mutate,
  } = useProducts({
    page,
    limit: PAGE_SIZE,
    status: apiStatus,
    category: category || undefined,
    search: search.trim() || undefined,
    sort: sort.field,
    order: sort.dir,
  });
  // console.log(productsRaw);

  const { data: categories } = useCategoriesFlat();
  const { update } = useUpdateProduct();
  const { deleteProduct } = useDeleteProduct();

  const products = productsRaw ?? [];
  const totalPages = meta?.totalPages ?? 1;

  const cycleSort = (field) => {
    setSort((p) =>
      p.field === field
        ? { field, dir: p.dir === "asc" ? "desc" : "asc" }
        : { field, dir: "asc" }
    );
    setPage(1);
  };

  const handleSave = async (updated) => {
    const result = await update(updated.id, updated);
    if (result) {
      mutate();
      setEdit(null);
    }
  };

  const handleDelete = async (product) => {
    const ok = await deleteProduct(product.id, product.name);
    if (ok) mutate();
  };

  // ── Skeleton for grid view ────────────────────────────────
  const GridSkeleton = (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {Array.from({ length: 8 }).map((_, i) => (
        <SkeletonCard key={i} rows={3} />
      ))}
    </div>
  );

  return (
    <div>
      <PageHeader
        title="Products"
        description={
          meta ? `${meta.total.toLocaleString()} products` : "Products"
        }
        action={
          <div className="flex gap-2">
            {/* <Link href="/products/promotions">
              <Button variant="secondary">
                <Tag size={14} /> Promotions
              </Button>
            </Link> */}
            <Link href="/dashboard/products/new">
              <Button>
                <Plus size={14} /> Add product
              </Button>
            </Link>
          </div>
        }
      />

      {/* Toolbar */}
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
            placeholder="Search products, brands…"
            className="w-full h-9 pl-9 pr-3 rounded-lg border text-[13px] outline-none transition-colors focus:border-[var(--color-accent)]"
            style={{
              borderColor: "var(--color-border-md)",
              color: "var(--color-text-primary)",
              background: "white",
            }}
          />
        </div>

        {/* Category filter */}
        <div className="relative">
          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
            className="h-9 pl-3 pr-8 rounded-lg border text-[13px] outline-none appearance-none cursor-pointer"
            style={{
              borderColor: "var(--color-border-md)",
              color: "var(--color-text-primary)",
              background: "white",
            }}
          >
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-text-tertiary)" }}
          />
        </div>

        {/* Sort */}
        <div className="relative">
          <select
            value={`${sort.field}-${sort.dir}`}
            onChange={(e) => {
              const [f, d] = e.target.value.split("-");
              setSort({ field: f, dir: d });
              setPage(1);
            }}
            className="h-9 pl-3 pr-8 rounded-lg border text-[13px] outline-none appearance-none cursor-pointer"
            style={{
              borderColor: "var(--color-border-md)",
              color: "var(--color-text-primary)",
              background: "white",
            }}
          >
            <option value="name-asc">Name A–Z</option>
            <option value="name-desc">Name Z–A</option>
            <option value="price-asc">Price low–high</option>
            <option value="price-desc">Price high–low</option>
            <option value="stock-asc">Stock low–high</option>
            <option value="updated_at-desc">Recently updated</option>
          </select>
          <ChevronDown
            size={13}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
            style={{ color: "var(--color-text-tertiary)" }}
          />
        </div>

        {/* View toggle */}
        <div
          className="flex rounded-lg border overflow-hidden"
          style={{ borderColor: "var(--color-border-md)" }}
        >
          {[
            ["grid", LayoutGrid],
            ["list", List],
          ].map(([v, Icon]) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className="w-9 h-9 flex items-center justify-center transition-colors"
              style={{
                background: view === v ? "var(--color-accent-subtle)" : "white",
                color:
                  view === v
                    ? "var(--color-accent)"
                    : "var(--color-text-tertiary)",
              }}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>

      {/* Status filter tabs */}
      <div
        className="flex gap-1.5 mb-5 overflow-x-auto pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {STATUS_FILTERS.map((s) => {
          const active = statusFilter === s;
          return (
            <button
              key={s}
              onClick={() => {
                setStatus(s);
                setPage(1);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all border flex-shrink-0"
              style={{
                background: active ? "var(--color-accent-subtle)" : "white",
                color: active
                  ? "var(--color-accent-text)"
                  : "var(--color-text-secondary)",
                borderColor: active ? "transparent" : "var(--color-border)",
              }}
            >
              {s}
            </button>
          );
        })}
      </div>

      {/* Content */}
      <QueryState
        isLoading={isLoading}
        error={error}
        onRetry={mutate}
        isEmpty={!isLoading && products.length === 0}
        emptyTitle="No products found"
        emptyDesc="Try changing your search or filters, or add a new product."
        emptyAction={
          <Link href="/dashboard/products/new">
            <Button>
              <Plus size={14} /> Add product
            </Button>
          </Link>
        }
        skeleton={
          view === "grid" ? GridSkeleton : <SkeletonTable rows={6} cols={5} />
        }
      >
        {/* Grid view */}
        {view === "grid" && (
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-5"
            style={{
              opacity: isRefreshing ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {products.map((p) => {
              const status = getStockStatus(p);
              return (
                <div
                  key={p.id}
                  onClick={() => setEdit(p)}
                  className="bg-white rounded-xl border cursor-pointer overflow-hidden group transition-all hover:shadow-sm"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div
                    className="h-28 flex items-center justify-center text-xs transition-transform duration-200 group-hover:scale-110"
                    style={{ background: "var(--color-bg)" }}
                  >
                    {p.thumbnail_url ? (
                      <img
                        src={p.thumbnail_url}
                        alt={"image"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      "📦"
                    )}
                  </div>
                  <div className="p-3">
                    <p
                      className="text-[13px] font-semibold truncate mb-0.5"
                      style={{ color: "var(--color-text-primary)" }}
                    >
                      {p.name}
                    </p>
                    {p.brand && (
                      <p
                        className="text-[11px] truncate mb-1"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        {p.brand}
                      </p>
                    )}
                    <p
                      className="text-[14px] font-bold mb-2"
                      style={{ color: "var(--color-accent-text)" }}
                    >
                      K{Number(p.price).toFixed(2)}
                    </p>
                    <div className="flex items-center justify-between gap-1">
                      <span
                        className="text-[11px]"
                        style={{ color: "var(--color-text-tertiary)" }}
                      >
                        {p.stock > 0 ? `${p.stock} in stock` : "No stock"}
                      </span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* List view */}
        {view === "list" && (
          <Card
            noPadding
            className="mb-5"
            style={{
              opacity: isRefreshing ? 0.6 : 1,
              transition: "opacity 0.2s",
            }}
          >
            <div
              className="hidden md:grid px-4 py-2.5 border-b"
              style={{
                gridTemplateColumns: "48px 1fr 120px 100px 90px 80px",
                borderColor: "var(--color-border)",
              }}
            >
              {[
                { label: "", field: null },
                { label: "Product", field: "name" },
                { label: "Category", field: null },
                { label: "Price", field: "price" },
                { label: "Stock", field: "stock" },
                { label: "Status", field: null },
              ].map(({ label, field }, i) => (
                <button
                  key={i}
                  disabled={!field}
                  onClick={() => field && cycleSort(field)}
                  className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider disabled:cursor-default"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {label}
                  {field && <SortIcon field={field} sort={sort} />}
                </button>
              ))}
            </div>
            <div
              className="divide-y"
              style={{ borderColor: "var(--color-border)" }}
            >
              {products.map((p) => {
                const status = getStockStatus(p);
                return (
                  <div
                    key={p.id}
                    onClick={() => setEdit(p)}
                    className="cursor-pointer transition-colors hover:bg-[var(--color-bg)] px-4 py-3"
                  >
                    {/* Mobile */}
                    <div className="md:hidden flex items-center gap-3">
                      <span className="text-xs w-12 h-12">
                        {p.thumbnail_url ? (
                          <img
                            src={p.thumbnail_url}
                            alt={"image"}
                            className="h-full w-full object-cover rounded"
                          />
                        ) : (
                          "📦"
                        )}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p
                            className="text-[13px] font-semibold line-clamp-1"
                            style={{ color: "var(--color-text-primary)" }}
                          >
                            {p.name}
                          </p>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </div>
                        <p
                          className="text-[11px]"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          {p.category} ·{" "}
                          {p.variants.reduce(
                            (sum, pv) => sum + (pv.stock || 0),
                            0
                          )}{" "}
                          in stock
                        </p>
                      </div>
                      <p
                        className="text-[14px] font-bold flex-shrink-0"
                        style={{ color: "var(--color-accent-text)" }}
                      >
                        K{Number(p.price).toFixed(2)}
                      </p>
                    </div>
                    {/* Desktop */}
                    <div
                      className="hidden md:grid items-center"
                      style={{
                        gridTemplateColumns: "48px 1fr 120px 100px 90px 80px",
                      }}
                    >
                      <span className="text-xs w-12 h-12">
                        {p.thumbnail_url ? (
                          <img
                            src={p.thumbnail_url}
                            alt={"image"}
                            className="h-full w-full object-cover rounded"
                          />
                        ) : (
                          "📦"
                        )}
                      </span>
                      <div>
                        <p
                          className="text-[13px] font-semibold"
                          style={{ color: "var(--color-text-primary)" }}
                        >
                          {p.name}
                        </p>
                        <p
                          className="text-[11px]"
                          style={{ color: "var(--color-text-tertiary)" }}
                        >
                          {p.brand || "—"}
                        </p>
                      </div>
                      <span
                        className="text-[12px]"
                        style={{ color: "var(--color-text-secondary)" }}
                      >
                        {p.category || "—"}
                      </span>
                      <span
                        className="text-[13px] font-semibold"
                        style={{ color: "var(--color-text-primary)" }}
                      >
                        K{Number(p.price).toFixed(2)}
                      </span>
                      <span
                        className="text-[12px]"
                        style={{
                          color:
                            p.variants.reduce(
                              (sum, pv) => sum + (pv.stock || 0),
                              0
                            ) === 0
                              ? "var(--color-danger)"
                              : "var(--color-text-secondary)",
                        }}
                      >
                        {p.variants.reduce(
                          (sum, pv) => sum + (pv.stock || 0),
                          0
                        )}{" "}
                        units
                      </span>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </QueryState>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mb-5">
          <p
            className="text-[12px]"
            style={{ color: "var(--color-text-tertiary)" }}
          >
            Showing {(page - 1) * PAGE_SIZE + 1}–
            {Math.min(page * PAGE_SIZE, meta?.total ?? 0)} of{" "}
            {(meta?.total ?? 0).toLocaleString()}
          </p>
          <div className="flex gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border text-[13px] disabled:opacity-40 hover:bg-[var(--color-bg)] transition-colors"
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
                  color: n === page ? "#fff" : "var(--color-text-secondary)",
                  borderColor:
                    n === page ? "var(--color-accent)" : "var(--color-border)",
                }}
              >
                {n}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="w-8 h-8 flex items-center justify-center rounded-lg border text-[13px] disabled:opacity-40 hover:bg-[var(--color-bg)] transition-colors"
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

      {/* Edit drawer */}
      {editProduct && (
        <EditProductDrawer
          product={editProduct}
          onClose={() => setEdit(null)}
          onSave={handleSave}
          mutate={mutate}
        />
      )}
    </div>
  );
}

// "use client";

// import { useState, useMemo } from "react";
// import Link from "next/link";
// import {
//   Search, SlidersHorizontal, Plus, LayoutGrid, List,
//   Tag, ChevronDown, ArrowUpDown, ChevronUp
// } from "lucide-react";
// import { Card, PageHeader, Badge, Button } from "@/components/ui";
// import { EditProductDrawer } from "@/components/products/EditProductDrawer";
// import { PRODUCTS, CATEGORIES, getStockStatus, getTotalStock } from "@/lib/products-data";

// const STATUS_FILTERS = ["All", "Active", "Low stock", "Out of stock", "Inactive"];
// const PAGE_SIZE = 8;

// export default function ProductsPage() {
//   const [search, setSearch]         = useState("");
//   const [category, setCategory]     = useState("All");
//   const [statusFilter, setStatus]   = useState("All");
//   const [view, setView]             = useState("grid"); // grid | list
//   const [sort, setSort]             = useState({ field: "name", dir: "asc" });
//   const [page, setPage]             = useState(1);
//   const [products, setProducts]     = useState(PRODUCTS);
//   const [editProduct, setEdit]      = useState(null);

//   const filtered = useMemo(() => {
//     let list = [...products];
//     if (search.trim()) {
//       const q = search.toLowerCase();
//       list = list.filter((p) =>
//         p.name.toLowerCase().includes(q) ||
//         (p.brand || "").toLowerCase().includes(q) ||
//         (p.category || "").toLowerCase().includes(q)
//       );
//     }
//     if (category !== "All") list = list.filter((p) => p.category === category);
//     if (statusFilter !== "All") {
//       list = list.filter((p) => getStockStatus(p).label === statusFilter);
//     }
//     list.sort((a, b) => {
//       let av, bv;
//       switch (sort.field) {
//         case "price":   av = a.price;       bv = b.price;       break;
//         case "stock":   av = getTotalStock(a); bv = getTotalStock(b); break;
//         case "updated": av = a.updated_at;  bv = b.updated_at;  break;
//         default:        av = a.name.toLowerCase(); bv = b.name.toLowerCase();
//       }
//       if (av < bv) return sort.dir === "asc" ? -1 : 1;
//       if (av > bv) return sort.dir === "asc" ? 1 : -1;
//       return 0;
//     });
//     return list;
//   }, [products, search, category, statusFilter, sort]);

//   const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
//   const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

//   const cycleSort = (field) => {
//     setSort((p) => p.field === field ? { field, dir: p.dir === "asc" ? "desc" : "asc" } : { field, dir: "asc" });
//     setPage(1);
//   };

//   const handleSave = (updated) => {
//     setProducts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
//   };

//   return (
//     <div>
//       <PageHeader
//         title="Products"
//         description={`${products.length} products in your catalogue`}
//         action={
//           <div className="flex gap-2">
//             <Link href="/dashboard/products/promotions">
//               <Button variant="secondary"><Tag size={14} /> Promotions</Button>
//             </Link>
//             <Link href="/dashboard/products/new">
//               <Button><Plus size={14} /> Add product</Button>
//             </Link>
//           </div>
//         }
//       />

//       {/* Toolbar */}
//       <div className="flex gap-2 mb-4 flex-wrap">
//         <div className="relative flex-1 min-w-[180px]">
//           <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
//             style={{ color: "var(--color-text-tertiary)" }} />
//           <input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
//             placeholder="Search products, brands…"
//             className="w-full h-9 pl-9 pr-3 rounded-lg border text-[13px] outline-none transition-colors focus:border-[var(--color-accent)]"
//             style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)", background: "white" }} />
//         </div>

//         {/* Category filter */}
//         <div className="relative">
//           <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
//             className="h-9 pl-3 pr-8 rounded-lg border text-[13px] outline-none appearance-none cursor-pointer"
//             style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)", background: "white" }}>
//             <option value="All">All categories</option>
//             {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
//           </select>
//           <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
//             style={{ color: "var(--color-text-tertiary)" }} />
//         </div>

//         {/* Sort */}
//         <div className="relative">
//           <select value={`${sort.field}-${sort.dir}`}
//             onChange={(e) => {
//               const [f, d] = e.target.value.split("-");
//               setSort({ field: f, dir: d }); setPage(1);
//             }}
//             className="h-9 pl-3 pr-8 rounded-lg border text-[13px] outline-none appearance-none cursor-pointer"
//             style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)", background: "white" }}>
//             <option value="name-asc">Name A–Z</option>
//             <option value="name-desc">Name Z–A</option>
//             <option value="price-asc">Price low–high</option>
//             <option value="price-desc">Price high–low</option>
//             <option value="stock-asc">Stock low–high</option>
//             <option value="updated-desc">Recently updated</option>
//           </select>
//           <ChevronDown size={13} className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
//             style={{ color: "var(--color-text-tertiary)" }} />
//         </div>

//         {/* View toggle */}
//         <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "var(--color-border-md)" }}>
//           {[["grid", LayoutGrid], ["list", List]].map(([v, Icon]) => (
//             <button key={v} onClick={() => setView(v)}
//               className="w-9 h-9 flex items-center justify-center transition-colors"
//               style={{
//                 background: view === v ? "var(--color-accent-subtle)" : "white",
//                 color: view === v ? "var(--color-accent)" : "var(--color-text-tertiary)",
//               }}>
//               <Icon size={15} />
//             </button>
//           ))}
//         </div>
//       </div>

//       {/* Status filter tabs */}
//       <div className="flex gap-1.5 mb-5 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
//         {STATUS_FILTERS.map((s) => {
//           const active = statusFilter === s;
//           const count  = s === "All" ? products.length : products.filter((p) => getStockStatus(p).label === s).length;
//           return (
//             <button key={s} onClick={() => { setStatus(s); setPage(1); }}
//               className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-medium whitespace-nowrap transition-all border flex-shrink-0"
//               style={{
//                 background:  active ? "var(--color-accent-subtle)" : "white",
//                 color:       active ? "var(--color-accent-text)"   : "var(--color-text-secondary)",
//                 borderColor: active ? "transparent"                : "var(--color-border)",
//               }}>
//               {s}
//               <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
//                 style={{ background: active ? "var(--color-accent)" : "var(--color-bg)", color: active ? "#fff" : "var(--color-text-tertiary)" }}>
//                 {count}
//               </span>
//             </button>
//           );
//         })}
//       </div>

//       {/* Empty state */}
//       {paginated.length === 0 && (
//         <div className="py-16 text-center">
//           <p className="text-[14px] font-medium mb-1" style={{ color: "var(--color-text-secondary)" }}>No products found</p>
//           <p className="text-[13px] mb-4" style={{ color: "var(--color-text-tertiary)" }}>Try changing your search or filters</p>
//           <button onClick={() => { setSearch(""); setCategory("All"); setStatus("All"); }}
//             className="text-[13px] font-medium" style={{ color: "var(--color-accent)" }}>
//             Clear filters
//           </button>
//         </div>
//       )}

//       {/* ── Grid view ── */}
//       {view === "grid" && paginated.length > 0 && (
//         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-5">
//           {paginated.map((p) => {
//             const status = getStockStatus(p);
//             const stock  = getTotalStock(p);
//             return (
//               <div key={p.id} onClick={() => setEdit(p)}
//                 className="bg-white rounded-xl border cursor-pointer overflow-hidden group transition-all hover:shadow-sm"
//                 style={{ borderColor: "var(--color-border)" }}>
//                 <div className="h-28 flex items-center justify-center text-5xl transition-transform duration-200 group-hover:scale-110"
//                   style={{ background: "var(--color-bg)" }}>
//                   {p.emoji}
//                 </div>
//                 <div className="p-3">
//                   <p className="text-[13px] font-semibold truncate mb-0.5" style={{ color: "var(--color-text-primary)" }}>{p.name}</p>
//                   {p.brand && <p className="text-[11px] truncate mb-1" style={{ color: "var(--color-text-tertiary)" }}>{p.brand}</p>}
//                   <p className="text-[14px] font-bold mb-2" style={{ color: "var(--color-accent-text)" }}>${p.price.toFixed(2)}</p>
//                   <div className="flex items-center justify-between gap-1">
//                     <span className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
//                       {stock > 0 ? `${stock} in stock` : "No stock"}
//                     </span>
//                     <Badge variant={status.variant}>{status.label}</Badge>
//                   </div>
//                   <p className="text-[10px] mt-1" style={{ color: "var(--color-text-tertiary)" }}>
//                     {p.variants.length} variant{p.variants.length !== 1 ? "s" : ""}
//                   </p>
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* ── List view ── */}
//       {view === "list" && paginated.length > 0 && (
//         <Card noPadding className="mb-5">
//           {/* Header */}
//           <div className="hidden md:grid px-4 py-2.5 border-b"
//             style={{ gridTemplateColumns: "48px 1fr 100px 120px 100px 90px", borderColor: "var(--color-border)" }}>
//             {[
//               { label: "",         field: null      },
//               { label: "Product",  field: "name"    },
//               { label: "Category", field: null      },
//               { label: "Price",    field: "price"   },
//               { label: "Stock",    field: "stock"   },
//               { label: "Status",   field: null      },
//             ].map(({ label, field }, i) => (
//               <button key={i} disabled={!field} onClick={() => field && cycleSort(field)}
//                 className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-wider disabled:cursor-default"
//                 style={{ color: "var(--color-text-tertiary)" }}>
//                 {label}
//                 {field && (
//                   sort.field === field
//                     ? sort.dir === "asc" ? <ChevronUp size={11} style={{ color: "var(--color-accent)" }} /> : <ChevronDown size={11} style={{ color: "var(--color-accent)" }} />
//                     : <ArrowUpDown size={11} style={{ opacity: 0.3 }} />
//                 )}
//               </button>
//             ))}
//           </div>
//           <div className="divide-y" style={{ borderColor: "var(--color-border)" }}>
//             {paginated.map((p) => {
//               const status = getStockStatus(p);
//               const stock  = getTotalStock(p);
//               return (
//                 <div key={p.id} onClick={() => setEdit(p)}
//                   className="cursor-pointer transition-colors hover:bg-[var(--color-bg)] px-4 py-3">
//                   {/* Mobile */}
//                   <div className="md:hidden flex items-center gap-3">
//                     <span className="text-3xl">{p.emoji}</span>
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2 flex-wrap">
//                         <p className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{p.name}</p>
//                         <Badge variant={status.variant}>{status.label}</Badge>
//                       </div>
//                       <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
//                         {p.category} · {p.variants.length} variants · {stock} in stock
//                       </p>
//                     </div>
//                     <p className="text-[14px] font-bold flex-shrink-0" style={{ color: "var(--color-accent-text)" }}>${p.price.toFixed(2)}</p>
//                   </div>
//                   {/* Desktop */}
//                   <div className="hidden md:grid items-center" style={{ gridTemplateColumns: "48px 1fr 100px 120px 100px 90px" }}>
//                     <span className="text-2xl">{p.emoji}</span>
//                     <div>
//                       <p className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>{p.name}</p>
//                       <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
//                         {p.brand || "—"} · {p.variants.length} variant{p.variants.length !== 1 ? "s" : ""}
//                       </p>
//                     </div>
//                     <span className="text-[12px]" style={{ color: "var(--color-text-secondary)" }}>{p.category || "—"}</span>
//                     <span className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>${p.price.toFixed(2)}</span>
//                     <span className="text-[12px]" style={{ color: stock === 0 ? "var(--color-danger)" : "var(--color-text-secondary)" }}>
//                       {stock} units
//                     </span>
//                     <Badge variant={status.variant}>{status.label}</Badge>
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         </Card>
//       )}

//       {/* Pagination */}
//       {totalPages > 1 && (
//         <div className="flex items-center justify-between mb-5">
//           <p className="text-[12px]" style={{ color: "var(--color-text-tertiary)" }}>
//             Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
//           </p>
//           <div className="flex gap-1">
//             <button disabled={page === 1} onClick={() => setPage((p) => p - 1)}
//               className="w-8 h-8 flex items-center justify-center rounded-lg border text-[13px] disabled:opacity-40 hover:bg-[var(--color-bg)] transition-colors"
//               style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>‹</button>
//             {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
//               <button key={n} onClick={() => setPage(n)}
//                 className="w-8 h-8 flex items-center justify-center rounded-lg text-[12px] font-medium border transition-colors"
//                 style={{ background: n === page ? "var(--color-accent)" : "transparent", color: n === page ? "#fff" : "var(--color-text-secondary)", borderColor: n === page ? "var(--color-accent)" : "var(--color-border)" }}>
//                 {n}
//               </button>
//             ))}
//             <button disabled={page === totalPages} onClick={() => setPage((p) => p + 1)}
//               className="w-8 h-8 flex items-center justify-center rounded-lg border text-[13px] disabled:opacity-40 hover:bg-[var(--color-bg)] transition-colors"
//               style={{ borderColor: "var(--color-border)", color: "var(--color-text-secondary)" }}>›</button>
//           </div>
//         </div>
//       )}

//       {/* Edit drawer */}
//       {editProduct && (
//         <EditProductDrawer
//           product={editProduct}
//           onClose={() => setEdit(null)}
//           onSave={handleSave}
//         />
//       )}
//     </div>
//   );
// }

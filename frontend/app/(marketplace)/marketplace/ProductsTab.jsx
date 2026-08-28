"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductPreviewModal } from "@/components/products/ProductPreviewModal";
import { ProductFilterSidebar } from "@/components/products/ProductFilterSidebar";
import { Select, Skeleton, EmptyState } from "@/components/ui";
import { useMarketplaceProducts } from "@/lib/hooks/useMarketplace";
import { useCategoriesFlat } from "@/lib/hooks/useCategories";
import { cn, buildParams } from "@/lib/utils";

// Rating-based sort dropped — no rating field exists in the live
// product data yet (see refactor plan, item D).
const SORT_OPTS = [
  { value: "created_at-desc", label: "Newest first" },
  { value: "created_at-asc", label: "Oldest first" },
  { value: "price-asc", label: "Price: low → high" },
  { value: "price-desc", label: "Price: high → low" },
];

/** Numbered pager driven by meta.page / meta.totalPages from useMarketplaceProducts */
function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;

  const pages = [];
  const push = (p) => pages.push(p);
  push(1);
  if (page > 3) push("…");
  for (let p = Math.max(2, page - 1); p <= Math.min(totalPages - 1, page + 1); p++) {
    push(p);
  }
  if (page < totalPages - 2) push("…");
  if (totalPages > 1) push(totalPages);

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10">
      <button
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center border border-[var(--color-border-md)] text-[var(--color-text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--color-primary)] transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft size={15} />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span
            key={`ellipsis-${i}`}
            className="w-9 h-9 flex items-center justify-center text-[13px] text-[var(--color-text-muted)]"
          >
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={cn(
              "w-9 h-9 rounded-[var(--radius-sm)] text-[13px] font-medium transition-colors",
              p === page
                ? "bg-[var(--color-primary)] text-white"
                : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg)]"
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        className="w-9 h-9 rounded-[var(--radius-sm)] flex items-center justify-center border border-[var(--color-border-md)] text-[var(--color-text-secondary)] disabled:opacity-30 disabled:cursor-not-allowed hover:border-[var(--color-primary)] transition-colors"
        aria-label="Next page"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

export function ProductsTab() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Click-driven filters — derived straight from the URL every render.
  // No local state needed: nothing about these is continuously typed,
  // so there's no risk of the URL round-trip feeling laggy, and this
  // way there's zero chance of local state drifting from the URL on
  // back/forward navigation or a shared link.
  const category = searchParams.get("category") ?? "";
  const sort = searchParams.get("sort") ?? "created_at-desc";
  const page = Number(searchParams.get("page")) || 1;

  // Freely-typed filters get locally-staged state (for responsive
  // typing) that's seeded from the URL on mount and re-synced whenever
  // the URL's value changes from outside this component (back button,
  // a shared link, a category quick-link elsewhere in the app).
  const urlQuery = searchParams.get("q") ?? "";
  const urlMin = searchParams.get("min") ?? "";
  const urlMax = searchParams.get("max") ?? "";

  const [search, setSearch] = useState(urlQuery);
  const [minPrice, setMinPrice] = useState(urlMin);
  const [maxPrice, setMaxPrice] = useState(urlMax);
  useEffect(() => setSearch(urlQuery), [urlQuery]);
  useEffect(() => setMinPrice(urlMin), [urlMin]);
  useEffect(() => setMaxPrice(urlMax), [urlMax]);

  const [preview, setPreview] = useState(null);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Pushes a patch of params into the URL, merging with (not replacing)
  // whatever's already there — e.g. preserves ?tab=products when this
  // is mounted inside the /marketplace tabs page.
  const updateParams = (patch) => {
    router.replace(`${pathname}?${buildParams(searchParams, patch)}`, { scroll: false });
  };

  // Debounced write-through for price — avoids a navigation on every
  // keystroke while typing a number, without changing the end result.
  const priceDebounce = useRef(null);
  const updatePriceParams = (patch) => {
    if (priceDebounce.current) clearTimeout(priceDebounce.current);
    priceDebounce.current = setTimeout(() => {
      updateParams({ ...patch, page: undefined });
    }, 300);
  };
  useEffect(() => () => priceDebounce.current && clearTimeout(priceDebounce.current), []);

  const [sortField, sortOrder] = sort.split("-");
  const { products, meta, isLoading, isRefreshing } = useMarketplaceProducts({
    page,
    limit: 24,
    search: urlQuery,
    category,
    min_price: urlMin || undefined,
    max_price: urlMax || undefined,
    sort: sortField,
    order: sortOrder,
  });

  const { data: CATEGORIES } = useCategoriesFlat();

  const topRef = useRef(null);

  const hasFilters = urlQuery || category || urlMin || urlMax;
  const clearFilters = () => {
    setSearch("");
    setMinPrice("");
    setMaxPrice("");
    updateParams({ q: null, category: null, min: null, max: null, page: null });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    updateParams({ q: search.trim() || null, page: null });
  };

  useEffect(() => {
    topRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [page]);

  const sidebarProps = {
    categories: CATEGORIES,
    category,
    onCategoryChange: (v) => updateParams({ category: v || null, page: null }),
    minPrice,
    maxPrice,
    onMinPriceChange: (v) => { setMinPrice(v); updatePriceParams({ min: v || null }); },
    onMaxPriceChange: (v) => { setMaxPrice(v); updatePriceParams({ max: v || null }); },
    onApply: () => setMobileFiltersOpen(false),
    onClear: clearFilters,
    hasFilters,
  };

  return (
    <div>
      <div ref={topRef} />

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-[13px] text-[var(--color-text-secondary)] mb-5">
        <Link href="/marketplace" className="hover:text-[var(--color-text-primary)] transition-colors">
          Home
        </Link>
        <span>/</span>
        <span className="text-[var(--color-text-primary)] font-medium">
          {category || "All Products"}
        </span>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <ProductFilterSidebar {...sidebarProps} />
        </aside>

        <div className="flex-1 min-w-0">
          {/* Search + top bar */}
          <div className="flex flex-wrap gap-3 mb-5">
            <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
              />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="w-full h-10 pl-9 pr-4 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] bg-white text-[13px] outline-none focus:border-[var(--color-primary)] transition-colors"
              />
            </form>

            {/* Mobile filter toggle */}
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className={cn(
                "lg:hidden flex items-center gap-2 h-10 px-4 rounded-[var(--radius-sm)] border text-[13px] font-medium transition-colors",
                hasFilters
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary-text)]"
                  : "border-[var(--color-border-md)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
              )}
            >
              <SlidersHorizontal size={14} /> Filters
            </button>

            <Select
              value={sort}
              onChange={(e) => updateParams({ sort: e.target.value, page: null })}
              className="min-w-[170px]"
            >
              {SORT_OPTS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          {/* Results header */}
          {meta && (
            <p className="text-[13px] text-[var(--color-text-secondary)] mb-4">
              Selected Products:{" "}
              <strong className="text-[var(--color-text-primary)]">
                {meta.total.toLocaleString()}
              </strong>
              {urlQuery && (
                <span>
                  {" "}
                  for "
                  <strong className="text-[var(--color-text-primary)]">
                    {urlQuery}
                  </strong>
                  "
                </span>
              )}
            </p>
          )}

          {/* Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-[var(--color-bg)] rounded-[var(--radius)] overflow-hidden">
                  <Skeleton className="aspect-square" />
                  <div className="p-3 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <EmptyState
              icon={Search}
              title={hasFilters ? "No results found" : "No products yet"}
              description={
                hasFilters
                  ? "Try adjusting your search or filters"
                  : "Check back soon — new products are listed daily"
              }
              action={
                hasFilters ? (
                  <button
                    onClick={clearFilters}
                    className="text-[13px] font-medium text-[var(--color-primary)] hover:underline"
                  >
                    Clear filters
                  </button>
                ) : null
              }
            />
          ) : (
            <div
              className={cn(
                "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-3 gap-4 transition-opacity",
                isRefreshing && "opacity-60"
              )}
            >
              {products.map((p) => (
                <ProductCard key={p.id} product={p} onQuickView={setPreview} />
              ))}
            </div>
          )}

          <Pagination
            page={page}
            totalPages={meta?.totalPages ?? 1}
            onChange={(p) => updateParams({ page: p === 1 ? null : p })}
          />
        </div>
      </div>

      {/* Mobile filter sheet */}
      {mobileFiltersOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-[85%] max-w-sm bg-white overflow-y-auto p-5">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setMobileFiltersOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-[var(--color-bg)]"
              >
                <X size={16} />
              </button>
            </div>
            <ProductFilterSidebar {...sidebarProps} />
          </div>
        </div>
      )}

      <ProductPreviewModal
        product={preview}
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
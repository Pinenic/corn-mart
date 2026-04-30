"use client";
import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductPreviewModal } from "@/components/products/ProductPreviewModal";
import { Button, Select, Skeleton, EmptyState } from "@/components/ui";
import { useMarketplaceProducts } from "@/lib/hooks/useMarketplace";
import { useCategoriesFlat } from "@/lib/hooks/useCategories";
import { cn } from "@/lib/utils";

// const CATEGORIES = [
//   "Footwear",
//   "Electronics",
//   "Accessories",
//   "Apparel",
//   "Home & Living",
//   "Bags",
//   "Beauty",
//   "Sports",
//   "Books",
//   "Toys",
// ];
const SORT_OPTS = [
  { value: "created_at-desc", label: "Newest first" },
  { value: "created_at-asc", label: "Oldest first" },
  { value: "price-asc", label: "Price: low → high" },
  { value: "price-desc", label: "Price: high → low" },
];

export function ProductsTab() {
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sort, setSort] = useState("created_at-desc");
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState(null);
  const [filtersOpen, setFilters] = useState(false);

  const [sortField, sortOrder] = sort.split("-");
  const { products, meta, isLoading, isRefreshing } = useMarketplaceProducts({
    page,
    limit: 24,
    search: query,
    category,
    min_price: minPrice || undefined,
    max_price: maxPrice || undefined,
    sort: sortField,
    order: sortOrder,
  });

  const { data:CATEGORIES, error} = useCategoriesFlat()
  // console.log(CATEGORIES);


  const hasFilters = query || category || minPrice || maxPrice;
  const clearFilters = () => {
    setQuery("");
    setSearch("");
    setCategory("");
    setMinPrice("");
    setMaxPrice("");
    setPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery(search.trim());
    setPage(1);
  };

  return (
    <div>
      {/* Search + filter bar */}
      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none"
          />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-[var(--color-border-md)] bg-white text-[13px] outline-none focus:border-[var(--color-primary)] transition-colors"
          />
        </form>

        <Select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="min-w-[140px]"
        >
          <option value="">All categories</option>
          {CATEGORIES.map((c) => (
            <option key={c.slug} value={c.name}>
              {c.name}
            </option>
          ))}
        </Select>

        <Select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          className="min-w-[160px]"
        >
          {SORT_OPTS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <button
          onClick={() => setFilters((v) => !v)}
          className={cn(
            "flex items-center gap-2 h-10 px-4 rounded-xl border text-[13px] font-medium transition-colors",
            filtersOpen
              ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary-text)]"
              : "border-[var(--color-border-md)] bg-white text-[var(--color-text-secondary)] hover:border-[var(--color-primary)]"
          )}
        >
          <SlidersHorizontal size={14} /> Filters
          {hasFilters && (
            <span className="w-4 h-4 rounded-full bg-[var(--color-primary)] text-white text-[9px] font-bold flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* Price filter expansion */}
      {filtersOpen && (
        <div className="bg-white rounded-2xl border border-[var(--color-border)] p-4 mb-6 flex flex-wrap gap-4 items-end">
          <div>
            <label className="text-[11px] font-medium text-[var(--color-text-secondary)] block mb-1">
              Min price ($)
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              placeholder="0"
              min="0"
              className="w-28 h-9 px-3 rounded-xl border border-[var(--color-border-md)] text-[13px] outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div>
            <label className="text-[11px] font-medium text-[var(--color-text-secondary)] block mb-1">
              Max price ($)
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Any"
              min="0"
              className="w-28 h-9 px-3 rounded-xl border border-[var(--color-border-md)] text-[13px] outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setPage(1);
              setFilters(false);
            }}
          >
            Apply
          </Button>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-[12px] text-[var(--color-danger)] hover:underline"
            >
              <X size={12} />
              Clear all
            </button>
          )}
        </div>
      )}

      {/* Results header */}
      {meta && (
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-4">
          {meta.total.toLocaleString()} product{meta.total !== 1 ? "s" : ""}
          {query && (
            <span>
              {" "}
              for "
              <strong className="text-[var(--color-text-primary)]">
                {query}
              </strong>
              "
            </span>
          )}
          {category && (
            <span>
              {" "}
              in{" "}
              <strong className="text-[var(--color-text-primary)]">
                {category}
              </strong>
            </span>
          )}
        </p>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 24 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl overflow-hidden border border-[var(--color-border)]"
            >
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
              <Button variant="secondary" onClick={clearFilters}>
                Clear filters
              </Button>
            ) : null
          }
        />
      ) : (
        <div
          className={cn(
            "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 transition-opacity",
            isRefreshing && "opacity-60"
          )}
        >
          {products.map((p) => (
            <ProductCard key={p.id} product={p} onQuickView={setPreview} />
          ))}
        </div>
      )}

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button
            variant="secondary"
            size="sm"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ‹ Prev
          </Button>
          <span className="text-[13px] text-[var(--color-text-secondary)] px-2">
            Page {page} of {meta.totalPages}
          </span>
          <Button
            variant="secondary"
            size="sm"
            disabled={page >= meta.totalPages}
            onClick={() => setPage((p) => p + 1)}
          >
            Next ›
          </Button>
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

"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import { StoreCard }             from "@/components/stores/StoreCard";
import { Button, Select, Skeleton, EmptyState } from "@/components/ui";
import { useMarketplaceStores }  from "@/lib/hooks/useMarketplace";
import { cn } from "@/lib/utils";

export function StoresTab() {
  const [search, setSearch] = useState("");
  const [query,  setQuery]  = useState("");
  const [sort,   setSort]   = useState("followers_count-desc");
  const [page,   setPage]   = useState(1);

  const [sortField, sortOrder] = sort.split("-");
  const { stores, meta, isLoading, isRefreshing } = useMarketplaceStores({
    page, limit: 20, search: query, sort: sortField, order: sortOrder,
  });

  const handleSearch = (e) => { e.preventDefault(); setQuery(search.trim()); setPage(1); };

  return (
    <div>
      <div className="flex flex-wrap gap-3 mb-6">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)] pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search stores…"
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-[var(--color-border-md)] bg-white text-[13px] outline-none focus:border-[var(--color-primary)] transition-colors" />
        </form>
        <Select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} className="min-w-[160px]">
          <option value="followers_count-desc">Most popular</option>
          <option value="created_at-desc">Newest</option>
          <option value="name-asc">Name A–Z</option>
        </Select>
      </div>

      {meta && (
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-4">
          {meta.total.toLocaleString()} store{meta.total !== 1 ? "s" : ""}
          {query && <span> matching "<strong className="text-[var(--color-text-primary)]">{query}</strong>"</span>}
        </p>
      )}

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-2xl" />)}
        </div>
      ) : stores.length === 0 ? (
        <EmptyState icon={Search} title="No stores found" description={query ? "Try a different search term" : "No stores available yet"} />
      ) : (
        <div className={cn("grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4", isRefreshing && "opacity-60")}>
          {stores.map(s => <StoreCard key={s.id} store={s} />)}
        </div>
      )}

      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-10">
          <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</Button>
          <span className="text-[13px] text-[var(--color-text-secondary)] px-2">Page {page} of {meta.totalPages}</span>
          <Button variant="secondary" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Next ›</Button>
        </div>
      )}
    </div>
  );
}

"use client";
import { use, useState } from "react";
import { Package } from "lucide-react";
import { useStore, useStoreProducts } from "@/lib/hooks/useMarketplace";
import { StorefrontHeader }    from "@/components/stores/StorefrontHeader";
import { ProductCard }         from "@/components/products/ProductCard";
import { ProductPreviewModal } from "@/components/products/ProductPreviewModal";
import { Button, Skeleton, EmptyState } from "@/components/ui";
import { cn } from "@/lib/utils";

export default function StoreProfilePage({ params }) {
  const { storeId } = use(params);
  const { store, isLoading: storeLoading }   = useStore(storeId);
  const [page, setPage] = useState(1);
  const [preview, setPreview] = useState(null);
  const { products, meta, isLoading: pLoading, isRefreshing } = useStoreProducts(storeId, { page });

  if (storeLoading) {
    return (
      <div>
        <Skeleton className="h-40 md:h-56 rounded-none" />
        <div className="max-w-5xl mx-auto px-4 md:px-6 pt-4 pb-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[var(--color-border)]">
              <Skeleton className="aspect-square" />
              <div className="p-3 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-20 text-center">
        <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-2">Store not found</h2>
        <p className="text-[13px] text-[var(--color-text-secondary)]">This store may no longer be available.</p>
      </div>
    );
  }

  return (
    <div>
      <StorefrontHeader store={store} />

      <div className="max-w-5xl mx-auto px-4 md:px-6 pb-12">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-bold text-[var(--color-text-primary)]">Products</h2>
          {meta && <p className="text-[13px] text-[var(--color-text-secondary)]">{meta.total} listing{meta.total !== 1 ? "s" : ""}</p>}
        </div>

        {pLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-[var(--color-border)]">
                <Skeleton className="aspect-square" />
                <div className="p-3 space-y-2"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-4 w-1/2" /></div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <EmptyState icon={Package} title="No products yet" description="This store hasn't listed any products yet. Check back soon!" />
        ) : (
          <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", isRefreshing && "opacity-60")}>
            {products.map(p => <ProductCard key={p.id} product={{ ...p, store }} onQuickView={setPreview} />)}
          </div>
        )}

        {meta && meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-10">
            <Button variant="secondary" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹ Prev</Button>
            <span className="text-[13px] text-[var(--color-text-secondary)] px-2">Page {page} of {meta.totalPages}</span>
            <Button variant="secondary" size="sm" disabled={page >= meta.totalPages} onClick={() => setPage(p => p + 1)}>Next ›</Button>
          </div>
        )}
      </div>

      <ProductPreviewModal product={preview} open={Boolean(preview)} onClose={() => setPreview(null)} />
    </div>
  );
}

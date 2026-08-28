"use client";
import { useState } from "react";
import { useStoreProducts } from "@/lib/hooks/useMarketplace";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductPreviewModal } from "@/components/products/ProductPreviewModal";
import { Skeleton, EmptyState } from "@/components/ui";
import { SUPPORTED_TAB_SOURCES } from "@/lib/storefront/configSchema";
import { Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductTabsBlock({ block, store }) {
  // Only "newest" has real data behind it right now — see
  // lib/storefront/configSchema.js. Tabs referencing "bestseller" or
  // "featured" are quietly dropped until that data exists, rather
  // than showing a tab that always renders empty.
  const tabs = block.tabs.filter((t) => SUPPORTED_TAB_SOURCES.includes(t.source));
  const [active, setActive] = useState(0);
  const [preview, setPreview] = useState(null);

  // useStoreProducts is already sorted created_at desc — exactly "newest".
  const { products, isLoading } = useStoreProducts(store?.id, { limit: 8 });

  if (tabs.length === 0) return null;

  return (
    <div className="mb-12">
      {/* Tab bar */}
      <div className="flex items-center gap-6 border-b border-[var(--color-border)] mb-6">
        {tabs.map((tab, i) => (
          <button
            key={tab.label}
            onClick={() => setActive(i)}
            className={cn(
              "pb-3 text-[14px] font-medium transition-colors relative -mb-px",
              i === active
                ? "text-[var(--color-text-primary)] border-b-2 border-[var(--color-primary)]"
                : "text-[var(--color-text-muted)] hover:text-[var(--color-text-secondary)]"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
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
        <EmptyState icon={Package} title="No products yet" description="Check back soon" />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={{ ...p, store }} onQuickView={setPreview} />
          ))}
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

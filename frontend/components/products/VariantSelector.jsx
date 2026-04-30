"use client";
import { cn } from "@/lib/utils";

export function VariantSelector({ variants, selected, onSelect }) {
  if (!variants?.length) return null;

  // Group by option type if names follow "Colour / Size" pattern
  // Otherwise just render as flat pills
  return (
    <div className="space-y-3">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)]">
        Variant
        {selected && (
          <span className="ml-2 normal-case font-normal text-[var(--color-text-secondary)]">
            — {selected.name}
          </span>
        )}
      </p>
      <div className="flex flex-wrap gap-2">
        {variants.map((v) => {
          const isSel      = selected?.id === v.id;
          const outOfStock = (v.available_stock ?? 0) <= 0;
          return (
            <button
              key={v.id}
              onClick={() => onSelect(isSel ? null : v)}
              disabled={outOfStock}
              className={cn(
                "px-3 py-1.5 rounded-xl border text-[12px] font-medium transition-all",
                isSel
                  ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary-text)]"
                  : outOfStock
                  ? "border-[var(--color-border)] text-[var(--color-text-muted)] line-through opacity-50 cursor-not-allowed"
                  : "border-[var(--color-border-md)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              )}
            >
              {v.name}
              {v.price && <span className="ml-1 opacity-70">(K{Number(v.price).toFixed(2)})</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

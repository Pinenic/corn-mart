"use client";
import { useState } from "react";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Collapsible filter section — mirrors the mockup's accordion pattern
 * (Brand / Battery capacity / Screen type / etc.) but only the two
 * sections backed by real data are wired up: Category and Price.
 */
function FilterSection({ title, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-[var(--color-border)] py-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-[14px] font-semibold text-[var(--color-text-primary)]"
      >
        {title}
        {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

/**
 * Product filter sidebar. Used both as the fixed desktop sidebar and
 * (by the parent) inside a mobile bottom-sheet — this component only
 * renders the filter controls, not the sheet/positioning chrome.
 *
 * Category behaves as a single-select (radio-style) even though it's
 * rendered as checkboxes, matching the mockup's visual language —
 * the marketplace API only accepts one `category` value per query.
 */
export function ProductFilterSidebar({
  categories = [],
  category,
  onCategoryChange,
  minPrice,
  maxPrice,
  onMinPriceChange,
  onMaxPriceChange,
  onApply,
  onClear,
  hasFilters,
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <h2 className="text-[16px] font-bold text-[var(--color-text-primary)]">
          Filters
        </h2>
        {hasFilters && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-[12px] text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors"
          >
            <X size={12} />
            Clear all
          </button>
        )}
      </div>

      <FilterSection title="Price">
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-[11px] text-[var(--color-text-muted)] block mb-1">
              From
            </label>
            <input
              type="number"
              value={minPrice}
              onChange={(e) => onMinPriceChange(e.target.value)}
              placeholder="0"
              min="0"
              className="w-full h-9 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] text-[13px] outline-none focus:border-[var(--color-primary)]"
            />
          </div>
          <div className="flex-1">
            <label className="text-[11px] text-[var(--color-text-muted)] block mb-1">
              To
            </label>
            <input
              type="number"
              value={maxPrice}
              onChange={(e) => onMaxPriceChange(e.target.value)}
              placeholder="Any"
              min="0"
              className="w-full h-9 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] text-[13px] outline-none focus:border-[var(--color-primary)]"
            />
          </div>
        </div>
      </FilterSection>

      <FilterSection title="Category">
        <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
          {categories.map((c) => {
            const checked = category === c.name;
            return (
              <label
                key={c.slug}
                className="flex items-center gap-2.5 text-[13px] text-[var(--color-text-secondary)] cursor-pointer select-none"
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onCategoryChange(checked ? "" : c.name)}
                  className="w-4 h-4 rounded accent-[var(--color-primary)]"
                />
                <span
                  className={cn(
                    checked && "text-[var(--color-text-primary)] font-medium"
                  )}
                >
                  {c.name}
                </span>
              </label>
            );
          })}
          {categories.length === 0 && (
            <p className="text-[12px] text-[var(--color-text-muted)]">
              No categories yet
            </p>
          )}
        </div>
      </FilterSection>

      <button
        onClick={onApply}
        className="w-full h-11 mt-4 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[13px] font-semibold hover:bg-[var(--color-primary-hover)] transition-colors"
      >
        Apply
      </button>
    </div>
  );
}

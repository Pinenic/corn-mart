"use client";
import { cn, formatPrice } from "@/lib/utils";

// Rough name → hex map for the preset "Color" option values (lib/products-data.js
// DEFAULT_OPTION_TYPES) so swatches can render as actual color circles.
// Anything unrecognized falls back to a neutral dot with the name as a tooltip.
const COLOR_HEX = {
  black: "#0a0a0a",
  white: "#ffffff",
  navy: "#1e293b",
  grey: "#9ca3af",
  gray: "#9ca3af",
  red: "#dc2626",
  green: "#16a34a",
  blue: "#2563eb",
  yellow: "#eab308",
  pink: "#ec4899",
  purple: "#7c3aed",
  gold: "#d4af37",
  silver: "#c0c0c0",
};

// Option types rendered as circular swatches vs. boxed pills — matches the
// mockup's two distinct swatch styles without requiring new schema.
const CIRCLE_TYPES = new Set(["color", "colour", "finish"]);

/** Splits a composite variant name like "Purple / 256GB" into trimmed tokens. */
function tokenize(name) {
  return (name || "")
    .split(/[/,-]/)
    .map((t) => t.trim())
    .filter(Boolean);
}

export function VariantSelector({ variants, selected, onSelect }) {
  if (!variants?.length) return null;

  // Canonical option definitions come from whichever variant has them set —
  // sellers define options once and variants are generated from combinations.
  const optionDefs = variants.find((v) => v.options?.length)?.options ?? [];

  // Legacy/simple products with no option metadata: keep the original flat
  // pill list exactly as before, so nothing breaks for existing data.
  if (optionDefs.length === 0) {
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
            const isSel = selected?.id === v.id;
            const outOfStock = (v.available_stock ?? 0) <= 0;
            return (
              <button
                key={v.id}
                onClick={() => onSelect(isSel ? null : v)}
                disabled={outOfStock}
                className={cn(
                  "px-3 py-1.5 rounded-[var(--radius-sm)] border text-[12px] font-medium transition-all",
                  isSel
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary-text)]"
                    : outOfStock
                    ? "border-[var(--color-border)] text-[var(--color-text-muted)] line-through opacity-50 cursor-not-allowed"
                    : "border-[var(--color-border-md)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                )}
              >
                {v.name}
                {v.price && <span className="ml-1 opacity-70">({formatPrice(v.price)})</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const variantTokens = variants.map((v) => ({ v, tokens: tokenize(v.name) }));
  const selectedTokens = selected ? tokenize(selected.name) : [];

  // A value is unavailable only if every variant containing it is out of stock.
  const isValueUnavailable = (value) =>
    variantTokens
      .filter(({ tokens }) => tokens.some((t) => t.toLowerCase() === value.toLowerCase()))
      .every(({ v }) => (v.available_stock ?? 0) <= 0);

  const handlePick = (optionName, value) => {
    // Keep the currently-selected value for every other option axis, swap in
    // the newly clicked value for this axis, and find the variant whose name
    // contains that exact combination of tokens.
    const otherValues = optionDefs
      .filter((o) => o.name !== optionName)
      .map((o) => o.values.find((val) => selectedTokens.some((t) => t.toLowerCase() === val.toLowerCase())))
      .filter(Boolean);
    const targetValues = [...otherValues, value].map((v) => v.toLowerCase());

    const exactMatch = variantTokens.find(({ tokens }) => {
      const lower = tokens.map((t) => t.toLowerCase());
      return targetValues.every((tv) => lower.includes(tv));
    });

    const fallbackMatch = variantTokens.find(({ tokens }) =>
      tokens.some((t) => t.toLowerCase() === value.toLowerCase())
    );

    const match = exactMatch ?? fallbackMatch;
    if (match) onSelect(match.v);
  };

  return (
    <div className="space-y-4">
      {optionDefs.map((opt) => {
        const isCircle = CIRCLE_TYPES.has(opt.name.toLowerCase());
        return (
          <div key={opt.name} className="space-y-2">
            <p className="text-[12px] font-medium text-[var(--color-text-secondary)]">
              Select {opt.name.toLowerCase()}:
            </p>
            <div className="flex flex-wrap gap-2.5">
              {opt.values.map((value) => {
                const isSel = selectedTokens.some(
                  (t) => t.toLowerCase() === value.toLowerCase()
                );
                const unavailable = isValueUnavailable(value);

                if (isCircle) {
                  const hex = COLOR_HEX[value.toLowerCase()] ?? "#d4d4d4";
                  return (
                    <button
                      key={value}
                      title={value}
                      disabled={unavailable}
                      onClick={() => handlePick(opt.name, value)}
                      className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center transition-all",
                        isSel
                          ? "ring-2 ring-offset-2 ring-[var(--color-primary)]"
                          : "ring-1 ring-offset-2 ring-[var(--color-border-md)]",
                        unavailable && "opacity-30 cursor-not-allowed"
                      )}
                    >
                      <span
                        className="w-full h-full rounded-full border border-black/10"
                        style={{ background: hex }}
                      />
                    </button>
                  );
                }

                return (
                  <button
                    key={value}
                    disabled={unavailable}
                    onClick={() => handlePick(opt.name, value)}
                    className={cn(
                      "px-3.5 h-9 rounded-[var(--radius-sm)] border text-[13px] font-medium transition-all",
                      isSel
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : unavailable
                        ? "border-[var(--color-border)] text-[var(--color-text-muted)] line-through opacity-40 cursor-not-allowed"
                        : "border-[var(--color-border-md)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
                    )}
                  >
                    {value}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}

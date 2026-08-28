import { z } from "zod";

// ── Block schemas ────────────────────────────────────────────
// Each block type is validated independently. A store's config is an
// *array* of blocks — we parse block-by-block so one bad/unknown entry
// (e.g. a stale "discountGrid" block saved before that block type
// existed) never takes down the whole page. See safeParseBlock below.

const heroSchema = z.object({
  type: z.literal("hero"),
  enabled: z.boolean().default(true),
  eyebrow: z.string().max(60).optional(),
  headline: z.string().min(1).max(80),
  subhead: z.string().max(160).optional(),
  cta: z
    .object({
      label: z.string().max(30).default("Shop Now"),
      // Accepts a real URL, null, or "" (what a blank text input sends) —
      // all three mean "use the default store link".
      href: z
        .union([z.string().url(), z.literal(""), z.null()])
        .optional()
        .transform((v) => (v ? v : null)),
    })
    .default({ label: "Shop Now", href: null }),
  // null → falls back to store.banner (see resolveHeroImage)
  image: z.string().url().nullable().default(null),
  theme: z.enum(["dark", "light"]).default("dark"),
});

// Only "newest" is wired to real data right now. "bestseller" and
// "featured" are accepted here so a config that references them
// doesn't fail validation outright — they're just filtered out at
// render time until the backing data exists (see ProductTabsBlock).
const productTabSourceSchema = z.enum(["newest", "bestseller", "featured"]);

const productTabsSchema = z.object({
  type: z.literal("productTabs"),
  enabled: z.boolean().default(true),
  tabs: z
    .array(
      z.object({
        label: z.string().min(1).max(30),
        source: productTabSourceSchema,
      })
    )
    .min(1)
    .default([{ label: "New Arrival", source: "newest" }]),
});

const BLOCK_SCHEMAS = {
  hero: heroSchema,
  productTabs: productTabsSchema,
};

// Exported individually so the editor can validate each section's draft
// against the exact same rules the renderer/parser use.
export { heroSchema, productTabsSchema };

// Sources that actually have real data behind them today.
export const SUPPORTED_TAB_SOURCES = ["newest"];

/**
 * Validates a single raw block against its type's schema.
 * Returns the parsed block, or null if the type is unknown/unsupported
 * or the shape doesn't validate — callers should filter out nulls.
 */
export function safeParseBlock(raw) {
  if (!raw || typeof raw !== "object" || !raw.type) return null;
  const schema = BLOCK_SCHEMAS[raw.type];
  if (!schema) return null; // unknown/future block type — ignore, don't crash

  const result = schema.safeParse(raw);
  return result.success ? result.data : null;
}

/**
 * Parses a store's raw `config` column into a safe, ordered list of
 * renderable blocks. Handles null config, malformed JSON shape, and
 * individually-invalid blocks without ever throwing.
 *
 * Used by the public storefront renderer — disabled blocks are dropped
 * since there's nothing to render. For the editor, use
 * parseStoreConfigForEditing instead, which keeps disabled blocks so
 * they can be shown (and re-enabled) in the UI.
 */
export function parseStoreConfig(rawConfig) {
  if (!rawConfig || !Array.isArray(rawConfig.blocks)) {
    return defaultStoreConfig().blocks;
  }
  return rawConfig.blocks
    .map(safeParseBlock)
    .filter(Boolean)
    .filter((b) => b.enabled);
}

/**
 * Same parsing as parseStoreConfig, but keeps disabled blocks — for the
 * dashboard editor, where a seller needs to see and re-enable a block
 * they previously turned off.
 */
export function parseStoreConfigForEditing(rawConfig) {
  if (!rawConfig || !Array.isArray(rawConfig.blocks)) {
    return defaultStoreConfig().blocks;
  }
  return rawConfig.blocks.map(safeParseBlock).filter(Boolean);
}

/**
 * Finds a block of the given type in a parsed block list, falling back
 * to that block type's slice of defaultStoreConfig() if missing —
 * so the editor always has something to render even for a store whose
 * saved config is missing a block entirely (e.g. hand-edited or from
 * a future/partial save).
 */
export function getBlockOrDefault(blocks, type) {
  return (
    blocks.find((b) => b.type === type) ??
    defaultStoreConfig().blocks.find((b) => b.type === type)
  );
}

/**
 * Validates a hero + productTabs draft (as edited in the dashboard)
 * against the real schemas before saving, so the editor can never
 * persist a config shape the renderer/parser would reject.
 *
 * Returns { valid, errors: {hero, productTabs}, config }.
 * `config` is null unless both blocks validate successfully.
 */
export function buildConfigForSave({ hero, productTabs }) {
  const heroResult = heroSchema.safeParse(hero);
  const tabsResult = productTabsSchema.safeParse(productTabs);

  return {
    valid: heroResult.success && tabsResult.success,
    errors: {
      hero: heroResult.success ? null : heroResult.error.flatten(),
      productTabs: tabsResult.success ? null : tabsResult.error.flatten(),
    },
    config:
      heroResult.success && tabsResult.success
        ? { version: 1, blocks: [heroResult.data, tabsResult.data] }
        : null,
  };
}

/**
 * Fallback for every store that hasn't customized `config` yet
 * (i.e. all of them, today) — a minimal, sensible default so the
 * storefront never renders empty.
 */
export function defaultStoreConfig() {
  return {
    version: 1,
    blocks: [
      {
        type: "hero",
        enabled: true,
        headline: "Welcome to our store",
        subhead: "Browse our latest products below.",
        cta: { label: "Shop Now", href: null },
        image: null,
        theme: "dark",
      },
      {
        type: "productTabs",
        enabled: true,
        tabs: [{ label: "New Arrival", source: "newest" }],
      },
    ],
  };
}
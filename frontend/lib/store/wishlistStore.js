"use client";
// lib/store/wishlistStore.js
// ─────────────────────────────────────────────────────────────
// Wishlist store — signed-in users only (no guest/local mode,
// unlike cartStore). Talks directly to Supabase under RLS, same
// pattern as cartStore — no Express API layer involved.
//
// Unlike cart, there's no quantity to merge and no atomicity
// concern, so add/remove are plain client insert/delete calls
// rather than RPCs.
//
// Item shape:
// {
//   key:           "product-uuid::variant-uuid" | "product-uuid"
//   id:            string          (DB row id — always present, no
//                                    optimistic-only local items since
//                                    there's no guest mode to bridge)
//   product_id:    string
//   variant_id:    string | null
//   name:          string
//   variant_name:  string | null
//   price:         number          (current price — never snapshotted)
//   thumbnail_url: string | null
//   store_id:      string | null
//   store_name:    string | null
// }
// ─────────────────────────────────────────────────────────────

import { create } from "zustand";
import { toast } from "@/lib/store/toastStore";
import { supabase } from "@/lib/supabaseClient";

function normaliseItem(row) {
  return {
    key: row.variant_id ? `${row.product_id}::${row.variant_id}` : row.product_id,
    id: row.id,
    product_id: row.product_id,
    variant_id: row.variant_id ?? null,
    name: row.products?.name ?? row.title ?? "Product",
    variant_name: row.product_variants?.name ?? null,
    price: Number(row.product_variants?.price ?? row.products?.price ?? 0),
    thumbnail_url: row.products?.thumbnail_url ?? null,
    store_id: row.store_id,
    store_name: row.stores?.name ?? null,
  };
}

function keyFor(productId, variantId) {
  return variantId ? `${productId}::${variantId}` : productId;
}

export const useWishlistStore = create((set, get) => ({
  // ── State ─────────────────────────────────────────────────
  wishlistId: null,
  userId: null,
  items: [],
  loading: false,

  // ── Derived ───────────────────────────────────────────────
  isWishlisted(productId, variantId = null) {
    const key = keyFor(productId, variantId);
    return get().items.some((i) => i.key === key);
  },

  // ── Fetch wishlist from DB ────────────────────────────────
  getWishlist: async (userId) => {
    if (!userId) return;
    set({ loading: true, userId });

    const { data: wishlist, error } = await supabase
      .from("wishlists")
      .select(
        `
        id,
        wishlist_items (
          id,
          product_id,
          variant_id,
          title,
          store_id,
          products      ( name, price, thumbnail_url ),
          product_variants ( name, price ),
          stores        ( name )
        )
      `
      )
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[wishlistStore] getWishlist error:", error.message);
      set({ loading: false });
      return;
    }

    const items = (wishlist?.wishlist_items ?? []).map(normaliseItem);
    set({ wishlistId: wishlist?.id ?? null, items, loading: false });
  },

  // ── Ensure a wishlists row exists for this user ───────────
  // No RPC, so this is a plain upsert — safe to call every time
  // before the first item is added; a no-op once the row exists.
  _ensureWishlist: async (userId) => {
    const existing = get().wishlistId;
    if (existing) return existing;

    const { data, error } = await supabase
      .from("wishlists")
      .upsert({ user_id: userId }, { onConflict: "user_id" })
      .select("id")
      .single();

    if (error) {
      console.error("[wishlistStore] _ensureWishlist error:", error.message);
      return null;
    }

    set({ wishlistId: data.id });
    return data.id;
  },

  // ── Toggle — the main entry point from a heart icon ───────
  // Signed-out callers should be intercepted by the UI before this
  // is ever called (see ProductCard/ProductDetailClient) — this
  // store has no guest fallback by design.
  toggle: async (product, variant = null) => {
    const { userId } = get();
    if (!userId) {
      toast.info("Sign in to save items to your wishlist");
      return;
    }

    const key = keyFor(product.id, variant?.id ?? null);
    const already = get().items.find((i) => i.key === key);

    if (already) {
      await get().removeItem(already.id);
    } else {
      await get().addItem(product, variant);
    }
  },

  // ── Add item ──────────────────────────────────────────────
  addItem: async (product, variant = null) => {
    const { userId } = get();
    if (!userId) {
      toast.info("Sign in to save items to your wishlist");
      return;
    }

    const key = keyFor(product.id, variant?.id ?? null);
    if (get().items.some((i) => i.key === key)) return; // already wishlisted

    const prevItems = get().items;

    // Optimistic — id is null until getWishlist() re-syncs below and
    // assigns the real DB id (same convention as cartStore). Removal
    // matches by `key` first, so this is safe even mid-sync.
    set((s) => ({
      items: [
        ...s.items,
        {
          key,
          id: null,
          product_id: product.id,
          variant_id: variant?.id ?? null,
          name: product.name,
          variant_name: variant?.name ?? null,
          price: Number(variant?.price ?? product.price),
          thumbnail_url: product.thumbnail_url ?? null,
          store_id: product.store_id ?? null,
          store_name: product.store?.name ?? null,
        },
      ],
    }));

    const wishlistId = await get()._ensureWishlist(userId);
    if (!wishlistId) {
      set({ items: prevItems });
      toast.error("Couldn't save to wishlist — try again");
      return;
    }

    const { error } = await supabase.from("wishlist_items").insert({
      wishlist_id: wishlistId,
      product_id: product.id,
      variant_id: variant?.id ?? null,
      title: product.name,
      store_id: product.store_id ?? null,
    });

    if (error) {
      // Unique-violation (23505) means it's already there — e.g. a
      // second tab or a stale optimistic state. Treat as success
      // rather than surfacing a scary error for a harmless race.
      if (error.code !== "23505") {
        set({ items: prevItems });
        toast.error("Couldn't save to wishlist — try again");
        return;
      }
    } else {
      toast.success("Added to wishlist");
    }

    await get().getWishlist(userId);
  },

  // ── Remove item ───────────────────────────────────────────
  // Accepts a DB row id (preferred) or a composite key.
  removeItem: async (idOrKey) => {
    const { userId } = get();
    if (!userId) return;

    const prevItems = get().items;
    const item = prevItems.find((i) => i.id === idOrKey || i.key === idOrKey);
    if (!item) return;

    set((s) => ({ items: s.items.filter((i) => i.key !== item.key) }));

    const { error } = await supabase
      .from("wishlist_items")
      .delete()
      .eq("id", item.id);

    if (error) {
      set({ items: prevItems });
      toast.error("Couldn't remove item — try again");
      return;
    }

    toast.success("Removed from wishlist");
    await get().getWishlist(userId);
  },

  // ── Reset (on sign-out) ───────────────────────────────────
  resetWishlist: () =>
    set({ wishlistId: null, userId: null, items: [], loading: false }),
}));
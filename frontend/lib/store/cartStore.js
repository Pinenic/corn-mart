"use client";
// lib/stores/useCart.js
// ─────────────────────────────────────────────────────────────
// Unified cart store.
//
// Source of truth: Supabase (carts + cart_items tables).
// Local state:     Zustand (items array, drawer state, totals).
// Persistence:     cartId and items persisted to localStorage so
//                  the cart survives a page refresh without a
//                  full re-fetch. Items are rehydrated from DB
//                  on sign-in via getCart().
//
// Item shape (what lives in state.items):
// {
//   key:           "product-uuid::variant-uuid" | "product-uuid"
//   id:            string (cart_items DB row id — needed for RPCs)
//   product_id:    string
//   variant_id:    string | null
//   name:          string  (product name)
//   variant_name:  string | null
//   price:         number
//   quantity:      number
//   thumbnail_url: string | null
//   store_id:      string
//   store_name:    string | null
// }
//
// Key design decisions:
//   - addItem()    → optimistic add → RPC → re-sync from DB
//   - updateQty()  → optimistic update → RPC → re-sync
//   - removeItem() → accepts composite key OR DB id → optimistic → DB delete
//   - clearCart()  → optimistic clear → DB delete
//   - All mutations rollback on error and show a toast
// ─────────────────────────────────────────────────────────────

import { create }   from "zustand";
import { persist }  from "zustand/middleware";
import { toast }    from "@/lib/store/toastStore";
import { supabase } from "@/lib/supabaseClient";

// ── DB → item shape normaliser ────────────────────────────────
// Converts a raw cart_items row (with joined relations) into the
// flat shape the UI and byStore() grouping expect.
function normaliseItem(row) {
  return {
    // Composite key for deduplication — same product+variant = same slot
    key:           row.variant_id
                     ? `${row.product_id}::${row.variant_id}`
                     : row.product_id,
    // DB id — needed for update/delete RPCs
    id:            row.id,
    product_id:    row.product_id,
    variant_id:    row.variant_id ?? null,
    name:          row.products?.name          ?? "Product",
    variant_name:  row.product_variants?.name  ?? null,
    price:         Number(row.price),
    quantity:      row.quantity,
    thumbnail_url: row.products?.thumbnail_url ?? null,
    store_id:      row.store_id,
    store_name:    row.stores?.name            ?? null,
  };
}

// ── Optimistic item builder ───────────────────────────────────
// Used before the DB confirms, so the UI updates immediately.
// The DB `id` is not available yet — it's filled in after re-sync.
function buildOptimisticItem(product, variant, quantity) {
  const key = variant?.id
    ? `${product.id}::${variant.id}`
    : product.id;

  return {
    key,
    id:            null,                          // filled in after getCart()
    product_id:    product.id,
    variant_id:    variant?.id    ?? null,
    name:          product.name,
    variant_name:  variant?.name  ?? null,
    price:         Number(variant?.price ?? product.price),
    quantity,
    thumbnail_url: product.thumbnail_url ?? null,
    store_id:      product.store_id,
    store_name:    product.store?.name   ?? null,
  };
}

// ─────────────────────────────────────────────────────────────

export const useCartStore = create(
  persist(
    (set, get) => ({
      // ── State ───────────────────────────────────────────────
      cartId:    null,
      userId:    null,
      items:     [],
      loading:   false,
      isOpen:    false,   // cart drawer / sheet visibility

      // ── Drawer controls ─────────────────────────────────────
      openCart:   () => set({ isOpen: true  }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set(s => ({ isOpen: !s.isOpen })),

      // ── Derived values (callable functions) ─────────────────
      // Zustand doesn't support computed getters natively,
      // so these are plain functions that read from state.

      // Total item count (sum of all quantities)
      count() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      // Total price
      subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },

      // Items grouped by store — used by checkout to create one
      // store_order per store involved in the cart.
      // Returns: { [storeId]: { store_name, items: [...] } }
      byStore() {
        return get().items.reduce((groups, item) => {
          if (!groups[item.store_id]) {
            groups[item.store_id] = { store_name: item.store_name, items: [] };
          }
          groups[item.store_id].items.push(item);
          return groups;
        }, {});
      },

      // ── Fetch cart from DB ───────────────────────────────────
      // Call on sign-in and after any mutation to stay in sync.
      getCart: async (userId) => {
        if (!userId) return;
        set({ loading: true, userId });

        const { data: cart, error } = await supabase
          .from("carts")
          .select(`
            id,
            cart_items (
              id,
              product_id,
              variant_id,
              quantity,
              price,
              store_id,
              products      ( name, thumbnail_url ),
              product_variants ( name, price, images:product_images(*) ),
              stores        ( name )
            )
          `)
          .eq("user_id", userId)
          .maybeSingle();

        if (error) {
          console.error("[useCart] getCart error:", error.message);
          set({ loading: false });
          return;
        }

        const items = (cart?.cart_items ?? []).map(normaliseItem);

        set({
          cartId:  cart?.id ?? null,
          items,
          loading: false,
        });
      },

      // ── Add item ─────────────────────────────────────────────
      // Optimistic: immediately updates UI, then calls the RPC.
      // If the RPC fails, rolls back and shows an error toast.
      //
      // Parameters:
      //   product  — { id, name, price, thumbnail_url, store_id, store }
      //   variant  — { id, name, price } | null
      //   quantity — number (default 1)
      //   stock    — available_stock from the variant (for guard)
      addItem: async (product, variant, quantity = 1, stock = Infinity) => {
        const prevItems = get().items;
        const key = variant?.id
          ? `${product.id}::${variant.id}`
          : product.id;

        // Stock guard — prevent adding more than available
        const existing = prevItems.find(i => i.key === key);
        const currentQty = existing?.quantity ?? 0;

        if (currentQty + quantity > stock) {
          toast.error("Cannot add item, stock limit will be exceeded", {
            description: `Only ${stock} in stock (you already have ${currentQty} in your cart).`,
          });
          return;
        }

        // Optimistic update
        if (existing) {
          set(s => ({
            items: s.items.map(i =>
              i.key === key ? { ...i, quantity: i.quantity + quantity } : i
            ),
          }));
        } else {
          set(s => ({
            items: [...s.items, buildOptimisticItem(product, variant, quantity)],
          }));
        }

        // DB call
        const { error } = await supabase.rpc("add_to_cart", {
          p_product_id: product.id,
          p_variant_id: variant?.id ?? null,
          p_quantity:   quantity,
        });

        if (error) {
          // Rollback
          set({ items: prevItems });
          toast.error("Failed to add item", {
            description: "Not enough stock or an error occurred.",
          });
          return;
        }

        toast.success("Added to cart", {
          description: `${product.name}${variant?.name ? ` — ${variant.name}` : ""} added.`,
        });

        // Re-sync to get the real DB id on the new item
        await get().getCart(get().userId);
      },

      // ── Update quantity ──────────────────────────────────────
      // Accepts the composite key (from UI) or the DB id.
      // Optimistic update with rollback.
      updateQty: async (keyOrId, quantity) => {
        if (quantity < 1) {
          await get().removeItem(keyOrId);
          return;
        }

        const prevItems = get().items;
        const item = prevItems.find(i => i.key === keyOrId || i.id === keyOrId);
        if (!item) return;

        // Optimistic update
        set(s => ({
          items: s.items.map(i =>
            (i.key === keyOrId || i.id === keyOrId) ? { ...i, quantity } : i
          ),
        }));

        const { error } = await supabase.rpc("update_cart_quantity", {
          p_item_id: item.id,
          p_quantity: quantity,
        });

        if (error) {
          set({ items: prevItems });
          toast.error("Failed to update quantity", { description: error.message });
          return;
        }

        await get().getCart(get().userId);
      },

      // ── Remove item ──────────────────────────────────────────
      // Accepts the composite key ("product::variant") or the DB row id.
      // Optimistic removal with rollback.
      removeItem: async (keyOrId) => {
        const prevItems = get().items;
        const item = prevItems.find(i => i.key === keyOrId || i.id === keyOrId);
        if (!item) return;

        // Optimistic removal
        set(s => ({ items: s.items.filter(i => i.key !== item.key) }));

        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("id", item.id);

        if (error) {
          set({ items: prevItems });
          toast.error("Failed to remove item", { description: error.message });
          return;
        }

        toast.success("Removed from cart");

        // Sync totals — no need for full getCart() on a simple remove
        // but we still call it to keep the DB id map accurate
        await get().getCart(get().userId);
      },

      // ── Clear cart ───────────────────────────────────────────
      // Removes all items from both local state and the DB.
      // Note: the checkout_cart RPC deletes cart_items itself, so
      // call this only for explicit "empty cart" user actions.
      clearCart: async () => {
        const { cartId, userId } = get();
        if (!cartId) return;

        const prevItems = get().items;

        // Optimistic clear
        set({ items: [] });

        const { error } = await supabase
          .from("cart_items")
          .delete()
          .eq("cart_id", cartId);

        if (error) {
          set({ items: prevItems });
          toast.error("Failed to clear cart", { description: error.message });
          return;
        }

        toast.success("Cart cleared");

        // Re-sync to confirm empty state
        await get().getCart(userId);
      },

      // ── Reset (on sign-out) ──────────────────────────────────
      // Clears local state without touching the DB.
      // The cart rows stay in DB and are reloaded on next sign-in.
      resetCart: () => set({
        cartId:  null,
        userId:  null,
        items:   [],
        isOpen:  false,
        loading: false,
      }),
    }),
    {
      name: "cm-cart",
      // Only persist what's needed to avoid a full re-fetch on refresh.
      // Items are persisted so the cart appears immediately on page load
      // before getCart() completes (hydration flash prevention).
      // DB ids (item.id) may be stale after a server-side change, but
      // getCart() corrects them before any mutation is attempted.
      partialize: (s) => ({
        cartId: s.cartId,
        items:  s.items,
      }),
    }
  )
);
"use client";
// lib/store/cartStore.js
// ─────────────────────────────────────────────────────────────
// Unified cart store — authenticated users AND guests.
//
// GUEST CART
//   Unauthenticated users get a fully optimistic local cart.
//   Items live only in Zustand state (persisted to localStorage
//   by zustand/middleware/persist so they survive page reloads).
//   All mutate actions (addItem, updateQty, removeItem, clearCart)
//   work identically in guest mode — they just skip the Supabase
//   calls and operate on local state only.
//
// SYNC ON SIGN-IN
//   When a user signs in, useAuthStore calls:
//     useCartStore.getState().syncGuestCart(userId)
//   which merges any guest items into the user's Supabase cart via
//   the existing `add_to_cart` RPC (one call per unique item), then
//   does a full getCart() to reconcile everything from the DB.
//   Guest items already in the DB cart are deduplicated by the RPC.
//
// AUTHENTICATED CART
//   Source of truth: Supabase (carts + cart_items tables).
//   Optimistic updates are applied immediately; errors roll back.
//   Re-sync (getCart) runs after every successful mutation to keep
//   DB ids accurate.
//
// Item shape:
// {
//   key:           "product-uuid::variant-uuid" | "product-uuid"
//   id:            string | null   (DB row id; null for guest items)
//   product_id:    string
//   variant_id:    string | null
//   name:          string
//   variant_name:  string | null
//   price:         number
//   quantity:      number
//   thumbnail_url: string | null
//   store_id:      string
//   store_name:    string | null
// }
// ─────────────────────────────────────────────────────────────

import { create }  from "zustand";
import { persist } from "zustand/middleware";
import { toast }   from "@/lib/store/toastStore";
import { supabase } from "@/lib/supabaseClient";

// ── DB row → flat item ────────────────────────────────────────
function normaliseItem(row) {
  return {
    key:           row.variant_id
                     ? `${row.product_id}::${row.variant_id}`
                     : row.product_id,
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

// ── Optimistic item (before DB confirms) ─────────────────────
function buildOptimisticItem(product, variant, quantity) {
  const key = variant?.id
    ? `${product.id}::${variant.id}`
    : product.id;
  return {
    key,
    id:            null,
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
      // ── State ─────────────────────────────────────────────
      cartId:  null,
      userId:  null,     // null = guest
      items:   [],
      loading: false,
      isOpen:  false,

      // ── Drawer controls ───────────────────────────────────
      openCart:   () => set({ isOpen: true  }),
      closeCart:  () => set({ isOpen: false }),
      toggleCart: () => set(s => ({ isOpen: !s.isOpen })),

      // ── Derived values ────────────────────────────────────

      // Total number of units across all line items.
      // (items.length would only count distinct lines.)
      count() {
        return get().items.reduce((sum, i) => sum + i.quantity, 0);
      },

      subtotal() {
        return get().items.reduce((sum, i) => sum + i.price * i.quantity, 0);
      },

      // Items grouped by store — used by checkout.
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

      // ── Fetch cart from DB (authenticated only) ───────────
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
          console.error("[cartStore] getCart error:", error.message);
          set({ loading: false });
          return;
        }

        const items = (cart?.cart_items ?? []).map(normaliseItem);
        set({ cartId: cart?.id ?? null, items, loading: false });
      },

      // ── Sync guest cart → DB on sign-in ──────────────────
      // Merges any locally-stored guest items into the user's
      // Supabase cart, then does a full re-sync. Called by
      // useAuthStore after a successful sign-in/sign-up.
      syncGuestCart: async (userId) => {
        const guestItems = get().items.filter(i => i.id === null);

        if (guestItems.length === 0) {
          // Nothing to merge — just load the user's existing cart
          await get().getCart(userId);
          return;
        }

        set({ loading: true, userId });

        // Fire all add_to_cart RPCs in parallel. The RPC upserts
        // (adds quantity if the item already exists in the DB cart),
        // so duplicate items are handled automatically.
        const results = await Promise.allSettled(
          guestItems.map(item =>
            supabase.rpc("add_to_cart", {
              p_product_id: item.product_id,
              p_variant_id: item.variant_id ?? null,
              p_quantity:   item.quantity,
            })
          )
        );

        const failed = results.filter(r => r.status === "rejected" || r.value?.error);
        if (failed.length > 0) {
          console.warn(`[cartStore] syncGuestCart: ${failed.length} item(s) failed to sync`);
        }

        // Full re-sync from DB to get accurate ids and merged state
        await get().getCart(userId);

        if (guestItems.length > 0) {
          toast.success(
            "Cart synced",
            { description: `${guestItems.length} item${guestItems.length !== 1 ? "s" : ""} from your guest session were added to your cart.` }
          );
        }
      },

      // ── Add item ──────────────────────────────────────────
      // Works for both guest and authenticated users.
      // Guests: optimistic only (no DB call).
      // Auth:   optimistic → RPC → re-sync.
      //
      //   product  — { id, name, price, thumbnail_url, store_id, store? }
      //   variant  — { id, name, price } | null
      //   quantity — number (default 1)
      //   stock    — number (default Infinity)
      addItem: async (product, variant, quantity = 1, stock = Infinity) => {
        const prevItems = get().items;
        const key = variant?.id
          ? `${product.id}::${variant.id}`
          : product.id;

        // Stock guard
        const existing   = prevItems.find(i => i.key === key);
        const currentQty = existing?.quantity ?? 0;
        if (currentQty + quantity > stock) {
          toast.error("Cannot add item — stock limit will be exceeded", {
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

        // Guest: stop here — item lives in local state only until sign-in
        if (!get().userId) {
          toast.success("Added to cart", {
            description: `${product.name}${variant?.name ? ` — ${variant.name}` : ""} added. Sign in to save your cart.`,
          });
          return;
        }

        // Authenticated: persist to DB
        const { error } = await supabase.rpc("add_to_cart", {
          p_product_id: product.id,
          p_variant_id: variant?.id ?? null,
          p_quantity:   quantity,
        });

        if (error) {
          set({ items: prevItems });
          toast.error("Failed to add item", {
            description: "Not enough stock or an error occurred.",
          });
          return;
        }

        toast.success("Added to cart", {
          description: `${product.name}${variant?.name ? ` — ${variant.name}` : ""} added.`,
        });

        // Re-sync to get the DB id on the new row
        await get().getCart(get().userId);
      },

      // ── Update quantity ───────────────────────────────────
      // Delegates to removeItem when quantity reaches 0.
      updateQty: async (keyOrId, quantity) => {
        if (quantity < 1) {
          await get().removeItem(keyOrId);
          return;
        }

        const prevItems = get().items;
        const item = prevItems.find(i => i.key === keyOrId || i.id === keyOrId);
        if (!item) return;

        // Optimistic
        set(s => ({
          items: s.items.map(i =>
            (i.key === keyOrId || i.id === keyOrId) ? { ...i, quantity } : i
          ),
        }));

        // Guest: no DB call
        if (!get().userId) return;

        const { error } = await supabase.rpc("update_cart_quantity", {
          p_item_id:  item.id,
          p_quantity: quantity,
        });

        if (error) {
          set({ items: prevItems });
          toast.error("Failed to update quantity", { description: error.message });
          return;
        }

        await get().getCart(get().userId);
      },

      // ── Remove item ───────────────────────────────────────
      // Accepts composite key ("product::variant") or DB row id.
      removeItem: async (keyOrId) => {
        const prevItems = get().items;
        const item = prevItems.find(i => i.key === keyOrId || i.id === keyOrId);
        if (!item) return;

        // Optimistic
        set(s => ({ items: s.items.filter(i => i.key !== item.key) }));

        // Guest: no DB call
        if (!get().userId) {
          toast.success("Removed from cart");
          return;
        }

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
        await get().getCart(get().userId);
      },

      // ── Clear cart ────────────────────────────────────────
      clearCart: async () => {
        const { cartId, userId } = get();

        // Guest or no DB cart yet
        if (!userId || !cartId) {
          set({ items: [] });
          return;
        }

        const prevItems = get().items;
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
        await get().getCart(userId);
      },

      // ── Reset (on sign-out) ───────────────────────────────
      // Clears local state. DB cart rows are kept so they
      // reload on next sign-in. Guest items in localStorage
      // are cleared too since the user is now signed out.
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
      // Persist items and cartId so the cart survives a page reload
      // without a full re-fetch (hydration flash prevention).
      // Guest items are also persisted here until sign-in syncs them.
      partialize: (s) => ({
        cartId: s.cartId,
        items:  s.items,
        userId: s.userId,
      }),
    }
  )
);

import { create } from "zustand";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
import { persist } from "zustand/middleware";
import { useProfile } from "./useProfile";

export const useCart = create(
  persist((set, get) => ({
    cartId: null,
    items: [],
    loading: false,
    subtotal: 0,
    itemCount: 0,
    user: null,

    setCartId: (id) => set({ cartId: id }),

    setUserId: (id) => set({ user: id }),

    // -------------------------
    // Calculate totals locally
    // -------------------------
    calculateTotals: (items) => {
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );

      const itemCount = items.reduce((count, item) => count + item.quantity, 0);

      set({ subtotal, itemCount });
    },

    // -------------------------
    // Fetch Cart
    // -------------------------
    getCart: async (userId) => {
      set({ loading: true });
      // console.log(userId);
      const { data: cart, error } = await supabase
        .from("carts")
        .select(
          `
        id,
        cart_items (
          id,
          product_id,
          variant_id,
          quantity,
          price,
          store_id,
          products ( name, thumbnail_url ),
          product_variants (name, price, images:product_images(*) ),
          stores (name)
        )
        `
        )
        .eq("user_id", userId)
        .maybeSingle();
      console.log(cart);

      if (error) {
        console.error("Error fetching cart", error);
        set({ loading: false });
        return;
      }

      const items = cart?.cart_items || [];

      set({
        cartId: cart?.id || null,
        items,
        user: userId,
        loading: false,
      });

      get().calculateTotals(items);
    },

    // -------------------------
    // Add Item (Optimistic + RPC)
    // -------------------------
    addItem: async (productId, variantId, quantity) => {
      const prevItems = get().items;

      // optimistic UI update
      const fakeId = "temp-" + Math.random();
      const optimisticItem = {
        id: fakeId,
        product_id: productId,
        variant_id: variantId,
        quantity,
        price: 0, // will correct after reload
      };
      console.log("addItem args:", { productId, variantId, quantity });

      // set({ items: [...prevItems, optimisticItem] });
      // get().calculateTotals([...prevItems, optimisticItem]);

      // RPC call
      const { error } = await supabase.rpc("add_to_cart", {
        p_product_id: productId,
        p_variant_id: variantId,
        p_quantity: quantity,
      });

      if (error) {
        // rollback
        set({ items: prevItems });
        get().calculateTotals(prevItems);

        toast.error("Failed to add item", {
          description: error.message,
        });

        return;
      }

      toast.success("Added to cart", {
        description: "Item was added successfully.",
      });

      await get().getCart(get().user);
    },

    // -------------------------
    // Update quantity (Optimistic + RPC)
    // -------------------------
    updateItem: async (itemId, quantity) => {
      const prevItems = get().items;

      // optimistic update
      const updatedItems = prevItems.map((item) =>
        item.id === itemId ? { ...item, quantity } : item
      );

      set({ items: updatedItems });
      get().calculateTotals(updatedItems);

      const { error } = await supabase.rpc("update_cart_quantity", {
        p_item_id: itemId,
        p_quantity: quantity,
      });

      if (error) {
        // rollback
        set({ items: prevItems });
        get().calculateTotals(prevItems);

        toast.error("Failed to update item", {
          description: error.message,
        });

        return;
      }

      toast.success("Cart updated", {
        description: "Item quantity adjusted.",
      });

      await get().getCart(get().user);
    },

    // -------------------------
    // Remove item
    // -------------------------
    removeItem: async (itemId) => {
      const prevItems = get().items;

      // optimistic UI
      const filtered = prevItems.filter((i) => i.id !== itemId);
      set({ items: filtered });
      get().calculateTotals(filtered);

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) {
        set({ items: prevItems });
        get().calculateTotals(prevItems);

        toast.error("Failed to remove item", {
          description: error.message,
        });

        return;
      }
      toast.success("Removed", {
        description: "Item removed from cart.",
      });

      await get().getCart(get().user);
    },

    // -------------------------
    // Clear the cart
    // -------------------------
    clearCart: async () => {
      const cartId = get().cartId;
      if (!cartId) return;

      const prevItems = get().items;
      set({ items: [] });
      get().calculateTotals([]);

      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("cart_id", cartId);

      if (error) {
        set({ items: prevItems });
        get().calculateTotals(prevItems);

        toast.error("Failed to clear cart", {
          description: error.message,
        });

        return;
      }

      toast.success("Cart cleared");

      await get().getCart(get().user);
    },
  }))
);

"use client";

import { useEffect } from "react";
import { useCart } from "@/store/useCart"; // adjust path if needed
import CheckoutStoreSection from "./CheckoutStoreSection";
import CheckoutSummary from "./CheckoutSummary";

export default function CheckoutContent() {
  const { items, subtotal, itemCount, user, getCart, loading } = useCart();

  // On mount, if user exists and cart is empty or not loaded, fetch.
  useEffect(() => {
    if (user && items.length === 0 && !loading) {
      getCart(user);
    }
  }, [user, items.length, loading, getCart]);

  // Group items by store_id
  const groupedByStore = items.reduce((acc, item) => {
    const storeId = item.store_id;
    const storeName = item.stores?.name; // comes from Supabase join

    if (!acc[storeId]) {
      acc[storeId] = {
        store_id: storeId,
        store_name: storeName,
        items: [],
      };
    }

    acc[storeId].items.push(item);

    return acc;
  }, {});

  // If no items, show fallback
  if (!items.length) {
    return (
      <div className="text-center py-20 text-gray-500">Your cart is empty.</div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* LEFT – Items grouped by store */}
      <div className="md:col-span-2 space-y-6">
        {Object.entries(groupedByStore).map(([storeId, storeData]) => (
          <CheckoutStoreSection
            key={storeId}
            storeId={storeId}
            storeName={storeData.store_name}
            items={storeData.items}
          />
        ))}
      </div>

      {/* RIGHT – Summary */}
      <div>
        <CheckoutSummary subtotal={subtotal} itemCount={itemCount} />
      </div>
    </div>
  );
}

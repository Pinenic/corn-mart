"use client";
// lib/hooks/useDeliveryEligibility.js
//
// For every store in the cart, checks whether it has a
// delivery-enabled location and what that location's delivery_fee
// is (store_locations.delivery_fee — the buyer-facing fee, set by
// the seller, separate from anything the delivery platform charges
// Corn Mart internally).
//
// Cart-wide "Delivery" checkout is only offered when EVERY store in
// the cart can fulfill it. A mixed cart — one seller delivers,
// another doesn't — falls back to Self pick only, until per-store
// checkout splitting exists. Failing closed (no delivery offered) is
// safer than promising delivery a store can't actually do.
import { useEffect, useState } from "react";
import { marketplaceStoreService } from "@/lib/api/services";

export function useDeliveryEligibility(storeIds) {
  const [loading, setLoading] = useState(false);
  const [byStore, setByStore] = useState({}); // { [storeId]: { enabled, fee } }

  const key = storeIds.slice().sort().join(",");

  useEffect(() => {
    if (storeIds.length === 0) {
      setByStore({});
      return;
    }

    let cancelled = false;
    setLoading(true);

    Promise.all(
      storeIds.map(async (storeId) => {
        try {
          const result = await marketplaceStoreService.getLocations(storeId);
          const locations = result?.data ?? [];
          const deliverable = locations.find((l) => l.delivery_enabled);
          return [
            storeId,
            {
              enabled: Boolean(deliverable),
              fee: Number(deliverable?.delivery_fee ?? 0),
            },
          ];
        } catch {
          return [storeId, { enabled: false, fee: 0 }];
        }
      })
    ).then((entries) => {
      if (cancelled) return;
      setByStore(Object.fromEntries(entries));
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const allDeliverable =
    storeIds.length > 0 && storeIds.every((id) => byStore[id]?.enabled);
  const totalDeliveryFee = storeIds.reduce(
    (sum, id) => sum + (byStore[id]?.fee ?? 0),
    0
  );

  return { loading, byStore, allDeliverable, totalDeliveryFee };
}

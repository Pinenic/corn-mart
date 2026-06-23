"use client";
// lib/hooks/useOrdersRealtime.js
// ─────────────────────────────────────────────────────────────
// Realtime push updates for the store dashboard's order-driven
// surfaces: the Overview KPIs, the Orders list + status tab counts,
// and the analytics endpoints that summarize orders.
//
// Before this hook existed, none of those pages had a realtime
// subscription AND the global SWR config disabled focus/stale
// revalidation — so a new order, or a status change made from another
// tab/device, simply never appeared until the page was hard-reloaded.
//
// `orders` has a `store_id` column directly (no view/trigger indirection
// needed), so we can subscribe straight to it, scoped per store —
// mirroring the pattern already used for messages in useStoreMessages.js.
// ─────────────────────────────────────────────────────────────

import { useEffect, useRef } from "react";
import { mutate as globalMutate } from "swr";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "@/lib/store/toastStore";

export default function useOrdersRealtime(storeId) {
  const channelRef = useRef(null);

  useEffect(() => {
    if (!storeId) return;

    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }

    // Revalidate every SWR key scoped to this store's orders/analytics —
    // covers the orders list, the status-count tabs, single-order detail,
    // and every analytics endpoint (overview KPIs, revenue series, etc).
    const revalidateOrderData = () =>
      globalMutate(
        (key) =>
          Array.isArray(key) &&
          typeof key[0] === "string" &&
          (key[0].startsWith(`/stores/${storeId}/orders`) ||
            key[0].startsWith(`/stores/${storeId}/analytics`)),
        undefined,
        { revalidate: true }
      );

    const channel = supabase
      .channel(`store-orders-${storeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "orders",
          filter: `store_id=eq.${storeId}`,
        },
        () => {
          revalidateOrderData();
          toast.info("New order received");
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "orders",
          filter: `store_id=eq.${storeId}`,
        },
        () => revalidateOrderData()
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
        channelRef.current = null;
      }
    };
  }, [storeId]);
}

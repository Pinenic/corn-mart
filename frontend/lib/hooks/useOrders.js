"use client";
// lib/hooks/useOrders.js
// All hooks and mutations for the Orders feature.
//
// useOrders        — paginated list with filters
// useOrderCounts   — status tab counts
// useOrder         — single order detail
// useUpdateStatus  — mutation to change order status

import { useState, useCallback } from "react";
import { useApi }       from "./useApi";
import { orderService } from "@/lib/api/services";
import { ApiError, flattenValidationErrors } from "@/lib/api/errors";
import { toast }        from "@/lib/store/toastStore";
import useAuthStore     from "@/lib/store/useAuthStore";

// ── List ──────────────────────────────────────────────────────
export function useOrders(filters = {}) {
  const storeId = useAuthStore((s) => s.storeId);
  const path    = storeId ? `/stores/${storeId}/orders` : null;

  // Filter out undefined values to avoid sending them as query params
  const params = {
    page:     filters.page     ?? 1,
    limit:    filters.limit    ?? 20,
    status:   filters.status   ?? "all",
    dateFrom: filters.dateFrom,
    dateTo:   filters.dateTo,
    search:   filters.search,
    sort:     filters.sort     ?? "created_at",
    order:    filters.order    ?? "desc",
  };
  
  // Remove undefined values
  Object.keys(params).forEach(key => {
    if (params[key] === undefined) {
      delete params[key];
    }
  });

  return useApi(path, params);
}

// ── Status counts ─────────────────────────────────────────────
export function useOrderCounts() {
  const storeId = useAuthStore((s) => s.storeId);
  const path    = storeId ? `/stores/${storeId}/orders/status-counts` : null;

  return useApi(path);
}

// ── Single order ──────────────────────────────────────────────
export function useOrder(orderId) {
  const storeId = useAuthStore((s) => s.storeId);
  const path    = storeId && orderId ? `/stores/${storeId}/orders/${orderId}` : null;

  return useApi(path);
}

// ── Status history ────────────────────────────────────────────
export function useOrderHistory(orderId) {
  const storeId = useAuthStore((s) => s.storeId);
  const path    = storeId && orderId ? `/stores/${storeId}/orders/${orderId}/history` : null;

  return useApi(path);
}

// ── Update status mutation ────────────────────────────────────
export function useUpdateOrderStatus() {
  const storeId            = useAuthStore((s) => s.storeId);
  const [loading, setLoad] = useState(false);
  const [error, setError]  = useState(null);

  const STATUS_LABELS = {
    confirmed:  "confirmed",
    processing: "marked as processing",
    shipped:    "marked as shipped",
    delivered:  "marked as delivered",
    cancelled:  "cancelled",
    refunded:   "refunded",
  };

  const updateStatus = useCallback(async (orderId, status, comment = "") => {
    if (!storeId) return null;
    setLoad(true);
    setError(null);

    try {
      const payload = { status };
      if (comment) payload.comment = comment;
      const result = await orderService.updateStatus(storeId, orderId, payload);
      toast.success(`Order has been ${STATUS_LABELS[status] ?? status}.`);
      return result?.data ?? null;
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Could not update order status.";
      setError(err instanceof ApiError ? err : null);
      toast.error(message);
      return null;
    } finally {
      setLoad(false);
    }
  }, [storeId]);

  return { updateStatus, loading, error };
}

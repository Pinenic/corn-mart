"use client";
import useSWR from "swr";
import { useState, useCallback } from "react";
import { swrFetcher, apiClient } from "@/lib/api/client";
import { marketplaceBuyerService } from "@/lib/api/services";
import { ApiError }              from "@/lib/api/errors";
import { toast }                 from "@/lib/store/toastStore";
import useAuthStore from "../store/useAuthStore";

const SWR_OPTS = { revalidateOnFocus: false, shouldRetryOnError: false };

export function useBuyerOrders(filters = {}) {
  const token = useAuthStore(s => s.token);
  const key   = token ? ["/marketplace/orders", { page: filters.page ?? 1, limit: 10 }] : null;
  const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, SWR_OPTS);
  return { orders: data?.data ?? [], meta: data?.meta ?? null, isLoading, error, mutate };
}

export function useBuyerOrder(orderId) {
  const token = useAuthStore(s => s.token);
  const key   = token && orderId ? [`/marketplace/orders/${orderId}`, {}] : null;
  const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, SWR_OPTS);
  return { order: data?.data ?? null, isLoading, error, mutate };
}

export function usePlaceOrder() {
  const [loading, setLoading] = useState(false);
  const place = useCallback(async (payload) => {
    setLoading(true);
    try {
      const result = await marketplaceBuyerService.placeOrder(payload);
      toast.success("Order placed! The seller will be in touch.");
      return result?.data ?? null;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not place order.");
      return null;
    } finally { setLoading(false); }
  }, []);
  return { place, loading };
}

export function useCancelOrder() {
  const [loading, setLoading] = useState(false);
  const cancel = useCallback(async (orderId, reason = "") => {
    setLoading(true);
    try {
      const payload = reason ? { reason } : {};
      const result = await marketplaceBuyerService.cancelOrder(orderId, payload);
      toast.success("Order cancelled.");
      return result?.data ?? null;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not cancel order.");
      return null;
    } finally { setLoading(false); }
  }, []);
  return { cancel, loading };
}

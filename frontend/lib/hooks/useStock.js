"use client";
// client/lib/hooks/useStock.js
import useSWR, { mutate as globalMutate } from "swr";
import { useState, useCallback } from "react";
import { apiClient, swrFetcher } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { toast } from "@/lib/store/toastStore";
import useAuthStore from "@/lib/store/useAuthStore";

const SWR_OPTS = {
  revalidateOnFocus: true,
  keepPreviousData: true,
  shouldRetryOnError: false,
};

// ── useStockEntries — paginated list with filters ─────────────
export function useStockEntries(filters = {}) {
  const storeId = useAuthStore((s) => s.storeId);
  const key = storeId
    ? [
        `/stores/${storeId}/stock`,
        {
          page: filters.page ?? 1,
          limit: filters.limit ?? 25,
          product_id: filters.productId ?? undefined,
          date_from: filters.dateFrom ?? undefined,
          date_to: filters.dateTo ?? undefined,
          search: filters.search ?? undefined,
        },
      ]
    : null;

  const { data, error, isLoading, isValidating, mutate } = useSWR(
    key,
    swrFetcher,
    SWR_OPTS
  );

  return {
    entries: data?.data ?? [],
    total: data?.meta?.total ?? 0,
    isLoading,
    isRefreshing: isValidating && !isLoading,
    error,
    mutate,
  };
}

// ── useStockSummary — header summary cards ────────────────────
export function useStockSummary(filters = {}) {
  const storeId = useAuthStore((s) => s.storeId);
  const key = storeId
    ? [
        `/stores/${storeId}/stock/summary`,
        {
          date_from: filters.dateFrom ?? undefined,
          date_to: filters.dateTo ?? undefined,
        },
      ]
    : null;

  const { data, error, isLoading } = useSWR(key, swrFetcher, SWR_OPTS);
  // console.log(data);

  return {
    summary: data?.data ?? { totalUnits: 0, totalSpend: 0, entryCount: 0, pendingCount: 0 },
    isLoading,
    error,
  };
}

// ── useCreateStockEntry ───────────────────────────────────────
export function useCreateStockEntry() {
  const storeId = useAuthStore((s) => s.storeId);
  const [loading, setLoad] = useState(false);
  const [errors, setErrs] = useState({});

  const create = useCallback(
    async (payload) => {
      console.log("payload: ", payload)
      if (!storeId) return null;
      setLoad(true);
      setErrs({});
      try {
        const result = await apiClient.post(
          `/stores/${storeId}/stock`,
          payload
        );
        // Revalidate both the list and the summary
        globalMutate((k) => Array.isArray(k) && k[0]?.includes("/stock"));
        toast.success("Stock entry logged");
        return result?.data ?? null;
      } catch (err) {
        if (err instanceof ApiError && err.isValidation) {
          const flat = {};
          (err.details ?? []).forEach((d) => {
            flat[d.field] = d.message;
          });
          setErrs(flat);
          console.log(flat)
          toast.error("Please fix the highlighted fields");
        } else {
          toast.error(
            err instanceof ApiError ? err.message : "Failed to save entry"
          );
        }
        return null;
      } finally {
        setLoad(false);
      }
    },
    [storeId]
  );

  return { create, loading, errors };
}

// ── useUpdateStockEntry ───────────────────────────────────────
export function useUpdateStockEntry() {
  const storeId = useAuthStore((s) => s.storeId);
  const [loading, setLoad] = useState(false);

  const update = useCallback(
    async (entryId, payload) => {
      if (!storeId) return null;
      setLoad(true);
      try {
        const result = await apiClient.patch(
          `/stores/${storeId}/stock/${entryId}`,
          payload
        );
        globalMutate((k) => Array.isArray(k) && k[0]?.includes("/stock"));
        toast.success("Entry updated");
        return result?.data ?? null;
      } catch (err) {
        toast.error(
          err instanceof ApiError ? err.message : "Failed to update entry"
        );
        return null;
      } finally {
        setLoad(false);
      }
    },
    [storeId]
  );

  return { update, loading };
}

// ── useDeleteStockEntry ───────────────────────────────────────
export function useDeleteStockEntry() {
  const storeId = useAuthStore((s) => s.storeId);
  const [loading, setLoad] = useState(false);

  const remove = useCallback(
    async (entryId) => {
      if (!storeId) return false;
      setLoad(true);
      try {
        await apiClient.delete(`/stores/${storeId}/stock/${entryId}`);
        globalMutate((k) => Array.isArray(k) && k[0]?.includes("/stock"));
        toast.success("Entry deleted");
        return true;
      } catch (err) {
        toast.error(
          err instanceof ApiError ? err.message : "Failed to delete entry"
        );
        return false;
      } finally {
        setLoad(false);
      }
    },
    [storeId]
  );

  return { remove, loading };
}

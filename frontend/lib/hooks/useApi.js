"use client";
// lib/hooks/useApi.js
// Generic SWR-backed data fetching hook.
// All feature hooks (useOrders, useProducts, etc.) are built on top of this.
//
// Returns:
//   data       — the response data payload (typed by what the API returns)
//   meta       — pagination meta { page, limit, total, totalPages, ... }
//   isLoading  — true on the first load (no cached data yet)
//   isRefreshing — true on subsequent revalidations (cached data exists)
//   error      — ApiError instance if the request failed
//   mutate     — SWR mutate to manually revalidate or update cache

import useSWR from "swr";
import { swrFetcher } from "@/lib/api/client";
import { ApiError }   from "@/lib/api/errors";
import useAuthStore   from "@/lib/store/useAuthStore";

// Global SWR config — applied to all hooks built on useApi
export const SWR_CONFIG = {
  // Revalidate when window/tab regains focus. This was previously off
  // with nothing else to fill the gap for most dashboard data (orders,
  // products, analytics have no realtime subscription and no polling),
  // so a stale dashboard tab only ever updated via an explicit mutate()
  // call from a local action, or a hard page reload. Re-enabling this
  // is the cheapest fix for "I had to refresh the page to see X".
  revalidateOnFocus: true,
  // Revalidate when network reconnects
  revalidateOnReconnect: true,
  // Revalidate stale cached data on mount (e.g. navigating back to a
  // page you already visited this session). Previously off, which
  // meant a dashboard page could silently show minutes/hours-old data
  // every time you returned to it within the same tab.
  revalidateIfStale: true,
  // Deduplicate requests within 5s (reduced from 2s to prevent duplicate requests)
  dedupingInterval: 5000,
  // How long to keep cached data before treating it as stale (30s)
  focusThrottleInterval: 30_000,
  // Keep showing stale data while revalidating (better UX than blanking out)
  keepPreviousData: true,
  // Don't retry failed requests automatically — let the user retry
  // (retries happen at the client.js level for transient errors)
  shouldRetryOnError: false,
};

/**
 * useApi — base data fetching hook
 *
 * @param {string|null} path   — API path e.g. "/stores/abc/orders"
 *                               Pass null to skip the request (conditional fetching)
 * @param {object}      params — query params e.g. { page: 1, limit: 20 }
 * @param {object}      opts   — SWR options overrides
 */
export function useApi(path, params = {}, opts = {}) {
  const token = useAuthStore((s) => s.token);
  // console.log("firing with token: ", token) for testing

  // Build the SWR key — include token so cache is per-session,
  // and params so different filters get separate cache entries.
  // Null key = skip the request (conditional fetching pattern).
  const key = path && token ? [path, params] : null;

  const { data: result, error, isLoading, isValidating, mutate } = useSWR(
    key,
    swrFetcher,
    { ...SWR_CONFIG, ...opts }
  );

  return {
    data:         result?.data ?? null,
    meta:         result?.meta ?? null,
    isLoading:    isLoading,
    isRefreshing: isValidating && !isLoading,
    error:        error instanceof ApiError ? error : null,
    mutate,
  };
}

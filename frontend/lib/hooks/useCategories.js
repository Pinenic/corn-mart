"use client";
// lib/hooks/useCategories.js
// Categories are global reference data — any authenticated user can read them.
// No storeId needed, just a valid token.

import useSWR from "swr";
import { SWR_CONFIG } from "@/lib/hooks/useApi";
import { swrFetcher } from "../api/client";
import useAuthStore from "@/lib/store/useAuthStore";
import { ApiError } from "@/lib/api/errors";

// All categories with nested subcategories — for the full category picker
export function useCategories() {
  const token = useAuthStore((s) => s.token);
  const key = token ? ["/categories", {}] : null;

  const {
    data: result,
    error,
    isLoading,
    mutate,
  } = useSWR(key, swrFetcher, {
    ...SWR_CONFIG,
    // Categories rarely change — cache aggressively
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  return {
    data: result?.data ?? [],
    isLoading,
    error: error instanceof ApiError ? error : null,
    mutate,
  };
}

// Flat list (no nested subs) — for simple dropdowns
export function useCategoriesFlat() {
  const token = useAuthStore((s) => s.token);
  const key = token ? ["/categories/flat", {}] : null;

  const {
    data: result,
    error,
    isLoading,
  } = useSWR(key, swrFetcher, {
    ...SWR_CONFIG,
    revalidateOnFocus: false,
    dedupingInterval: 60_000,
  });

  return {
    data: result?.data ?? [],
    isLoading,
    error: error instanceof ApiError ? error : null,
  };
}

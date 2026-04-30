"use client";
import useSWR from "swr";
import { swrFetcher } from "@/lib/api/client";
import { ApiError }   from "@/lib/api/errors";

const SWR_OPTS = { revalidateOnFocus: false, keepPreviousData: true, shouldRetryOnError: false };

export function useMarketplaceProducts(filters = {}) {
  const key = ["/marketplace/products", {
    page:      filters.page     ?? 1,
    limit:     filters.limit    ?? 24,
    search:    filters.search   || undefined,
    category:  filters.category || undefined,
    subcat_id: filters.subcat_id|| undefined,
    min_price: filters.min_price|| undefined,
    max_price: filters.max_price|| undefined,
    store_id:  filters.store_id || undefined,
    sort:      filters.sort     ?? "created_at",
    order:     filters.order    ?? "desc",
  }];
  const { data, error, isLoading, isValidating, mutate } = useSWR(key, swrFetcher, SWR_OPTS);
  return {
    products:     data?.data ?? [],
    meta:         data?.meta ?? null,
    isLoading,
    isRefreshing: isValidating && !isLoading,
    error:        error instanceof ApiError ? error : null,
    mutate,
  };
}

export function useProduct(productId) {
  const key = productId ? [`/marketplace/products/${productId}`, {}] : null;
  const { data, error, isLoading } = useSWR(key, swrFetcher, SWR_OPTS);
  return {
    product:  data?.data ?? null,
    isLoading,
    error:    error instanceof ApiError ? error : null,
  };
}

export function useMarketplaceStores(filters = {}) {
    const key = ["/marketplace/stores", {
      page:   filters.page   ?? 1,
      limit:  filters.limit  ?? 20,
      search: filters.search || undefined,
      sort:   filters.sort   ?? "followers_count",
      order:  filters.order  ?? "desc",
    }];
    const { data, error, isLoading, isValidating, mutate } = useSWR(key, swrFetcher, SWR_OPTS);
    return {
      stores:       data?.data ?? [],
      meta:         data?.meta ?? null,
      isLoading,
      isRefreshing: isValidating && !isLoading,
      error:        error instanceof ApiError ? error : null,
      mutate,
    };
  }
  
  export function useStore(storeId) {
    const key = storeId ? [`/marketplace/stores/${storeId}`, {}] : null;
    const { data, error, isLoading } = useSWR(key, swrFetcher, SWR_OPTS);
    return { store: data?.data ?? null, isLoading, error };
  }
  
  export function useStoreProducts(storeId, filters = {}) {
    const key = storeId ? [`/marketplace/stores/${storeId}/products`, {
      page:  filters.page  ?? 1,
      limit: filters.limit ?? 20,
      sort:  "created_at", order: "desc",
    }] : null;
    const { data, error, isLoading, isValidating } = useSWR(key, swrFetcher, SWR_OPTS);
    return {
      products:     data?.data ?? [],
      meta:         data?.meta ?? null,
      isLoading,
      isRefreshing: isValidating && !isLoading,
      error,
    };
  }
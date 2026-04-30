"use client";
import useSWR from "swr";
import { useCallback } from "react";
import { swrFetcher } from "@/lib/api/client";
import { marketplaceBuyerService } from "@/lib/api/services";
import useAuthStore from "../store/useAuthStore";

const SWR_OPTS = { revalidateOnFocus: true, refreshInterval: 60_000, shouldRetryOnError: false };

export function useNotifications(filters = {}) {
  const token = useAuthStore(s => s.token);
  const key   = token ? ["/marketplace/notifications", { page: 1, limit: 30, ...filters }] : null;
  const { data, error, isLoading, mutate } = useSWR(key, swrFetcher, SWR_OPTS);
  return {
    notifications: data?.data ?? [],
    meta:          data?.meta ?? null,
    isLoading, error, mutate,
  };
}

export function useMarkNotificationRead() {
  const mutate = useCallback(async (id, mutateFn) => {
    try {
      await marketplaceBuyerService.markNotificationRead(id);
      mutateFn?.();
    } catch { /* silent */ }
  }, []);
  return { markRead: mutate };
}

export function useMarkAllNotificationsRead() {
  const markAll = useCallback(async (mutateFn) => {
    try {
      await marketplaceBuyerService.markAllNotificationsRead();
      mutateFn?.();
    } catch { /* silent */ }
  }, []);
  return { markAll };
}

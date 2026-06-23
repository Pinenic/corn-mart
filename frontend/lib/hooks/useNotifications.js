"use client";
import useSWR, { mutate as globalMutate } from "swr";
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
    // The API returns the unread count as meta.unread (see
    // marketplaceBuyerService.listNotifications on the backend).
    // This was previously dropped here, which silently broke every
    // consumer that destructures `unread` (bell badges, "mark all
    // read" visibility, the account notifications page header).
    unread:        data?.meta?.unread ?? 0,
    isLoading, error, mutate,
  };
}

export function useMarkNotificationRead() {
  const markRead = useCallback(async (id, mutateFn) => {
    // Optimistic: flip is_read locally and decrement the unread count
    // immediately so the dot/badge disappears on click instead of
    // waiting on a full request round trip.
    mutateFn?.((current) => {
      if (!current?.data) return current;
      const target = current.data.find((n) => n.id === id);
      if (!target || target.is_read) return current;
      return {
        ...current,
        data: current.data.map((n) =>
          n.id === id ? { ...n, is_read: true, viewed: true } : n
        ),
        meta: current.meta
          ? { ...current.meta, unread: Math.max(0, (current.meta.unread ?? 0) - 1) }
          : current.meta,
      };
    }, false);

    try {
      await marketplaceBuyerService.markNotificationRead(id);
    } catch {
      /* silent — revalidation below restores accurate state either way */
    } finally {
      // Resync every mounted useNotifications() instance (drawer, full
      // page, etc.) with the server, whether the request succeeded or not.
      globalMutate(
        (key) => Array.isArray(key) && key[0] === "/marketplace/notifications",
        undefined,
        { revalidate: true }
      );
    }
  }, []);
  return { markRead };
}

export function useMarkAllNotificationsRead() {
  const markAll = useCallback(async (mutateFn) => {
    mutateFn?.((current) => {
      if (!current?.data) return current;
      return {
        ...current,
        data: current.data.map((n) => ({ ...n, is_read: true, viewed: true })),
        meta: current.meta ? { ...current.meta, unread: 0 } : current.meta,
      };
    }, false);

    try {
      await marketplaceBuyerService.markAllNotificationsRead();
    } catch {
      /* silent */
    } finally {
      globalMutate(
        (key) => Array.isArray(key) && key[0] === "/marketplace/notifications",
        undefined,
        { revalidate: true }
      );
    }
  }, []);
  return { markAll };
}

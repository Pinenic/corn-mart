"use client";
// lib/hooks/useStore.js

import { useState, useCallback } from "react";
import { useApi }    from "./useApi";
import { storeService } from "@/lib/api/services";
import { ApiError }  from "@/lib/api/errors";
import { toast }     from "@/lib/store/toastStore";
import useAuthStore  from "@/lib/store/useAuthStore";

// ── Store profile ─────────────────────────────────────────────
export function useStore() {
  const storeId = useAuthStore((s) => s.storeId);
  const path    = storeId ? `/stores/${storeId}` : null;

  return useApi(path);
}

// ── All stores owned by the current user ──────────────────────
export function useMyStores() {
  const token = useAuthStore((s) => s.token);
  const path  = token ? "/stores/mine" : null;

  return useApi(path);
}

// ── Update store mutation ─────────────────────────────────────
export function useUpdateStore() {
  const storeId            = useAuthStore((s) => s.storeId);
  const [loading, setLoad] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const update = useCallback(async (payload) => {
    if (!storeId) return null;
    setLoad(true);
    setFieldErrors({});

    try {
      const result = await storeService.update(storeId, payload);
      toast.success("Store profile updated.");
      return result?.data ?? null;
    } catch (err) {
      if (err instanceof ApiError && err.isValidation) {
        const map = {};
        err.details?.forEach(({ field, message }) => { map[field] = message; });
        setFieldErrors(map);
        toast.error("Please fix the highlighted fields.");
      } else {
        toast.error(err instanceof ApiError ? err.message : "Could not update store.");
      }
      return null;
    } finally {
      setLoad(false);
    }
  }, [storeId]);

  return { update, loading, fieldErrors };
}

// ── Store locations ───────────────────────────────────────────
export function useStoreLocations() {
  const storeId = useAuthStore((s) => s.storeId);
  const path    = storeId ? `/stores/${storeId}/locations` : null;

  return useApi(path);
}

export function useCreateLocation() {
  const storeId            = useAuthStore((s) => s.storeId);
  const [loading, setLoad] = useState(false);

  const create = useCallback(async (payload) => {
    if (!storeId) return null;
    setLoad(true);
    try {
      const result = await storeService.createLocation(storeId, payload);
      toast.success("Location added.");
      return result?.data ?? null;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not add location.");
      return null;
    } finally {
      setLoad(false);
    }
  }, [storeId]);

  return { create, loading };
}

export function useDeleteLocation() {
  const storeId            = useAuthStore((s) => s.storeId);
  const [loading, setLoad] = useState(false);

  const deleteLocation = useCallback(async (locationId) => {
    if (!storeId) return false;
    setLoad(true);
    try {
      await storeService.deleteLocation(storeId, locationId);
      toast.success("Location removed.");
      return true;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not remove location.");
      return false;
    } finally {
      setLoad(false);
    }
  }, [storeId]);

  return { deleteLocation, loading };
}

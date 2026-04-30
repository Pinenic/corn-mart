"use client";
// lib/hooks/useOnboarding.js
// Mutations used exclusively by the onboarding flow.
// Keeps onboarding logic separate from the main useProducts/useStore hooks.

import { useState, useCallback } from "react";
import { ApiError } from "@/lib/api/errors";
import { apiClient } from "@/lib/api/client";
import { toast } from "@/lib/store/toastStore";
import useAuthStore from "@/lib/store/useAuthStore";

// ── Create store ──────────────────────────────────────────────
export function useCreateStore() {
  const [loading, setLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const create = useCallback(async (payload) => {
    setLoading(true);
    setFieldErrors({});
    try {
      // POST /stores — the backend creates the store owned by req.user
      const result = await apiClient.post("/stores/onboarding", payload);
      
      return result?.data ?? null;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isValidation) {
          const flat = {};
          (err.details ?? []).forEach((d) => { flat[d.field] = d.message; });
          setFieldErrors(flat);
          toast.error("Please fix the highlighted fields.");
        } else {
          toast.error(err.message);
        }
      }
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading, fieldErrors };
}

// ── Upload store logo / banner ────────────────────────────────
// Returns { logoUrl, bannerUrl } — either may be null if no file provided.
export function useUploadStoreAssets() {
  const [loading, setLoading] = useState(false);

  const upload = useCallback(async (storeId, { logoFile, bannerFile }) => {
    if (!storeId || (!logoFile && !bannerFile)) return {};
    setLoading(true);

    const token   = useAuthStore.getState().token;
    const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
    const results = {};

    const doUpload = async (file, field) => {
      const fd = new FormData();
      fd.append(field, file);
      const res  = await fetch(`${baseUrl}/stores/${storeId}/assets`, {
        method:  "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body:    fd,
      });
      const json = await res.json();
      if (res.ok && json.success) return json.data?.[field + "Url"] ?? null;
      return null;
    };

    try {
      if (logoFile)   results.logoUrl   = await doUpload(logoFile,   "logo");
      if (bannerFile) results.bannerUrl = await doUpload(bannerFile, "banner");
    } catch { /* silent — store was created, assets are optional */ }

    setLoading(false);
    return results;
  }, []);

  return { upload, loading };
}

// ── Create first product (onboarding) ────────────────────────
export function useCreateFirstProduct() {
  const [loading, setLoading] = useState(false);

  const create = useCallback(async (storeId, { details, imageFiles }) => {
    if (!storeId) return null;
    setLoading(true);

    try {
      // 1. Create product record
      const result = await apiClient.post(`/stores/${storeId}/products`, details);
      const product = result?.data;
      if (!product) throw new Error("Product creation returned no data");

      // 2. Upload images if provided (max 3)
      if (imageFiles?.length > 0) {
        const token   = useAuthStore.getState().token;
        const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
        const fd      = new FormData();
        imageFiles.slice(0, 3).forEach((f) => fd.append("images", f));

        await fetch(`${baseUrl}/stores/${storeId}/products/${product.id}/images`, {
          method:  "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body:    fd,
        });
        // Image failure is non-fatal — product exists, seller can add images later
      }

      toast.success(`"${details.name}" is live on your store!`);
      return product;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not create product. Try again.");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { create, loading };
}

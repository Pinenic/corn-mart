"use client";
// lib/hooks/useProducts.js

import { useState, useCallback } from "react";
import { useApi }    from "./useApi";
import { productService } from "@/lib/api/services";
import { ApiError, flattenValidationErrors } from "@/lib/api/errors";
import { toast }     from "@/lib/store/toastStore";
import useAuthStore  from "@/lib/store/useAuthStore";

// ── List ──────────────────────────────────────────────────────
export function useProducts(filters = {}) {
  const storeId = useAuthStore((s) => s.storeId);
  const path    = storeId ? `/stores/${storeId}/products` : null;
  console.log("firing...")
  
  // Filter out undefined values to avoid sending them as query params
  const params = {
    page:     filters.page     ?? 1,
    limit:    filters.limit    ?? 20,
    status:   filters.status   ?? "all",
    category: filters.category,
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

// ── Single product ────────────────────────────────────────────
export function useProduct(productId) {
  const storeId = useAuthStore((s) => s.storeId);
  const path    = storeId && productId ? `/stores/${storeId}/products/${productId}` : null;

  return useApi(path);
}

// ── Variants ──────────────────────────────────────────────────
export function useVariants(productId) {
  const storeId = useAuthStore((s) => s.storeId);
  const path    = storeId && productId
    ? `/stores/${storeId}/products/${productId}/variants`
    : null;

  return useApi(path);
}

// ── Create product mutation ───────────────────────────────────
export function useCreateProduct() {
  const storeId            = useAuthStore((s) => s.storeId);
  const [loading, setLoad] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const create = useCallback(async (payload) => {
    if (!storeId) return null;
    setLoad(true);
    setFieldErrors({});

    try {
      const result = await productService.create(storeId, payload);
      toast.success(`"${payload.name}" has been created.`);
      return result?.data ?? null;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isValidation) {
          setFieldErrors(flattenValidationErrors(err));
          toast.error("Please fix the highlighted fields.");
        } else {
          toast.error(err.message);
        }
      }
      return null;
    } finally {
      setLoad(false);
    }
  }, [storeId]);

  return { create, loading, fieldErrors };
}

// ── Update product mutation ───────────────────────────────────
export function useUpdateProduct() {
  const storeId            = useAuthStore((s) => s.storeId);
  const [loading, setLoad] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const update = useCallback(async (productId, payload) => {
    if (!storeId) return null;
    setLoad(true);
    setFieldErrors({});

    try {
      const result = await productService.update(storeId, productId, payload);
      toast.success("Product updated.");
      return result?.data ?? null;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isValidation) {
          setFieldErrors(flattenValidationErrors(err));
          toast.error("Please fix the highlighted fields.");
        } else {
          toast.error(err.message);
        }
      }
      return null;
    } finally {
      setLoad(false);
    }
  }, [storeId]);

  return { update, loading, fieldErrors };
}

// ── Delete product mutation (soft-delete) ─────────────────────
export function useDeleteProduct() {
  const storeId            = useAuthStore((s) => s.storeId);
  const [loading, setLoad] = useState(false);

  const deleteProduct = useCallback(async (productId, productName) => {
    if (!storeId) return false;
    setLoad(true);

    try {
      await productService.delete(storeId, productId);
      toast.success(`"${productName}" has been archived.`);
      return true;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not archive the product.");
      return false;
    } finally {
      setLoad(false);
    }
  }, [storeId]);

  return { deleteProduct, loading };
}

// ── Create variant mutation ───────────────────────────────────
export function useCreateVariant(productId) {
  const storeId            = useAuthStore((s) => s.storeId);
  const [loading, setLoad] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const create = useCallback(async (payload) => {
    if (!storeId || !productId) return null;
    setLoad(true);
    setFieldErrors({});

    try {
      const result = await productService.createVariant(storeId, productId, payload);
      toast.success("Variant added.");
      return result?.data ?? null;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isValidation) {
          setFieldErrors(flattenValidationErrors(err));
          toast.error("Please fix the highlighted fields.");
        } else if (err.code === "DUPLICATE_SKU") {
          setFieldErrors({ sku: err.message });
          toast.error(err.message);
        } else {
          toast.error(err.message);
        }
      }
      return null;
    } finally {
      setLoad(false);
    }
  }, [storeId, productId]);

  return { create, loading, fieldErrors };
}

// ── Update variant mutation ──────────────────────────────────
export function useUpdateVariant(productId) {
  const storeId            = useAuthStore((s) => s.storeId);
  const [loading, setLoad] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const update = useCallback(async (variantId, payload) => {
    console.log(variantId, payload)
    if (!storeId || !productId) return null;
    setLoad(true);
    setFieldErrors({});

    try {
      const result = await productService.updateVariant(storeId, productId, variantId, payload);
      toast.success("Variant updated.");
      return result?.data ?? null;
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.isValidation) {
          setFieldErrors(flattenValidationErrors(err));
          toast.error("Please fix the highlighted fields.");
        } else {
          toast.error(err.message);
        }
      }
      return null;
    } finally {
      setLoad(false);
    }
  }, [storeId, productId]);

  return { update, loading, fieldErrors };
}

// ── Delete variant mutation ───────────────────────────────────
export function useDeleteVariant(productId) {
  const storeId            = useAuthStore((s) => s.storeId);
  const [loading, setLoad] = useState(false);

  const deleteVariant = useCallback(async (variantId) => {
    if (!storeId || !productId) return false;
    setLoad(true);

    try {
      await productService.deleteVariant(storeId, productId, variantId);
      toast.success("Variant deleted.");
      return true;
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not delete the variant.");
      return false;
    } finally {
      setLoad(false);
    }
  }, [storeId, productId]);

  return { deleteVariant, loading };
}

// ── Upload product images (after product is created) ──────────
// Sends files as multipart/form-data to POST /stores/:storeId/products/:productId/images
export function useUploadProductImages() {
  const storeId            = useAuthStore((s) => s.storeId);
  const [loading, setLoad] = useState(false);

  const upload = useCallback(async (productId, imageFiles) => {
    // const imgArr = imgArr.push(imageFiles)
    console.log("beginnig to upload...", productId, imageFiles)
    if (!storeId || !productId || !imageFiles) return null;
    setLoad(true);

    try {
      // Build FormData — field name must match multer's upload.array("images", 3)
      const formData = new FormData();
      imageFiles.forEach((file) => formData.append("images", file));

      // apiClient uses fetch — for multipart we call fetch directly
      // so we don't accidentally set Content-Type (browser sets it with boundary)
      const token = useAuthStore.getState().token;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

      const res = await fetch(
        `${baseUrl}/stores/${storeId}/products/${productId}/images`,
        {
          method:  "POST",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body:    formData,
          // No Content-Type header — browser sets multipart/form-data with boundary
        }
      );

      const json = await res.json();

      if (!res.ok || !json.success) {
        const code = json.error?.code ?? "UPLOAD_FAILED";
        const msg  = json.error?.message ?? "Image upload failed";
        toast.error(
          code === "VARIANT_IMAGE_LIMIT"
            ? msg                               // "Only N more images can be added"
            : "Some images could not be uploaded. The product was saved."
        );
        return null;
      }

      return json.data; // { images: [...], variant_id: "..." }
    } catch (err) {
      toast.error("Image upload failed. The product was saved — you can add images later.");
      return null;
    } finally {
      setLoad(false);
    }
  }, [storeId]);

  return { upload, loading };
}
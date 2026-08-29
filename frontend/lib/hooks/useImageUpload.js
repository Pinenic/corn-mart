"use client";
// lib/hooks/useImageUpload.js
// ─────────────────────────────────────────────────────────────
// useImageUpload(): generic single-tracker hook for upload/replace/
// delete — used for profile avatars and store logo/banner, where
// only one upload is ever in flight at a time for that component.
//
// useVariantImageUpload(storeId, productId): dedicated hook for
// product variant image slots. Each slot (variantId + slotIndex)
// gets its OWN XHR and its own progress/uploading state, so
// multiple slots can upload concurrently without stepping on each
// other's progress bar.
// ─────────────────────────────────────────────────────────────

import { useState, useCallback, useRef } from "react";
import useAuthStore from "@/lib/store/useAuthStore";
import { toast }   from "@/lib/store/toastStore";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";

// ── Friendly error messages ───────────────────────────────────
const ERROR_MESSAGES = {
  FILE_TOO_LARGE:        "That file is too large. Check the size limit and try again.",
  TOO_MANY_FILES:        "Too many files selected.",
  UNSUPPORTED_MEDIA_TYPE:"File type not supported. Use JPEG, PNG, WEBP, GIF, or AVIF.",
  UNEXPECTED_FIELD:      "Unexpected upload field — please refresh and try again.",
  STORAGE_UPLOAD_ERROR:  "Storage is temporarily unavailable. Please try again.",
  UNAUTHORISED:          "Your session has expired. Please sign in again.",
  FORBIDDEN:             "You don't have permission to do that.",
  NOT_FOUND:             "Resource not found.",
  default:               "Upload failed. Please try again.",
};

function getFriendlyError(code) {
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES.default;
}

// ── Generic single-tracker hook ─────────────────────────────────
// Fine for avatar / logo / banner: one upload target per component,
// never more than one in flight at once.
export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [removing,  setRemoving]  = useState(false);
  const [progress,  setProgress]  = useState(0);     // 0–100
  const [error,     setError]     = useState(null);  // string | null
  const xhrRef = useRef(null);                       // for abort support

  const token = useAuthStore(s => s.token);

  const upload = useCallback(async ({
    file,             // File
    endpoint,         // API path, e.g. "/stores/abc/logo"
    field,            // Form field name expected by multer, e.g. "logo"
    method = "POST", // HTTP method
    onSuccess,        // optional callback(responseData)
    successMessage,   // optional toast message override
  }) => {
    if (!file) {
      setError("No file selected");
      return null;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    return new Promise((resolve) => {
      const formData = new FormData();
      formData.append(field, file);

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          setProgress(Math.round((e.loaded / e.total) * 100));
        }
      });

      xhr.addEventListener("load", () => {
        setUploading(false);
        setProgress(0);
        xhrRef.current = null;

        let json;
        try {
          json = JSON.parse(xhr.responseText);
        } catch {
          setError("Unexpected server response");
          toast.error("Upload failed — unexpected server response");
          resolve(null);
          return;
        }

        if (xhr.status >= 200 && xhr.status < 300 && json.success) {
          const msg = successMessage ?? "Image updated successfully";
          toast.success(msg);
          onSuccess?.(json.data);
          resolve(json.data);
        } else {
          const code = json.error?.code;
          const msg  = getFriendlyError(code);
          setError(msg);
          toast.error(msg);
          resolve(null);
        }
      });

      xhr.addEventListener("error", () => {
        setUploading(false);
        setProgress(0);
        xhrRef.current = null;
        const msg = "Network error — check your connection and try again";
        setError(msg);
        toast.error(msg);
        resolve(null);
      });

      xhr.addEventListener("abort", () => {
        setUploading(false);
        setProgress(0);
        xhrRef.current = null;
        resolve(null);
      });

      xhr.open(method, `${BASE_URL}${endpoint}`);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      // Do NOT set Content-Type — the browser sets multipart/form-data with boundary automatically
      xhr.send(formData);
    });
  }, [token]);

  const remove = useCallback(async ({
    endpoint,
    onSuccess,
    successMessage,
  }) => {
    setRemoving(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method:  "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 204) {
        toast.success(successMessage ?? "Image removed");
        onSuccess?.();
        return true;
      }

      let json;
      try { json = await res.json(); } catch { json = null; }

      const code = json?.error?.code;
      const msg  = getFriendlyError(code);
      setError(msg);
      toast.error(msg);
      return false;
    } catch {
      const msg = "Network error — check your connection and try again";
      setError(msg);
      toast.error(msg);
      return false;
    } finally {
      setRemoving(false);
    }
  }, [token]);

  const abort = useCallback(() => {
    xhrRef.current?.abort();
  }, []);

  return { upload, remove, abort, uploading, removing, progress, error };
}

// ── Convenience wrappers (unchanged use-cases) ─────────────────

export function useProfileAvatarUpload() {
  const { upload, remove, ...rest } = useImageUpload();
  return {
    ...rest,
    uploadAvatar: (file, opts = {}) =>
      upload({ file, endpoint: "/users/me/avatar", field: "avatar", method: "PATCH", ...opts }),
    removeAvatar: (opts = {}) =>
      remove({ endpoint: "/users/me/avatar", successMessage: "Avatar removed", ...opts }),
  };
}

export function useStoreLogoUpload(storeId) {
  const { upload, remove, ...rest } = useImageUpload();
  return {
    ...rest,
    uploadLogo: (file, opts = {}) =>
      upload({ file, endpoint: `/stores/${storeId}/logo`, field: "logo", method: "PATCH", successMessage: "Logo updated", ...opts }),
    removeLogo: (opts = {}) =>
      remove({ endpoint: `/stores/${storeId}/logo`, successMessage: "Logo removed", ...opts }),
  };
}

export function useStoreBannerUpload(storeId) {
  const { upload, remove, ...rest } = useImageUpload();
  return {
    ...rest,
    uploadBanner: (file, opts = {}) =>
      upload({ file, endpoint: `/stores/${storeId}/banner`, field: "banner", method: "PATCH", successMessage: "Banner updated", ...opts }),
    removeBanner: (opts = {}) =>
      remove({ endpoint: `/stores/${storeId}/banner`, successMessage: "Banner removed", ...opts }),
  };
}

// ── Product variant image slots — concurrent, per-slot tracking ─
// Each slot is addressed by (variantId, slotIndex) and gets its own
// XHR + progress entry, so uploading to 2–3 slots at once works
// correctly and each slot's progress bar reflects only that slot.
//
//   const imgUpload = useVariantImageUpload(storeId, productId);
//   imgUpload.uploadToSlot(variantId, slotIndex, file, { onSuccess });
//   imgUpload.removeSlot(variantId, slotIndex, { onSuccess });
//   imgUpload.isUploading(variantId, slotIndex)   // boolean
//   imgUpload.isRemoving(variantId, slotIndex)    // boolean
//   imgUpload.getProgress(variantId, slotIndex)   // 0-100
export function useVariantImageUpload(storeId, productId) {
  const [progressByKey, setProgressByKey] = useState({});   // key -> 0-100
  const [uploadingKeys, setUploadingKeys] = useState(() => new Set());
  const [removingKeys,  setRemovingKeys]  = useState(() => new Set());
  const xhrRefs = useRef({});                                // key -> XMLHttpRequest

  const token = useAuthStore(s => s.token);

  const slotKey = (variantId, slotIndex) => `${variantId}-${slotIndex}`;

  const uploadToSlot = useCallback((variantId, slotIndex, file, opts = {}) => {
    const { onSuccess, successMessage } = opts;
    const key = slotKey(variantId, slotIndex);

    if (!file) {
      toast.error("No file selected");
      return Promise.resolve(null);
    }

    setUploadingKeys(prev => new Set(prev).add(key));
    setProgressByKey(prev => ({ ...prev, [key]: 0 }));

    return new Promise((resolve) => {
      const formData = new FormData();
      formData.append("image", file);

      const xhr = new XMLHttpRequest();
      xhrRefs.current[key] = xhr;

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const pct = Math.round((e.loaded / e.total) * 100);
          setProgressByKey(prev => ({ ...prev, [key]: pct }));
        }
      });

      const cleanup = () => {
        setUploadingKeys(prev => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
        setProgressByKey(prev => {
          const next = { ...prev };
          delete next[key];
          return next;
        });
        delete xhrRefs.current[key];
      };

      xhr.addEventListener("load", () => {
        let json;
        try {
          json = JSON.parse(xhr.responseText);
        } catch {
          cleanup();
          toast.error("Upload failed — unexpected server response");
          resolve(null);
          return;
        }

        cleanup();

        if (xhr.status >= 200 && xhr.status < 300 && json.success) {
          toast.success(successMessage ?? `Image saved to slot ${slotIndex + 1}`);
          onSuccess?.(json.data);
          resolve(json.data);
        } else {
          toast.error(getFriendlyError(json.error?.code));
          resolve(null);
        }
      });

      xhr.addEventListener("error", () => {
        cleanup();
        toast.error("Network error — check your connection and try again");
        resolve(null);
      });

      xhr.addEventListener("abort", () => {
        cleanup();
        resolve(null);
      });

      xhr.open(
        "PUT",
        `${BASE_URL}/stores/${storeId}/products/${productId}/variants/${variantId}/images/${slotIndex}`
      );
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(formData);
    });
  }, [storeId, productId, token]);

  const removeSlot = useCallback(async (variantId, slotIndex, opts = {}) => {
    const { onSuccess, successMessage } = opts;
    const key = slotKey(variantId, slotIndex);

    setRemovingKeys(prev => new Set(prev).add(key));

    try {
      const res = await fetch(
        `${BASE_URL}/stores/${storeId}/products/${productId}/variants/${variantId}/images/${slotIndex}`,
        { method: "DELETE", headers: token ? { Authorization: `Bearer ${token}` } : {} }
      );

      let json;
      try { json = await res.json(); } catch { json = null; }

      if (res.ok && json?.success) {
        toast.success(successMessage ?? "Image removed");
        onSuccess?.(json.data); // { deleted: true, shiftedImages: [{ id, sort_order }, ...] }
        return true;
      }

      toast.error(getFriendlyError(json?.error?.code));
      return false;
    } catch {
      toast.error("Network error — check your connection and try again");
      return false;
    } finally {
      setRemovingKeys(prev => {
        const next = new Set(prev);
        next.delete(key);
        return next;
      });
    }
  }, [storeId, productId, token]);

  const abortSlot = useCallback((variantId, slotIndex) => {
    xhrRefs.current[slotKey(variantId, slotIndex)]?.abort();
  }, []);

  const isUploading = useCallback(
    (variantId, slotIndex) => uploadingKeys.has(slotKey(variantId, slotIndex)),
    [uploadingKeys]
  );
  const isRemoving = useCallback(
    (variantId, slotIndex) => removingKeys.has(slotKey(variantId, slotIndex)),
    [removingKeys]
  );
  const getProgress = useCallback(
    (variantId, slotIndex) => progressByKey[slotKey(variantId, slotIndex)] ?? 0,
    [progressByKey]
  );

  return { uploadToSlot, removeSlot, abortSlot, isUploading, isRemoving, getProgress };
}
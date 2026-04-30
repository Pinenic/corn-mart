"use client";
// lib/hooks/useImageUpload.js
// ─────────────────────────────────────────────────────────────
// Universal React hook for image upload, replace, and delete
// operations — works for profile avatars, store assets, and
// product images without any change to the hook itself.
//
// The `endpoint` parameter is the only thing that changes:
//
//   Profile avatar (upload/replace):
//     endpoint: "/users/me/avatar"
//     method:   "PATCH"
//     field:    "avatar"
//
//   Store logo (upload/replace):
//     endpoint: "/stores/<storeId>/logo"
//     method:   "PATCH"
//     field:    "logo"
//
//   Store banner (upload/replace):
//     endpoint: "/stores/<storeId>/banner"
//     method:   "PATCH"
//     field:    "banner"
//
//   Product images (add, up to 3):
//     endpoint: "/stores/<storeId>/products/<productId>/images"
//     method:   "POST"
//     field:    "images"
//
// Usage:
//
//   const { upload, remove, uploading, progress, error } = useImageUpload();
//
//   // Replace store logo
//   const result = await upload({
//     file:     selectedFile,           // File object from input or drop
//     endpoint: `/stores/${storeId}/logo`,
//     field:    "logo",
//     method:   "PATCH",
//   });
//   if (result) setLogoUrl(result.logo);
//
//   // Delete store banner
//   await remove({ endpoint: `/stores/${storeId}/banner` });
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

// ── Main hook ─────────────────────────────────────────────────
export function useImageUpload() {
  const [uploading, setUploading] = useState(false);
  const [removing,  setRemoving]  = useState(false);
  const [progress,  setProgress]  = useState(0);     // 0–100
  const [error,     setError]     = useState(null);  // string | null
  const xhrRef = useRef(null);                       // for abort support

  const token = useAuthStore(s => s.token);

  // ── upload ──────────────────────────────────────────────────
  // Uploads a single file or an array of files using XHR so we
  // get real upload progress (fetch doesn't support this).
  //
  // Returns the parsed response data on success, null on failure.
  const upload = useCallback(async ({
    file,             // File | File[]
    variantId,
    endpoint,         // API path, e.g. "/stores/abc/logo"
    field,            // Form field name expected by multer, e.g. "logo"
    method = "POST", // HTTP method
    onSuccess,        // optional callback(responseData)
    successMessage,   // optional toast message override
  }) => {
    const files = Array.isArray(file) ? file : [file];
    if (!files.length || !files[0]) {
      setError("No file selected");
      return null;
    }

    setUploading(true);
    setProgress(0);
    setError(null);

    return new Promise((resolve) => {
      const formData = new FormData();
      formData.append("variant_id", variantId)
      files.forEach(f => formData.append(field, f));

      const xhr = new XMLHttpRequest();
      xhrRef.current = xhr;

      // Progress tracking
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

  // ── remove ──────────────────────────────────────────────────
  // Sends a DELETE request to remove an image.
  // Returns true on success, false on failure.
  const remove = useCallback(async ({
    endpoint,         // API path, e.g. "/stores/abc/logo" or "/products/abc/images/img-id"
    onSuccess,        // optional callback()
    successMessage,   // optional toast message override
  }) => {
    setRemoving(true);
    setError(null);

    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, {
        method:  "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (res.status === 204) {
        // No content — success
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

  // ── abort ───────────────────────────────────────────────────
  // Cancels an in-progress upload.
  const abort = useCallback(() => {
    xhrRef.current?.abort();
  }, []);

  return { upload, remove, abort, uploading, removing, progress, error };
}

// ── Convenience wrappers ──────────────────────────────────────
// Pre-bound versions for specific use-cases.
// Import these instead of useImageUpload when you know the context.

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

export function useProductImageUpload(storeId, productId) {
  const { upload, remove, ...rest } = useImageUpload();
  return {
    ...rest,
    uploadImages: (files, opts = {}) =>
      upload({ file: files, endpoint: `/stores/${storeId}/products/${productId}/images`, field: "images", method: "POST", successMessage: "Images uploaded", ...opts }),
    removeImage: (imageId, opts = {}) =>
      remove({ endpoint: `/stores/${storeId}/products/${productId}/images/${imageId}`, successMessage: "Image removed", ...opts }),
  };
}
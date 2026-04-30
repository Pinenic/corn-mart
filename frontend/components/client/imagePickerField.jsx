"use client";
// client/ImagePickerField.jsx
// ─────────────────────────────────────────────────────────────
// A reusable click-to-upload + drag-and-drop field component.
//
// Handles:
//   - File selection (click or drag-drop)
//   - Local preview before upload
//   - Upload progress bar
//   - Replace and remove actions on an existing image
//   - Disabled state during upload
//
// Usage — store logo:
//
//   <ImagePickerField
//     label="Store logo"
//     aspect="square"           // "square" | "banner" | "free"
//     currentUrl={store.logo}
//     onUpload={(file) => uploadLogo(file)}
//     onRemove={() => removeLogo()}
//     uploading={uploading}
//     progress={progress}
//     hint="PNG or JPEG · max 3 MB"
//   />
//
// Usage — product image slot (no remove, just replace):
//
//   <ImagePickerField
//     aspect="square"
//     currentUrl={img.image_url}
//     onUpload={(file) => uploadImages([file])}
//     uploading={uploading}
//     progress={progress}
//   />
// ─────────────────────────────────────────────────────────────

import { useRef, useState, useEffect } from "react";
import { Upload, X, RefreshCw, Image as ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ImagePickerField({
  label,
  aspect    = "square",      // "square" | "banner" | "free"
  currentUrl,                // existing URL from DB — shown as current state
  onUpload,                  // async (File) => any
  onRemove,                  // async () => any — if undefined, remove button hidden
  uploading = false,
  progress  = 0,
  hint,
  className,
}) {
  const fileRef = useRef(null);
  const [preview,   setPreview]   = useState(null);   // local File object URL
  const [dragOver,  setDragOver]  = useState(false);

  // Clean up object URLs on unmount to avoid memory leaks
  useEffect(() => {
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [preview]);

  const displayUrl = preview ?? currentUrl ?? null;
  const hasImage   = Boolean(displayUrl);

  const handleFile = async (file) => {
    if (!file || !file.type.startsWith("image/")) return;

    // Show local preview immediately
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));

    // Trigger the upload
    const result = await onUpload?.(file);

    // If the upload returned a new URL, clear the local preview
    // (the parent will update currentUrl from the API response)
    if (result) {
      URL.revokeObjectURL(preview ?? "");
      setPreview(null);
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    // Reset input so the same file can be re-selected after removal
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleRemove = async (e) => {
    e.stopPropagation();
    if (preview) {
      URL.revokeObjectURL(preview);
      setPreview(null);
    }
    await onRemove?.();
  };

  const aspectClass = {
    square: "aspect-square",
    banner: "aspect-[4/1]",
    free:   "",
  }[aspect] ?? "aspect-square";

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <p className="text-[12px] font-semibold mb-1.5"
          style={{ color: "var(--color-text-secondary)" }}>
          {label}
        </p>
      )}

      <div
        onClick={() => !uploading && fileRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={cn(
          "relative w-full rounded-2xl border-2 overflow-hidden transition-all duration-200 group",
          aspectClass,
          !hasImage && "flex flex-col items-center justify-center gap-2",
          uploading    ? "cursor-not-allowed opacity-75" : "cursor-pointer",
          dragOver     ? "border-[var(--color-accent)] scale-[1.01]" : "",
          hasImage     ? "border-[var(--color-accent)]" : "border-dashed border-[var(--color-border-md)]",
          !hasImage && !dragOver && "hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5"
        )}
        style={{ minHeight: aspect === "free" ? 120 : undefined, background: "var(--color-bg)" }}
      >
        {/* ── Current image ── */}
        {hasImage && (
          <img
            src={displayUrl}
            alt="Uploaded image"
            className="w-full h-full object-cover"
          />
        )}

        {/* ── Empty state ── */}
        {!hasImage && (
          <>
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
              dragOver ? "bg-[var(--color-accent)] text-white" : "bg-white text-[var(--color-text-muted)]"
            )}>
              <Upload size={18} />
            </div>
            <div className="text-center px-3">
              <p className="text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>
                {dragOver ? "Drop to upload" : "Click or drag to upload"}
              </p>
              {hint && (
                <p className="text-[11px] mt-0.5" style={{ color: "var(--color-text-muted)" }}>
                  {hint}
                </p>
              )}
            </div>
          </>
        )}

        {/* ── Hover overlay on existing image ── */}
        {hasImage && !uploading && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
            <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl text-[12px] font-semibold"
              style={{ color: "var(--color-text-primary)" }}>
              <RefreshCw size={13} /> Replace
            </div>
          </div>
        )}

        {/* ── Progress bar ── */}
        {uploading && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-black/10">
            <div
              className="h-full bg-[var(--color-accent)] transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* ── Remove button ── */}
        {hasImage && onRemove && !uploading && (
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 w-7 h-7 rounded-xl bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors opacity-0 group-hover:opacity-100 z-10"
          >
            <X size={13} />
          </button>
        )}

        {/* ── Upload loading indicator ── */}
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-[var(--color-accent)] border-t-transparent rounded-full animate-spin" />
              {progress > 0 && (
                <span className="text-[11px] font-semibold" style={{ color: "var(--color-accent)" }}>
                  {progress}%
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
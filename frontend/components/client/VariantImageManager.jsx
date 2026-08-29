"use client";

import { ImagePickerField } from "./imagePickerField";
import { cn } from "@/lib/utils";

export function VariantImageManager({
  variants = [],
  images = [],
  onUpload,       // (variantId, slotIndex, file) => Promise
  onRemove,       // (variantId, slotIndex) => Promise
  isUploading,    // (variantId, slotIndex) => boolean
  isRemoving,     // (variantId, slotIndex) => boolean
  getProgress,    // (variantId, slotIndex) => number (0-100)
  className,
}) {
  const variantImagesById = variants.reduce((acc, variant) => {
    const variantImages = images
      .filter((img) => img.variant_id === variant.id)
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
    acc[variant.id] = variantImages;
    return acc;
  }, {});

  const renderSlot = (variant, slotIndex) => {
    const image = variantImagesById[variant.id]?.[slotIndex];
    const slotKey = `${variant.id}-${slotIndex}`;

    const uploading = isUploading?.(variant.id, slotIndex) ?? false;
    const removing  = isRemoving?.(variant.id, slotIndex) ?? false;
    const progress  = getProgress?.(variant.id, slotIndex) ?? 0;

    return (
      <ImagePickerField
        key={slotKey}
        label={`Image ${slotIndex + 1}`}
        currentUrl={image?.image_url}
        aspect="square"
        uploading={uploading || removing}
        progress={progress}
        onUpload={(file) => onUpload?.(variant.id, slotIndex, file)}
        onRemove={image ? () => onRemove?.(variant.id, slotIndex) : undefined}
        hint=""
      />
    );
  };

  if (!variants?.length) {
    return (
      <div
        className={cn(
          "rounded-3xl border border-dashed p-5 text-center",
          className
        )}
        style={{
          borderColor: "var(--color-border-md)",
          background: "var(--color-bg)",
          color: "var(--color-text-secondary)",
        }}
      >
        No variants available. Add variants first to assign images.
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {variants.map((variant) => (
        <div key={variant.id} className="rounded-3xl border border-[var(--color-border)] p-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between mb-4">
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--color-text-primary)" }}>
                {variant.name || "Variant"}
              </p>
            </div>
            <p className="text-[11px] text-right" style={{ color: "var(--color-text-secondary)" }}>
              Up to 3 images
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[0, 1, 2].map((slotIndex) => renderSlot(variant, slotIndex))}
          </div>
        </div>
      ))}
    </div>
  );
}
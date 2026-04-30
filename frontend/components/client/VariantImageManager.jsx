"use client";

import { ImagePickerField } from "./imagePickerField";
import { cn } from "@/lib/utils";

export function VariantImageManager({
  variants = [],
  images = [],
  onUpload,
  onRemove,
  progress = {},
  uploading = false,
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

    return (
      <ImagePickerField
        key={slotKey}
        label={`Image ${slotIndex + 1}`}
        currentUrl={image?.image_url}
        aspect="square"
        uploading={uploading}
        progress={progress[slotKey] ?? 0}
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
              {/* {variant.sku && (
                <p className="text-[11px] mt-1" style={{ color: "var(--color-text-secondary)" }}>
                  SKU: {variant.sku}
                </p>
              )} */}
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

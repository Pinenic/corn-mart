"use client";
import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { cn } from "@/lib/utils";

export function ProductImageGallery({ images = [], thumbnail_url, selectedVariant }) {
  // Filter images relevant to the selected variant, or show all if none selected
  const variantImages = selectedVariant
    ? images.filter(img => img.variant_id === selectedVariant.id || img.variant_id === null)
    : images;

  // Fall back to thumbnail if no images
  const allImages = variantImages.length > 0
    ? variantImages
    : thumbnail_url
    ? [{ id: "thumb", image_url: thumbnail_url, is_thumbnail: true }]
    : [];

  const [active, setActive] = useState(0);

  // Reset to first image when variant changes
  useEffect(() => { setActive(0); }, [selectedVariant?.id]);

  const prev = () => setActive(i => (i - 1 + allImages.length) % allImages.length);
  const next = () => setActive(i => (i + 1) % allImages.length);

  if (allImages.length === 0) {
    return (
      <div className="aspect-square bg-[var(--color-bg)] rounded-[var(--radius-lg)] flex items-center justify-center">
        <Package size={64} className="text-[var(--color-text-muted)]" />
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row-reverse gap-3">
      {/* Main image */}
      <div className="relative flex-1 aspect-square bg-[var(--color-bg)] rounded-[var(--radius-lg)] overflow-hidden group">
        <img
          src={allImages[active]?.image_url}
          alt="Product"
          className="w-full h-full object-cover transition-opacity duration-300"
        />
        {allImages.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronLeft size={16} className="text-[var(--color-text-primary)]" />
            </button>
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
            >
              <ChevronRight size={16} className="text-[var(--color-text-primary)]" />
            </button>
            {/* Dot indicators — mobile only, desktop has the thumbnail rail */}
            <div className="md:hidden absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActive(i)}
                  className={cn("rounded-full transition-all", i === active ? "w-4 h-1.5 bg-white" : "w-1.5 h-1.5 bg-white/60")}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Thumbnail rail — horizontal strip on mobile, vertical column on desktop */}
      {allImages.length > 1 && (
        <div
          className="flex md:flex-col gap-2 overflow-x-auto md:overflow-x-visible md:overflow-y-auto md:w-16 md:max-h-[480px] flex-shrink-0 pb-1 md:pb-0"
          style={{ scrollbarWidth: "none" }}
        >
          {allImages.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActive(i)}
              className={cn(
                "flex-shrink-0 w-16 h-16 rounded-[var(--radius-sm)] overflow-hidden border-2 transition-all",
                i === active
                  ? "border-[var(--color-primary)]"
                  : "border-[var(--color-border)] hover:border-[var(--color-border-md)]"
              )}
            >
              <img src={img.image_url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

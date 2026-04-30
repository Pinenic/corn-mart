"use client";

import { useState, useRef, useEffect } from "react";
import { Upload, X, Star, GripVertical, Image } from "lucide-react";
import { useUploadProductImages } from "@/lib/hooks/useProducts";

/**
 * ImageUploader
 *
 * Props:
 *   productId    — optional product ID for immediate upload in edit mode
 *   images       — array of { id, image_url, is_thumbnail, sort_order, variant_id, _file }
 *   variants     — array of { id, name } for variant assignment dropdown
 *   onChange(images) — called when images array changes
 */
export function ImageUploader({
  productId,
  images = [],
  variants = [],
  onChange
}) {
  const { upload, loading: uploading } = useUploadProductImages();
  const [draggingId, setDraggingId] = useState(null);
  const [dragOverId, setDragOverId] = useState(null);
  const fileRef = useRef(null);
  const previewUrls = useRef(new Set());

  useEffect(() => {
    return () => {
      previewUrls.current.forEach(URL.revokeObjectURL);
      previewUrls.current.clear();
    };
  }, []);

  const setThumbnail = (id) => {
    onChange(images.map((img) => ({ ...img, is_thumbnail: img.id === id })));
  };

  const revokePreviewUrl = (img) => {
    if (img?._preview && img.image_url) {
      URL.revokeObjectURL(img.image_url);
      previewUrls.current.delete(img.image_url);
    }
  };

  const removeImage = (id) => {
    const removed = images.find((img) => img.id === id);
    const next = images.filter((img) => img.id !== id);

    revokePreviewUrl(removed);

    if (next.length > 0 && !next.find((i) => i.is_thumbnail)) {
      next[0] = { ...next[0], is_thumbnail: true };
    }
    onChange(next);
  };

  const assignVariant = (id, variant_id) => {
    onChange(
      images.map((img) =>
        img.id === id ? { ...img, variant_id: variant_id || null } : img
      )
    );
  };

  const createPreviewImage = (file, index) => {
    const image_url = URL.createObjectURL(file);
    previewUrls.current.add(image_url);

    return {
      id: `tmp-${Date.now()}-${index}`,
      image_url,
      _file: file,
      _preview: true,
      is_thumbnail: images.length === 0 && index === 0,
      sort_order: images.length + index,
      variant_id: null,
    };
  };

  const handleFiles = async (files) => {
    const fileArray = Array.from(files);

    if (productId) {
      const result = await upload(productId, fileArray);
      const uploadedImages =
        result?.images ?? (Array.isArray(result) ? result : null);

      if (Array.isArray(uploadedImages) && uploadedImages.length > 0) {
        onChange([
          ...images,
          ...uploadedImages.map((img, index) => ({
            ...img,
            sort_order: images.length + index,
          })),
        ]);
      }
      return;
    }

    const previews = fileArray.map((file, index) =>
      createPreviewImage(file, index)
    );
    onChange([...images, ...previews]);
  };

  // Drag-to-reorder
  const handleDragStart = (id) => setDraggingId(id);
  const handleDragOver = (e, id) => {
    e.preventDefault();
    setDragOverId(id);
  };
  const handleDrop = (e, targetId) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) {
      setDraggingId(null);
      setDragOverId(null);
      return;
    }
    const from = images.findIndex((i) => i.id === draggingId);
    const to = images.findIndex((i) => i.id === targetId);
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    onChange(next.map((img, i) => ({ ...img, sort_order: i })));
    setDraggingId(null);
    setDragOverId(null);
  };

  return (
    <div>
      {/* Upload zone */}
      <div
        className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors hover:border-[var(--color-accent)] mb-4"
        style={{
          borderColor: "var(--color-border-md)",
          background: "var(--color-bg)",
        }}
        onClick={() => fileRef.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          handleFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background: "white", color: "var(--color-text-tertiary)" }}
          >
            <Upload size={18} />
          </div>
          <div>
            <p
              className="text-[13px] font-medium"
              style={{ color: "var(--color-text-primary)" }}
            >
              Click to upload or drag & drop
            </p>
            <p
              className="text-[11px] mt-0.5"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              PNG, JPG, WEBP up to 10MB each · First image is set as thumbnail
            </p>
          </div>
        </div>
      </div>

      {/* Image grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {images.map((img) => (
            <div
              key={img.id}
              draggable
              onDragStart={() => handleDragStart(img.id)}
              onDragOver={(e) => handleDragOver(e, img.id)}
              onDrop={(e) => handleDrop(e, img.id)}
              onDragEnd={() => {
                setDraggingId(null);
                setDragOverId(null);
              }}
              className="relative rounded-xl border overflow-hidden group transition-all"
              style={{
                borderColor:
                  dragOverId === img.id
                    ? "var(--color-accent)"
                    : img.is_thumbnail
                    ? "var(--color-accent)"
                    : "var(--color-border)",
                borderWidth: img.is_thumbnail ? 2 : 1,
                opacity: draggingId === img.id ? 0.5 : 1,
              }}
            >
              {/* Image preview */}
              <div className="aspect-square bg-[var(--color-bg)] flex items-center justify-center overflow-hidden">
                {img.image_url ? (
                  <img
                    src={img.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image
                    size={24}
                    style={{ color: "var(--color-text-tertiary)" }}
                  />
                )}
              </div>

              {/* Overlay controls */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-start justify-between p-1.5">
                {/* Drag handle */}
                <div
                  className="opacity-0 group-hover:opacity-100 cursor-grab p-1 rounded bg-white/90"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <GripVertical size={13} />
                </div>
                {/* Remove */}
                <button
                  onClick={() => removeImage(img.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded bg-white/90 transition-colors hover:bg-red-50"
                  style={{ color: "var(--color-danger)" }}
                >
                  <X size={13} />
                </button>
              </div>

              {/* Thumbnail star */}
              <button
                onClick={() => setThumbnail(img.id)}
                title={img.is_thumbnail ? "Thumbnail" : "Set as thumbnail"}
                className="absolute bottom-1.5 left-1.5 p-1 rounded-md transition-colors"
                style={{
                  background: img.is_thumbnail
                    ? "var(--color-accent)"
                    : "white",
                  color: img.is_thumbnail
                    ? "white"
                    : "var(--color-text-tertiary)",
                  border: img.is_thumbnail
                    ? "none"
                    : "0.5px solid var(--color-border)",
                }}
              >
                <Star size={11} fill={img.is_thumbnail ? "white" : "none"} />
              </button>

              {/* Thumbnail label */}
              {img.is_thumbnail && (
                <span
                  className="absolute top-1.5 left-1.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md"
                  style={{ background: "var(--color-accent)", color: "white" }}
                >
                  Cover
                </span>
              )}

              {/* Variant assignment */}
              {variants.length > 0 && (
                <div className="px-1.5 pb-1.5">
                  <select
                    value={img.variant_id || ""}
                    onChange={(e) => assignVariant(img.id, e.target.value)}
                    className="w-full text-[10px] rounded-md border px-1.5 py-1 outline-none bg-white"
                    style={{
                      borderColor: "var(--color-border)",
                      color: "var(--color-text-secondary)",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <option value="">All variants</option>
                    {variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <p
          className="text-[11px] mt-2"
          style={{ color: "var(--color-text-tertiary)" }}
        >
          Drag images to reorder · ⭐ = product cover image
        </p>
      )}
    </div>
  );
}

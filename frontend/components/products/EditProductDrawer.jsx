"use client";

import { useState, useEffect } from "react";
import { X, Save, Eye, EyeOff } from "lucide-react";
import { Badge, Button } from "@/components/ui";
import { ImageUploader } from "./ImageUploader";
import { VariantsEditor } from "./VariantsEditor";
import { OptionsEditor } from "./OptionsEditor";
import { useCategories } from "@/lib/hooks/useCategories";
import { useImageUpload } from "@/lib/hooks/useImageUpload";
import { getStockStatus } from "@/lib/products-data";
import { ImagePickerField } from "../client/imagePickerField";
import { VariantImageManager } from "../client/VariantImageManager";

const TABS = [
  { key: "details", label: "Details" },
  // { key: "options", label: "Options" },
  { key: "variants", label: "Variants" },
  { key: "images", label: "Images" },
];

export function EditProductDrawer({ product, onClose, onSave, mutate }) {
  const [form, setForm] = useState({ ...product });
  const [activeTab, setTab] = useState("details");
  const [dirty, setDirty] = useState(false);
  const [progressMap, setProgressMap] = useState({});

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  
  // Initialize image upload hook
  const storeId = product.store_id;
  const { upload, remove, abort, uploading, removing, progress, error } = useImageUpload(
    storeId,
    product.id
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const h = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const update = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    setDirty(true);
  };

  // Handle variant image upload
  const handleUploadVariantImage = async (variantId, slotIndex, file) => {
    const slotKey = `${variantId}-${slotIndex}`;
    setProgressMap((prev) => ({ ...prev, [slotKey]: 0 }));

    const result = await upload({
      file,
      variantId,
      endpoint:`/stores/${storeId}/products/${product.id}/images`,
      field: "images",
      successMessage: `Image uploaded to slot ${slotIndex + 1}`,
      onSuccess: (data) => {
        const newImage = {
          id: data.id,
          image_url: data.image_url,
          variant_id: variantId,
          sort_order: slotIndex,
          is_thumbnail: false,
        };

        const existingIndex = form.images.findIndex(
          (img) =>
            img.variant_id === variantId &&
            (img.sort_order ?? 0) === slotIndex
        );

        const updatedImages =
          existingIndex >= 0
            ? form.images.map((img, i) =>
                i === existingIndex ? newImage : img
              )
            : [...form.images, newImage];

        update("images", updatedImages);

        // Clear progress
        setProgressMap((prev) => {
          const next = { ...prev };
          delete next[slotKey];
          return next;
        });
      },
    });

    if (!result) {
      setProgressMap((prev) => {
        const next = { ...prev };
        delete next[slotKey];
        return next;
      });
    }
  };

  // Handle variant image removal
  const handleRemoveVariantImage = async (variantId, slotIndex) => {
    const slotKey = `${variantId}-${slotIndex}`;

    const imageToRemove = form.images.find(
      (img) =>
        img.variant_id === variantId && (img.sort_order ?? 0) === slotIndex
    );

    if (!imageToRemove) return;

    await remove({
      endpoint: `/stores/${storeId}/products/${product.id}/images/${imageToRemove.id}`,
      successMessage: `Image removed from slot ${slotIndex + 1}`,
      onSuccess: () => {
        const updatedImages = form.images.filter(
          (img) => img.id !== imageToRemove.id
        );
        update("images", updatedImages);

        setProgressMap((prev) => {
          const next = { ...prev };
          delete next[slotKey];
          return next;
        });
      },
    });
  };

  // Track upload progress for current slot
  useEffect(() => {
    if (uploading && progress > 0) {
      const slotKeys = Object.keys(progressMap);
      if (slotKeys.length > 0) {
        const currentSlot = slotKeys[0];
        setProgressMap((prev) => ({
          ...prev,
          [currentSlot]: progress,
        }));
      }
    }
  }, [progress, uploading]);

  const handleSave = () => {
    onSave?.(form);
    setDirty(false);
    onClose();
  };

  const stockStatus = getStockStatus(form);
  const selectedCategory = categories.find((c) => c.name === form.category);
  const subcats = selectedCategory?.subcategories || [];

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-white"
        style={{
          width: "min(600px, 100vw)",
          borderLeft: "0.5px solid var(--color-border)",
          animation: "slideInRight 0.22s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: "-4px 0 32px rgba(0,0,0,0.08)",
        }}
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2
                className="text-[16px] font-semibold tracking-tight truncate"
                style={{ color: "var(--color-text-primary)" }}
              >
                {form.name || "Edit product"}
              </h2>
              <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
            </div>
            <p
              className="text-[12px] mt-0.5"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              {form.variants.length} variant
              {form.variants.length !== 1 ? "s" : ""}
              {form.brand ? ` · ${form.brand}` : ""}
            </p>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <button
              onClick={() => update("is_active", !form.is_active)}
              className="flex items-center gap-1.5 h-8 px-3 rounded-lg border text-[12px] font-medium transition-colors hover:bg-[var(--color-bg)]"
              style={{
                borderColor: "var(--color-border-md)",
                color: form.is_active
                  ? "var(--color-success)"
                  : "var(--color-text-tertiary)",
              }}
            >
              {form.is_active ? <Eye size={13} /> : <EyeOff size={13} />}
              {form.is_active ? "Active" : "Inactive"}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg)]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div
          className="flex border-b flex-shrink-0 px-5"
          style={{ borderColor: "var(--color-border)" }}
        >
          {TABS.map((tab) => {
            const active = activeTab === tab.key;
            // Badge counts
            const count =
              tab.key === "variants"
                ? form.variants.length
                : tab.key === "images"
                ? form.images.length
                : tab.key === "options"
                ? form.options?.length ?? 0
                : null;
            return (
              <button
                key={tab.key}
                onClick={() => setTab(tab.key)}
                className="flex items-center gap-1.5 px-3 py-3 text-[13px] font-medium border-b-2 transition-colors"
                style={{
                  borderColor: active ? "var(--color-accent)" : "transparent",
                  color: active
                    ? "var(--color-accent-text)"
                    : "var(--color-text-secondary)",
                  marginBottom: -1,
                }}
              >
                {tab.label}
                {count != null && (
                  <span
                    className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full min-w-[18px] text-center"
                    style={{
                      background: active
                        ? "var(--color-accent)"
                        : "var(--color-bg)",
                      color: active ? "white" : "var(--color-text-tertiary)",
                    }}
                  >
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="flex-1 overflow-y-auto px-5 py-5">
          {/* ── Details ── */}
          {activeTab === "details" && (
            <div className="space-y-4">
              <Field label="Product name *">
                <input
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Enter product name"
                  className={inputCls}
                  style={inputStyle}
                />
              </Field>
              <Field label="Description">
                <textarea
                  value={form.description || ""}
                  onChange={(e) => update("description", e.target.value)}
                  placeholder="Describe your product…"
                  rows={4}
                  className={`${inputCls} resize-none py-2`}
                  style={inputStyle}
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Base price ($) *">
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      update("price", parseFloat(e.target.value) || 0)
                    }
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>
                <Field label="Brand">
                  <input
                    value={form.brand || ""}
                    onChange={(e) => update("brand", e.target.value)}
                    placeholder="Brand name"
                    className={inputCls}
                    style={inputStyle}
                  />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Category">
                  <select
                    value={form.category || ""}
                    onChange={(e) => {
                      update("category", e.target.value);
                      update("subcat_id", null);
                    }}
                    className={`${inputCls} cursor-pointer`}
                    style={inputStyle}
                    disabled={categoriesLoading}
                  >
                    <option value="">
                      {categoriesLoading
                        ? "Loading categories..."
                        : "Select category"}
                    </option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Subcategory">
                  <select
                    value={form.subcat_id || ""}
                    onChange={(e) =>
                      update("subcat_id", e.target.value || null)
                    }
                    disabled={!form.category || !subcats.length}
                    className={`${inputCls} cursor-pointer disabled:opacity-50`}
                    style={inputStyle}
                  >
                    <option value="">Select subcategory</option>
                    {subcats.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>
            </div>
          )}

          {/* ── Options ── */}
          {activeTab === "images" && (
            <div>
              <p
                className="text-[13px] mb-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Upload images for each variant (up to 3 per variant).
              </p>
              <VariantImageManager
                variants={form.variants}
                images={form.images}
                onUpload={handleUploadVariantImage}
                onRemove={handleRemoveVariantImage}
                uploading={uploading || removing}
                progress={progressMap}
              />
            </div>
          )}

          {/* ── Variants ── */}
          {activeTab === "variants" && (
            <div>
              <p
                className="text-[13px] mb-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Variants represent each sellable version of your product. Each
                has its own SKU, price override, and stock level.
              </p>
              <VariantsEditor
                productId={product.id}
                variants={form.variants}
                productName={form.name}
                onChange={(v) => update("variants", v)}
              />
            </div>
          )}

          {/* ── Images ── */}
          {/* {activeTab === "options" && (
            <div>
              <p
                className="text-[13px] mb-4"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Upload product images. Drag to reorder. Star icon sets the cover
                image. Optionally assign images to specific variants.
              </p>
              <ImageUploader
                productId={product.id}
                images={form.images}
                variants={form.variants}
                onChange={(imgs) => update("images", imgs)}
                mutate={mutate}
              />
            </div>
          )} */}
        </div>

        {/* Footer */}
        <div
          className="flex items-center gap-3 px-5 py-4 border-t flex-shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          {dirty && (
            <span
              className="text-[12px] flex-1"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              Unsaved changes
            </span>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSave} disabled={!dirty}>
              <Save size={14} /> Save changes
            </Button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0.6; }
          to   { transform: translateX(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label
        className="text-[12px] font-medium block mb-1.5"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputCls =
  "w-full h-9 px-3 rounded-lg border text-[13px] outline-none transition-colors focus:border-[var(--color-accent)]";
const inputStyle = {
  borderColor: "var(--color-border-md)",
  color: "var(--color-text-primary)",
  background: "white",
};

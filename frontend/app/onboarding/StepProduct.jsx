"use client";
import { useRef, useState } from "react";
import { Upload, X, Star, Image as ImageIcon, Package, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[12px] font-semibold mb-1.5"
      style={{ color: "var(--color-text-secondary)" }}>
      {children}{required && <span style={{ color: "var(--color-danger)" }} className="ml-0.5">*</span>}
    </label>
  );
}

const inputBase  = "w-full h-10 px-3 rounded-xl border text-[13px] outline-none transition-all focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10";
const inputStyle = { borderColor: "var(--color-border-md)", color: "var(--color-text-primary)", background: "white" };

// ── Inline 3-slot image picker ────────────────────────────────
function ImageSlots({ files, onChange }) {
  const ref = useRef(null);
  const MAX = 3;

  const handleFiles = (newFiles) => {
    const combined = [...files, ...Array.from(newFiles)].slice(0, MAX);
    onChange(combined);
  };

  const remove = (i) => {
    const next = files.filter((_, idx) => idx !== i);
    onChange(next);
  };

  const setAsCover = (i) => {
    // Swap the chosen image to index 0 (first = cover)
    const next = [...files];
    [next[0], next[i]] = [next[i], next[0]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {/* Slots */}
      <div className="flex gap-3">
        {Array.from({ length: MAX }).map((_, i) => {
          const file    = files[i];
          const preview = file ? URL.createObjectURL(file) : null;
          const isCover = i === 0;

          return (
            <div key={i} className="relative flex-1 aspect-square group">
              {file ? (
                <div
                  className={cn(
                    "w-full h-full rounded-2xl overflow-hidden border-2 transition-all",
                    isCover ? "border-[var(--color-accent)]" : "border-[var(--color-border)]"
                  )}
                >
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all rounded-2xl flex items-end justify-between p-1.5">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => setAsCover(i)}
                        title="Set as cover"
                        className="w-6 h-6 rounded-lg flex items-center justify-center bg-white/90 hover:bg-white transition-colors opacity-0 group-hover:opacity-100">
                        <Star size={11} style={{ color: "var(--color-text-secondary)" }} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center bg-white/90 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100",
                        !isCover && "ml-auto"
                      )}>
                      <X size={11} style={{ color: "var(--color-danger)" }} />
                    </button>
                  </div>
                  {/* Cover badge */}
                  {isCover && (
                    <span className="absolute top-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-md text-white"
                      style={{ background: "var(--color-accent)" }}>
                      Cover
                    </span>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => ref.current?.click()}
                  disabled={files.length >= MAX}
                  className={cn(
                    "w-full h-full rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all",
                    i === files.length
                      ? "border-[var(--color-accent)]/50 hover:border-[var(--color-accent)] hover:bg-[var(--color-accent)]/5 cursor-pointer"
                      : "border-[var(--color-border)] opacity-40 cursor-not-allowed"
                  )}
                  style={{ background: "var(--color-bg)" }}
                >
                  {i === 0 && files.length === 0 ? (
                    <>
                      <ImageIcon size={20} style={{ color: "var(--color-accent)" }} />
                      <span className="text-[10px] font-semibold" style={{ color: "var(--color-accent)" }}>Add photo</span>
                    </>
                  ) : i === files.length ? (
                    <Upload size={14} style={{ color: "var(--color-text-muted)" }} />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-dashed" style={{ borderColor: "var(--color-border)" }} />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <input
        ref={ref}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />

      <p className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
        Up to 3 photos · First photo is the cover image · Drag and drop also works
      </p>
    </div>
  );
}

// ── Product preview card ──────────────────────────────────────
function ProductPreview({ form }) {
  const coverUrl = form.images[0] ? URL.createObjectURL(form.images[0]) : null;
  return (
    <div className="bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden">
      <div className="aspect-square bg-[var(--color-bg)] flex items-center justify-center overflow-hidden relative">
        {coverUrl
          ? <img src={coverUrl} alt="" className="w-full h-full object-cover" />
          : <Package size={40} style={{ color: "var(--color-text-muted)" }} />
        }
        {form.images.length > 1 && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            {form.images.slice(0, 3).map((_, i) => (
              <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i === 0 ? "bg-white" : "bg-white/50")} />
            ))}
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-[13px] font-semibold truncate" style={{ color: "var(--color-text-primary)" }}>
          {form.name || <span style={{ color: "var(--color-text-muted)" }}>Product name</span>}
        </p>
        {form.price && (
          <p className="text-[14px] font-bold mt-0.5" style={{ color: "var(--color-accent)" }}>
            K{parseFloat(form.price || 0).toFixed(2)}
          </p>
        )}
        {!form.name && !form.price && (
          <div className="space-y-1 mt-1">
            <div className="h-2 rounded bg-[var(--color-border)] w-3/4" />
            <div className="h-2 rounded w-1/2" style={{ background: "var(--color-accent)" + "40" }} />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export function StepProduct({ form, onChange }) {
  const update = (field, val) => onChange({ ...form, [field]: val });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_200px] gap-6 lg:gap-8 max-w-2xl mx-auto">

      {/* Form */}
      <div className="space-y-5">

        {/* Hero prompt */}
        <div className="flex items-start gap-3 p-4 rounded-2xl"
          style={{ background: "var(--color-accent-subtle)", borderColor: "var(--color-accent)" }}>
          <Sparkles size={16} className="flex-shrink-0 mt-0.5" style={{ color: "var(--color-accent)" }} />
          <div>
            <p className="text-[13px] font-semibold" style={{ color: "var(--color-accent-text)" }}>
              List your first product
            </p>
            <p className="text-[12px] mt-0.5" style={{ color: "var(--color-accent-text)", opacity: 0.8 }}>
              Keep it simple — you can add more details from the products page later
            </p>
          </div>
        </div>

        {/* Product name */}
        <div>
          <FieldLabel required>Product name</FieldLabel>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Handmade Leather Bag"
            className={inputBase}
            style={inputStyle}
          />
        </div>

        {/* Price + Stock */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel required>Price (ZMW)</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold"
                style={{ color: "var(--color-text-muted)" }}>K</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="0.00"
                className={inputBase + " pl-7"}
                style={inputStyle}
              />
            </div>
          </div>
          <div>
            <FieldLabel>Stock qty</FieldLabel>
            <input
              type="number"
              min="0"
              step="1"
              value={form.stock}
              onChange={(e) => update("stock", e.target.value)}
              placeholder="1"
              className={inputBase}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <FieldLabel>Short description <span className="font-normal" style={{ color: "var(--color-text-muted)" }}>(optional)</span></FieldLabel>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="What should buyers know about this product?"
            rows={2}
            className={inputBase + " h-auto resize-none py-2.5"}
            style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)", background: "white" }}
          />
        </div>

        {/* Images */}
        <div>
          <FieldLabel>Product photos <span className="font-normal" style={{ color: "var(--color-text-muted)" }}>(up to 3)</span></FieldLabel>
          <ImageSlots files={form.images} onChange={(imgs) => update("images", imgs)} />
        </div>

      </div>

      {/* Preview */}
      <div className="space-y-3 lg:sticky lg:top-6">
        <p className="text-[12px] font-semibold flex items-center gap-1.5"
          style={{ color: "var(--color-text-secondary)" }}>
          <Sparkles size={12} style={{ color: "var(--color-accent)" }} />
          How it looks
        </p>
        <ProductPreview form={form} />
        <p className="text-[10px] text-center" style={{ color: "var(--color-text-muted)" }}>
          Buyers see this on your store
        </p>
      </div>

    </div>
  );
}

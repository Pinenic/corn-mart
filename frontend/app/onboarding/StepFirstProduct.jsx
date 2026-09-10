"use client";
import { useRef } from "react";
import {
  Upload,
  X,
  Star,
  Image as ImageIcon,
  Package,
  Sparkles,
  Heart,
} from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[12px] font-semibold text-[var(--color-text-secondary)] mb-1.5">
      {children}
      {required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
    </label>
  );
}

const inputBase =
  "w-full h-10 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] text-[13px] outline-none transition-all focus:border-[var(--color-primary)] text-[var(--color-text-primary)] bg-white";
const selectCls =
  "w-full h-9 px-3 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] text-[13px] outline-none transition-colors focus:border-[var(--color-primary)] text-[var(--color-text-primary)] bg-white cursor-pointer";

// ── Inline 3-slot image picker ────────────────────────────────
function ImageSlots({ files, onChange }) {
  const ref = useRef(null);
  const MAX = 3;

  const handleFiles = (newFiles) => {
    const combined = [...files, ...Array.from(newFiles)].slice(0, MAX);
    onChange(combined);
  };

  const remove = (i) => onChange(files.filter((_, idx) => idx !== i));

  const setAsCover = (i) => {
    const next = [...files];
    [next[0], next[i]] = [next[i], next[0]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        {Array.from({ length: MAX }).map((_, i) => {
          const file = files[i];
          const preview = file ? URL.createObjectURL(file) : null;
          const isCover = i === 0;

          return (
            <div key={i} className="relative flex-1 aspect-square group">
              {file ? (
                <div
                  className={cn(
                    "w-full h-full rounded-[var(--radius)] overflow-hidden border-2 transition-all",
                    isCover ? "border-[var(--color-primary)]" : "border-[var(--color-border)]"
                  )}
                >
                  <img src={preview} alt="" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all rounded-[var(--radius)] flex items-end justify-between p-1.5">
                    {!isCover && (
                      <button
                        type="button"
                        onClick={() => setAsCover(i)}
                        title="Set as cover"
                        className="w-6 h-6 rounded-lg flex items-center justify-center bg-white/90 hover:bg-white transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <Star size={11} className="text-[var(--color-text-secondary)]" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center bg-white/90 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100",
                        !isCover && "ml-auto"
                      )}
                    >
                      <X size={11} className="text-[var(--color-danger)]" />
                    </button>
                  </div>
                  {isCover && (
                    <span className="absolute top-1.5 left-1.5 text-[8px] font-bold px-1.5 py-0.5 rounded-md text-white bg-[var(--color-primary)]">
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
                    "w-full h-full rounded-[var(--radius)] border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all bg-[var(--color-bg)]",
                    i === files.length
                      ? "border-[var(--color-primary)]/50 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary)]/5 cursor-pointer"
                      : "border-[var(--color-border)] opacity-40 cursor-not-allowed"
                  )}
                >
                  {i === 0 && files.length === 0 ? (
                    <>
                      <ImageIcon size={20} className="text-[var(--color-primary)]" />
                      <span className="text-[10px] font-semibold text-[var(--color-primary)]">Add photo</span>
                    </>
                  ) : i === files.length ? (
                    <Upload size={14} className="text-[var(--color-text-muted)]" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border-2 border-dashed border-[var(--color-border)]" />
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <input ref={ref} type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleFiles(e.target.files)} />

      <p className="text-[10px] text-[var(--color-text-muted)]">
        Up to 3 photos · First photo is the cover image · Drag and drop also works
      </p>
    </div>
  );
}

// ── Product preview — mirrors the real ProductCard markup ──────
// Non-interactive (the product doesn't exist yet), but visually the
// same card shape/classes a buyer will actually see, not a stand-in.
function LiveProductPreview({ form }) {
  const coverUrl = form.images[0] ? URL.createObjectURL(form.images[0]) : null;

  return (
    <div className="bg-[var(--color-bg)] rounded-[var(--radius)] overflow-hidden">
      <div className="relative bg-white aspect-square flex items-center justify-center overflow-hidden">
        {coverUrl ? (
          <img src={coverUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <Package size={48} className="text-[var(--color-text-muted)]" />
        )}
        {form.images.length > 1 && (
          <div className="absolute bottom-2 right-2 flex gap-1">
            {form.images.slice(0, 3).map((_, i) => (
              <div key={i} className={cn("w-1.5 h-1.5 rounded-full", i === 0 ? "bg-white" : "bg-white/50")} />
            ))}
          </div>
        )}
        <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-[var(--color-text-secondary)]">
          <Heart size={14} />
        </div>
      </div>

      <div className="p-3 pt-2.5 space-y-2">
        <p className="text-[13px] font-medium text-[var(--color-text-primary)] line-clamp-2 leading-snug">
          {form.name || <span className="text-[var(--color-text-muted)]">Product name</span>}
        </p>
        <p className="text-[16px] font-bold text-[var(--color-text-primary)]">
          {form.price ? formatPrice(parseFloat(form.price)) : (
            <span className="text-[var(--color-text-muted)] font-normal text-[13px]">Price</span>
          )}
        </p>
        <div className="w-full h-9 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[13px] font-semibold flex items-center justify-center opacity-90">
          Buy Now
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[12px] font-medium text-[var(--color-text-secondary)] block mb-1.5">{label}</label>
      {children}
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export function StepFirstProduct({ form, onChange, categoriesRaw }) {
  const update = (field, val) => onChange((f) => ({ ...f, [field]: val }));
  const selectedCat = (categoriesRaw ?? []).find((c) => c.name === form.category);
  const subcats = selectedCat?.subcategories ?? [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_220px] gap-6 lg:gap-8 max-w-2xl mx-auto">
      {/* Form */}
      <div className="space-y-5">
        <div className="flex items-start gap-3 p-4 rounded-[var(--radius)] bg-[var(--color-primary-light)]">
          <Sparkles size={16} className="flex-shrink-0 mt-0.5 text-[var(--color-primary)]" />
          <div>
            <p className="text-[13px] font-semibold text-[var(--color-primary-text)]">
              List your first product
            </p>
            <p className="text-[12px] mt-0.5 text-[var(--color-primary-text)] opacity-80">
              Keep it simple — you can add more details from the products page later
            </p>
          </div>
        </div>

        <div>
          <FieldLabel required>Product name</FieldLabel>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Handmade Leather Bag"
            className={inputBase}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <FieldLabel required>Price (ZMW)</FieldLabel>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px] font-semibold text-[var(--color-text-muted)]">
                K
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="0.00"
                className={cn(inputBase, "pl-7")}
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
            />
          </div>
        </div>

        <div>
          <FieldLabel>
            Brand name <span className="font-normal text-[var(--color-text-muted)]">(optional)</span>
          </FieldLabel>
          <input
            value={form.brand}
            onChange={(e) => update("brand", e.target.value)}
            placeholder="Brand name"
            className={inputBase}
          />
        </div>

        <div>
          <FieldLabel>
            Short description <span className="font-normal text-[var(--color-text-muted)]">(optional)</span>
          </FieldLabel>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="What should buyers know about this product?"
            rows={2}
            className={cn(inputBase, "h-auto resize-none py-2.5")}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Category">
            <select
              value={form.category}
              onChange={(e) => { update("category", e.target.value); update("subcat_id", ""); }}
              className={selectCls}
            >
              <option value="">Select category</option>
              {(categoriesRaw ?? []).map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </Field>
          <Field label="Subcategory">
            <select
              value={form.subcat_id}
              onChange={(e) => update("subcat_id", e.target.value)}
              disabled={!form.category || !subcats.length}
              className={cn(selectCls, "disabled:opacity-50 disabled:cursor-not-allowed")}
            >
              <option value="">Select subcategory</option>
              {subcats.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <div>
          <FieldLabel>
            Product photos <span className="font-normal text-[var(--color-text-muted)]">(up to 3)</span>
          </FieldLabel>
          <ImageSlots files={form.images} onChange={(imgs) => update("images", imgs)} />
        </div>
      </div>

      {/* Preview */}
      <div className="space-y-3 lg:sticky lg:top-6">
        <p className="text-[12px] font-semibold flex items-center gap-1.5 text-[var(--color-text-secondary)]">
          <Sparkles size={12} className="text-[var(--color-primary)]" />
          How it looks
        </p>
        <LiveProductPreview form={form} />
        <p className="text-[10px] text-center text-[var(--color-text-muted)]">
          Buyers see this on your store
        </p>
      </div>
    </div>
  );
}

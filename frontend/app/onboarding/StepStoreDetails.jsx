"use client";
import { useRef } from "react";
import { Upload, X, Image as ImageIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { StorefrontHeader } from "@/components/stores/StorefrontHeader";
import { StorefrontRenderer } from "@/components/storefront/StorefrontRenderer";
import { defaultStoreConfig } from "@/lib/storefront/configSchema";

// ── Inline helpers ────────────────────────────────────────────

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[12px] font-semibold text-[var(--color-text-secondary)] mb-1.5">
      {children}
      {required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
    </label>
  );
}

function FieldError({ msg }) {
  if (!msg) return null;
  return <p className="text-[11px] mt-1 text-[var(--color-danger)]">{msg}</p>;
}

function AssetPicker({ label, value, onChange, aspect = "square", hint }) {
  const ref = useRef(null);
  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (f) onChange(f);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f && f.type.startsWith("image/")) onChange(f);
  };

  const previewUrl = value instanceof File ? URL.createObjectURL(value) : value;

  return (
    <div>
      <FieldLabel>{label}</FieldLabel>
      <div
        onClick={() => ref.current?.click()}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          "relative border-2 border-dashed rounded-[var(--radius)] overflow-hidden cursor-pointer transition-all group bg-[var(--color-bg)]",
          aspect === "banner" ? "h-24 w-full" : "h-20 w-20",
          previewUrl
            ? "border-[var(--color-primary)]"
            : "border-[var(--color-border-md)] hover:border-[var(--color-primary)]"
        )}
      >
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
              <Upload size={16} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onChange(null); }}
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/80 transition-colors"
            >
              <X size={10} />
            </button>
          </>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1">
            <ImageIcon size={18} className="text-[var(--color-text-muted)]" />
            {hint && <span className="text-[9px] text-center px-1 text-[var(--color-text-muted)]">{hint}</span>}
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

// ── Live storefront preview — the real components, not a mockup ──
function LiveStorePreview({ form }) {
  const bannerUrl = form.bannerFile instanceof File ? URL.createObjectURL(form.bannerFile) : null;
  const logoUrl = form.logoFile instanceof File ? URL.createObjectURL(form.logoFile) : null;
  const slug = (form.name || "your-store").toLowerCase().trim().replace(/\s+/g, "-");

  // Shimmed store object — same shape StorefrontHeader/StorefrontRenderer
  // expect from a real fetched store, just built from live form state
  // instead of a DB row. No real id exists yet, so anything that would
  // need one (Follow/Share/Message) is disabled via preview mode.
  const previewStore = {
    id: null,
    name: form.name || "Your store name",
    description: form.description,
    logo: logoUrl,
    banner: bannerUrl,
    is_verified: false,
    followers_count: 0,
  };

  return (
    <div className="rounded-[var(--radius-lg)] border border-[var(--color-border)] overflow-hidden shadow-sm bg-white">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <div className="flex-1 h-4 rounded-md bg-[var(--color-border-md)] mx-2 flex items-center px-2">
          <span className="text-[8px] text-[var(--color-text-muted)] truncate">
            /marketplace/stores/{slug}
          </span>
        </div>
      </div>

      {/* The real components, scaled to fit this narrower column */}
      <div className="origin-top-left" style={{ zoom: 0.62 }}>
        <StorefrontHeader store={previewStore} preview />
        <div className="max-w-5xl mx-auto px-4 md:px-6 pb-6">
          <StorefrontRenderer store={previewStore} blocks={defaultStoreConfig().blocks} />
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export function StepStoreDetails({ form, onChange, errors }) {
  const update = (field, val) => onChange({ ...form, [field]: val });

  const inputBase =
    "w-full h-10 px-3 rounded-[var(--radius-sm)] border text-[13px] outline-none transition-all focus:border-[var(--color-primary)] text-[var(--color-text-primary)] bg-white";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 lg:gap-8">
      {/* ── Form ── */}
      <div className="space-y-5">
        {/* Store name */}
        <div>
          <FieldLabel required>Store name</FieldLabel>
          <input
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
            placeholder="e.g. Ama's Boutique"
            maxLength={100}
            className={cn(inputBase, errors?.name ? "border-[var(--color-danger)]" : "border-[var(--color-border-md)]")}
          />
          <div className="flex justify-between mt-1">
            <FieldError msg={errors?.name} />
            <span className="text-[10px] ml-auto text-[var(--color-text-muted)]">
              {form.name.length}/100
            </span>
          </div>
        </div>

        {/* Description */}
        <div>
          <FieldLabel>Description</FieldLabel>
          <textarea
            value={form.description}
            onChange={(e) => update("description", e.target.value)}
            placeholder="Tell buyers what makes your store special…"
            rows={3}
            maxLength={500}
            className={cn(inputBase, "resize-none py-2.5 h-auto border-[var(--color-border-md)]")}
          />
          <div className="flex justify-end mt-1">
            <span className="text-[10px] text-[var(--color-text-muted)]">
              {form.description.length}/500
            </span>
          </div>
        </div>

        {/* Logo + Banner */}
        <div className="space-y-3">
          <FieldLabel>Store images</FieldLabel>
          <div className="flex gap-4 items-start">
            <AssetPicker
              label="Logo"
              value={form.logoFile}
              onChange={(f) => update("logoFile", f)}
              aspect="square"
              hint="Square recommended"
            />
            <AssetPicker
              label="Banner"
              value={form.bannerFile}
              onChange={(f) => update("bannerFile", f)}
              aspect="banner"
              hint="1200×300 recommended"
            />
          </div>
          <p className="text-[11px] text-[var(--color-text-muted)]">
            Both are optional — you can always update them later
          </p>
        </div>
      </div>

      {/* ── Live preview ── */}
      <div className="lg:sticky lg:top-6 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-[var(--color-primary)]" />
          <p className="text-[12px] font-semibold text-[var(--color-text-secondary)]">
            Live preview — this is your real storefront
          </p>
        </div>
        <LiveStorePreview form={form} />
        <p className="text-[10px] text-center text-[var(--color-text-muted)]">
          Updates as you type ✦
        </p>
      </div>
    </div>
  );
}

"use client";
import { useRef, useState, useCallback } from "react";
import { Upload, X, Store, Image as ImageIcon, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Inline helpers ────────────────────────────────────────────

function FieldLabel({ children, required }) {
  return (
    <label className="block text-[12px] font-semibold mb-1.5"
      style={{ color: "var(--color-text-secondary)" }}>
      {children}{required && <span className="text-[var(--color-danger)] ml-0.5">*</span>}
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
          "relative border-2 border-dashed rounded-2xl overflow-hidden cursor-pointer transition-all group",
          aspect === "banner" ? "h-24 w-full" : "h-20 w-20",
          previewUrl
            ? "border-[var(--color-accent)]"
            : "border-[var(--color-border-md)] hover:border-[var(--color-accent)]"
        )}
        style={{ background: "var(--color-bg)" }}
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
            <ImageIcon size={18} style={{ color: "var(--color-text-tertiary)" }} />
            {hint && <span className="text-[9px] text-center px-1" style={{ color: "var(--color-text-tertiary)" }}>{hint}</span>}
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      </div>
    </div>
  );
}

// ── Mini storefront preview ───────────────────────────────────
function LivePreview({ form }) {
  const bannerUrl = form.bannerFile instanceof File
    ? URL.createObjectURL(form.bannerFile)
    : null;
  const logoUrl = form.logoFile instanceof File
    ? URL.createObjectURL(form.logoFile)
    : null;
  const accentColor = "#0057ff";

  return (
    <div className="w-full rounded-2xl border border-[var(--color-border)] overflow-hidden shadow-sm bg-white">
      {/* Browser chrome */}
      <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--color-bg)] border-b border-[var(--color-border)]">
        <div className="w-2.5 h-2.5 rounded-full bg-red-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
        <div className="w-2.5 h-2.5 rounded-full bg-green-400" />
        <div className="flex-1 h-4 rounded-md bg-[var(--color-border-md)] mx-2 flex items-center px-2">
          <span className="text-[8px] text-[var(--color-text-muted)] truncate">
            storely.com/store/{(form.name || "your-store").toLowerCase().replace(/\s+/g, "-")}
          </span>
        </div>
      </div>

      {/* Store banner */}
      <div className="h-16 relative overflow-hidden"
        style={{ background: bannerUrl ? undefined : `linear-gradient(135deg, ${accentColor}20 0%, ${accentColor}08 100%)` }}>
        {bannerUrl && <img src={bannerUrl} alt="" className="w-full h-full object-cover" />}
        {!bannerUrl && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-20" style={{ background: accentColor }} />
          </div>
        )}
      </div>

      {/* Store identity */}
      <div className="px-3 pb-3">
        <div className="flex items-end gap-2 -mt-4 mb-2">
          <div className="w-10 h-10 rounded-xl border-2 border-white shadow-sm overflow-hidden flex-shrink-0"
            style={{ background: accentColor }}>
            {logoUrl
              ? <img src={logoUrl} alt="" className="w-full h-full object-cover" />
              : <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
                  {(form.name || "S")[0].toUpperCase()}
                </div>
            }
          </div>
          <div className="min-w-0 flex-1 mb-1">
            <p className="text-[11px] font-bold truncate" style={{ color: "var(--color-text-primary)" }}>
              {form.name || <span style={{ color: "var(--color-text-muted)" }}>Your store name</span>}
            </p>
          </div>
        </div>
        {form.description && (
          <p className="text-[9px] leading-relaxed line-clamp-2" style={{ color: "var(--color-text-secondary)" }}>
            {form.description}
          </p>
        )}

        {/* Skeleton product grid */}
        <div className="grid grid-cols-3 gap-1.5 mt-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-lg overflow-hidden border border-[var(--color-border)]">
              <div className="aspect-square bg-[var(--color-bg)] animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
              <div className="p-1 space-y-0.5">
                <div className="h-1.5 rounded bg-[var(--color-border)] w-3/4" />
                <div className="h-1.5 rounded w-1/2" style={{ background: accentColor + "40" }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────
export function StepDetails({ form, onChange, errors }) {
  const update = (field, val) => onChange({ ...form, [field]: val });

  const inputBase = "w-full h-10 px-3 rounded-xl border text-[13px] outline-none transition-all focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10";
  const inputStyle = { borderColor: errors ? "var(--color-danger)" : "var(--color-border-md)", color: "var(--color-text-primary)", background: "white" };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 lg:gap-8">

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
            className={inputBase}
            style={{ ...inputStyle, borderColor: errors?.name ? "var(--color-danger)" : "var(--color-border-md)" }}
          />
          <div className="flex justify-between mt-1">
            <FieldError msg={errors?.name} />
            <span className="text-[10px] ml-auto" style={{ color: "var(--color-text-muted)" }}>
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
            className={inputBase + " resize-none py-2.5 h-auto"}
            style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-primary)", background: "white" }}
          />
          <div className="flex justify-end mt-1">
            <span className="text-[10px]" style={{ color: "var(--color-text-muted)" }}>
              {form.description.length}/500
            </span>
          </div>
        </div>

        {/* Logo + Banner side by side */}
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
          <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
            Both are optional — you can always update them later
          </p>
        </div>

      </div>

      {/* ── Live preview ── */}
      <div className="lg:sticky lg:top-6 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles size={13} style={{ color: "var(--color-accent)" }} />
          <p className="text-[12px] font-semibold" style={{ color: "var(--color-text-secondary)" }}>
            Live preview
          </p>
        </div>
        <LivePreview form={form} />
        <p className="text-[10px] text-center" style={{ color: "var(--color-text-muted)" }}>
          Updates as you type ✦
        </p>
      </div>

    </div>
  );
}

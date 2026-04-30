"use client";

import { useEffect, useState } from "react";
import { X, Save, Tag, Percent, DollarSign, Package, Truck, Gift } from "lucide-react";
import { Button } from "@/components/ui";
import { PROMOTION_TYPES, CATEGORIES, PRODUCTS } from "@/lib/products-data";

const TYPE_ICONS = {
  percentage:   Percent,
  fixed:        DollarSign,
  bogo:         Gift,
  free_shipping:Truck,
  bundle:       Package,
};

const EMPTY_PROMO = {
  id: null,
  name: "",
  code: "",
  type: "percentage",
  value: "",
  applies_to: "all",
  product_ids: [],
  category_ids: [],
  min_order_value: "",
  max_uses: "",
  starts_at: "",
  ends_at: "",
  is_active: true,
};

export function EditPromotionDrawer({ promotion = null, onClose, onSave }) {
  const [form, setForm] = useState(promotion ? { ...promotion } : { ...EMPTY_PROMO });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleId = (field, id) => {
    const current = form[field] || [];
    const next = current.includes(id) ? current.filter((x) => x !== id) : [...current, id];
    update(field, next);
  };

  const generateCode = () => {
    const base = form.name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 8);
    const suffix = Math.floor(Math.random() * 90 + 10);
    update("code", `${base}${suffix}`);
  };

  const TypeIcon = TYPE_ICONS[form.type] || Tag;
  const isNew = !promotion;
  const requiresValue = ["percentage", "fixed"].includes(form.type);

  return (
    <>
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]" onClick={onClose} aria-hidden="true" />

      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-white"
        style={{
          width: "min(480px, 100vw)",
          borderLeft: "0.5px solid var(--color-border)",
          animation: "slideInRight 0.22s cubic-bezier(0.16,1,0.3,1)",
          boxShadow: "-4px 0 32px rgba(0,0,0,0.08)",
        }}
        role="dialog" aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b flex-shrink-0" style={{ borderColor: "var(--color-border)" }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ background: "var(--color-accent-subtle)", color: "var(--color-accent)" }}>
            <TypeIcon size={16} />
          </div>
          <h2 className="text-[15px] font-semibold flex-1" style={{ color: "var(--color-text-primary)" }}>
            {isNew ? "Create promotion" : `Edit: ${promotion.name}`}
          </h2>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors hover:bg-[var(--color-bg)]"
            style={{ color: "var(--color-text-secondary)" }}>
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-5">

          {/* Basic info */}
          <Section title="Basic info">
            <Field label="Promotion name *">
              <input value={form.name} onChange={(e) => update("name", e.target.value)}
                placeholder="e.g. Summer Sale"
                className={inputCls} style={inputStyle} />
            </Field>
            <Field label="Discount code">
              <div className="flex gap-2">
                <input value={form.code} onChange={(e) => update("code", e.target.value.toUpperCase())}
                  placeholder="e.g. SUMMER20"
                  className={`${inputCls} flex-1 font-mono tracking-wider`} style={inputStyle} />
                <button onClick={generateCode} disabled={!form.name.trim()}
                  className="h-9 px-3 rounded-lg border text-[12px] font-medium transition-colors hover:bg-[var(--color-bg)] disabled:opacity-40"
                  style={{ borderColor: "var(--color-border-md)", color: "var(--color-text-secondary)", flexShrink: 0 }}>
                  Generate
                </button>
              </div>
            </Field>
          </Section>

          {/* Discount type */}
          <Section title="Discount type">
            <div className="grid grid-cols-1 gap-2">
              {PROMOTION_TYPES.map((t) => {
                const Icon = TYPE_ICONS[t.value] || Tag;
                const active = form.type === t.value;
                return (
                  <button key={t.value} onClick={() => update("type", t.value)}
                    className="flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all"
                    style={{
                      borderColor: active ? "var(--color-accent)" : "var(--color-border)",
                      background: active ? "var(--color-accent-subtle)" : "transparent",
                    }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: active ? "var(--color-accent)" : "var(--color-bg)", color: active ? "white" : "var(--color-text-secondary)" }}>
                      <Icon size={14} />
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-medium" style={{ color: active ? "var(--color-accent-text)" : "var(--color-text-primary)" }}>
                        {t.label}
                      </p>
                      <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>{t.example}</p>
                    </div>
                    {active && (
                      <span className="text-[11px] font-bold w-4 h-4 rounded-full flex items-center justify-center text-white"
                        style={{ background: "var(--color-accent)" }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Discount value (only for % and fixed) */}
            {requiresValue && (
              <div className="mt-3">
                <Field label={form.type === "percentage" ? "Discount percentage (%)" : "Discount amount ($)"}>
                  <input type="number" min="0" max={form.type === "percentage" ? 100 : undefined}
                    value={form.value || ""} onChange={(e) => update("value", e.target.value)}
                    placeholder={form.type === "percentage" ? "e.g. 20" : "e.g. 10"}
                    className={inputCls} style={inputStyle} />
                </Field>
              </div>
            )}
          </Section>

          {/* Applies to */}
          <Section title="Applies to">
            <div className="flex gap-2 mb-3">
              {[
                { value: "all",      label: "All products" },
                { value: "category", label: "Categories" },
                { value: "products", label: "Specific products" },
              ].map((opt) => (
                <button key={opt.value} onClick={() => update("applies_to", opt.value)}
                  className="flex-1 py-1.5 rounded-lg border text-[12px] font-medium transition-all"
                  style={{
                    borderColor: form.applies_to === opt.value ? "var(--color-accent)" : "var(--color-border-md)",
                    background:  form.applies_to === opt.value ? "var(--color-accent-subtle)" : "transparent",
                    color:       form.applies_to === opt.value ? "var(--color-accent-text)" : "var(--color-text-secondary)",
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>

            {form.applies_to === "category" && (
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map((cat) => {
                  const active = (form.category_ids || []).includes(cat);
                  return (
                    <button key={cat} onClick={() => toggleId("category_ids", cat)}
                      className="px-3 py-1 rounded-lg border text-[12px] font-medium transition-all"
                      style={{
                        background: active ? "var(--color-accent-subtle)" : "transparent",
                        color: active ? "var(--color-accent-text)" : "var(--color-text-secondary)",
                        borderColor: active ? "var(--color-accent)" : "var(--color-border-md)",
                      }}>
                      {cat}
                    </button>
                  );
                })}
              </div>
            )}

            {form.applies_to === "products" && (
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {PRODUCTS.map((p) => {
                  const active = (form.product_ids || []).includes(p.id);
                  return (
                    <button key={p.id} onClick={() => toggleId("product_ids", p.id)}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg border text-left transition-all"
                      style={{
                        background: active ? "var(--color-accent-subtle)" : "transparent",
                        borderColor: active ? "var(--color-accent)" : "var(--color-border)",
                      }}>
                      <span className="text-xl">{p.emoji}</span>
                      <span className="flex-1 text-[13px] font-medium" style={{ color: active ? "var(--color-accent-text)" : "var(--color-text-primary)" }}>
                        {p.name}
                      </span>
                      {active && <span className="text-[11px] font-bold" style={{ color: "var(--color-accent)" }}>✓</span>}
                    </button>
                  );
                })}
              </div>
            )}
          </Section>

          {/* Conditions */}
          <Section title="Conditions">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Min. order value ($)">
                <input type="number" min="0" value={form.min_order_value || ""}
                  onChange={(e) => update("min_order_value", e.target.value)}
                  placeholder="No minimum"
                  className={inputCls} style={inputStyle} />
              </Field>
              <Field label="Max. uses">
                <input type="number" min="1" value={form.max_uses || ""}
                  onChange={(e) => update("max_uses", e.target.value)}
                  placeholder="Unlimited"
                  className={inputCls} style={inputStyle} />
              </Field>
            </div>
          </Section>

          {/* Dates */}
          <Section title="Active dates">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Start date">
                <input type="date" value={form.starts_at || ""}
                  onChange={(e) => update("starts_at", e.target.value)}
                  className={inputCls} style={inputStyle} />
              </Field>
              <Field label="End date">
                <input type="date" value={form.ends_at || ""}
                  onChange={(e) => update("ends_at", e.target.value)}
                  className={inputCls} style={inputStyle} />
              </Field>
            </div>
          </Section>

          {/* Active toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border" style={{ borderColor: "var(--color-border)" }}>
            <div>
              <p className="text-[13px] font-medium" style={{ color: "var(--color-text-primary)" }}>Active</p>
              <p className="text-[11px]" style={{ color: "var(--color-text-tertiary)" }}>
                Inactive promotions will not be applied at checkout
              </p>
            </div>
            <button onClick={() => update("is_active", !form.is_active)}
              className="relative flex-shrink-0 rounded-full transition-colors duration-200"
              style={{ width: 36, height: 20, background: form.is_active ? "var(--color-accent)" : "var(--color-border-md)" }}>
              <span className="absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white transition-transform duration-200"
                style={{ transform: form.is_active ? "translateX(19px)" : "translateX(3px)" }} />
            </button>
          </div>

        </div>

        {/* Footer */}
        <div className="flex gap-2 px-5 py-4 border-t flex-shrink-0" style={{ borderColor: "var(--color-border)" }}>
          <Button variant="secondary" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="primary" className="flex-1" onClick={() => { onSave?.(form); onClose(); }}
            disabled={!form.name.trim()}>
            <Save size={14} /> {isNew ? "Create promotion" : "Save changes"}
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to   { transform: translateX(0); }
        }
      `}</style>
    </>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: "var(--color-text-tertiary)" }}>{title}</p>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="text-[12px] font-medium block mb-1.5" style={{ color: "var(--color-text-secondary)" }}>{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full h-9 px-3 rounded-lg border text-[13px] outline-none transition-colors focus:border-[var(--color-accent)]";
const inputStyle = { borderColor: "var(--color-border-md)", color: "var(--color-text-primary)", background: "white" };

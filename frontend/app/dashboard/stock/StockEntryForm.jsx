"use client";
// app/stock/StockEntryForm.jsx
import { useState, useEffect, useCallback } from "react";
import { X, Calculator, Package } from "lucide-react";
import { useProducts } from "@/lib/hooks/useProducts";
import { useVariants } from "@/lib/hooks/useProducts";
import useAuthStore from "@/lib/store/useAuthStore";
import { cn } from "@/lib/utils";

// ── Tiny shared input primitives ──────────────────────────────
const inputCls =
  "w-full h-10 px-3 rounded-xl border text-[13px] outline-none transition-all focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/10";
const inputStyle = {
  borderColor: "var(--color-border-md)",
  color: "var(--color-text-primary)",
  background: "white",
};

function Field({ label, error, required, children, hint }) {
  return (
    <div className="space-y-1.5">
      <label
        className="block text-[12px] font-semibold"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
        {required && (
          <span className="text-[var(--color-danger)] ml-0.5">*</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
          {hint}
        </p>
      )}
      {error && (
        <p className="text-[11px]" style={{ color: "var(--color-danger)" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Form ──────────────────────────────────────────────────────
function EntryForm({ initial, onSubmit, onCancel, loading, fieldErrors }) {
  const today = new Date().toISOString().split("T")[0];

  const [form, setForm] = useState({
    product_name: initial?.pending_product_name ?? "",
    product_id: initial?.product_id ?? "",
    variant_id: initial?.variant_id ?? "",
    supplier: initial?.supplier ?? "",
    quantity: initial?.quantity ?? "",
    unit_cost: initial?.unit_cost ?? "",
    total_cost: initial?.total_cost ?? "",
    entry_date: initial?.entry_date ?? today,
    notes: initial?.notes ?? "",
    is_adjustment: initial?.is_adjustment ?? false,
  });
  const [errors, setErrors] = useState({});
  const [isNew, setIsNew] = useState(Boolean(initial?.product_id));

  // Merge server-side field errors in
  useEffect(() => {
    if (fieldErrors && Object.keys(fieldErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...fieldErrors }));
    }
  }, [fieldErrors]);

  const set = (field, val) => {
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setForm((prev) => {
      const next = { ...prev, [field]: val };
      // Auto-compute total_cost when qty or unit_cost changes
      if (field === "quantity" || field === "unit_cost") {
        const qty = Number(field === "quantity" ? val : next.quantity);
        const cost = Number(field === "unit_cost" ? val : next.unit_cost);
        if (qty > 0 && cost >= 0) {
          next.total_cost = (qty * cost).toFixed(2);
        }
      }
      return next;
    });
  };

  // Load products for the selector
  const { data: productsData } = useProducts({
    page: 1,
    limit: 20,
    status: "all",
    category: undefined,
    search: undefined,
  });
  const products = productsData ?? [];

  // Load variants when a product is selected
  const { data: variantsData } = useVariants(form.product_id || null);
  const variants = variantsData?.data ?? [];

  // Reset variant when product changes
  useEffect(() => {
    set("variant_id", "");
  }, [form.product_id]);

  const switchProduct = () => {
    setIsNew(!isNew);
  };

  const validate = () => {
    const e = {};
    if (!form.product_name && !form.product_id ) e.product_name = "Enter a product";
    if (!form.product_id && !form.product_name) e.product_id = "Select a product";
    if (!form.quantity) e.quantity = "Quantity is required";
    if (Number(form.quantity) === 0) e.quantity = "Quantity cannot be zero";
    if (form.unit_cost === "") e.unit_cost = "Unit cost is required";
    if (form.total_cost === "") e.total_cost = "Total cost is required";
    if (!form.entry_date) e.entry_date = "Date is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit({
      pending_product_name: form.product_name,
      product_id: form.product_id || null,
      variant_id: form.variant_id || null,
      supplier: form.supplier || null,
      quantity: Number(form.quantity),
      unit_cost: Number(form.unit_cost),
      total_cost: Number(form.total_cost),
      entry_date: form.entry_date,
      notes: form.notes || null,
      is_adjustment: form.is_adjustment,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full overflow-y-scroll"
    >
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        {/* Adjustment toggle */}
        {/* <div
          className="flex items-center gap-3 p-3 rounded-xl border"
          style={{ borderColor: "var(--color-border)", background: "var(--color-bg)" }}
        >
          <div className="flex-1">
            <p className="text-[13px] font-semibold" style={{ color: "var(--color-text-primary)" }}>
              Stock adjustment
            </p>
            <p className="text-[11px]" style={{ color: "var(--color-text-muted)" }}>
              Log a correction (e.g. stock count fix, return) instead of a purchase
            </p>
          </div>
          <button
            type="button"
            onClick={() => set("is_adjustment", !form.is_adjustment)}
            className="relative flex-shrink-0 rounded-full transition-colors duration-200"
            style={{ width: 36, height: 20, background: form.is_adjustment ? "var(--color-warning)" : "var(--color-border-md)" }}
          >
            <span
              className="absolute top-[3px] w-[14px] h-[14px] rounded-full bg-white shadow-sm transition-transform duration-200"
              style={{ transform: form.is_adjustment ? "translateX(19px)" : "translateX(3px)" }}
            />
          </button>
        </div> */}

        {/* Product */}
        <Field label="Product" required error={errors.product_id || errors.product_name}>
          {!initial && <div className="flex gap-4">
            <label
              htmlFor="New Product"
              className="block text-[11px] font-semibold"
              style={{ color: "var(--color-text-secondary)" }}
            >
              New
            </label>
            <input
              type="radio"
              name="New product"
              id="newprod"
              value={!isNew}
              checked={!isNew}
              onChange={switchProduct}
            />
            <label
              htmlFor="Existing Product"
              className="block text-[11px] font-semibold"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Existing
            </label>
            <input
              type="radio"
              name="Existing product"
              id="exprod"
              value={isNew}
              checked={isNew}
              onChange={switchProduct}
            />
          </div>}
          {!isNew ? (
            <input
              value={form.product_name}
              onChange={(e) => set("product_name", e.target.value)}
              placeholder="New product's name…"
              className={inputCls}
              style={inputStyle}
            />
          ) : (
            <select
              value={form.product_id}
              onChange={(e) => set("product_id", e.target.value)}
              className={`${inputCls} cursor-pointer`}
              style={{
                ...inputStyle,
                borderColor: errors.product_id
                  ? "var(--color-danger)"
                  : "var(--color-border-md)",
              }}
            >
              <option value="">Select a product…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </Field>

        {/* Variant (only if product has multiple variants) */}
        {form.product_id && variants.length > 1 && (
          <Field label="Variant">
            <select
              value={form.variant_id}
              onChange={(e) => set("variant_id", e.target.value)}
              className={`${inputCls} cursor-pointer`}
              style={inputStyle}
            >
              <option value="">All variants / Default</option>
              {variants.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                  {v.sku ? ` — ${v.sku}` : ""}
                </option>
              ))}
            </select>
          </Field>
        )}

        {/* Supplier */}
        <Field label="Supplier" hint="Where you bought the stock from">
          <input
            value={form.supplier}
            onChange={(e) => set("supplier", e.target.value)}
            placeholder="e.g. Wholesale Market, Ali Express…"
            className={inputCls}
            style={inputStyle}
          />
        </Field>

        {/* Date */}
        <Field label="Date of purchase" required error={errors.entry_date}>
          <input
            type="date"
            value={form.entry_date}
            max={today}
            onChange={(e) => set("entry_date", e.target.value)}
            className={inputCls}
            style={{
              ...inputStyle,
              borderColor: errors.entry_date
                ? "var(--color-danger)"
                : "var(--color-border-md)",
            }}
          />
        </Field>

        {/* Quantity + Unit cost */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Units" required error={errors.quantity}>
            <input
              type="number"
              min="1"
              step="1"
              value={form.quantity}
              onChange={(e) => set("quantity", e.target.value)}
              placeholder="0"
              className={inputCls}
              style={{
                ...inputStyle,
                borderColor: errors.quantity
                  ? "var(--color-danger)"
                  : "var(--color-border-md)",
              }}
            />
          </Field>
          <Field label="Unit cost (ZMW)" required error={errors.unit_cost}>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold"
                style={{ color: "var(--color-text-muted)" }}
              >
                K
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.unit_cost}
                onChange={(e) => set("unit_cost", e.target.value)}
                placeholder="0.00"
                className={`${inputCls} pl-7`}
                style={{
                  ...inputStyle,
                  borderColor: errors.unit_cost
                    ? "var(--color-danger)"
                    : "var(--color-border-md)",
                }}
              />
            </div>
          </Field>
        </div>

        {/* Total cost (auto-computed, but editable for discounts) */}
        <Field
          label="Total cost (ZMW)"
          required
          error={errors.total_cost}
          hint="Auto-calculated from units × unit cost. Edit if you got a bulk discount."
        >
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[12px] font-semibold"
              style={{ color: "var(--color-text-muted)" }}
            >
              K
            </span>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.total_cost}
              onChange={(e) => set("total_cost", e.target.value)}
              placeholder="0.00"
              className={`${inputCls} pl-7`}
              style={{
                ...inputStyle,
                borderColor: errors.total_cost
                  ? "var(--color-danger)"
                  : "var(--color-border-md)",
              }}
            />
            {/* Recalc button */}
            {form.quantity && form.unit_cost && (
              <button
                type="button"
                onClick={() =>
                  set(
                    "total_cost",
                    (Number(form.quantity) * Number(form.unit_cost)).toFixed(2)
                  )
                }
                title="Recalculate"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-[var(--color-bg)] transition-colors"
                style={{ color: "var(--color-text-muted)" }}
              >
                <Calculator size={13} />
              </button>
            )}
          </div>
        </Field>

        {/* Notes */}
        <Field label="Notes">
          <textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            placeholder="Batch number, invoice ref, condition…"
            rows={3}
            className={`${inputCls} h-auto resize-none py-2.5`}
            style={inputStyle}
          />
        </Field>
      </div>

      {/* Footer actions */}
      <div
        className="flex items-center gap-2 p-4 border-t flex-shrink-0"
        style={{ borderColor: "var(--color-border)", background: "white" }}
      >
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-10 rounded-xl border text-[13px] font-semibold transition-colors hover:bg-[var(--color-bg)]"
          style={{
            borderColor: "var(--color-border-md)",
            color: "var(--color-text-secondary)",
          }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 h-10 rounded-xl text-[13px] font-bold text-white transition-all disabled:opacity-50"
          style={{ background: "var(--color-accent)" }}
        >
          {loading ? "Saving…" : initial ? "Save changes" : "Log entry"}
        </button>
      </div>
    </form>
  );
}

// ── Drawer wrapper ────────────────────────────────────────────
export function StockEntryDrawer({
  open,
  entry,
  onClose,
  onSave,
  loading,
  fieldErrors,
}) {
  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />
      {/* Drawer */}
      <div
        className="fixed right-0 top-0 bottom-0 z-50 flex flex-col bg-white shadow-2xl"
        style={{ width: "min(100vw, 440px)" }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
          style={{ borderColor: "var(--color-border)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "var(--color-accent-subtle)" }}
            >
              <Package size={16} style={{ color: "var(--color-accent)" }} />
            </div>
            <p
              className="text-[15px] font-bold"
              style={{ color: "var(--color-text-primary)" }}
            >
              {entry ? "Edit entry" : "Log stock purchase"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-[var(--color-bg)] transition-colors"
            style={{ color: "var(--color-text-muted)" }}
          >
            <X size={16} />
          </button>
        </div>

        <EntryForm
          initial={entry}
          onSubmit={onSave}
          onCancel={onClose}
          loading={loading}
          fieldErrors={fieldErrors}
        />
      </div>
    </>
  );
}

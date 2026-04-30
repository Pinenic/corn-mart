"use client";

import { useEffect, useState } from "react";
import { Plus, X, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui";
import { Modal } from "../ui/Modal";
import { OptionsEditor } from "./OptionsEditor";
import { useCreateVariant, useUpdateVariant, useDeleteVariant, useVariants } from "@/lib/hooks/useProducts";

/**
 * VariantsEditor
 *
 * Manages product_variants array. Handles:
 *   - Inline editing of name, SKU, price, stock, threshold
 *   - Active/inactive toggle per variant
 *   - Auto-generated SKU suggestion
 *   - Low stock highlighting
 *   - Add / remove variants
 *
 * Props:
 *   productId   — the product ID to fetch variants for
 *   productName — used for SKU suggestion
 */
export function VariantsEditor({
  productId,
  productName = "",
}) {
  const [expandedId, setExpandedId] = useState(null);
  const [editedVariants, setEditedVariants] = useState({}); // Track pending changes per variant
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [newVariant, setNewVariant] = useState({
    name: "",
    sku: "",
    price: null,
    stock: 0,
    reserved_stock: 0,
    low_stock_threshold: 3,
    is_active: true,
    description: "",
    options: [],
  });
  // const [variants, setVariant] = useState([]);
  const { create, loading: addingVariant } = useCreateVariant(productId);
  const { update: updateVariant } = useUpdateVariant(productId);
  const { deleteVariant } = useDeleteVariant(productId);
  const {
      data: variants,
      meta,
      isLoading,
      isRefreshing,
      error,
      mutate,
    } = useVariants(productId);
    console.log(variants);

  const resetNewVariant = () => ({
    name: "",
    sku: "",
    price: null,
    stock: 0,
    reserved_stock: 0,
    low_stock_threshold: 3,
    is_active: true,
    description: "",
    options: [],
  });

  const openAddModal = () => {
    setNewVariant(resetNewVariant());
    setAddModalOpen(true);
  };

  const closeAddModal = () => {
    setAddModalOpen(false);
    setNewVariant(resetNewVariant());
  };

  const handleNewVariantChange = (field, value) => {
    setNewVariant((prev) => ({ ...prev, [field]: value }));
  };

  const saveNewVariant = async () => {
    if (!newVariant.name.trim()) return;

    const created = await create(newVariant);
    if (!created) return;

    closeAddModal();
    mutate();
    setExpandedId(created.id);
  };

  // const update = (id, field, value) => {
  //   onChange(variants.map((v) => (v.id === id ? { ...v, [field]: value } : v)));
  // };
  const update = (id, field, value) => {
    setEditedVariants(prev => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
        ...(field === "options" ? { options: value } : {}),
      }
    }));
  };

  const toggleExpand = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      // Initialize edited state with current variant data
      const variant = variants.find(v => v.id === id);
      if (variant && !editedVariants[id]) {
        setEditedVariants(prev => ({
          ...prev,
          [id]: { ...variant }
        }));
      }
    }
  };

  const saveVariant = async (id) => {
    const changes = editedVariants[id];
    console.log(changes);
    if (!changes) return;

    await updateVariant(id, changes);
    setEditedVariants(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
    mutate(); // Refresh the variants data
  };

  const cancelEdit = (id) => {
    setEditedVariants(prev => {
      const newState = { ...prev };
      delete newState[id];
      return newState;
    });
  };

  const remove = async (id) => {
    const success = await deleteVariant(id);
    if (success) {
      mutate(); // Refresh the variants data
    }
  };

  // const addVariant = () => {
  //   const next = {
  //     id: `var-new-${Date.now()}`,
  //     product_id: "",
  //     name: "",
  //     sku: suggestSku(productName, variants.length + 1),
  //     price: null,
  //     stock: 0,
  //     reserved_stock: 0,
  //     low_stock_threshold: 3,
  //     is_active: true,
  //     available_stock: 0,
  //     description: "",
  //   };
  //   onChange([...variants, next]);
  //   setExpandedId(next.id);
  // };
  const addVariant = () => {
    openAddModal();
  };

  const getStockBadge = (v) => {
    if (!v.is_active) return { label: "Inactive", variant: "default" };
    if (v.available_stock === 0)
      return { label: "Out of stock", variant: "danger" };
    if (v.available_stock <= v.low_stock_threshold)
      return { label: "Low stock", variant: "warning" };
    return null;
  };

  const createDisabled = !newVariant.name.trim();

  return (
    <>
      <Modal open={isAddModalOpen} onClose={closeAddModal} title="Add new variant" size="md">
        <div className="space-y-4 px-5 py-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label="Variant name *">
              <input
                value={newVariant.name}
                onChange={(e) => handleNewVariantChange("name", e.target.value)}
                placeholder="e.g. Black / Size 42"
                className="w-full h-10 px-3 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
                style={{
                  borderColor: "var(--color-border-md)",
                  color: "var(--color-text-primary)",
                }}
              />
            </Field>
            <Field label="SKU">
              <input
                value={newVariant.sku}
                onChange={(e) => handleNewVariantChange("sku", e.target.value)}
                placeholder="Auto-generated or custom SKU"
                className="w-full h-10 px-3 rounded-lg border text-[12px] font-mono outline-none focus:border-[var(--color-accent)] transition-colors"
                style={{
                  borderColor: "var(--color-border-md)",
                  color: "var(--color-text-primary)",
                }}
              />
            </Field>
            <Field label="Price ($)">
              <input
                type="number"
                step="0.01"
                min="0"
                value={newVariant.price ?? ""}
                onChange={(e) =>
                  handleNewVariantChange(
                    "price",
                    e.target.value ? parseFloat(e.target.value) : null
                  )
                }
                placeholder="Base price or override"
                className="w-full h-10 px-3 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
                style={{
                  borderColor: "var(--color-border-md)",
                  color: "var(--color-text-primary)",
                }}
              />
            </Field>
            <Field label="Stock">
              <input
                type="number"
                min="0"
                value={newVariant.stock}
                onChange={(e) =>
                  handleNewVariantChange("stock", parseInt(e.target.value) || 0)
                }
                className="w-full h-10 px-3 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
                style={{
                  borderColor: "var(--color-border-md)",
                  color: "var(--color-text-primary)",
                }}
              />
            </Field>
            <Field label="Reserved stock">
              <input
                type="number"
                min="0"
                value={newVariant.reserved_stock}
                onChange={(e) =>
                  handleNewVariantChange(
                    "reserved_stock",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full h-10 px-3 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
                style={{
                  borderColor: "var(--color-border-md)",
                  color: "var(--color-text-primary)",
                }}
              />
            </Field>
            <Field label="Low stock threshold">
              <input
                type="number"
                min="0"
                value={newVariant.low_stock_threshold}
                onChange={(e) =>
                  handleNewVariantChange(
                    "low_stock_threshold",
                    parseInt(e.target.value) || 0
                  )
                }
                className="w-full h-10 px-3 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
                style={{
                  borderColor: "var(--color-border-md)",
                  color: "var(--color-text-primary)",
                }}
              />
            </Field>
          </div>

          <Field label="Variant description (optional)">
            <textarea
              value={newVariant.description}
              onChange={(e) => handleNewVariantChange("description", e.target.value)}
              rows={3}
              placeholder="Optional notes about this variant…"
              className="w-full px-3 py-2 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
              style={{
                borderColor: "var(--color-border-md)",
                color: "var(--color-text-primary)",
              }}
            />
          </Field>

          <div className="flex items-center justify-end gap-2 pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
            <button
              type="button"
              onClick={closeAddModal}
              className="text-[12px] font-medium px-3 py-2 rounded-lg transition-colors hover:bg-[var(--color-bg)]"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={saveNewVariant}
              disabled={createDisabled || addingVariant}
              className="text-[12px] font-medium px-3 py-2 rounded-lg transition-colors"
              style={{
                background: createDisabled ? "var(--color-border)" : "var(--color-accent)",
                color: createDisabled ? "var(--color-text-secondary)" : "white",
              }}
            >
              {addingVariant ? "Creating..." : "Create variant"}
            </button>
          </div>
        </div>
      </Modal>

      <div className="space-y-2">
      {(!variants || variants.length === 0) && (
        <div
          className="rounded-xl border px-4 py-6 text-center"
          style={{
            borderColor: "var(--color-border)",
            background: "var(--color-bg)",
          }}
        >
          <p
            className="text-[13px]"
            style={{ color: "var(--color-text-secondary)" }}
          >
            No variants yet. Add your first variant below.
          </p>
        </div>
      )}

      {(variants || []).map((v, idx) => {
        const displayVariant = editedVariants[v.id] || v;
        const badge = getStockBadge(displayVariant);
        const isExpanded = expandedId === v.id;
        const hasChanges = !!editedVariants[v.id];

        return (
          <div
            key={v.id}
            className="rounded-xl border overflow-hidden"
            style={{
              borderColor:
                displayVariant.available_stock <= displayVariant.low_stock_threshold &&
                displayVariant.is_active &&
                displayVariant.available_stock > 0
                  ? "var(--color-warning)"
                  : "var(--color-border)",
            }}
          >
            {/* Row summary */}
            <div
              className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-[var(--color-bg)] transition-colors"
              onClick={() => toggleExpand(v.id)}
            >
              {/* Active toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  update(v.id, "is_active", !(displayVariant.is_active));
                }}
                className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 border-2 transition-colors"
                style={{
                  background: displayVariant.is_active
                    ? "var(--color-accent)"
                    : "transparent",
                  borderColor: displayVariant.is_active
                    ? "var(--color-accent)"
                    : "var(--color-border-md)",
                }}
                title={v.is_active ? "Deactivate variant" : "Activate variant"}
              >
                {v.is_active && (
                  <span
                    style={{ color: "white", fontSize: 10, fontWeight: 700 }}
                  >
                    ✓
                  </span>
                )}
              </button>

              <span
                className="flex-1 text-[13px] font-medium truncate"
                style={{
                  color: displayVariant.is_active
                    ? "var(--color-text-primary)"
                    : "var(--color-text-tertiary)",
                }}
              >
                {displayVariant.name || (
                  <span
                    style={{
                      color: "var(--color-text-tertiary)",
                      fontStyle: "italic",
                    }}
                  >
                    Unnamed variant
                  </span>
                )}
              </span>

              {displayVariant.sku && (
                <span
                  className="text-[11px] font-mono hidden sm:block"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  {displayVariant.sku}
                </span>
              )}

              <span
                className="text-[12px] font-semibold flex-shrink-0 hidden sm:block"
                style={{ color: "var(--color-text-secondary)" }}
              >
                K{(displayVariant.price ?? 0).toFixed(2)}
              </span>

              <span
                className="text-[12px] flex-shrink-0"
                style={{ color: "var(--color-text-secondary)" }}
              >
                {displayVariant.stock} in stock
              </span>

              {badge && <Badge variant={badge.variant}>{badge.label}</Badge>}

              {displayVariant.available_stock <= displayVariant.low_stock_threshold &&
                displayVariant.is_active &&
                displayVariant.stock > 0 && (
                  <AlertTriangle
                    size={14}
                    style={{ color: "var(--color-warning)", flexShrink: 0 }}
                  />
                )}

              {isExpanded ? (
                <ChevronUp
                  size={14}
                  style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }}
                />
              ) : (
                <ChevronDown
                  size={14}
                  style={{ color: "var(--color-text-tertiary)", flexShrink: 0 }}
                />
              )}
            </div>

            {/* Expanded editing panel */}
            {isExpanded && (
              <div
                className="px-4 pb-4 pt-2 border-t"
                style={{
                  borderColor: "var(--color-border)",
                  background: "var(--color-bg)",
                }}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <Field label="Variant name *">
                    <input
                      value={displayVariant.name}
                      onChange={(e) => update(v.id, "name", e.target.value)}
                      placeholder="e.g. Black / Size 42"
                      className="w-full h-8 px-3 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
                      style={{
                        borderColor: "var(--color-border-md)",
                        color: "var(--color-text-primary)",
                      }}
                    />
                  </Field>
                  <Field label="SKU">
                    <input
                      value={displayVariant.sku || ""}
                      onChange={(e) => update(v.id, "sku", e.target.value)}
                      placeholder="Auto-generated"
                      className="w-full h-8 px-3 rounded-lg border text-[12px] font-mono outline-none focus:border-[var(--color-accent)] transition-colors"
                      style={{
                        borderColor: "var(--color-border-md)",
                        color: "var(--color-text-primary)",
                      }}
                    />
                  </Field>
                  <Field label="Price override ($)">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={displayVariant.price ?? ""}
                      onChange={(e) =>
                        update(
                          v.id,
                          "price",
                          e.target.value ? parseFloat(e.target.value) : null
                        )
                      }
                      placeholder="Uses product base price"
                      className="w-full h-8 px-3 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
                      style={{
                        borderColor: "var(--color-border-md)",
                        color: "var(--color-text-primary)",
                      }}
                    />
                  </Field>
                  <Field label="Stock">
                    <input
                      type="number"
                      min="0"
                      value={displayVariant.stock}
                      onChange={(e) =>
                        update(v.id, "stock", parseInt(e.target.value) || 0)
                      }
                      className="w-full h-8 px-3 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
                      style={{
                        borderColor: "var(--color-border-md)",
                        color: "var(--color-text-primary)",
                      }}
                    />
                  </Field>
                  <Field label="Reserved stock">
                    <input
                      type="number"
                      min="0"
                      value={displayVariant.reserved_stock}
                      onChange={(e) =>
                        update(
                          v.id,
                          "reserved_stock",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full h-8 px-3 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
                      style={{
                        borderColor: "var(--color-border-md)",
                        color: "var(--color-text-primary)",
                      }}
                    />
                  </Field>
                  <Field label="Low stock threshold">
                    <input
                      type="number"
                      min="0"
                      value={displayVariant.low_stock_threshold}
                      onChange={(e) =>
                        update(
                          v.id,
                          "low_stock_threshold",
                          parseInt(e.target.value) || 0
                        )
                      }
                      className="w-full h-8 px-3 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors"
                      style={{
                        borderColor: "var(--color-border-md)",
                        color: "var(--color-text-primary)",
                      }}
                    />
                  </Field>
                </div>
                <Field label="Variant description (optional)">
                  <textarea
                    value={displayVariant.description || ""}
                    onChange={(e) =>
                      update(v.id, "description", e.target.value)
                    }
                    placeholder="Optional notes about this variant…"
                    rows={2}
                    className="w-full px-3 py-2 rounded-lg border text-[12px] outline-none focus:border-[var(--color-accent)] transition-colors resize-none"
                    style={{
                      borderColor: "var(--color-border-md)",
                      color: "var(--color-text-primary)",
                    }}
                  />
                </Field>

                <OptionsEditor
                  options={displayVariant.options || []}
                  onChange={(opts) => update(v.id, "options", opts)}
                />

                <div
                  className="flex items-center justify-between mt-3 pt-2 border-t"
                  style={{ borderColor: "var(--color-border)" }}
                >
                  <div className="flex items-center gap-2">
                    {hasChanges && (
                      <>
                        <button
                          onClick={() => saveVariant(v.id)}
                          className="text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors"
                          style={{
                            background: "var(--color-accent)",
                            color: "white",
                          }}
                        >
                          Save Changes
                        </button>
                        <button
                          onClick={() => cancelEdit(v.id)}
                          className="text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-[var(--color-bg)]"
                          style={{ color: "var(--color-text-secondary)" }}
                        >
                          Cancel
                        </button>
                      </>
                    )}
                    <p
                      className="text-[11px]"
                      style={{ color: "var(--color-text-tertiary)" }}
                    >
                      Available stock: {Math.max(0, displayVariant.stock - displayVariant.reserved_stock)}{" "}
                      (stock − reserved)
                    </p>
                  </div>
                  <button
                    onClick={() => remove(v.id)}
                    className="flex items-center gap-1.5 text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-red-50"
                    style={{ color: "var(--color-danger)" }}
                  >
                    <X size={13} /> Remove variant
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Add variant button */}
      <button
        onClick={addVariant}
        className="w-full flex items-center justify-center gap-2 h-9 rounded-xl border border-dashed text-[13px] font-medium transition-colors hover:bg-[var(--color-accent-subtle)] hover:border-[var(--color-accent)]"
        style={{
          borderColor: "var(--color-border-md)",
          color: "var(--color-text-secondary)",
        }}
      >
        <Plus size={14} /> Add variant
      </button>
    </div>
    </>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label
        className="text-[11px] font-medium block mb-1"
        style={{ color: "var(--color-text-secondary)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function suggestSku(productName, index) {
  const prefix = productName
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .split(" ")
    .filter(Boolean)
    .map((w) => w.slice(0, 3).toUpperCase())
    .join("-");
  return `${prefix || "PRD"}-${String(index).padStart(2, "0")}`;
}

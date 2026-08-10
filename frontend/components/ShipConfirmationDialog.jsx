// components/ShipConfirmationDialog.jsx
"use client";

import { useEffect, useState } from "react";
import { X, Package, Truck } from "lucide-react";
import { useDeliveryPricing, useUpdateOrderStatus } from "@/lib/hooks/useOrders";

// Shown when a seller ships a platform_delivery order. Two jobs:
//   1. Let them review what they're about to hand off (order + items)
//   2. Let them pick the parcel size that determines the delivery fee
//      — this is a human judgment call (only the seller has actually
//      looked at the parcel), so it's a picker, not an auto-calc.
//
// Self-arranged orders skip this entirely — there's no fee or size
// to confirm, so the old single-click "Ship" behavior stays as-is
// for those.
export default function ShipConfirmationDialog({ order, onClose, onShipped }) {
  const { data: pricingData, isLoading: pricingLoading } = useDeliveryPricing();
  // console.log(pricingData);
  const { updateStatus, loading: submitting, error } = useUpdateOrderStatus();

  const [selectedSize, setSelectedSize] = useState(null);
  const [comment, setComment] = useState("");

  const feeRule = pricingData?.fee_rule;
  const isFlat = feeRule?.type === "flat";
  const isTiered = feeRule?.type === "tiered";

  // If the delivery platform rejects the ship attempt because the
  // size was missing/invalid, it comes back with a real tier list —
  // use that as a fallback so the picker still works even if the
  // initial pricing fetch failed for some reason.
  const tiers = isTiered
    ? feeRule.tiers
    : error?.details?.tiers ?? [];

  const selectedTier = tiers.find((t) => t.key === selectedSize);

  async function handleConfirm() {
    if (isTiered && !selectedSize) return;

    const result = await updateStatus(order.id, "shipped", comment, {
      parcel_size: selectedSize || undefined,
    });

    if (result) {
      onShipped?.(result);
      onClose();
    }
    // On failure, the dialog stays open — updateStatus's error state
    // (including a fresh tiers list, if that was the problem) is
    // still visible via `error` above, so the seller can just pick a
    // size and retry without losing their place.
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[85vh] overflow-y-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="ship-dialog-title"
      >
        <div className="sticky top-0 bg-white flex items-center justify-between px-5 py-4 border-b border-[var(--color-border)]">
          <h2 id="ship-dialog-title" className="text-[15px] font-semibold flex items-center gap-2">
            <Truck size={16} /> Confirm shipment
          </h2>
          <button onClick={onClose} className="p-1 text-[var(--color-text-muted)]">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4">
          {/* Order summary */}
          <div className="bg-[var(--color-bg)] rounded-xl p-3 mb-4">
            <p className="text-[11px] uppercase tracking-wide text-[var(--color-text-muted)] mb-1">
              Order
            </p>
            <p className="text-[13px] font-medium">
              {order.order_items?.length ?? 0} item
              {order.order_items?.length !== 1 ? "s" : ""} to{" "}
              {order.shipping_info?.name ?? order.customer?.full_name ?? "buyer"}
            </p>
            <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5">
              {order.shipping_info?.line1 ?? order.shipping_info?.address}
              {order.shipping_info?.city ? `, ${order.shipping_info.city}` : ""}
            </p>
          </div>

          {/* Parcel size / fee */}
          <p className="text-[12px] font-medium mb-2 flex items-center gap-1.5">
            <Package size={13} /> Parcel size
          </p>

          {isFlat && (
            <p className="text-[13px] text-[var(--color-text-secondary)] mb-4">
              Flat delivery fee — {feeRule.amount != null ? `K${feeRule.amount}` : "—"}
            </p>
          )}

          {pricingLoading && (
            <p className="text-[13px] text-[var(--color-text-muted)] mb-4">
              Loading pricing...
            </p>
          )}
          {!pricingLoading && isTiered && (
            <div className="space-y-2 mb-4">
              {tiers.map((tier) => (
                <button
                  key={tier.key}
                  onClick={() => setSelectedSize(tier.key)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl border text-left transition-colors ${
                    selectedSize === tier.key
                      ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                      : "border-[var(--color-border-md)]"
                  }`}
                >
                  <div>
                    <p className="text-[13px] font-medium">{tier.label ?? tier.key}</p>
                    {(tier.max_weight_kg || tier.max_items) && (
                      <p className="text-[11px] text-[var(--color-text-muted)]">
                        {tier.max_weight_kg ? `Up to ${tier.max_weight_kg}kg` : ""}
                        {tier.max_weight_kg && tier.max_items ? " · " : ""}
                        {tier.max_items ? `Up to ${tier.max_items} items` : ""}
                      </p>
                    )}
                  </div>
                  <span className="text-[13px] font-semibold">K{tier.price}</span>
                </button>
              ))}
            </div>
          )}

          <label className="block mb-4">
            <span className="block text-[12px] font-medium mb-1">
              Note for the rider (optional)
            </span>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="w-full px-3 py-2 rounded-xl text-[13px] border border-[var(--color-border-md)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/30"
            />
          </label>

          {error && !error.details?.tiers && (
            <p className="text-[12px] text-red-600 mb-3">{error.message}</p>
          )}
          {isTiered && !selectedSize && (
            <p className="text-[12px] text-[var(--color-text-muted)] mb-3">
              Select a size to see the delivery fee and continue.
            </p>
          )}

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-medium border border-[var(--color-border-md)]"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={submitting || (isTiered && !selectedSize)}
              className="flex-1 py-2.5 rounded-xl text-[13px] font-medium bg-[var(--color-primary)] text-white disabled:opacity-50"
            >
              {submitting
                ? "Shipping..."
                : selectedTier
                  ? `Ship — K${selectedTier.price}`
                  : "Ship"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

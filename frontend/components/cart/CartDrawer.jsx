"use client";
import { useState } from "react";
import { X, Trash2, ShoppingBag, Plus, Minus, ArrowRight } from "lucide-react";
import { Drawer } from "@/components/ui/Modal";
import { Button, Spinner } from "@/components/ui";
import { formatPrice, truncate, cn } from "@/lib/utils";
import {useCartStore} from "@/lib/store/cartStore";
import useAuthStore from "@/lib/store/useAuthStore";
import { usePlaceOrder } from "@/lib/hooks/useBuyerOrders";
import { toast } from "@/lib/store/toastStore";
import { useCart } from "@/lib/store/useCart";

function CartItem({ item }) {
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex gap-3 py-3 border-b border-[var(--color-border)] last:border-0">
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-xl bg-[var(--color-bg)] flex-shrink-0 overflow-hidden">
        {item.thumbnail_url ? (
          <img
            src={item.thumbnail_url}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-2xl">
            📦
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold text-[var(--color-text-primary)] leading-snug line-clamp-2">
          {item.name}
        </p>
        {item.variant_name && (
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5">
            {item.variant_name}
          </p>
        )}
        {item.store_name && (
          <p className="text-[11px] text-[var(--color-text-muted)]">
            {item.store_name}
          </p>
        )}
        <p className="text-[13px] font-bold text-[var(--color-primary)] mt-1">
          {formatPrice(item.price * item.quantity)}
        </p>
      </div>

      {/* Qty + delete */}
      <div className="flex flex-col items-end justify-between flex-shrink-0">
        <button
          onClick={() => removeItem(item.key)}
          className="text-[var(--color-text-muted)] hover:text-[var(--color-danger)] transition-colors"
        >
          <Trash2 size={13} />
        </button>
        <div className="flex items-center gap-1 border border-[var(--color-border-md)] rounded-xl overflow-hidden">
          <button
            onClick={() => updateQty(item.key, item.quantity - 1)}
            className="w-7 h-7 flex items-center justify-center hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
          >
            <Minus size={11} />
          </button>
          <span className="w-6 text-center text-[12px] font-semibold text-[var(--color-text-primary)]">
            {item.quantity}
          </span>
          <button
            onClick={() => updateQty(item.key, item.quantity + 1)}
            className="w-7 h-7 flex items-center justify-center hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)]"
          >
            <Plus size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function CartDrawer() {
  const cartId = useCartStore((s) => s.cartId)
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);
  const _subtotal = useCartStore((s) => s.subtotal);
  const _byStore = useCartStore((s) => s.byStore);
  const subtotal = _subtotal();
  const byStore = _byStore();
  const token = useAuthStore((s) => s.token);
  const { place, loading } = usePlaceOrder();

  const [shipping, setShipping] = useState({
    name: "",
    phone: "",
    address: "",
    city: "",
    country: "",
  });
  const [step, setStep] = useState("cart"); // cart | shipping | confirm

  const handleCheckout = async () => {
    if (!token) {
      toast.info("Please sign in to place an order");
      return;
    }
    if (step === "cart") {
      setStep("shipping");
      return;
    }
    if (step === "shipping") {
      setStep("confirm");
      return;
    }

    // Place order
    const orderItems = items.map((i) => ({
      product_id: i.product_id,
      variant_id: i.variant_id,
      quantity: i.quantity,
    }));

    const result = await place({
      cart_id: cartId,
      shipping_info: shipping,
    });

    if (result) {
      clearCart();
      setStep("cart");
      closeCart();
    }
  };

  const handleBack = () => {
    if (step === "shipping") setStep("cart");
    if (step === "confirm") setStep("shipping");
  };

  return (
    <Drawer
      open={isOpen}
      onClose={closeCart}
      title={
        step === "cart"
          ? `Cart (${items.length})`
          : step === "shipping"
          ? "Delivery info"
          : "Confirm order"
      }
      side="right"
    >
      <div className="flex flex-col h-full">
        {/* Back button */}
        {step !== "cart" && (
          <button
            onClick={handleBack}
            className="mx-4 mt-3 text-[12px] text-[var(--color-primary)] font-medium hover:underline text-left"
          >
            ← Back
          </button>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {step === "cart" &&
            (items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <ShoppingBag
                  size={40}
                  className="text-[var(--color-text-muted)] mb-4"
                />
                <p className="text-[14px] font-semibold text-[var(--color-text-primary)]">
                  Your cart is empty
                </p>
                <p className="text-[13px] text-[var(--color-text-secondary)] mt-1">
                  Browse the marketplace to find products you love
                </p>
                <button
                  onClick={closeCart}
                  className="mt-4 text-[13px] font-medium text-[var(--color-primary)] hover:underline"
                >
                  Continue shopping
                </button>
              </div>
            ) : (
              <div>
                {/* Group by store */}
                {Object.entries(byStore).map(([storeId, group]) => (
                  <div key={storeId} className="mb-4">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                      {group.store_name ?? "Store"}
                    </p>
                    {group.items.map((item) => (
                      <CartItem key={item.key} item={item} />
                    ))}
                  </div>
                ))}
              </div>
            ))}

          {step === "shipping" && (
            <div className="space-y-3 pt-2">
              {[
                { label: "Full name", field: "name", placeholder: "Your name" },
                {
                  label: "Phone",
                  field: "phone",
                  placeholder: "+1 555 000 0000",
                },
                {
                  label: "Address",
                  field: "address",
                  placeholder: "Street address",
                },
                { label: "City", field: "city", placeholder: "City" },
                { label: "Country", field: "country", placeholder: "Country" },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="text-[11px] font-medium text-[var(--color-text-secondary)] block mb-1">
                    {label}
                  </label>
                  <input
                    value={shipping[field]}
                    onChange={(e) =>
                      setShipping((s) => ({ ...s, [field]: e.target.value }))
                    }
                    placeholder={placeholder}
                    className="w-full h-10 px-3 rounded-xl border border-[var(--color-border-md)] bg-white text-[13px] outline-none focus:border-[var(--color-primary)] placeholder:text-[var(--color-text-muted)]"
                  />
                </div>
              ))}
            </div>
          )}

          {step === "confirm" && (
            <div className="space-y-4 pt-2">
              <div className="bg-[var(--color-bg)] rounded-2xl p-4 space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                  Delivering to
                </p>
                {Object.entries(shipping)
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[12px]">
                      <span className="capitalize text-[var(--color-text-muted)]">
                        {k}
                      </span>
                      <span className="font-medium text-[var(--color-text-primary)]">
                        {v}
                      </span>
                    </div>
                  ))}
              </div>
              <div className="bg-[var(--color-bg)] rounded-2xl p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-3">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </p>
                {items.map((i) => (
                  <div
                    key={i.key}
                    className="flex justify-between text-[12px] py-1"
                  >
                    <span className="text-[var(--color-text-secondary)] truncate flex-1 mr-3">
                      {truncate(i.name, 28)} ×{i.quantity}
                    </span>
                    <span className="font-semibold text-[var(--color-text-primary)] flex-shrink-0">
                      {formatPrice(i.price * i.quantity)}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-[var(--color-text-muted)] text-center leading-relaxed px-2">
                Payment is arranged directly with the seller. You'll be
                contacted to complete your purchase.
              </p>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {items.length > 0 && (
          <div className="border-t border-[var(--color-border)] px-4 py-4 flex-shrink-0 space-y-3">
            {step === "cart" && (
              <div className="flex justify-between text-[13px] font-semibold text-[var(--color-text-primary)]">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
            )}
            {step === "confirm" && (
              <div className="flex justify-between text-[14px] font-bold text-[var(--color-text-primary)]">
                <span>Total</span>
                <span className="text-[var(--color-primary)]">
                  {formatPrice(subtotal)}
                </span>
              </div>
            )}
            <Button
              className="w-full"
              loading={loading}
              onClick={handleCheckout}
            >
              {step === "cart" ? (
                <>
                  <span>Proceed to delivery info</span>
                  <ArrowRight size={15} />
                </>
              ) : null}
              {step === "shipping" ? (
                <>
                  <span>Review order</span>
                  <ArrowRight size={15} />
                </>
              ) : null}
              {step === "confirm" ? (
                <>
                  <span>Place order</span>
                  <ArrowRight size={15} />
                </>
              ) : null}
            </Button>
          </div>
        )}
      </div>
    </Drawer>
  );
}

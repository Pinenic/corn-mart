"use client";
import Link from "next/link";
import { Trash2, ShoppingBag, Plus, Minus, ArrowRight, LogIn } from "lucide-react";
import { Drawer } from "@/components/ui/Modal";
import { formatPrice, cn } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cartStore";
import useAuthStore from "@/lib/store/useAuthStore";

// ── Cart line item ────────────────────────────────────────────
export function CartItem({ item }) {
  const updateQty = useCartStore((s) => s.updateQty);
  const removeItem = useCartStore((s) => s.removeItem);

  return (
    <div className="flex gap-3 py-3 border-b border-[var(--color-border)] last:border-0">
      {/* Thumbnail */}
      <div className="w-16 h-16 rounded-[var(--radius-sm)] bg-[var(--color-bg)] flex-shrink-0 overflow-hidden">
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
        <p className="text-[13px] font-bold text-[var(--color-text-primary)] mt-1">
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
        <div className="flex items-center gap-1 border border-[var(--color-border-md)] rounded-[var(--radius-sm)] overflow-hidden">
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

// ── Guest sign-in nudge ───────────────────────────────────────
function GuestBanner({ onClose }) {
  return (
    <div className="mx-4 mb-4 rounded-[var(--radius-lg)] border border-[var(--color-border-md)] bg-[var(--color-bg)] p-4 flex flex-col gap-3">
      <div>
        <p className="text-[13px] font-semibold text-[var(--color-text-primary)]">
          Sign in to check out
        </p>
        <p className="text-[12px] text-[var(--color-text-secondary)] mt-0.5 leading-relaxed">
          Your cart is saved locally. Sign in or create an account and
          it&apos;ll be waiting for you.
        </p>
      </div>
      <div className="flex gap-2">
        <Link href="/sign-in" onClick={onClose} className="flex-1">
          <button className="w-full h-9 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[13px] font-semibold flex items-center justify-center gap-1.5 hover:bg-[var(--color-primary-hover)] transition-colors">
            <LogIn size={14} />
            Sign in
          </button>
        </Link>
        <Link href="/sign-up" onClick={onClose} className="flex-1">
          <button className="w-full h-9 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] text-[var(--color-text-secondary)] text-[13px] font-medium flex items-center justify-center hover:bg-white transition-colors">
            Create account
          </button>
        </Link>
      </div>
    </div>
  );
}

// ── Mini-cart drawer ─────────────────────────────────────────
// Quick preview only. Shipping/address/payment now live on the
// dedicated /checkout page (see Phase 5 of the refactor plan) — this
// drawer's only job is to show what's in the cart and hand off to
// the full /cart page.
export function CartDrawer() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const _subtotal = useCartStore((s) => s.subtotal);
  const _byStore = useCartStore((s) => s.byStore);
  const subtotal = _subtotal();
  const byStore = _byStore();

  const { user } = useAuthStore();
  const isGuest = !user;

  return (
    <Drawer open={isOpen} onClose={closeCart} title={`Cart (${items.length})`} side="right">
      <div className="flex flex-col h-full">
        {/* Content */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {items.length === 0 ? (
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
          )}
        </div>

        {/* Guest sign-in nudge */}
        {items.length > 0 && isGuest && <GuestBanner onClose={closeCart} />}

        {/* Footer CTA */}
        {items.length > 0 && !isGuest && (
          <div className="border-t border-[var(--color-border)] px-4 py-4 flex-shrink-0 space-y-3">
            <div className="flex justify-between text-[13px] font-semibold text-[var(--color-text-primary)]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <Link href="/cart" onClick={closeCart}>
              <button
                className={cn(
                  "w-full h-11 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-[var(--color-primary-hover)] transition-colors"
                )}
              >
                View Cart
                <ArrowRight size={15} />
              </button>
            </Link>
          </div>
        )}
      </div>
    </Drawer>
  );
}

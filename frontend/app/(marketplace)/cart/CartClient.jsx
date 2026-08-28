"use client";
import Link from "next/link";
import { ShoppingBag, ArrowRight, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";
import { CartItem } from "@/components/cart/CartDrawer";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cartStore";
import useAuthStore from "@/lib/store/useAuthStore";

export function CartClient() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const _subtotal = useCartStore((s) => s.subtotal);
  const _byStore = useCartStore((s) => s.byStore);
  const subtotal = _subtotal();
  const byStore = _byStore();

  const { user } = useAuthStore();
  const isGuest = !user;

  if (items.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 md:px-6 py-24 text-center">
        <ShoppingBag size={44} className="text-[var(--color-text-muted)] mx-auto mb-4" />
        <h1 className="text-[20px] font-bold text-[var(--color-text-primary)] mb-2">
          Your cart is empty
        </h1>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">
          Browse the marketplace to find products you love
        </p>
        <Link href="/marketplace/products">
          <button className="h-11 px-6 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[13px] font-semibold hover:bg-[var(--color-primary-hover)] transition-colors">
            Browse Products
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-10">
      <h1 className="text-[24px] font-bold text-[var(--color-text-primary)] mb-8">
        Shopping Cart
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        {/* Item list */}
        <div className="lg:col-span-2">
          {Object.entries(byStore).map(([storeId, group]) => (
            <div key={storeId} className="mb-6">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                {group.store_name ?? "Store"}
              </p>
              {group.items.map((item) => (
                <CartItem key={item.key} item={item} />
              ))}
            </div>
          ))}
        </div>

        {/* Order summary */}
        <div className="lg:col-span-1">
          <div className="border border-[var(--color-border)] rounded-[var(--radius-lg)] p-6 sticky top-24">
            <h2 className="text-[16px] font-bold text-[var(--color-text-primary)] mb-5">
              Order Summary
            </h2>

            <div className="flex justify-between text-[13px] text-[var(--color-text-secondary)] mb-3">
              <span>Subtotal</span>
              <span className="font-semibold text-[var(--color-text-primary)]">
                {formatPrice(subtotal)}
              </span>
            </div>
            <p className="text-[11px] text-[var(--color-text-muted)] mb-5">
              Delivery fee (if any) is calculated at checkout.
            </p>

            <div className="flex justify-between text-[15px] font-bold text-[var(--color-text-primary)] border-t border-[var(--color-border)] pt-4 mb-5">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            {isGuest ? (
              <div className="space-y-2">
                <p className="text-[12px] text-[var(--color-text-secondary)] mb-2">
                  Sign in to check out — your cart is saved locally.
                </p>
                <Link href="/sign-in">
                  <button className="w-full h-11 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-[var(--color-primary-hover)] transition-colors">
                    <LogIn size={15} />
                    Sign in to check out
                  </button>
                </Link>
              </div>
            ) : (
              <button
                onClick={() => router.push("/checkout?step=shipping")}
                className="w-full h-11 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[13px] font-semibold flex items-center justify-center gap-2 hover:bg-[var(--color-primary-hover)] transition-colors"
              >
                Checkout
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

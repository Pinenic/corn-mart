"use client";
import Link from "next/link";
import { ShoppingCart, X } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cartStore";
import { useWishlistStore } from "@/lib/store/wishlistStore";

export function WishlistItemCard({ item }) {
  const addToCart = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);
  const removeItem = useWishlistStore((s) => s.removeItem);

  const handleMoveToCart = (e) => {
    e.preventDefault();
    // Shim a product/variant shape from the wishlist item's flatter
    // normalized fields — cartStore.addItem only ever reads these.
    const product = {
      id: item.product_id,
      name: item.name,
      price: item.price,
      thumbnail_url: item.thumbnail_url,
      store_id: item.store_id,
      store: { name: item.store_name },
    };
    const variant = item.variant_id
      ? { id: item.variant_id, name: item.variant_name, price: item.price }
      : null;

    addToCart(product, variant, 1);
    openCart();
    // Unconditional — addItem doesn't report success/failure back to the
    // caller (it toasts internally either way), so "move to cart" is
    // treated as a deliberate one-way action rather than something that
    // silently reverses on a rare failure.
    removeItem(item.key);
  };

  return (
    <div className="group relative bg-[var(--color-bg)] rounded-[var(--radius)] overflow-hidden">
      <Link
        href={`/marketplace/products/${item.product_id}`}
        className="block relative overflow-hidden bg-white aspect-square"
      >
        {item.thumbnail_url ? (
          <img
            src={item.thumbnail_url}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">📦</div>
        )}
      </Link>

      <button
        onClick={(e) => {
          e.preventDefault();
          removeItem(item.key);
        }}
        aria-label="Remove from wishlist"
        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow-sm text-[var(--color-text-secondary)] hover:text-[var(--color-danger)] transition-colors"
      >
        <X size={14} />
      </button>

      <div className="p-3 pt-2.5 space-y-2">
        <Link href={`/marketplace/products/${item.product_id}`}>
          <p className="text-[13px] font-medium text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug">
            {item.name}
          </p>
        </Link>
        {item.variant_name && (
          <p className="text-[11px] text-[var(--color-text-muted)]">{item.variant_name}</p>
        )}
        {item.store_name && (
          <p className="text-[11px] text-[var(--color-text-muted)]">{item.store_name}</p>
        )}

        <p className="text-[16px] font-bold text-[var(--color-text-primary)]">
          {formatPrice(item.price)}
        </p>

        <button
          onClick={handleMoveToCart}
          className="w-full h-9 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white text-[13px] font-semibold hover:bg-[var(--color-primary-hover)] transition-colors flex items-center justify-center gap-1.5"
        >
          <ShoppingCart size={13} />
          Move to Cart
        </button>
      </div>
    </div>
  );
}
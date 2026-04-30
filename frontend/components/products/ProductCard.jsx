"use client";
import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Eye, Heart, Star } from "lucide-react";
import { cn, formatPrice, truncate } from "@/lib/utils";
import {useCartStore} from "@/lib/store/cartStore";
import { toast } from "@/lib/store/toastStore";
import { Badge } from "@/components/ui";

export function ProductCard({ product, onQuickView }) {
  const [wishlisted, setWishlisted] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);


  const isOutOfStock = !product.variants?.length && product.stock === 0;
  const hasVariants = product.variants?.length > 1;
  const thumbnail = product.images.filter((img) => img.is_thumbnail === true);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (isOutOfStock) return;
    if (hasVariants) {
      onQuickView?.(product);
      return;
    }
    addItem(product, null, 1);
    toast.success(`"${truncate(product.name, 30)}" added to cart`);
    openCart();
  };

  return (
    <div className="group relative bg-white rounded-2xl border border-[var(--color-border)] overflow-hidden hover:shadow-lg hover:border-[var(--color-border-md)] transition-all duration-300">
      {/* Image */}
      <Link
        href={`/marketplace/products/${product.id}`}
        className="block relative overflow-hidden bg-[var(--color-bg)] aspect-square"
      >
        {product.thumbnail_url ? (
          <img
            src={thumbnail[0]?.image_url || product.thumbnail_url}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl">
            📦
          </div>
        )}

        {/* Overlay actions */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        <div className="absolute top-3 right-3 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300">
          <button
            onClick={(e) => {
              e.preventDefault();
              setWishlisted((v) => !v);
            }}
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center shadow-sm transition-colors",
              wishlisted
                ? "bg-red-500 text-white"
                : "bg-white text-[var(--color-text-secondary)] hover:text-red-500"
            )}
          >
            <Heart size={14} fill={wishlisted ? "currentColor" : "none"} />
          </button>
          <button
            onClick={(e) => {
              e.preventDefault();
              onQuickView?.(product);
            }}
            className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
          >
            <Eye size={14} />
          </button>
        </div>

        {/* Out of stock overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <Badge variant="danger">Out of stock</Badge>
          </div>
        )}

        {/* Store badge */}
        {product.store?.name && (
          <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-[10px] font-medium bg-white/90 backdrop-blur px-2 py-0.5 rounded-full text-[var(--color-text-secondary)]">
              {product.store.name}
            </span>
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-3">
        {product.category && (
          <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
            {product.category}
          </p>
        )}
        <Link href={`/marketplace/products/${product.id}`}>
          <p className="text-[13px] font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-primary)] transition-colors line-clamp-2 leading-snug mb-1.5">
            {product.name}
          </p>
        </Link>

        <div className="flex items-center justify-between gap-2">
          <p className="text-[15px] font-bold text-[var(--color-primary)]">
            {formatPrice(product.price)}
          </p>
          {/* <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={cn("flex items-center gap-1.5 px-3 h-8 rounded-xl text-[12px] font-semibold transition-all", isOutOfStock ? "opacity-40 cursor-not-allowed bg-[var(--color-bg)] text-[var(--color-text-muted)]" : "bg-[var(--color-primary-light)] text-[var(--color-primary-text)] hover:bg-[var(--color-primary)] hover:text-white")}>
            <ShoppingCart size={13} />
            {hasVariants ? "Options" : "Add"}
          </button> */}
        </div>
      </div>
    </div>
  );
}

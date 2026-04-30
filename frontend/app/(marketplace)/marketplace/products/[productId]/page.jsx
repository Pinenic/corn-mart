"use client";
import { use, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingCart, Store, Package } from "lucide-react";
import { useProduct } from "@/lib/hooks/useMarketplace";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import { VariantSelector } from "@/components/products/VariantSelector";
import { Button, Badge, Skeleton, OrderStatusBadge } from "@/components/ui";
import { useCartStore } from "@/lib/store/cartStore";
import { toast } from "@/lib/store/toastStore";
import { formatPrice, truncate } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function ProductDetailPage({ params }) {
  const { productId } = use(params);
  const { product, isLoading, error } = useProduct(productId);

  const [selectedVariant, setVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4 pt-4">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-5xl mx-auto px-4 md:px-6 py-20 text-center">
        <Package
          size={48}
          className="text-[var(--color-text-muted)] mx-auto mb-4"
        />
        <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-2">
          Product not found
        </h2>
        <p className="text-[13px] text-[var(--color-text-secondary)] mb-6">
          This product may have been removed or is unavailable.
        </p>
        <Link href="/marketplace/products">
          <Button variant="secondary">Browse products</Button>
        </Link>
      </div>
    );
  }

  const effectiveVariant = selectedVariant ?? product.variants?.[0] ?? null;
  const price = effectiveVariant?.price ?? product.price;
  const stock = effectiveVariant?.available_stock ?? product.stock ?? 0;
  const outOfStock = stock <= 0;

  const handleAdd = () => {
    addItem(product, effectiveVariant, qty);
    toast.success(`${truncate(product.name, 28)} added to cart`);
    openCart();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-muted)] mb-6">
        <Link
          href="/marketplace/products"
          className="hover:text-[var(--color-primary)] flex items-center gap-1"
        >
          <ArrowLeft size={12} /> Products
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <span>{product.category}</span>
          </>
        )}
        <span>/</span>
        <span className="text-[var(--color-text-secondary)] truncate max-w-[200px]">
          {product.name}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Gallery */}
        <ProductImageGallery
          images={product.images ?? []}
          thumbnail_url={product.thumbnail_url}
          selectedVariant={effectiveVariant}
        />

        {/* Details */}
        <div className="flex flex-col gap-5">
          {/* Store link */}
          {product.store && (
            <Link
              href={`/marketplace/stores/${product.store_id}`}
              className="flex items-center gap-2 text-[12px] font-semibold text-[var(--color-primary)] hover:underline w-fit"
            >
              <div className="w-5 h-5 rounded-md overflow-hidden bg-[var(--color-bg)] flex-shrink-0">
                {product.store.logo ? (
                  <img
                    src={product.store.logo}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Store
                    size={12}
                    className="m-auto mt-0.5 text-[var(--color-text-muted)]"
                  />
                )}
              </div>
              More from {" "}
              {product.store.name}
            </Link>
          )}

          {/* Name */}
          <div>
            {product.category && (
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-1">
                {product.category}
              </p>
            )}
            <h1 className="text-[24px] md:text-[28px] font-bold text-[var(--color-text-primary)] leading-tight">
              {product.name}
            </h1>
            {product.brand && (
              <p className="text-[13px] text-[var(--color-text-muted)] mt-1">
                {product.brand}
              </p>
            )}
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <p className="text-[28px] font-bold text-[var(--color-primary)]">
              {formatPrice(price)}
            </p>
            {effectiveVariant?.price &&
              effectiveVariant.price !== product.price && (
                <p className="text-[14px] text-[var(--color-text-muted)] line-through">
                  {formatPrice(product.price)}
                </p>
              )}
          </div>

          {/* Stock indicator */}
          <div className="flex items-center gap-2">
            {outOfStock ? (
              <Badge variant="danger">Out of stock</Badge>
            ) : stock <= 5 ? (
              <Badge variant="warning">Only {stock} left</Badge>
            ) : (
              <Badge variant="success">In stock</Badge>
            )}
          </div>

          {/* Variants */}
          {product.variants?.length >= 1 && (
            <VariantSelector
              variants={product.variants}
              selected={selectedVariant || effectiveVariant}
              onSelect={setVariant}
            />
          )}

          {/* Description */}
          {product.description && (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-muted)] mb-2">
                Description
              </p>
              <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>
          )}

          {/* Qty + Add to cart */}
          <div className="flex items-center gap-3 pt-2">
            <div className="flex items-center border border-[var(--color-border-md)] rounded-xl overflow-hidden">
              <button
                onClick={() => setQty((q) => Math.max(1, q - 1))}
                className="w-10 h-11 flex items-center justify-center hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] font-bold text-lg"
              >
                −
              </button>
              <span className="w-10 text-center text-[14px] font-semibold text-[var(--color-text-primary)]">
                {qty}
              </span>
              <button
                onClick={() => setQty((q) => Math.min(stock || 99, q + 1))}
                disabled={outOfStock}
                className="w-10 h-11 flex items-center justify-center hover:bg-[var(--color-bg)] text-[var(--color-text-secondary)] font-bold text-lg disabled:opacity-40"
              >
                +
              </button>
            </div>
            <Button
              size="lg"
              className="flex-1"
              disabled={outOfStock}
              onClick={handleAdd}
            >
              <ShoppingCart size={17} />
              {outOfStock ? "Unavailable" : "Add to cart"}
            </Button>
          </div>

          {/* Contact seller note */}
          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
            💬 Payment is arranged directly with the seller. Place your order
            and the seller will contact you to confirm and arrange delivery.
          </p>
        </div>
      </div>
    </div>
  );
}

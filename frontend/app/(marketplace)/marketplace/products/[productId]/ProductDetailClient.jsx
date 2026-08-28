"use client";
import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ShoppingCart,
  Store,
  Package,
  Heart,
  Truck,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import { useProduct, useStoreProducts, useMarketplaceProducts } from "@/lib/hooks/useMarketplace";
import { ProductImageGallery } from "@/components/products/ProductImageGallery";
import { VariantSelector } from "@/components/products/VariantSelector";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductPreviewModal } from "@/components/products/ProductPreviewModal";
import { Button, Badge, Skeleton } from "@/components/ui";
import { useCartStore } from "@/lib/store/cartStore";
import { toast } from "@/lib/store/toastStore";
import { formatPrice, truncate, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { usePendingMessageRef } from "@/lib/store/usePendingMessageRef";
import { useStartConversation } from "@/lib/hooks/useBuyerMessages";

/** Store products first, backfilled with same-category products, current item excluded. */
function useRelatedProducts(product) {
  const { products: storeProducts } = useStoreProducts(product?.store_id, { limit: 8 });
  const { products: categoryProducts } = useMarketplaceProducts(
    product?.category ? { category: product.category, limit: 8 } : {}
  );

  if (!product) return [];

  const fromStore = storeProducts.filter((p) => p.id !== product.id);
  const seen = new Set(fromStore.map((p) => p.id));
  const fromCategory = categoryProducts.filter((p) => p.id !== product.id && !seen.has(p.id));

  return [...fromStore, ...fromCategory].slice(0, 4);
}

export function ProductDetailClient({ productId }) {
  const { product, isLoading, error } = useProduct(productId);
  const router = useRouter();
  const setMessageRef = usePendingMessageRef((s) => s.setMessageRef);
  const { startConversation, starting } = useStartConversation();

  const [selectedVariant, setVariant] = useState(null);
  const [qty, setQty] = useState(1);
  const [wishlisted, setWishlisted] = useState(false);
  const [preview, setPreview] = useState(null);
  const addItem = useCartStore((s) => s.addItem);
  const openCart = useCartStore((s) => s.openCart);

  const related = useRelatedProducts(product);

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-[var(--radius-lg)]" />
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
      <div className="max-w-6xl mx-auto px-4 md:px-6 py-20 text-center">
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
  // Only shown if the backend actually provides a compare_at_price — no
  // schema change, purely conditional on real data being present.
  const compareAtPrice = product.compare_at_price;

  const handleAdd = () => {
    addItem(product, effectiveVariant, qty);
    toast.success(`${truncate(product.name, 28)} added to cart`);
    openCart();
  };

  const handleChat = async () => {
    setMessageRef({
      productId: productId,
      image_url: product.thumbnail_url,
      name: product.name,
      link: `/marketplace/products/${productId}`,
    });
    const conv = await startConversation({
      storeId: product.store_id,
      topic: "",
      body: "",
      orderId: null,
    });
    if (conv) router.push(`/account/messages/${conv.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-[12px] text-[var(--color-text-muted)] mb-6 flex-wrap">
        <Link
          href="/marketplace"
          className="hover:text-[var(--color-primary)] flex items-center gap-1"
        >
          <ArrowLeft size={12} /> Home
        </Link>
        <span>/</span>
        <Link href="/marketplace/products" className="hover:text-[var(--color-primary)]">
          Catalog
        </Link>
        {product.category && (
          <>
            <span>/</span>
            <Link
              href={`/marketplace/products?category=${encodeURIComponent(product.category)}`}
              className="hover:text-[var(--color-primary)]"
            >
              {product.category}
            </Link>
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
              More from {product.store.name}
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
            <p className="text-[28px] font-bold text-[var(--color-text-primary)]">
              {formatPrice(price)}
            </p>
            {compareAtPrice && compareAtPrice > price && (
              <p className="text-[16px] text-[var(--color-text-muted)] line-through">
                {formatPrice(compareAtPrice)}
              </p>
            )}
            {effectiveVariant?.price &&
              effectiveVariant.price !== product.price &&
              !compareAtPrice && (
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

          {/* Qty + Add to cart */}
          <div className="grid grid-cols-2 md:flex items-center gap-3 pt-2">
            <div className="flex items-center border border-[var(--color-border-md)] rounded-[var(--radius-sm)] overflow-hidden">
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

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setWishlisted((v) => !v)}
              className={cn(
                "h-11 rounded-[var(--radius-sm)] border text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors",
                wishlisted
                  ? "border-red-500 text-red-500 bg-red-50"
                  : "border-[var(--color-border-md)] text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]"
              )}
            >
              <Heart size={15} fill={wishlisted ? "currentColor" : "none"} />
              {wishlisted ? "Wishlisted" : "Add to Wishlist"}
            </button>
            <button
              onClick={handleChat}
              className="h-11 rounded-[var(--radius-sm)] border border-[var(--color-border-md)] text-[13px] font-semibold text-[var(--color-text-secondary)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] flex items-center justify-center gap-2 transition-colors"
            >
              <MessageSquare size={15} />
              Chat Now
            </button>
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-[var(--radius-sm)] bg-[var(--color-bg)]">
              <Truck size={18} className="text-[var(--color-text-secondary)]" />
              <p className="text-[11px] font-medium text-[var(--color-text-primary)]">
                Delivery arranged
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)]">by seller</p>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-[var(--radius-sm)] bg-[var(--color-bg)]">
              <Package size={18} className="text-[var(--color-text-secondary)]" />
              <p className="text-[11px] font-medium text-[var(--color-text-primary)]">
                {outOfStock ? "Out of Stock" : "In Stock"}
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)]">
                {outOfStock ? "—" : "Today"}
              </p>
            </div>
            <div className="flex flex-col items-center text-center gap-1.5 p-3 rounded-[var(--radius-sm)] bg-[var(--color-bg)]">
              <ShieldCheck size={18} className="text-[var(--color-text-secondary)]" />
              <p className="text-[11px] font-medium text-[var(--color-text-primary)]">
                Seller Verified
              </p>
              <p className="text-[10px] text-[var(--color-text-muted)]">Contact direct</p>
            </div>
          </div>

          {/* Contact seller note */}
          <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed">
            💬 Payment is arranged directly with the seller. Place your order
            and the seller will contact you to confirm and arrange delivery.
          </p>
        </div>
      </div>

      {/* Details */}
      {product.description && (
        <div className="mt-14 bg-[var(--color-bg)] rounded-[var(--radius-lg)] p-6 md:p-8">
          <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-4">
            Details
          </h2>
          <p className="text-[13px] text-[var(--color-text-secondary)] leading-relaxed whitespace-pre-line">
            {product.description}
          </p>
        </div>
      )}

      {/* Related products */}
      {related.length > 0 && (
        <div className="mt-14">
          <h2 className="text-[18px] font-bold text-[var(--color-text-primary)] mb-5">
            Related Products
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} onQuickView={setPreview} />
            ))}
          </div>
        </div>
      )}

      <ProductPreviewModal
        product={preview}
        open={Boolean(preview)}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}

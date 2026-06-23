"use client";
import { useState } from "react";
import Link from "next/link";
import { ShoppingCart, Eye, Heart, Star } from "lucide-react";
import { cn, formatPrice, truncate } from "@/lib/utils";
import { useCartStore } from "@/lib/store/cartStore";
import { toast } from "@/lib/store/toastStore";
import { Badge } from "@/components/ui";

function deriveSurfaces(theme) {
  const isDark =
    theme?.preset === "dark-mode" ||
    theme?.backgroundColor?.toLowerCase().startsWith("#0") ||
    theme?.backgroundColor?.toLowerCase().startsWith("#1");

  return {
    isDark,
    pageBg: theme?.backgroundColor || (isDark ? "#0f172a" : "#f8f9fa"),
    surfaceBg: isDark ? "#111827" : "#ffffff",
    cardBg: isDark ? "#1f2937" : "#ffffff",
    cardBorder: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
    textPrimary: isDark ? "#f9fafb" : "#0f1117",
    textSecond: isDark ? "#9ca3af" : "#6b7280",
    accent: theme?.primaryColor || "#16a34a",
  };
}

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

export function ProductCard2({ product, onQuickView }) {
  const cardConfig = {
    style: "minimal",
    showRatings: false,
    showPrice: true,
    showDiscount: true,
    buttonStyle: "filled",
  };

  const gridConfig = {
    layout: "grid-4",
    spacing: "normal",
    imageRatio: "square",
    pagination: "pagination",
  };
  const surfaces = deriveSurfaces({
    preset: "light-mode",
    primaryColor: "#16a34a",
    secondaryColor: "#1F2937",
    backgroundColor: "transparent",
    accentColor: "#16a34a",
  });
  const thumbnail = product.images.filter((img) => img.is_thumbnail === true);
  const { style, showRatings, showPrice, showDiscount, buttonStyle } =
    cardConfig;
  const { imageRatio } = gridConfig;
  const { isDark, accent, textPrimary, textSecond, cardBg, cardBorder } =
    surfaces;

  const aspectCls =
    imageRatio === "portrait" ? "aspect-[3/4]" : "aspect-square";
  const imgBg = isDark ? "#374151" : "#f5f6f8";

  const AddBtn = () => {
    const styles = {
      filled: { background: accent, color: "#fff", border: "none" },
      outline: {
        background: "transparent",
        color: accent,
        border: `1px solid ${accent}`,
      },
      text: { background: "transparent", color: accent, border: "none" },
    }[buttonStyle] ?? { background: accent, color: "#fff" };
    return (
      <button
        className="w-full mt-2 py-1.5 rounded-lg text-[11px] font-semibold"
        style={styles}
      >
        See Preview
      </button>
    );
  };

  const Meta = () => (
    <div className="p-2.5">
      <p
        className="text-[12px] font-semibold truncate"
        style={{ color: textPrimary }}
      >
        {product.name}
      </p>
      {showRatings && (
        <div className="flex items-center gap-1 my-0.5">
          <Star size={9} fill={accent} color={accent} />
          <span className="text-[10px]" style={{ color: textSecond }}>
            {product.rating} ({product.reviews})
          </span>
        </div>
      )}
      <div className="my-0.5 h-8 line-clamp-2">
        {/* <Star size={9} fill={accent} color={accent} /> */}
        <span className="text-[10px]" style={{ color: textSecond }}>
          {product.description}
        </span>
      </div>

      <div className="flex items-center justify-between gap-4">
        {showPrice && (
          <div className="flex items-center gap-1.5">
            <span className="text-[13px] md:text-[15px] font-bold">
              K{product.price}
            </span>
            {product.originalPrice && showDiscount && (
              <span
                className="text-[11px] line-through"
                style={{ color: textSecond }}
              >
                ${product.originalPrice}
              </span>
            )}
          </div>
        )}
        {/* <AddBtn /> */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onQuickView?.(product);
          }}
          style={{ backgroundColor: accent }}
          className="p-1 px-2 h-8 rounded-lg text-white hover:cursor-pointer hover:text-white/90 flex gap-2 items-center justify-center shadow-sm text-[var(--color-text-secondary)] hover:text-[var(--color-primary)] transition-colors"
        >
          <span className="text-sm">Preview</span>
          <Eye size={14} className="" />
        </button>
      </div>
    </div>
  );

  if (style === "elevated") {
    return (
      <div
        className="rounded-xl overflow-hidden shadow-lg"
        style={{ background: cardBg }}
      >
        <div
          className={`relative overflow-hidden ${aspectCls}`}
          style={{ background: imgBg }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            crossOrigin="anonymous"
          />
          {product.badge && showDiscount && (
            <span
              className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white"
              style={{ background: accent }}
            >
              {product.badge}
            </span>
          )}
        </div>
        <Meta />
      </div>
    );
  }

  if (style === "border-only") {
    return (
      <div
        className="rounded-lg overflow-hidden border"
        style={{ borderColor: cardBorder, background: cardBg }}
      >
        <div
          className={`relative overflow-hidden ${aspectCls}`}
          style={{ background: imgBg }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover"
            crossOrigin="anonymous"
          />
          {product.badge && showDiscount && (
            <span
              className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold"
              style={{
                border: `1px solid ${cardBorder}`,
                background: cardBg,
                color: textPrimary,
              }}
            >
              {product.badge}
            </span>
          )}
        </div>
        <Meta />
      </div>
    );
  }

  if (style === "hover-actions") {
    return (
      <div
        className="group rounded-xl overflow-hidden border cursor-pointer"
        style={{ background: cardBg, borderColor: cardBorder }}
      >
        <div
          className={`relative overflow-hidden ${aspectCls}`}
          style={{ background: imgBg }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            crossOrigin="anonymous"
          />
          {product.badge && showDiscount && (
            <span
              className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white"
              style={{ background: accent }}
            >
              {product.badge}
            </span>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {[Heart, Eye, ShoppingCart].map((Icon, i) => (
              <button
                key={i}
                className="p-2 bg-white rounded-full hover:scale-110 transition-transform"
              >
                <Icon size={14} color={accent} />
              </button>
            ))}
          </div>
        </div>
        <Meta />
      </div>
    );
  }

  if (style === "quick-add") {
    return (
      <div
        className="group rounded-xl overflow-hidden border cursor-pointer"
        style={{ background: cardBg, borderColor: cardBorder }}
      >
        <div
          className={`relative overflow-hidden ${aspectCls}`}
          style={{ background: imgBg }}
        >
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            crossOrigin="anonymous"
          />
          <button
            className="absolute bottom-2 right-2 p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white"
            style={{ background: accent }}
          >
            <Plus size={14} />
          </button>
        </div>
        <Meta />
      </div>
    );
  }

  // minimal (default)
  return (
    <div
      className="group rounded-xl overflow-hidden border cursor-pointer"
      style={{ background: cardBg, borderColor: cardBorder }}
    >
      <Link
        href={`/marketplace/products/${product.id}`}
        className=""
      >
        <div
          className={`relative overflow-hidden ${aspectCls} transition-transform duration-200 group-hover:scale-[1.02]`}
          style={{ background: imgBg }}
        >
          {/* <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          crossOrigin="anonymous"
        /> */}
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
          {product.badge && showDiscount && (
            <span
              className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white"
              style={{ background: accent }}
            >
              {product.badge}
            </span>
          )}
        </div>
        <Meta />
      </Link>
    </div>
  );
}

"use client";

import { ShoppingCart, Search, Menu, Star, ChevronRight, Instagram, Twitter } from "lucide-react";
import { PRODUCTS } from "@/lib/products-data";
import { FONTS } from "@/lib/branding-data";

const FEATURED = PRODUCTS.slice(0, 4);

/**
 * StorefrontPreview
 * A realistic, reactive mock of the customer-facing storefront.
 * All props come from the branding form state and update live.
 */
export function StorefrontPreview({ branding }) {
  const {
    store_name, tagline, accent_color, font, theme,
    hero_headline, hero_subline, hero_cta_text, hero_style,
    announcement_enabled, announcement_text, announcement_bg,
    footer_tagline, footer_links, social,
    seo_title,
  } = branding;

  const fontStack = FONTS.find((f) => f.value === font)?.stack ?? "'DM Sans', sans-serif";

  // Theme-derived surface colours
  const isDark      = theme === "dark";
  const surfaceBg   = isDark ? "#111827" : "#ffffff";
  const pageBg      = isDark ? "#0f172a" : "#f8f9fa";
  const textPrimary = isDark ? "#f9fafb" : "#0f1117";
  const textSecond  = isDark ? "#9ca3af" : "#6b7280";
  const cardBg      = isDark ? "#1f2937" : "#ffffff";
  const cardBorder  = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)";

  const btn = { background: accent_color, color: "#ffffff" };

  return (
    <div
      style={{
        fontFamily: fontStack,
        background: pageBg,
        color: textPrimary,
        borderRadius: 12,
        overflow: "hidden",
        border: `0.5px solid ${cardBorder}`,
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      {/* ── Announcement bar ── */}
      {announcement_enabled && announcement_text && (
        <div
          className="text-center py-2 px-4 text-[11px] font-medium text-white"
          style={{ background: announcement_bg || accent_color }}
        >
          {announcement_text}
        </div>
      )}

      {/* ── Navbar ── */}
      <nav
        className="flex items-center gap-4 px-6 py-3.5 border-b"
        style={{ background: surfaceBg, borderColor: cardBorder }}
      >
        <span className="font-bold text-[15px] flex-1" style={{ color: textPrimary }}>
          {store_name}
        </span>
        <div className="hidden md:flex items-center gap-5 text-[12px]" style={{ color: textSecond }}>
          {["Shop", "About", "Contact"].map((l) => (
            <span key={l} className="cursor-pointer hover:opacity-70 transition-opacity">{l}</span>
          ))}
        </div>
        <div className="flex items-center gap-2.5" style={{ color: textSecond }}>
          <Search size={15} className="cursor-pointer" />
          <div className="relative cursor-pointer">
            <ShoppingCart size={15} />
            <span
              className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center text-white"
              style={{ background: accent_color }}
            >
              2
            </span>
          </div>
          <Menu size={15} className="md:hidden cursor-pointer" />
        </div>
      </nav>

      {/* ── Hero ── */}
      <div
        className="relative overflow-hidden"
        style={{
          background: isDark
            ? `linear-gradient(135deg, #1e293b 0%, #0f172a 100%)`
            : `linear-gradient(135deg, ${accent_color}12 0%, ${accent_color}04 100%)`,
          padding: hero_style === "full-bleed" ? "56px 24px" : "44px 24px",
        }}
      >
        {/* Decorative blob */}
        <div
          className="absolute top-0 right-0 w-48 h-48 rounded-full opacity-10 pointer-events-none"
          style={{ background: accent_color, transform: "translate(30%, -30%)" }}
        />

        <div
          className={`relative max-w-lg ${hero_style === "centered" ? "mx-auto text-center" : ""}`}
        >
          <p
            className="text-[11px] font-semibold uppercase tracking-widest mb-2"
            style={{ color: accent_color }}
          >
            New collection
          </p>
          <h1
            className="font-bold leading-tight mb-3"
            style={{ fontSize: 22, color: textPrimary }}
          >
            {hero_headline}
          </h1>
          <p className="text-[13px] mb-5 max-w-sm" style={{ color: textSecond }}>
            {hero_subline}
          </p>
          <div className={`flex gap-2.5 ${hero_style === "centered" ? "justify-center" : ""}`}>
            <button
              className="px-5 py-2 rounded-lg text-[12px] font-semibold text-white"
              style={btn}
            >
              {hero_cta_text}
            </button>
            <button
              className="px-4 py-2 rounded-lg text-[12px] font-semibold border"
              style={{ borderColor: cardBorder, color: textPrimary, background: "transparent" }}
            >
              Learn more
            </button>
          </div>
        </div>
      </div>

      {/* ── Featured products ── */}
      <div className="px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] font-bold" style={{ color: textPrimary }}>
            Featured products
          </p>
          <span
            className="text-[11px] font-medium flex items-center gap-1 cursor-pointer"
            style={{ color: accent_color }}
          >
            View all <ChevronRight size={11} />
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {FEATURED.map((p) => (
            <div
              key={p.id}
              className="rounded-xl overflow-hidden border cursor-pointer group"
              style={{ background: cardBg, borderColor: cardBorder }}
            >
              {/* Product image */}
              <div
                className="h-24 flex items-center justify-center text-4xl transition-transform duration-200 group-hover:scale-105"
                style={{ background: isDark ? "#374151" : "#f5f6f8" }}
              >
                {p.emoji}
              </div>
              <div className="p-2.5">
                <p className="text-[12px] font-semibold truncate" style={{ color: textPrimary }}>
                  {p.name}
                </p>
                <p className="text-[11px] mb-1.5" style={{ color: textSecond }}>{p.brand}</p>
                <div className="flex items-center justify-between">
                  <p className="text-[13px] font-bold" style={{ color: accent_color }}>
                    ${p.price.toFixed(2)}
                  </p>
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} size={9} fill={accent_color} color={accent_color} />
                    ))}
                  </div>
                </div>
                <button
                  className="w-full mt-2 py-1.5 rounded-lg text-[11px] font-semibold text-white"
                  style={btn}
                >
                  Add to cart
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Category strip ── */}
      <div className="px-4 pb-5">
        <p className="text-[13px] font-bold mb-3" style={{ color: textPrimary }}>
          Shop by category
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {["Footwear", "Electronics", "Accessories", "Apparel", "Home & Living"].map((cat) => (
            <button
              key={cat}
              className="flex-shrink-0 px-3 py-1.5 rounded-full border text-[11px] font-medium whitespace-nowrap transition-colors"
              style={{ borderColor: accent_color + "40", color: accent_color, background: accent_color + "10" }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Banner / promo strip ── */}
      <div
        className="mx-4 mb-5 rounded-xl p-5 flex items-center justify-between gap-4"
        style={{ background: accent_color, color: "white" }}
      >
        <div>
          <p className="text-[13px] font-bold mb-0.5">Spring Sale — up to 30% off</p>
          <p className="text-[11px] opacity-80">Limited time offer on selected items.</p>
        </div>
        <button
          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white"
          style={{ color: accent_color }}
        >
          Shop sale
        </button>
      </div>

      {/* ── Footer ── */}
      <footer
        className="px-6 py-5 border-t"
        style={{ background: surfaceBg, borderColor: cardBorder }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-bold mb-1" style={{ color: textPrimary }}>{store_name}</p>
            <p className="text-[11px]" style={{ color: textSecond }}>{footer_tagline}</p>
            {/* Social */}
            <div className="flex gap-2.5 mt-2.5">
              {social?.instagram && (
                <div className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: accent_color + "15", color: accent_color }}>
                  <Instagram size={12} />
                </div>
              )}
              {social?.twitter && (
                <div className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: accent_color + "15", color: accent_color }}>
                  <Twitter size={12} />
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {footer_links?.slice(0, 4).map((l) => (
              <span key={l.label} className="text-[11px] cursor-pointer hover:opacity-70 transition-opacity"
                style={{ color: textSecond }}>
                {l.label}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 pt-3 border-t flex items-center justify-between"
          style={{ borderColor: cardBorder }}>
          <p className="text-[10px]" style={{ color: textSecond }}>
            © 2026 {store_name}. All rights reserved.
          </p>
          <p className="text-[10px]" style={{ color: textSecond }}>Powered by Corn Mart</p>
        </div>
      </footer>
    </div>
  );
}

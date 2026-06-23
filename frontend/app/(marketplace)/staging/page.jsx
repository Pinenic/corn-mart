"use client";

import {
  ShoppingCart,
  Search,
  Menu,
  Star,
  ChevronRight,
  Instagram,
  Twitter,
  User,
  Heart,
  Eye,
  Plus,
} from "lucide-react";

// ─── Font stacks keyed by typography preset ───────────────────────────────────
const FONT_STACKS = {
  "modern-sans":    "'Inter', sans-serif",
  "serif-combo":    "'Playfair Display', Georgia, serif",
  "display-body":   "'Poppins', sans-serif",
  "minimal-clean":  "'DM Sans', sans-serif",
  "bold-editorial": "'Bebas Neue', 'Arial Narrow', sans-serif",
};

// Derived from typography.headingFont when using a custom font
const GOOGLE_STACKS = {
  Inter:             "'Inter', sans-serif",
  "Playfair Display":"'Playfair Display', Georgia, serif",
  "Source Sans Pro": "'Source Sans Pro', sans-serif",
  Poppins:           "'Poppins', sans-serif",
  "Open Sans":       "'Open Sans', sans-serif",
  "DM Sans":         "'DM Sans', sans-serif",
  "Bebas Neue":      "'Bebas Neue', 'Arial Narrow', sans-serif",
  Roboto:            "'Roboto', sans-serif",
  Montserrat:        "'Montserrat', sans-serif",
  Lato:              "'Lato', sans-serif",
};

// ─── Mock products — replace with your real data feed ────────────────────────
const MOCK_PRODUCTS = [
  { id: "1", name: "Classic Leather Jacket", price: 299, originalPrice: 399,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
    rating: 4.8, reviews: 124, badge: "Sale" },
  { id: "2", name: "Premium Sneakers", price: 189,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    rating: 4.9, reviews: 89 },
  { id: "3", name: "Minimalist Watch", price: 249,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    rating: 4.7, reviews: 56, badge: "New" },
  { id: "4", name: "Canvas Backpack", price: 129, originalPrice: 159,
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    rating: 4.6, reviews: 203, badge: "Sale" },
];

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&h=600&fit=crop";

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function hex(color, alpha) {
  // Append a 2-char hex alpha to a 6-char hex color string
  const a = Math.round(alpha * 255)
    .toString(16)
    .padStart(2, "0");
  return `${color}${a}`;
}

function deriveSurfaces(theme) {
  const isDark =
    theme?.preset === "dark-mode" ||
    theme?.backgroundColor?.toLowerCase().startsWith("#0") ||
    theme?.backgroundColor?.toLowerCase().startsWith("#1");

  return {
    isDark,
    pageBg:      theme?.backgroundColor || (isDark ? "#0f172a" : "#f8f9fa"),
    surfaceBg:   isDark ? "#111827" : "#ffffff",
    cardBg:      isDark ? "#1f2937" : "#ffffff",
    cardBorder:  isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
    textPrimary: isDark ? "#f9fafb" : "#0f1117",
    textSecond:  isDark ? "#9ca3af" : "#6b7280",
    accent:      theme?.primaryColor || "#10b981",
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────────────────────

function Header({ config = {}, surfaces }) {
  const { layout, showCart, showSearch } = config?.header;
  const { isDark, surfaceBg, cardBorder, textPrimary, textSecond, accent } = surfaces;

  const Logo = () => (
    <span className="font-bold text-[15px]" style={{ color: textPrimary }}>
      STOREFRONT
    </span>
  );

  const Nav = () => (
    <div className="hidden md:flex items-center gap-5 text-[12px]" style={{ color: textSecond }}>
      {["Shop", "Collections", "About"].map((l) => (
        <span key={l} className="cursor-pointer hover:opacity-70 transition-opacity">{l}</span>
      ))}
    </div>
  );

  const Icons = () => (
    <div className="flex items-center gap-2.5" style={{ color: textSecond }}>
      {showSearch && <Search size={15} className="cursor-pointer" />}
      {showCart && (
        <div className="relative cursor-pointer">
          <ShoppingCart size={15} />
          <span
            className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full text-[8px] font-bold flex items-center justify-center text-white"
            style={{ background: accent }}
          >
            2
          </span>
        </div>
      )}
      <User size={15} className="cursor-pointer" />
    </div>
  );

  const baseStyle = {
    background: layout === "transparent-overlay" ? "transparent" : surfaceBg,
    borderColor: cardBorder,
  };

  if (layout === "logo-center") {
    return (
      <nav className="border-b" style={{ ...baseStyle, borderColor: cardBorder }}>
        <div className="flex items-center justify-between px-6 py-3.5">
          <div className="w-16" />
          <Logo />
          <Icons />
        </div>
        <div className="flex justify-center pb-3">
          <Nav />
        </div>
      </nav>
    );
  }

  if (layout === "minimal") {
    return (
      <nav className="flex items-center justify-between px-6 py-3.5 border-b" style={baseStyle}>
        <Logo />
        <Icons />
      </nav>
    );
  }

  if (layout === "sidebar-style") {
    return (
      <nav className="flex items-center gap-4 px-6 py-3.5 border-b" style={baseStyle}>
        <Menu size={15} className="cursor-pointer" style={{ color: textSecond }} />
        <Logo />
        <div className="flex-1" />
        <Icons />
      </nav>
    );
  }

  if (layout === "transparent-overlay") {
    return (
      <nav className="flex items-center gap-4 px-6 py-3.5 absolute top-0 left-0 right-0 z-10" style={baseStyle}>
        <Logo />
        <div className="flex-1"><Nav /></div>
        <Icons />
      </nav>
    );
  }

  // logo-left (default)
  return (
    <nav className="flex items-center gap-4 px-6 py-3.5 border-b" style={baseStyle}>
      <span className="flex-1"><Logo /></span>
      <Nav />
      <Icons />
    </nav>
  );
}

function Hero({ config, surfaces }) {
  const { layout, title, subtitle, ctaText, textAlignment, overlayOpacity } = config.hero;
  const { isDark, accent, textPrimary, textSecond, cardBorder } = surfaces;

  const alignClass = {
    left:   "text-left items-start",
    center: "text-center items-center",
    right:  "text-right items-end",
  }[textAlignment] ?? "text-center items-center";

  const btn = { background: accent, color: "#ffffff" };
  const btnOutline = { borderColor: cardBorder, color: textPrimary, background: "transparent" };

  if (layout === "text-only") {
    return (
      <section
        className={`py-16 px-8 flex flex-col ${alignClass}`}
        style={{ background: isDark ? "#1e293b" : `${hex(accent, 0.05)}` }}
      >
        <h1 className="text-[28px] font-bold mb-3" style={{ color: textPrimary }}>{title}</h1>
        <p className="text-[14px] mb-6 max-w-lg" style={{ color: textSecond }}>{subtitle}</p>
        <button className="px-6 py-2.5 rounded-lg text-[13px] font-semibold w-fit" style={btn}>
          {ctaText}
        </button>
      </section>
    );
  }

  if (layout === "split") {
    return (
      <section className="grid md:grid-cols-2 min-h-[280px]">
        <div
          className={`flex flex-col justify-center p-8 ${alignClass}`}
          style={{ background: isDark ? "#1e293b" : `${hex(accent, 0.04)}` }}
        >
          <h1 className="text-[26px] font-bold mb-3" style={{ color: textPrimary }}>{title}</h1>
          <p className="text-[13px] mb-5 max-w-sm" style={{ color: textSecond }}>{subtitle}</p>
          <div className="flex gap-2.5 w-fit">
            <button className="px-5 py-2 rounded-lg text-[12px] font-semibold" style={btn}>{ctaText}</button>
            <button className="px-4 py-2 rounded-lg text-[12px] font-semibold border" style={btnOutline}>Learn more</button>
          </div>
        </div>
        <div className="relative min-h-[220px]">
          <img src={HERO_IMAGE} alt="Hero" className="w-full h-full object-cover" crossOrigin="anonymous" />
        </div>
      </section>
    );
  }

  // full-width / carousel / video-overlay all share the banner pattern
  const isVideo = layout === "video-overlay";
  return (
    <section className="relative overflow-hidden" style={{ height: 280 }}>
      <img src={HERO_IMAGE} alt="Hero" className="w-full h-full object-cover" crossOrigin="anonymous" />
      <div
        className="absolute inset-0"
        style={{
          background: isVideo
            ? "linear-gradient(to right, rgba(0,0,0,0.75) 0%, transparent 100%)"
            : `rgba(0,0,0,${overlayOpacity / 100})`,
        }}
      />
      <div className={`absolute inset-0 flex flex-col justify-center px-8 ${isVideo ? "text-left items-start" : alignClass}`}>
        <h1 className="text-[26px] font-bold text-white mb-3">{title}</h1>
        <p className="text-[13px] text-white/80 mb-5 max-w-md">{subtitle}</p>
        <div className="flex gap-2.5">
          <button className="px-5 py-2 rounded-lg text-[12px] font-semibold" style={btn}>{ctaText}</button>
          {isVideo && (
            <button className="px-4 py-2 rounded-lg text-[12px] font-semibold border border-white/40 text-white bg-white/10">
              Watch Video
            </button>
          )}
        </div>
      </div>
    </section>
  );
}

function ProductCard({ product, cardConfig, gridConfig, surfaces }) {
  const { style, showRatings, showPrice, showDiscount, buttonStyle } = cardConfig;
  const { imageRatio } = gridConfig;
  const { isDark, accent, textPrimary, textSecond, cardBg, cardBorder } = surfaces;

  const aspectCls = imageRatio === "portrait" ? "aspect-[3/4]" : "aspect-square";
  const imgBg = isDark ? "#374151" : "#f5f6f8";

  const AddBtn = () => {
    const styles = {
      filled:  { background: accent, color: "#fff", border: "none" },
      outline: { background: "transparent", color: accent, border: `1px solid ${accent}` },
      text:    { background: "transparent", color: accent, border: "none" },
    }[buttonStyle] ?? { background: accent, color: "#fff" };
    return (
      <button className="w-full mt-2 py-1.5 rounded-lg text-[11px] font-semibold" style={styles}>
        Add to cart
      </button>
    );
  };

  const Meta = () => (
    <div className="p-2.5">
      <p className="text-[12px] font-semibold truncate" style={{ color: textPrimary }}>{product.name}</p>
      {showRatings && (
        <div className="flex items-center gap-1 my-0.5">
          <Star size={9} fill={accent} color={accent} />
          <span className="text-[10px]" style={{ color: textSecond }}>{product.rating} ({product.reviews})</span>
        </div>
      )}
      {showPrice && (
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] font-bold" style={{ color: accent }}>${product.price}</span>
          {product.originalPrice && showDiscount && (
            <span className="text-[11px] line-through" style={{ color: textSecond }}>${product.originalPrice}</span>
          )}
        </div>
      )}
      <AddBtn />
    </div>
  );

  if (style === "elevated") {
    return (
      <div className="rounded-xl overflow-hidden shadow-lg" style={{ background: cardBg }}>
        <div className={`relative overflow-hidden ${aspectCls}`} style={{ background: imgBg }}>
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" crossOrigin="anonymous" />
          {product.badge && showDiscount && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white" style={{ background: accent }}>{product.badge}</span>
          )}
        </div>
        <Meta />
      </div>
    );
  }

  if (style === "border-only") {
    return (
      <div className="rounded-lg overflow-hidden border" style={{ borderColor: cardBorder, background: cardBg }}>
        <div className={`relative overflow-hidden ${aspectCls}`} style={{ background: imgBg }}>
          <img src={product.image} alt={product.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
          {product.badge && showDiscount && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold" style={{ border: `1px solid ${cardBorder}`, background: cardBg, color: textPrimary }}>{product.badge}</span>
          )}
        </div>
        <Meta />
      </div>
    );
  }

  if (style === "hover-actions") {
    return (
      <div className="group rounded-xl overflow-hidden border cursor-pointer" style={{ background: cardBg, borderColor: cardBorder }}>
        <div className={`relative overflow-hidden ${aspectCls}`} style={{ background: imgBg }}>
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" crossOrigin="anonymous" />
          {product.badge && showDiscount && (
            <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white" style={{ background: accent }}>{product.badge}</span>
          )}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            {[Heart, Eye, ShoppingCart].map((Icon, i) => (
              <button key={i} className="p-2 bg-white rounded-full hover:scale-110 transition-transform">
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
      <div className="group rounded-xl overflow-hidden border cursor-pointer" style={{ background: cardBg, borderColor: cardBorder }}>
        <div className={`relative overflow-hidden ${aspectCls}`} style={{ background: imgBg }}>
          <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" crossOrigin="anonymous" />
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
    <div className="group rounded-xl overflow-hidden border cursor-pointer" style={{ background: cardBg, borderColor: cardBorder }}>
      <div className={`relative overflow-hidden ${aspectCls} transition-transform duration-200 group-hover:scale-[1.02]`} style={{ background: imgBg }}>
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" crossOrigin="anonymous" />
        {product.badge && showDiscount && (
          <span className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold text-white" style={{ background: accent }}>{product.badge}</span>
        )}
      </div>
      <Meta />
    </div>
  );
}

function ProductGrid({ config, surfaces }) {
  const { layout, spacing } = config.productGrid;
  const { textPrimary, accent } = surfaces;

  const gapCls = { tight: "gap-2", normal: "gap-3", wide: "gap-6" }[spacing] ?? "gap-3";

  const gridCls = {
    "grid-2": `grid grid-cols-2 ${gapCls}`,
    "grid-3": `grid grid-cols-2 md:grid-cols-3 ${gapCls}`,
    "grid-4": `grid grid-cols-2 md:grid-cols-4 ${gapCls}`,
    masonry:  `columns-2 ${gapCls}`,
    list:     `flex flex-col ${gapCls}`,
  }[layout] ?? `grid grid-cols-2 md:grid-cols-4 ${gapCls}`;

  const products = layout === "list" ? MOCK_PRODUCTS : MOCK_PRODUCTS.slice(0, 4);

  if (layout === "list") {
    return (
      <section className="px-4 py-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[14px] font-bold" style={{ color: textPrimary }}>Featured products</p>
          <span className="text-[11px] font-medium flex items-center gap-1 cursor-pointer" style={{ color: accent }}>
            View all <ChevronRight size={11} />
          </span>
        </div>
        <div className={gridCls}>
          {products.map((p) => (
            <div key={p.id} className="flex gap-3 p-3 rounded-lg border" style={{ borderColor: surfaces.cardBorder, background: surfaces.cardBg }}>
              <img src={p.image} alt={p.name} className="w-20 h-20 object-cover rounded-lg" crossOrigin="anonymous" />
              <div className="flex-1">
                <p className="text-[13px] font-semibold mb-1" style={{ color: surfaces.textPrimary }}>{p.name}</p>
                <p className="text-[13px] font-bold" style={{ color: accent }}>${p.price}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="px-4 py-5">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[14px] font-bold" style={{ color: textPrimary }}>Featured products</p>
        <span className="text-[11px] font-medium flex items-center gap-1 cursor-pointer" style={{ color: accent }}>
          View all <ChevronRight size={11} />
        </span>
      </div>
      <div className={gridCls}>
        {products.map((p, i) => (
          <div key={p.id} className={layout === "masonry" ? `break-inside-avoid mb-${i % 2 === 0 ? "4" : "0"}` : ""}>
            <ProductCard
              product={p}
              cardConfig={config.productCard}
              gridConfig={config.productGrid}
              surfaces={surfaces}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export
// ─────────────────────────────────────────────────────────────────────────────

/**
 * StorefrontPreview
 *
 * Accepts the new structured `config` object from branding-context:
 *   { header, hero, productGrid, productCard, theme, typography }
 *
 * Pass as: <StorefrontPreview config={config} />
 */
export default function StorefrontPreview() {
    const config = {
  header: {
    layout: "logo-left",
    logoPosition: "left",
    navAlignment: "center",
    showCart: true,
    showSearch: true,
  },
  hero: {
    layout: "full-width",
    title: "Summer Collection 2024",
    subtitle: "Discover the latest trends in fashion",
    ctaText: "Shop Now",
    textAlignment: "center",
    overlayOpacity: 40,
  },
  productGrid: {
    layout: "grid-4",
    spacing: "normal",
    imageRatio: "square",
    pagination: "pagination",
  },
  productCard: {
    style: "minimal",
    showRatings: true,
    showPrice: true,
    showDiscount: true,
    buttonStyle: "filled",
  },
  theme: {
    preset: "light-mode",
    primaryColor: "#10B981",
    secondaryColor: "#1F2937",
    backgroundColor: "transparent",
    accentColor: "#34D399",
  },
  typography: {
    preset: "modern-sans",
    headingFont: "Inter",
    bodyFont: "Inter",
    scale: "medium",
  },
};
  const surfaces = deriveSurfaces(config.theme);
  const { isDark, pageBg, surfaceBg, cardBorder, textSecond, accent } = surfaces;

  const fontStack =
    GOOGLE_STACKS[config?.typography?.headingFont] ??
    FONT_STACKS[config?.typography?.preset] ??
    "'DM Sans', sans-serif";

  const isTransparent = config?.header?.layout === "transparent-overlay";

  return (
    <div
    className="max-w-7xl m-auto"
      style={{
        fontFamily: fontStack,
        background: pageBg,
        borderRadius: 1,
        overflow: "hidden",
        // border: `0.5px solid ${cardBorder}`,
        fontSize: 13,
        lineHeight: 1.5,
      }}
    >
      {/* Header sits inside a relative wrapper when transparent */}
      <div className={isTransparent ? "relative" : ""}>
        <Header config={config} surfaces={surfaces} />
        <Hero config={config} surfaces={surfaces} />
      </div>

      <ProductGrid config={config} surfaces={surfaces} />

      {/* Category strip */}
      <div className="px-4 pb-5">
        <p className="text-[13px] font-bold mb-3" style={{ color: surfaces.textPrimary }}>
          Shop by category
        </p>
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {["Footwear", "Electronics", "Accessories", "Apparel", "Home"].map((cat) => (
            <button
              key={cat}
              className="flex-shrink-0 px-3 py-1.5 rounded-full border text-[11px] font-medium whitespace-nowrap"
              style={{ borderColor: `${accent}40`, color: accent, background: `${accent}10` }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Promo strip */}
      <div
        className="mx-4 mb-5 rounded-xl p-5 flex items-center justify-between gap-4"
        style={{ background: accent, color: "white" }}
      >
        <div>
          <p className="text-[13px] font-bold mb-0.5">Spring Sale — up to 30% off</p>
          <p className="text-[11px] opacity-80">Limited time offer on selected items.</p>
        </div>
        <button
          className="flex-shrink-0 px-3 py-1.5 rounded-lg text-[11px] font-semibold bg-white"
          style={{ color: accent }}
        >
          Shop sale
        </button>
      </div>

      {/* Footer */}
      <footer
        className="px-6 py-5 border-t"
        style={{ background: surfaceBg, borderColor: cardBorder }}
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[13px] font-bold mb-1" style={{ color: surfaces.textPrimary }}>
              STOREFRONT
            </p>
            <p className="text-[11px]" style={{ color: textSecond }}>
              Your brand, your way.
            </p>
            <div className="flex gap-2.5 mt-2.5">
              {[Instagram, Twitter].map((Icon, i) => (
                <div
                  key={i}
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ background: `${accent}15`, color: accent }}
                >
                  <Icon size={12} />
                </div>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-1">
            {["Privacy", "Terms", "Contact", "FAQ"].map((l) => (
              <span
                key={l}
                className="text-[11px] cursor-pointer hover:opacity-70 transition-opacity"
                style={{ color: textSecond }}
              >
                {l}
              </span>
            ))}
          </div>
        </div>
        <div
          className="mt-4 pt-3 border-t flex items-center justify-between"
          style={{ borderColor: cardBorder }}
        >
          <p className="text-[10px]" style={{ color: textSecond }}>
            © 2026 STOREFRONT. All rights reserved.
          </p>
          <p className="text-[10px]" style={{ color: textSecond }}>
            Powered by Corn Mart
          </p>
        </div>
      </footer>
    </div>
  );
}

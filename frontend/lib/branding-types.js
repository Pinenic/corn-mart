// Type strings kept as JSDoc for IDE support, but no TS syntax

/**
 * @typedef {'logo-left' | 'logo-center' | 'minimal' | 'sidebar-style' | 'transparent-overlay'} HeaderLayout
 * @typedef {'full-width' | 'split' | 'carousel' | 'text-only' | 'video-overlay'} HeroLayout
 * @typedef {'grid-2' | 'grid-3' | 'grid-4' | 'masonry' | 'list'} ProductGridLayout
 * @typedef {'minimal' | 'hover-actions' | 'quick-add' | 'elevated' | 'border-only'} ProductCardStyle
 * @typedef {'light-minimal' | 'dark-mode' | 'pastel-soft' | 'bold-vibrant' | 'monochrome'} ThemePreset
 * @typedef {'modern-sans' | 'serif-combo' | 'display-body' | 'minimal-clean' | 'bold-editorial'} TypographyPreset
 * @typedef {'tight' | 'normal' | 'wide'} GridSpacing
 * @typedef {'square' | 'portrait'} ImageRatio
 * @typedef {'small' | 'medium' | 'large'} FontScale
 */

/** @type {import('./branding-types').BrandingConfig} */
export const defaultBrandingConfig = {
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
    layout: "grid-3",
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
    preset: "dark-mode",
    primaryColor: "#10B981",
    secondaryColor: "#1F2937",
    backgroundColor: "#111827",
    accentColor: "#34D399",
  },
  typography: {
    preset: "modern-sans",
    headingFont: "Inter",
    bodyFont: "Inter",
    scale: "medium",
  },
};

export const mockProducts = [
  {
    id: "1",
    name: "Classic Leather Jacket",
    price: 299,
    originalPrice: 399,
    image:
      "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop",
    rating: 4.8,
    reviews: 124,
    badge: "Sale",
  },
  {
    id: "2",
    name: "Premium Sneakers",
    price: 189,
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop",
    rating: 4.9,
    reviews: 89,
  },
  {
    id: "3",
    name: "Minimalist Watch",
    price: 249,
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&h=400&fit=crop",
    rating: 4.7,
    reviews: 56,
    badge: "New",
  },
  {
    id: "4",
    name: "Canvas Backpack",
    price: 129,
    originalPrice: 159,
    image:
      "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&h=400&fit=crop",
    rating: 4.6,
    reviews: 203,
    badge: "Sale",
  },
  {
    id: "5",
    name: "Wireless Earbuds",
    price: 179,
    image:
      "https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400&h=400&fit=crop",
    rating: 4.5,
    reviews: 312,
  },
  {
    id: "6",
    name: "Sunglasses",
    price: 159,
    image:
      "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400&h=400&fit=crop",
    rating: 4.4,
    reviews: 78,
    badge: "Popular",
  },
];

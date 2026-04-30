// ─────────────────────────────────────────────────────────────
//  Branding configuration — the data shape your backend would
//  store in a `store_branding` table (1:1 with stores).
// ─────────────────────────────────────────────────────────────

export const FONTS = [
  { value: "DM Sans",      label: "DM Sans",      stack: "'DM Sans', sans-serif"      },
  { value: "Inter",        label: "Inter",         stack: "'Inter', sans-serif"         },
  { value: "Playfair Display", label: "Playfair Display", stack: "'Playfair Display', serif" },
  { value: "Space Grotesk",label: "Space Grotesk", stack: "'Space Grotesk', sans-serif" },
  { value: "Lato",         label: "Lato",          stack: "'Lato', sans-serif"          },
  { value: "Merriweather", label: "Merriweather",  stack: "'Merriweather', serif"       },
];

export const THEMES = [
  { value: "minimal",  label: "Minimal",   description: "Clean, lots of whitespace" },
  { value: "bold",     label: "Bold",      description: "High contrast, strong type" },
  { value: "warm",     label: "Warm",      description: "Earthy tones, friendly"    },
  { value: "dark",     label: "Dark",      description: "Night-mode storefront"     },
];

export const ACCENT_COLORS = [
  { hex: "#0057ff", name: "Ocean Blue"   },
  { hex: "#7c3aed", name: "Violet"       },
  { hex: "#059669", name: "Emerald"      },
  { hex: "#dc2626", name: "Ruby"         },
  { hex: "#d97706", name: "Amber"        },
  { hex: "#db2777", name: "Rose"         },
  { hex: "#0891b2", name: "Cyan"         },
  { hex: "#4f46e5", name: "Indigo"       },
];

export const DEFAULT_BRANDING = {
  // Identity
  store_name:    "Corn Mart Shop",
  tagline:       "Shop smart, live well",
  domain:        "storely.myshop.com",
  description:   "Premium lifestyle products curated for the modern shopper.",

  // Visuals
  accent_color:  "#0057ff",
  theme:         "minimal",
  font:          "DM Sans",
  logo_url:      null,
  favicon_url:   null,
  banner_url:    null,

  // Hero section
  hero_headline: "New arrivals are here",
  hero_subline:  "Discover our latest collection of curated favourites.",
  hero_cta_text: "Shop now",
  hero_cta_url:  "/shop",
  hero_style:    "centered", // centered | split | full-bleed

  // Announcement bar
  announcement_enabled: true,
  announcement_text: "🚚 Free shipping on orders over $50 — Use code SHIP50",
  announcement_bg:   "#0057ff",

  // Social links
  social: {
    instagram: "storely",
    twitter:   "storely",
    facebook:  "",
    tiktok:    "",
  },

  // Footer
  footer_tagline: "Made with ♥ for great shopping",
  footer_links: [
    { label: "About us",       url: "/about"    },
    { label: "Contact",        url: "/contact"  },
    { label: "Returns policy", url: "/returns"  },
    { label: "Privacy policy", url: "/privacy"  },
  ],

  // SEO
  seo_title:       "Corn Mart Shop — Premium lifestyle products",
  seo_description: "Discover premium lifestyle products curated for the modern shopper.",

  // Status
  is_published:  true,
  last_updated:  "2026-03-15T14:22:00Z",
};

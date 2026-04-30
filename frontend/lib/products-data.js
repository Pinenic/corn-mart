// ─────────────────────────────────────────────────────────────
//  Mock data — mirrors the Supabase schema exactly
//  products → product_variants → product_images
//  Plus promotions (custom feature)
// ─────────────────────────────────────────────────────────────

export const CATEGORIES = [
  "Footwear", "Electronics", "Accessories", "Apparel",
  "Home & Living", "Sports", "Beauty", "Books",
];

export const SUBCATEGORIES = {
  Footwear:      [{ id: 1, name: "Sneakers" }, { id: 2, name: "Boots" }, { id: 3, name: "Sandals" }],
  Electronics:   [{ id: 4, name: "Audio" }, { id: 5, name: "Wearables" }, { id: 6, name: "Lighting" }],
  Accessories:   [{ id: 7, name: "Bags" }, { id: 8, name: "Jewellery" }, { id: 9, name: "Watches" }],
  Apparel:       [{ id: 10, name: "Tops" }, { id: 11, name: "Bottoms" }, { id: 12, name: "Outerwear" }],
  "Home & Living":[{ id: 13, name: "Lighting" }, { id: 14, name: "Decor" }, { id: 15, name: "Storage" }],
};

// ── Product option types (scalable) ──────────────────────────
// Each option has a name and a list of values.
// The backend would store these in a product_options table
// and product_option_values table (see architecture notes).
export const DEFAULT_OPTION_TYPES = [
  { name: "Size",    values: ["XS","S","M","L","XL","XXL"] },
  { name: "Color",   values: ["Black","White","Navy","Grey","Red","Green","Blue","Yellow","Pink"] },
  { name: "Material",values: ["Cotton","Linen","Polyester","Wool","Leather","Vegan Leather"] },
  { name: "Storage", values: ["64GB","128GB","256GB","512GB","1TB"] },
  { name: "Finish",  values: ["Matte","Gloss","Brushed","Anodised"] },
];

// ── Products ─────────────────────────────────────────────────
export const PRODUCTS = [
  {
    id: "prod-001",
    store_id: "store-001",
    name: "Air Runner Pro",
    description: "Lightweight performance running shoe with responsive foam midsole and breathable mesh upper. Engineered for long-distance comfort.",
    price: 129.99,
    stock: 42,
    category: "Footwear",
    subcat_id: 1,
    brand: "Stridelab",
    thumbnail_url: null,
    is_active: true,
    emoji: "👟",
    created_at: "2026-01-10T09:00:00Z",
    updated_at: "2026-03-01T14:22:00Z",
    options: [
      { name: "Size",  values: ["38","39","40","41","42","43","44","45"] },
      { name: "Color", values: ["Black","White","Navy"] },
    ],
    variants: [
      { id: "var-001a", product_id: "prod-001", name: "Black / Size 42", sku: "ARK-BLK-42", price: 129.99, stock: 12, reserved_stock: 2, low_stock_threshold: 3, is_active: true, available_stock: 10 },
      { id: "var-001b", product_id: "prod-001", name: "White / Size 41", sku: "ARK-WHT-41", price: 129.99, stock: 8,  reserved_stock: 0, low_stock_threshold: 3, is_active: true, available_stock: 8  },
      { id: "var-001c", product_id: "prod-001", name: "Navy / Size 40",  sku: "ARK-NVY-40", price: 129.99, stock: 15, reserved_stock: 1, low_stock_threshold: 3, is_active: true, available_stock: 14 },
      { id: "var-001d", product_id: "prod-001", name: "Black / Size 38", sku: "ARK-BLK-38", price: 119.99, stock: 7,  reserved_stock: 0, low_stock_threshold: 3, is_active: true, available_stock: 7  },
    ],
    images: [
      { id: "img-001a", product_id: "prod-001", variant_id: null,      image_url: "/images/air-runner-1.jpg", is_thumbnail: true,  sort_order: 0 },
      { id: "img-001b", product_id: "prod-001", variant_id: null,      image_url: "/images/air-runner-2.jpg", is_thumbnail: false, sort_order: 1 },
      { id: "img-001c", product_id: "prod-001", variant_id: "var-001a",image_url: "/images/air-runner-blk.jpg",is_thumbnail: false, sort_order: 2 },
    ],
  },
  {
    id: "prod-002",
    store_id: "store-001",
    name: "Studio Buds X",
    description: "True wireless earbuds with active noise cancellation, 30-hour battery life, and custom-tuned drivers for audiophile-grade sound.",
    price: 89.00,
    stock: 17,
    category: "Electronics",
    subcat_id: 4,
    brand: "Sonara",
    thumbnail_url: null,
    is_active: true,
    emoji: "🎧",
    created_at: "2026-01-15T10:00:00Z",
    updated_at: "2026-02-20T11:00:00Z",
    options: [
      { name: "Color", values: ["Midnight Black","Pearl White","Rose Gold"] },
    ],
    variants: [
      { id: "var-002a", product_id: "prod-002", name: "Midnight Black", sku: "SBX-BLK", price: 89.00, stock: 8,  reserved_stock: 1, low_stock_threshold: 3, is_active: true, available_stock: 7  },
      { id: "var-002b", product_id: "prod-002", name: "Pearl White",    sku: "SBX-WHT", price: 89.00, stock: 5,  reserved_stock: 0, low_stock_threshold: 3, is_active: true, available_stock: 5  },
      { id: "var-002c", product_id: "prod-002", name: "Rose Gold",      sku: "SBX-RSG", price: 94.00, stock: 4,  reserved_stock: 0, low_stock_threshold: 3, is_active: true, available_stock: 4  },
    ],
    images: [
      { id: "img-002a", product_id: "prod-002", variant_id: null, image_url: "/images/studio-buds-1.jpg", is_thumbnail: true,  sort_order: 0 },
      { id: "img-002b", product_id: "prod-002", variant_id: null, image_url: "/images/studio-buds-2.jpg", is_thumbnail: false, sort_order: 1 },
    ],
  },
  {
    id: "prod-003",
    store_id: "store-001",
    name: "Canvas Tote",
    description: "Durable 12oz canvas tote with reinforced handles and interior zip pocket. Naturally dyed. Ships flat-packed.",
    price: 34.00,
    stock: 200,
    category: "Accessories",
    subcat_id: 7,
    brand: "Earthkin",
    thumbnail_url: null,
    is_active: true,
    emoji: "👜",
    created_at: "2026-02-01T08:00:00Z",
    updated_at: "2026-02-28T16:00:00Z",
    options: [
      { name: "Color", values: ["Natural","Black","Olive","Sand"] },
    ],
    variants: [
      { id: "var-003a", product_id: "prod-003", name: "Natural", sku: "CVT-NAT", price: 34.00, stock: 80, reserved_stock: 5, low_stock_threshold: 10, is_active: true, available_stock: 75 },
      { id: "var-003b", product_id: "prod-003", name: "Black",   sku: "CVT-BLK", price: 34.00, stock: 60, reserved_stock: 3, low_stock_threshold: 10, is_active: true, available_stock: 57 },
      { id: "var-003c", product_id: "prod-003", name: "Olive",   sku: "CVT-OLV", price: 34.00, stock: 40, reserved_stock: 2, low_stock_threshold: 10, is_active: true, available_stock: 38 },
      { id: "var-003d", product_id: "prod-003", name: "Sand",    sku: "CVT-SND", price: 34.00, stock: 20, reserved_stock: 0, low_stock_threshold: 10, is_active: true, available_stock: 20 },
    ],
    images: [
      { id: "img-003a", product_id: "prod-003", variant_id: null, image_url: "/images/canvas-tote-1.jpg", is_thumbnail: true, sort_order: 0 },
    ],
  },
  {
    id: "prod-004",
    store_id: "store-001",
    name: "Slate Watch",
    description: "Minimalist automatic watch with sapphire crystal glass, stainless steel case, and genuine leather strap. Water resistant to 50m.",
    price: 199.00,
    stock: 3,
    category: "Accessories",
    subcat_id: 9,
    brand: "Meridian",
    thumbnail_url: null,
    is_active: true,
    emoji: "⌚",
    created_at: "2025-12-01T12:00:00Z",
    updated_at: "2026-03-10T09:00:00Z",
    options: [
      { name: "Finish", values: ["Graphite","Silver","Gold"] },
      { name: "Strap",  values: ["Black Leather","Brown Leather","Steel Mesh"] },
    ],
    variants: [
      { id: "var-004a", product_id: "prod-004", name: "Graphite / Black Leather", sku: "SLW-GRF-BLK", price: 199.00, stock: 2, reserved_stock: 0, low_stock_threshold: 3, is_active: true, available_stock: 2 },
      { id: "var-004b", product_id: "prod-004", name: "Silver / Brown Leather",   sku: "SLW-SLV-BRN", price: 199.00, stock: 1, reserved_stock: 0, low_stock_threshold: 3, is_active: true, available_stock: 1 },
      { id: "var-004c", product_id: "prod-004", name: "Gold / Steel Mesh",        sku: "SLW-GLD-MSH", price: 229.00, stock: 0, reserved_stock: 0, low_stock_threshold: 3, is_active: false, available_stock: 0 },
    ],
    images: [
      { id: "img-004a", product_id: "prod-004", variant_id: null, image_url: "/images/slate-watch-1.jpg", is_thumbnail: true,  sort_order: 0 },
      { id: "img-004b", product_id: "prod-004", variant_id: null, image_url: "/images/slate-watch-2.jpg", is_thumbnail: false, sort_order: 1 },
    ],
  },
  {
    id: "prod-005",
    store_id: "store-001",
    name: "Linen Shirt",
    description: "Relaxed-fit linen shirt in stone-washed fabric. Breathable and perfect for warm weather. Ethically sourced.",
    price: 55.00,
    stock: 0,
    category: "Apparel",
    subcat_id: 10,
    brand: "Earthkin",
    thumbnail_url: null,
    is_active: false,
    emoji: "👔",
    created_at: "2026-01-20T07:00:00Z",
    updated_at: "2026-03-05T10:00:00Z",
    options: [
      { name: "Size",  values: ["XS","S","M","L","XL","XXL"] },
      { name: "Color", values: ["White","Beige","Terracotta","Sage"] },
    ],
    variants: [
      { id: "var-005a", product_id: "prod-005", name: "White / Medium",     sku: "LSH-WHT-M",  price: 55.00, stock: 0, reserved_stock: 0, low_stock_threshold: 5, is_active: false, available_stock: 0 },
      { id: "var-005b", product_id: "prod-005", name: "Beige / Large",      sku: "LSH-BEG-L",  price: 55.00, stock: 0, reserved_stock: 0, low_stock_threshold: 5, is_active: false, available_stock: 0 },
      { id: "var-005c", product_id: "prod-005", name: "Terracotta / Small", sku: "LSH-TRC-S",  price: 55.00, stock: 0, reserved_stock: 0, low_stock_threshold: 5, is_active: false, available_stock: 0 },
    ],
    images: [
      { id: "img-005a", product_id: "prod-005", variant_id: null, image_url: "/images/linen-shirt-1.jpg", is_thumbnail: true, sort_order: 0 },
    ],
  },
  {
    id: "prod-006",
    store_id: "store-001",
    name: "Bamboo Lamp",
    description: "Hand-woven bamboo table lamp with warm LED bulb included. Pairs with any natural or boho interior aesthetic.",
    price: 78.00,
    stock: 24,
    category: "Home & Living",
    subcat_id: 13,
    brand: "Earthkin",
    thumbnail_url: null,
    is_active: true,
    emoji: "🪔",
    created_at: "2026-02-15T11:00:00Z",
    updated_at: "2026-03-08T15:00:00Z",
    options: [
      { name: "Finish", values: ["Natural","Dark","White-washed"] },
    ],
    variants: [
      { id: "var-006a", product_id: "prod-006", name: "Natural",     sku: "BML-NAT", price: 78.00, stock: 12, reserved_stock: 1, low_stock_threshold: 4, is_active: true, available_stock: 11 },
      { id: "var-006b", product_id: "prod-006", name: "Dark",        sku: "BML-DRK", price: 78.00, stock: 8,  reserved_stock: 0, low_stock_threshold: 4, is_active: true, available_stock: 8  },
      { id: "var-006c", product_id: "prod-006", name: "White-washed",sku: "BML-WHT", price: 84.00, stock: 4,  reserved_stock: 0, low_stock_threshold: 4, is_active: true, available_stock: 4  },
    ],
    images: [
      { id: "img-006a", product_id: "prod-006", variant_id: null, image_url: "/images/bamboo-lamp-1.jpg", is_thumbnail: true, sort_order: 0 },
    ],
  },
];

// ── Promotions ────────────────────────────────────────────────
export const PROMOTION_TYPES = [
  { value: "percentage",  label: "Percentage off",    example: "20% off" },
  { value: "fixed",       label: "Fixed amount off",  example: "$10 off" },
  { value: "bogo",        label: "Buy X get Y free",  example: "Buy 2 get 1 free" },
  { value: "free_shipping",label: "Free shipping",    example: "Free shipping" },
  { value: "bundle",      label: "Bundle deal",       example: "3 for $99" },
];

export const PROMOTIONS = [
  {
    id: "promo-001",
    name: "Spring Sale",
    code: "SPRING20",
    type: "percentage",
    value: 20,
    applies_to: "all",
    product_ids: [],
    category_ids: [],
    min_order_value: 50,
    max_uses: 500,
    uses: 142,
    starts_at: "2026-03-01",
    ends_at: "2026-03-31",
    is_active: true,
    created_at: "2026-02-25T10:00:00Z",
  },
  {
    id: "promo-002",
    name: "Welcome Discount",
    code: "WELCOME10",
    type: "fixed",
    value: 10,
    applies_to: "all",
    product_ids: [],
    category_ids: [],
    min_order_value: 30,
    max_uses: null,
    uses: 891,
    starts_at: "2026-01-01",
    ends_at: null,
    is_active: true,
    created_at: "2025-12-20T08:00:00Z",
  },
  {
    id: "promo-003",
    name: "Footwear BOGO",
    code: "SHOE2GET1",
    type: "bogo",
    value: null,
    applies_to: "category",
    product_ids: [],
    category_ids: ["Footwear"],
    min_order_value: null,
    max_uses: 100,
    uses: 38,
    starts_at: "2026-03-10",
    ends_at: "2026-04-10",
    is_active: true,
    created_at: "2026-03-08T12:00:00Z",
  },
  {
    id: "promo-004",
    name: "Electronics Free Ship",
    code: "TECHSHIP",
    type: "free_shipping",
    value: null,
    applies_to: "category",
    product_ids: [],
    category_ids: ["Electronics"],
    min_order_value: 60,
    max_uses: 200,
    uses: 200,
    starts_at: "2026-02-01",
    ends_at: "2026-02-28",
    is_active: false,
    created_at: "2026-01-28T09:00:00Z",
  },
];

// ── Helpers ───────────────────────────────────────────────────
export function getStockStatus(product) {
  const total = product.variants.reduce((s, v) => s + v.available_stock, 0);
  if (!product.is_active) return { label: "Inactive",      variant: "default"  };
  if (total === 0)        return { label: "Out of stock",  variant: "danger"   };
  const threshold = Math.min(...product.variants.map(v => v.low_stock_threshold));
  if (total <= threshold) return { label: "Low stock",     variant: "warning"  };
  return                         { label: "Active",        variant: "success"  };
}

export function getTotalStock(product) {
  return product.variants.reduce((s, v) => s + v.available_stock, 0);
}

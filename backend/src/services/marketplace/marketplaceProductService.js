// src/services/marketplace/marketplaceProductService.js
// Public product queries for buyers.
// Only returns active products from the catalogue.
// Product detail includes active variants and images.

import { supabaseAdmin } from "../../config/supabase.js";

// Fields safe to expose publicly — no internal stock management details
const PRODUCT_PUBLIC_FIELDS = `
  id, variants:product_variants(*), images:product_images(*), store_id, name, description, price, stock,
  category, brand, thumbnail_url, subcat_id,
  is_active, created_at, updated_at
`.trim();

// Variant fields for buyers — available_stock is the key field they care about.
// We expose available_stock (generated: stock - reserved_stock) not raw stock,
// so buyers see accurate availability without seeing reservation internals.
const VARIANT_PUBLIC_FIELDS = `
  id, product_id, name, sku, price,
  available_stock, description, is_active
`.trim();

const marketplaceProductService = {

  // ── Global product search ────────────────────────────────────
  // Searches across ALL stores — the full marketplace catalogue.
  // Only active products from active stores are returned.
  async list({ page, limit, search, category, subcat_id, min_price, max_price, store_id, sort, order }) {
    let query = supabaseAdmin
      .from("products")
      .select(`${PRODUCT_PUBLIC_FIELDS}, store:store_id(id, name, logo, is_verified)`, { count: "exact" })
      .eq("is_active", true);

    // Filter to a specific store (used by store profile product tab)
    if (store_id) query = query.eq("store_id", store_id);

    if (search?.trim()) {
      // Search name and description for the query term
      query = query.or(
        `name.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%`
      );
    }

    if (category) query = query.eq("category", category);
    if (subcat_id) query = query.eq("subcat_id", subcat_id);
    if (min_price != null) query = query.gte("price", min_price);
    if (max_price != null) query = query.lte("price", max_price);

    const from = (page - 1) * limit;
    query = query
      .order(sort, { ascending: order === "asc" })
      .range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return { products: data, total: count };
  },

  // ── Products for a specific store ────────────────────────────
  // Used on the store's public profile page — filters by store_id
  // and returns only active products.
  async listForStore(storeId, { page, limit, search, category, sort, order }) {
    let query = supabaseAdmin
      .from("products")
      .select(PRODUCT_PUBLIC_FIELDS, VARIANT_PUBLIC_FIELDS, { count: "exact" })
      .eq("store_id", storeId)
      .eq("is_active", true);

    if (search?.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }
    if (category) query = query.eq("category", category);

    const from = (page - 1) * limit;
    query = query
      .order(sort, { ascending: order === "asc" })
      .range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return { products: data, total: count };
  },

  // ── Single product detail ─────────────────────────────────────
  // Returns the product with its active variants and all images.
  // Variants with available_stock <= 0 are still returned so the
  // buyer can see them as "out of stock" rather than invisible.
  async getById(productId) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(`
        ${PRODUCT_PUBLIC_FIELDS},
        store:store_id(id, name, logo, is_verified, followers_count)
      `)
      .eq("id", productId)
      .eq("is_active", true)
      .single();

      console.log("id: ",productId, "data: ",data , "error: ", error);

    if (error || !data) return null;

    // Only return active variants — inactive variants are fully hidden from buyers
    data.variants = (data.variants ?? [])
      .filter((v) => v.is_active)
      .sort((a, b) => a.name.localeCompare(b.name));

    // Sort images by sort_order
    data.images = (data.images ?? [])
      .sort((a, b) => a.sort_order - b.sort_order);

    return data;
  },
};

export default marketplaceProductService;

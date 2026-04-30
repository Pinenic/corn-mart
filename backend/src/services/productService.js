// src/services/productService.js
// All database operations for products, product_variants, and product_images.
//
// Key design decisions:
//
// 1. DELETE = soft delete (is_active = false) for products and variants.
//    Hard-deleting a product that exists in order history breaks the audit
//    trail. Use is_active=false to "archive" instead.
//    Only product_images are hard-deleted (they're just media).
//
// 2. available_stock is a GENERATED column (stock - reserved_stock).
//    Never write to it — the DB computes it. All stock changes must
//    target the `stock` or `reserved_stock` columns.
//
// 3. images jsonb on products is treated as read-only legacy data.
//    product_images table is the canonical source.

import { supabaseAdmin } from "../config/supabase.js";

const PRODUCT_FIELDS = `
  id, variants:product_variants(*), images:product_images(*), store_id, name, description, price, stock,
  category, brand, thumbnail_url, subcat_id,
  is_active, created_at, updated_at
`.trim();

const VARIANT_FIELDS = `
  id, product_id, name, sku, price, stock,
  reserved_stock, stock, low_stock_threshold,
  description, is_active, created_at, updated_at, options
`.trim();

const productService = {
  // ── Products ───────────────────────────────────────────────

  async list(storeId, { page, limit, status, category, search, sort, order }) {
    let query = supabaseAdmin
      .from("products")
      .select(PRODUCT_FIELDS, { count: "exact" })
      .eq("store_id", storeId);

    if (status === "active") query = query.eq("is_active", true);
    if (status === "inactive") query = query.eq("is_active", false);

    if (category) query = query.eq("category", category);

    if (search?.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    const from = (page - 1) * limit;
    query = query
      .order(sort, { ascending: order === "asc" })
      .range(from, from + limit - 1);

    const { data, error, count } = await query;
    if (error) throw error;

    return { products: data, total: count };
  },

  async getById(storeId, productId) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select(
        `
        *,
        variants:product_variants(${VARIANT_FIELDS}),
        images:product_images(
          id, image_url, is_thumbnail, sort_order, variant_id, created_at
        )
      `
      )
      .eq("id", productId)
      .eq("store_id", storeId)
      .single();

    console.log(data, error);

    if (error || !data) return null;

    // Sort images by sort_order
    if (data.images) {
      data.images.sort((a, b) => a.sort_order - b.sort_order);
    }
    return data;
  },

  async create(storeId, payload) {
    const { data, error } = await supabaseAdmin
      .from("products")
      .insert({ ...payload, store_id: storeId })
      .select(PRODUCT_FIELDS)
      .single();

    if (error) throw error;
    const product = await this.getById(storeId, data.id);
    return product;
    // Note: the trigger `trg_create_default_variant` will automatically
    // create a default variant after INSERT.
  },

  async update(storeId, productId, payload) {
    // Verify belongs to store
    const { data: existing } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("store_id", storeId)
      .single();

    if (!existing) return null;

    const { data, error } = await supabaseAdmin
      .from("products")
      .update({ ...payload, updated_at: new Date().toISOString() })
      .eq("id", productId)
      .select(PRODUCT_FIELDS)
      .single();

    if (error) throw error;
    return data;
  },

  // Soft delete — sets is_active = false
  async delete(storeId, productId) {
    const { data: existing } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("store_id", storeId)
      .single();

    if (!existing) return false;

    const { error } = await supabaseAdmin
      .from("products")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", productId);

    if (error) throw error;
    return true;
  },

  // ── Variants ───────────────────────────────────────────────

  async listVariants(storeId, productId) {
    // Verify product belongs to store first
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("store_id", storeId)
      .single();

    if (!product) return null;

    const { data, error } = await supabaseAdmin
      .from("product_variants")
      .select(VARIANT_FIELDS)
      .eq("product_id", productId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data;
  },

  async createVariant(storeId, productId, payload) {
    // Verify product belongs to store
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("store_id", storeId)
      .single();

    if (!product) return null;

    // Check SKU uniqueness (global constraint in DB but give a better error)
    if (payload.sku) {
      const { data: skuCheck } = await supabaseAdmin
        .from("product_variants")
        .select("id")
        .eq("sku", payload.sku)
        .maybeSingle();

      if (skuCheck) {
        const err = new Error(`SKU "${payload.sku}" is already in use`);
        err.statusCode = 409;
        err.code = "DUPLICATE_SKU";
        throw err;
      }
    }

    const { data, error } = await supabaseAdmin
      .from("product_variants")
      .insert({ ...payload, product_id: productId })
      .select(VARIANT_FIELDS)
      .single();

    if (error) throw error;
    return data;
  },

  async updateVariant(storeId, productId, variantId, payload) {
    // Verify ownership chain: store → product → variant
    const { data: variant } = await supabaseAdmin
      .from("product_variants")
      .select("id, product:product_id(store_id)")
      .eq("id", variantId)
      .eq("product_id", productId)
      .single();

    if (!variant || variant.product?.store_id !== storeId) return null;

    // Never allow writing to available_stock (it's generated)
    const { available_stock, ...safe } = payload;
    console.log("safe: ", safe, "/n payload: ", payload);

    // SKU uniqueness check
    if (safe.sku) {
      const { data: skuCheck } = await supabaseAdmin
        .from("product_variants")
        .select("id")
        .eq("sku", safe.sku)
        .neq("id", variantId)
        .maybeSingle();

      if (skuCheck) {
        const err = new Error(`SKU "${safe.sku}" is already in use`);
        err.statusCode = 409;
        err.code = "DUPLICATE_SKU";
        throw err;
      }
    }

    const { data, error } = await supabaseAdmin
      .from("product_variants")
      .update({ ...safe, updated_at: new Date().toISOString() })
      .eq("id", variantId)
      .select(VARIANT_FIELDS)
      .single();

    if (error) throw error;
    return data;
  },

  // Soft delete variant
  async deleteVariant(storeId, productId, variantId) {
    const { data: variant } = await supabaseAdmin
      .from("product_variants")
      .select("id, product:product_id(store_id)")
      .eq("id", variantId)
      .eq("product_id", productId)
      .single();

    if (!variant || variant.product?.store_id !== storeId) return false;

    const { error } = await supabaseAdmin
      .from("product_variants")
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq("id", variantId);

    if (error) throw error;
    return true;
  },

  // ── Images ─────────────────────────────────────────────────

  // ── Get the default variant for a product ─────────────────────
  // The DB trigger trg_create_default_variant creates a variant named
  // "Default" immediately after INSERT on products. This fetches it.
  async getDefaultVariant(productId) {
    const { data, error } = await supabaseAdmin
      .from("product_variants")
      .select("id, name, is_active")
      .eq("product_id", productId)
      .ilike("name", "default") // case-insensitive — trigger may use any casing
      .maybeSingle();

    if (error) throw error;
    return data ?? null;
  },

  // ── Count images already attached to a variant ────────────────
  async countVariantImages(variantId) {
    const { count, error } = await supabaseAdmin
      .from("product_images")
      .select("id", { count: "exact", head: true })
      .eq("variant_id", variantId);

    if (error) throw error;
    return count ?? 0;
  },

  // ── Add images to product, pinned to a specific variant ───────
  // Enforces the 3-image-per-variant limit.
  // Returns the inserted rows.
  async addImages(productId, variantId, imageUrls) {
    // Check how many images this variant already has
    const existing = await productService.countVariantImages(variantId);
    const available = 3 - existing;

    if (available <= 0) {
      const err = new Error("This variant already has the maximum of 3 images");
      err.statusCode = 422;
      err.code = "VARIANT_IMAGE_LIMIT";
      throw err;
    }

    if (imageUrls.length > available) {
      const err = new Error(
        `Only ${available} more image${
          available !== 1 ? "s" : ""
        } can be added to this variant (limit: 3)`
      );
      err.statusCode = 422;
      err.code = "VARIANT_IMAGE_LIMIT";
      throw err;
    }

    // Determine sort_order starting position
    const { data: last } = await supabaseAdmin
      .from("product_images")
      .select("sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    const startOrder = (last?.sort_order ?? -1) + 1;

    const rows = imageUrls.map((url, i) => ({
      product_id: productId,
      variant_id: variantId,
      image_url: url,
      is_thumbnail: existing === 0 && i === 0, // first image of first upload = thumbnail
      sort_order: startOrder + i,
    }));

    const { data, error } = await supabaseAdmin
      .from("product_images")
      .insert(rows)
      .select("id, image_url, is_thumbnail, sort_order, variant_id");

    if (error) throw error;

    // If this is the first image, also set it as product.thumbnail_url
    if (existing === 0 && rows[0]) {
      await supabaseAdmin
        .from("products")
        .update({ thumbnail_url: rows[0].image_url })
        .eq("id", productId);
    }

    return data;
  },

  async deleteImage(storeId, productId, imageId) {
    // Verify ownership chain
    const { data: image } = await supabaseAdmin
      .from("product_images")
      .select("id, product:product_id(store_id)")
      .eq("id", imageId)
      .eq("product_id", productId)
      .single();

    if (!image || image.product?.store_id !== storeId) return false;

    const { error } = await supabaseAdmin
      .from("product_images")
      .delete()
      .eq("id", imageId);

    if (error) throw error;
    return true;
  },

  // Batch update sort_order for drag-to-reorder
  async reorderImages(storeId, productId, images) {
    const { data: product } = await supabaseAdmin
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("store_id", storeId)
      .single();

    if (!product) return false;

    // Upsert sort_order for each image in a single round trip
    const updates = images.map(({ id, sort_order }) =>
      supabaseAdmin
        .from("product_images")
        .update({ sort_order })
        .eq("id", id)
        .eq("product_id", productId)
    );

    await Promise.all(updates);
    return true;
  },
};

export default productService;

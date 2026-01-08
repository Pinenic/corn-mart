// productService.js
import { supabase } from "../supabaseClient.js";

/**
 * Fetch products for store (includes variants & images)
 */
export async function getProductsByStore(storeId) {
  const { data, error } = await supabase
    .from("products")
    .select("*, product_variants(*), product_images(*)")
    .eq("store_id", storeId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
/**
 * Fetch a single product for store (includes variants & images)
 */
export async function getProductByID(productId) {
  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      product_images (
        id,
        image_url,
        is_thumbnail,
        sort_order,
        variant_id
      ),
      product_variants (
        *,
        product_images (
          id,
          image_url,
          is_thumbnail,
          sort_order
        )
      )
    `)
    .eq("id", productId)
    .single();


  if (error) throw error;
  return data;
}

export async function createSubcategory(subcat) {
  if (subcat.id) {
    const { data: subcategory, error: subcategoryError } = await supabase
      .from("subcategories")
      .select("*")
      .eq("id", subcat.id)
      .maybeSingle();

    if (subcategoryError)
      throw new Error(`Error fetching subcat, ${subcategoryError.message}`);
    if (subcategory) return subcategory;
  }

  const { data, error } = await supabase
    .from("subcategories")
    .insert([subcat])
    .select()
    .single();

  if (error) throw new Error(`Error creating subcat, ${error}`);

  return data;
}

/**
 * Create a product. A default variant will be created by DB trigger.
 * If you want to create a product + custom variants at once, create the product first then create variants.
 */
export async function createAProduct(payload) {
  const { data, error } = await supabase
    .from("products")
    .insert([payload])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update product
 */
export async function updateAProduct(productId, updates) {
  const { data, error } = await supabase
    .from("products")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", productId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function toggleProductActiveStatus(productId, newStatus) {
  const { data, error } = await supabase
    .from("products")
    .update({ is_active: newStatus })
    .eq("id", productId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Delete product
 */
export async function deleteAProduct(productId) {
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", productId);
  if (error) throw error;
  return true;
}

//variantService.js

/**
 * Create a variant for a product
 */
export async function createVariant({
  product_id,
  name,
  description,
  price = null,
  stock = 0,
  sku = null,
  low_stock_threshold = 3,
}) {
  const { data, error } = await supabase
    .from("product_variants")
    .insert([
      { product_id, name, description, price, stock, sku, low_stock_threshold },
    ])
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a variant
 */
export async function updateAVariant(variantId, updates) {
  const { data, error } = await supabase
    .from("product_variants")
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq("id", variantId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get variants for a product
 */
export async function getAllVariants(productId) {
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", {ascending: true});

  if (error) throw error;
  return data;
}

/**
 * Get variant by id
 */
export async function getAVariant(variantId) {
  const { data, error } = await supabase
    .from("product_variants")
    .select("*")
    .eq("id", variantId)
    .single();

  if (error) throw error;
  return data;
}
/**
 * Delete a variant
 */
export async function deleteAVariant(variantId) {
  const { error } = await supabase
    .from("product_variants")
    .delete()
    .eq("id", variantId);
  if (error) throw error;
  return true;
}

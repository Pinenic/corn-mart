import { supabase } from "../supabaseClient.js";

export async function addProductImages(productId, images) {
  const payload = images.map(img => ({
    product_id: productId,
    variant_id: null,
    image_url: img.url,
    is_thumbnail: img.is_thumbnail ?? false,
    sort_order: img.sort_order ?? 0,
  }));

  const { data, error } = await supabase
    .from("product_images")
    .insert(payload)
    .select();

  if (error) throw error;
  return data;
}

export async function addVariantImages({
  product_id,
  variant_id,
  images,
}) {
  const payload = images.map(img => ({
    product_id,
    variant_id,
    image_url: img.url,
    is_thumbnail: img.is_thumbnail ?? false,
    sort_order: img.sort_order ?? 0,
  }));

  const { data, error } = await supabase
    .from("product_images")
    .insert(payload)
    .select();

  if (error) throw error;
  return data;
}

export async function getProductImages(productId) {
  const { data, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data;
}

export async function deleteProductImage(imageId) {
  const { error } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (error) throw error;
  return true;
}

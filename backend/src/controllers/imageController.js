// src/controllers/imageController.js
// ─────────────────────────────────────────────────────────────
// Controller methods for all image upload/update/delete endpoints.
//
// These are the three use-cases:
//   1. User profile avatar
//   2. Store logo + banner
//   3. Product images
//
// Each method shows the full pattern:
//   - Get old URL from DB (for replace/delete)
//   - Call imageManager
//   - Persist the new URL to DB
//   - Return the new URL in the response
// ─────────────────────────────────────────────────────────────

import { uploadOne, uploadMany, replaceOne,
         deleteOne, deleteMany, deleteFolder,
         SIZE_LIMITS }               from "../services/images/imageManager.js";
import { supabaseAdmin }             from "../config/supabase.js";
import response                      from "../utils/response.js";
import asyncHandler                  from "../utils/asyncHandler.js";

// ─────────────────────────────────────────────────────────────
// 1. USER PROFILE AVATAR
// ─────────────────────────────────────────────────────────────

// PATCH /api/v1/users/me/avatar
// Replaces the user's avatar (or sets it for the first time).
export const updateProfileAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  if (!req.file) {
    return response.badRequest(res, "No avatar file provided");
  }

  // Fetch the existing avatar URL so we can delete it after the upload
  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .single();

  // Upload new → then delete old (replaceOne handles both atomically)
  const { publicUrl } = await replaceOne(
    req.file,
    `profiles/${userId}`,           // folder: one sub-dir per user
    profile?.avatar_url ?? null,    // old URL to delete (null = first upload)
    { maxSize: SIZE_LIMITS.profile }
  );

  // Persist to DB
  await supabaseAdmin
    .from("profiles")
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", userId);

  return response.ok(res, { avatar_url: publicUrl });
});

// DELETE /api/v1/users/me/avatar
export const deleteProfileAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .single();

  if (!profile?.avatar_url) {
    return response.notFound(res, "No avatar to delete");
  }

  await deleteOne(profile.avatar_url);

  await supabaseAdmin
    .from("profiles")
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq("id", userId);

  return response.noContent(res);
});

// ─────────────────────────────────────────────────────────────
// 2. STORE LOGO + BANNER
// ─────────────────────────────────────────────────────────────
// Both live in the same folder: stores/<storeId>/
// We keep them in separate DB columns: stores.logo and stores.banner.

// PATCH /api/v1/stores/:storeId/logo
export const updateStoreLogo = asyncHandler(async (req, res) => {
  const { storeId } = req.params;

  if (!req.file) {
    return response.badRequest(res, "No logo file provided");
  }

  // req.store is set by requireStoreAccess middleware — ownership already verified
  const oldUrl = req.store.logo ?? null;

  const { publicUrl } = await replaceOne(
    req.file,
    `stores/${storeId}`,      // folder shared between logo and banner
    oldUrl,
    { maxSize: SIZE_LIMITS.logo }
  );

  await supabaseAdmin
    .from("stores")
    .update({ logo: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", storeId);

  return response.ok(res, { logo: publicUrl });
});

// DELETE /api/v1/stores/:storeId/logo
export const deleteStoreLogo = asyncHandler(async (req, res) => {
  const { storeId } = req.params;

  if (!req.store.logo) {
    return response.notFound(res, "No logo to delete");
  }

  await deleteOne(req.store.logo);

  await supabaseAdmin
    .from("stores")
    .update({ logo: null, updated_at: new Date().toISOString() })
    .eq("id", storeId);

  return response.noContent(res);
});

// PATCH /api/v1/stores/:storeId/banner
export const updateStoreBanner = asyncHandler(async (req, res) => {
  const { storeId } = req.params;

  if (!req.file) {
    return response.badRequest(res, "No banner file provided");
  }

  const oldUrl = req.store.banner ?? null;

  const { publicUrl } = await replaceOne(
    req.file,
    `stores/${storeId}`,
    oldUrl,
    { maxSize: SIZE_LIMITS.banner }
  );

  await supabaseAdmin
    .from("stores")
    .update({ banner: publicUrl, updated_at: new Date().toISOString() })
    .eq("id", storeId);

  return response.ok(res, { banner: publicUrl });
});

// DELETE /api/v1/stores/:storeId/banner
export const deleteStoreBanner = asyncHandler(async (req, res) => {
  const { storeId } = req.params;

  if (!req.store.banner) {
    return response.notFound(res, "No banner to delete");
  }

  await deleteOne(req.store.banner);

  await supabaseAdmin
    .from("stores")
    .update({ banner: null, updated_at: new Date().toISOString() })
    .eq("id", storeId);

  return response.noContent(res);
});

// ─────────────────────────────────────────────────────────────
// 3. PRODUCT IMAGES
// ─────────────────────────────────────────────────────────────

// POST /api/v1/stores/:storeId/products/:productId/images
// Uploads 1–3 images and links them to the product's default variant.
export const addProductImages = asyncHandler(async (req, res) => {
  const { storeId, productId } = req.params;
  const {variant_id} = req.body;
  console.log(variant_id);

  const files = req.files ?? [];
  if (files.length === 0) {
    return response.badRequest(res, "At least one image file is required");
  }

  // Find the default variant created by the DB trigger on product insert
  const { data: defaultVariant } = await supabaseAdmin
    .from("product_variants")
    .select("id")
    .eq("product_id", productId)
    .eq("id", variant_id)
    .maybeSingle();

    console.log(defaultVariant)

  if (!defaultVariant) {
    return response.unprocessable(
      res,
      "Variant not found — the product may still be initialising"
    );
  }

  // Enforce 3-image limit per variant
  const { count: existing } = await supabaseAdmin
    .from("product_images")
    .select("id", { count: "exact", head: true })
    .eq("variant_id", defaultVariant.id);

  const available = 3 - (existing ?? 0);
  if (available <= 0) {
    return response.unprocessable(res, "This variant already has the maximum of 3 images");
  }

  const filesToUpload = files.slice(0, available);

  // Upload all to storage
  const uploaded = await uploadMany(
    filesToUpload,
    `stores/${storeId}/products/${productId}`,
    { maxSize: SIZE_LIMITS.product, maxCount: 3 }
  );

  // Determine sort_order starting position
  const { data: lastImage } = await supabaseAdmin
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const startOrder = (lastImage?.sort_order ?? -1) + 1;

  // Insert rows into product_images
  const rows = uploaded.map((u, i) => ({
    product_id:   productId,
    variant_id:   defaultVariant.id,
    image_url:    u.publicUrl,
    is_thumbnail: existing === 0 && i === 0,   // first ever image = thumbnail
    sort_order:   startOrder + i,
  }));

  const { data: images, error } = await supabaseAdmin
    .from("product_images")
    .insert(rows)
    .select("id, image_url, is_thumbnail, sort_order, variant_id");

  if (error) throw error;

  // Keep products.thumbnail_url in sync with the canonical thumbnail image
  const thumbnail = rows.find(r => r.is_thumbnail);
  if (thumbnail) {
    await supabaseAdmin
      .from("products")
      .update({ thumbnail_url: thumbnail.image_url })
      .eq("id", productId);
  }

  return response.created(res, { images, variant_id: defaultVariant.id });
});

// DELETE /api/v1/stores/:storeId/products/:productId/images/:imageId
export const deleteProductImage = asyncHandler(async (req, res) => {
  const { productId, imageId } = req.params;

  const { data: image } = await supabaseAdmin
    .from("product_images")
    .select("id, image_url, is_thumbnail, product:product_id(store_id)")
    .eq("id", imageId)
    .eq("product_id", productId)
    .single();

  if (!image || image.product?.store_id !== req.store.id) {
    return response.notFound(res, "Image not found");
  }

  // Delete from storage
  await deleteOne(image.image_url);

  // Hard-delete the DB row (images are not soft-deleted)
  await supabaseAdmin.from("product_images").delete().eq("id", imageId);

  // If the deleted image was the thumbnail, promote the next image
  if (image.is_thumbnail) {
    const { data: next } = await supabaseAdmin
      .from("product_images")
      .select("id, image_url")
      .eq("product_id", productId)
      .order("sort_order", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (next) {
      await supabaseAdmin
        .from("product_images")
        .update({ is_thumbnail: true })
        .eq("id", next.id);
      await supabaseAdmin
        .from("products")
        .update({ thumbnail_url: next.image_url })
        .eq("id", productId);
    } else {
      // No images left — clear thumbnail_url on the product
      await supabaseAdmin
        .from("products")
        .update({ thumbnail_url: null })
        .eq("id", productId);
    }
  }

  return response.noContent(res);
});

// Called when an entire product is soft-deleted.
// Hard-deletes all images from storage in one call.
// Exported so productService.js can call it directly.
export async function purgeProductImages(productId) {
  const { data: images } = await supabaseAdmin
    .from("product_images")
    .select("image_url")
    .eq("product_id", productId);

  if (images?.length) {
    await deleteMany(images.map(i => i.image_url));
    await supabaseAdmin.from("product_images").delete().eq("product_id", productId);
  }
}
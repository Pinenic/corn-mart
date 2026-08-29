// src/controllers/imageController.js
// ─────────────────────────────────────────────────────────────
// Controller methods for all image upload/update/delete endpoints.
//
// These are the three use-cases:
//   1. User profile avatar
//   2. Store logo + banner
//   3. Product images (slot-addressed by variant_id + sort_order)
//
// ─────────────────────────────────────────────────────────────

import { uploadOne, replaceOne,
  deleteOne, deleteMany }    from "../services/images/imageManager.js";
import { SIZE_LIMITS }               from "../services/images/imageProcessor.js";
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

const { data: profile } = await supabaseAdmin
.from("profiles")
.select("avatar_url")
.eq("id", userId)
.single();

const { publicUrl } = await replaceOne(
req.file,
`profiles/${userId}`,
profile?.avatar_url ?? null,
{ maxSize: SIZE_LIMITS.profile }
);

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

// PATCH /api/v1/stores/:storeId/logo
export const updateStoreLogo = asyncHandler(async (req, res) => {
const { storeId } = req.params;

if (!req.file) {
return response.badRequest(res, "No logo file provided");
}

const oldUrl = req.store.logo ?? null;

const { publicUrl } = await replaceOne(
req.file,
`stores/${storeId}`,
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
// 3. PRODUCT IMAGES — slot-addressed by (variant_id, sort_order)
// ─────────────────────────────────────────────────────────────
// sort_order is scoped PER VARIANT and doubles as the frontend's
// slot index (0, 1, 2). Each (variant_id, sort_order) pair maps
// to exactly one image. Uploading to an occupied slot replaces it
// in place (same DB row id, new image_url, old storage file removed).
//
// Only variants[0]'s slot 0 can ever be the product's thumbnail.
// "First variant" = the variant with the earliest created_at for
// this product. If your schema orders variants differently
// (e.g. a dedicated position/is_default column), swap that here.
// ─────────────────────────────────────────────────────────────

const MAX_IMAGE_SLOTS = 3;

async function getFirstVariantId(productId) {
const { data } = await supabaseAdmin
.from("product_variants")
.select("id")
.eq("product_id", productId)
.order("created_at", { ascending: true })
.limit(1)
.maybeSingle();
return data?.id ?? null;
}

// Closes the gap left by a deleted slot so a variant's remaining images
// stay contiguous and ascending from 0. E.g. deleting slot 0 with images
// still in slots 1 and 2 shifts them down to 0 and 1.
// Returns the rows that were shifted: [{ id, sort_order }, ...] (new
// sort_order values), in case a caller needs to sync client state.
async function reindexVariantImageSlots(variantId, deletedSlotIndex) {
const { data: laterImages } = await supabaseAdmin
.from("product_images")
.select("id, sort_order")
.eq("variant_id", variantId)
.gt("sort_order", deletedSlotIndex)
.order("sort_order", { ascending: true });

if (!laterImages?.length) return [];

const shifted = [];
// Ascending order matters here: each target sort_order is only freed up
// once the row that previously held it has already been moved down.
for (const img of laterImages) {
const newSortOrder = img.sort_order - 1;
await supabaseAdmin
.from("product_images")
.update({ sort_order: newSortOrder })
.eq("id", img.id);
shifted.push({ id: img.id, sort_order: newSortOrder });
}

return shifted;
}

// PUT /api/v1/stores/:storeId/products/:productId/variants/:variantId/images/:slotIndex
// Upserts the image for a single slot. Creates a new row if the slot
// is empty, replaces image_url in place if it's occupied.
export const upsertVariantImageSlot = asyncHandler(async (req, res) => {
const { storeId, productId, variantId } = req.params;
const slotIndex = Number(req.params.slotIndex);

if (!req.file) {
return response.badRequest(res, "No image file provided");
}
if (!Number.isInteger(slotIndex) || slotIndex < 0 || slotIndex >= MAX_IMAGE_SLOTS) {
return response.badRequest(res, `slotIndex must be an integer between 0 and ${MAX_IMAGE_SLOTS - 1}`);
}

const { data: variant } = await supabaseAdmin
.from("product_variants")
.select("id")
.eq("id", variantId)
.eq("product_id", productId)
.maybeSingle();

if (!variant) {
return response.notFound(res, "Variant not found");
}

const folder = `stores/${storeId}/products/${productId}`;

const { data: existingImage } = await supabaseAdmin
.from("product_images")
.select("id, image_url, is_thumbnail")
.eq("variant_id", variantId)
.eq("sort_order", slotIndex)
.maybeSingle();

let imageRow;

if (existingImage) {
// Replace in place: new file uploaded first, old storage file removed after.
const { publicUrl } = await replaceOne(
req.file, folder, existingImage.image_url, { maxSize: SIZE_LIMITS.product }
);

const { data: updated, error } = await supabaseAdmin
.from("product_images")
.update({ image_url: publicUrl })
.eq("id", existingImage.id)
.select("id, image_url, is_thumbnail, sort_order, variant_id")
.single();
if (error) throw error;
imageRow = updated;

if (imageRow.is_thumbnail) {
await supabaseAdmin
 .from("products")
 .update({ thumbnail_url: publicUrl })
 .eq("id", productId);
}
} else {
const { publicUrl } = await uploadOne(req.file, folder, { maxSize: SIZE_LIMITS.product });

const firstVariantId = await getFirstVariantId(productId);
const isThumbnailSlot = variantId === firstVariantId && slotIndex === 0;

const { data: inserted, error } = await supabaseAdmin
.from("product_images")
.insert({
 product_id:   productId,
 variant_id:   variantId,
 image_url:    publicUrl,
 sort_order:   slotIndex,
 is_thumbnail: isThumbnailSlot,
})
.select("id, image_url, is_thumbnail, sort_order, variant_id")
.single();
if (error) throw error;
imageRow = inserted;

if (isThumbnailSlot) {
await supabaseAdmin
 .from("products")
 .update({ thumbnail_url: publicUrl })
 .eq("id", productId);
}
}

return response.ok(res, { image: imageRow });
});

// DELETE /api/v1/stores/:storeId/products/:productId/variants/:variantId/images/:slotIndex
export const deleteVariantImageSlot = asyncHandler(async (req, res) => {
const { productId, variantId } = req.params;
const slotIndex = Number(req.params.slotIndex);

const { data: image } = await supabaseAdmin
.from("product_images")
.select("id, image_url, is_thumbnail")
.eq("variant_id", variantId)
.eq("sort_order", slotIndex)
.maybeSingle();

if (!image) {
return response.notFound(res, "No image in this slot");
}

await deleteOne(image.image_url);
await supabaseAdmin.from("product_images").delete().eq("id", image.id);

// Close the gap so remaining images in this variant stay 0..n contiguous.
const shiftedImages = await reindexVariantImageSlots(variantId, slotIndex);

if (image.is_thumbnail) {
// Fall back to variants[0]'s slot 0, if it still exists — otherwise clear it.
const firstVariantId = await getFirstVariantId(productId);
let newThumbUrl = null;

if (firstVariantId) {
const { data: slot0 } = await supabaseAdmin
 .from("product_images")
 .select("id, image_url")
 .eq("variant_id", firstVariantId)
 .eq("sort_order", 0)
 .maybeSingle();


if (slot0) {
 newThumbUrl = slot0.image_url;
 await supabaseAdmin
   .from("product_images")
   .update({ is_thumbnail: true })
   .eq("id", slot0.id);
}
}

await supabaseAdmin
.from("products")
.update({ thumbnail_url: newThumbUrl })
.eq("id", productId);
}

// 200 instead of 204 — the frontend needs shiftedImages to keep its
// local slot assignments in sync with the reindex above.
return response.ok(res, { deleted: true, shiftedImages });
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
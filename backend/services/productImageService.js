// services/imageService.js
import { supabase } from "../supabaseClient.js";
import { randomUUID } from "crypto";

/**
 * Upload multiple images to Supabase Storage and return their public URLs.
 */
export async function uploadProductImages(
  userId,
  productId,
  files,
  thumbnailIndex = 0
) {
  const uploadedUrls = [];

  for (const [index, file] of files.entries()) {
    const fileName = `${userId}/${productId}/${randomUUID()}-${
      file.originalname
    }`;
    const { error: uploadErr } = await supabase.storage
      .from("user_uploads")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadErr) throw uploadErr;

    const {
      data: { publicUrl },
    } = supabase.storage.from("user_uploads").getPublicUrl(fileName);

    uploadedUrls.push({
      image_url: publicUrl,
      is_thumbnail: index === thumbnailIndex,
    });
  }

  // Insert into product_images table
  const { error: dbErr } = await supabase.from("product_images").insert(
    uploadedUrls.map((urlObj) => ({
      product_id: productId,
      image_url: urlObj.image_url,
      is_thumbnail: urlObj.is_thumbnail,
    }))
  );
  if (dbErr) throw dbErr;

  // Update products table thumbnail_url
  const thumbnailUrl = uploadedUrls.find((u) => u.is_thumbnail)?.image_url;
  if (thumbnailUrl) {
    const { error: thumbErr } = await supabase
      .from("products")
      .update({ thumbnail_url: thumbnailUrl })
      .eq("id", productId);
    if (thumbErr) throw thumbErr;
  }

  return uploadedUrls.map((u) => u.image_url);
}

/**
 * Update product images (add new + remove old)
 */
export async function updateProductImages(
  userId,
  productId,
  { newFiles = [], removedImageIds = [] }
) {
  // Delete removed images
  if (removedImageIds.length) {
    const { data: oldImages, error: fetchErr } = await supabase
      .from("product_images")
      .select("image_url")
      .in("id", removedImageIds);

    if (fetchErr) throw fetchErr;

    const fileNames = oldImages.map(
      (img) => img.image_url.split("user_uploads/")[1]
    );

    const { error: storageErr } = await supabase.storage
      .from("user_uploads")
      .remove(fileNames);

    if (storageErr) throw storageErr;

    const { error: deleteErr } = await supabase
      .from("product_images")
      .delete()
      .in("id", removedImageIds);

    if (deleteErr) throw deleteErr;
  }

  // Upload new images
  // Needs reveiw on setting the thumbnai url
  if (newFiles.length) {
    await uploadProductImages(userId, productId, newFiles);
  }

  return true;
}

/**
 * Delete all product images (for when a product is deleted)
 */
export async function deleteAllProductImages(productId) {
  const { data: images, error: fetchErr } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", productId);

  if (fetchErr) throw fetchErr;

  if (!images.length) return true;

  const fileNames = images.map(
    (img) => img.image_url.split("user_uploads/")[1]
  );

  const { error: storageErr } = await supabase.storage
    .from("user_uploads")
    .remove(fileNames);

  if (storageErr) throw storageErr;

  const { error: deleteErr } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);

  if (deleteErr) throw deleteErr;

  return true;
}

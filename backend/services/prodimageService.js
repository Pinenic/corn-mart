// services/imageService.js
import { supabase } from "../supabaseClient.js";
import { randomUUID } from "crypto";

/**
 * Upload a single image to Supabase Storage
 * @private
 */
export async function uploadSingleImage(userId, productId, file) {
  console.log(file);
    const ext = file.mimetype.split("/")[1];
    const filename = `${randomUUID()}.${ext}`;
    const filePath = `${userId}/products/${productId}/${filename}`;
  // const fileName = `${userId}/${productId}/${randomUUID()}-${file.originalname}`;
  
  const { error: uploadErr } = await supabase.storage
    .from("user_uploads")
    .upload(filePath, file.buffer, {
      contentType: file.mimetype,
    });
  
  if (uploadErr) throw uploadErr;
  
  const {
    data: { publicUrl },
  } = supabase.storage.from("user_uploads").getPublicUrl(filePath);
  
  return { filePath, publicUrl };
}

/**
 * Upload multiple images to Supabase Storage and save to database
 */
export async function uploadImages(userId, productId, files, thumbnailIndex = 0) {
  if (!files || files.length === 0) {
    throw new Error("No files provided for upload");
  }
console.log(files);
  const uploadedImages = [];

  // Upload all files to storage
  for (const [index, file] of files.entries()) {
    const { publicUrl } = await uploadSingleImage(userId, productId, file);
    
    uploadedImages.push({
      image_url: publicUrl,
      is_thumbnail: index === thumbnailIndex,
    });
  }

  // Insert into product_images table
  const { data: insertedImages, error: dbErr } = await supabase
    .from("product_images")
    .insert(
      uploadedImages.map((img) => ({
        product_id: productId,
        image_url: img.image_url,
        is_thumbnail: img.is_thumbnail,
      }))
    )
    .select();

  if (dbErr) throw dbErr;

  // Update thumbnail if specified
  const thumbnailUrl = uploadedImages.find((u) => u.is_thumbnail)?.image_url;
  if (thumbnailUrl) {
    await updateThumbnail(productId, thumbnailUrl);
  }

  return insertedImages;
}

/**
 * Delete a single image by image ID
 */
export async function deleteImage(imageId) {
  // Fetch the image record to get the URL
  const { data: image, error: fetchErr } = await supabase
    .from("product_images")
    .select("image_url, product_id, is_thumbnail")
    .eq("id", imageId)
    .single();

  if (fetchErr) throw fetchErr;
  if (!image) throw new Error("Image not found");

  // Extract filename from URL
  const fileName = image.image_url.split("user_uploads/")[1];

  // Delete from storage
  const { error: storageErr } = await supabase.storage
    .from("user_uploads")
    .remove([fileName]);

  if (storageErr) throw storageErr;

  // Delete from database
  const { error: deleteErr } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (deleteErr) throw deleteErr;

  // If deleted image was thumbnail, set a new one
  if (image.is_thumbnail) {
    await setFirstImageAsThumbnail(image.product_id);
  }

  return true;
}

/**
 * Delete multiple images by their IDs
 */
export async function deleteImages(imageIds) {
  if (!imageIds || imageIds.length === 0) {
    throw new Error("No image IDs provided");
  }

  // Fetch all images to delete
  const { data: images, error: fetchErr } = await supabase
    .from("product_images")
    .select("image_url, product_id, is_thumbnail")
    .in("id", imageIds);

  if (fetchErr) throw fetchErr;
  if (!images.length) return true;

  // Extract filenames from URLs
  const fileNames = images.map((img) => img.image_url.split("user_uploads/")[1]);

  // Delete from storage
  const { error: storageErr } = await supabase.storage
    .from("user_uploads")
    .remove(fileNames);

  if (storageErr) throw storageErr;

  // Delete from database
  const { error: deleteErr } = await supabase
    .from("product_images")
    .delete()
    .in("id", imageIds);

  if (deleteErr) throw deleteErr;

  // Check if any deleted image was a thumbnail
  const deletedThumbnail = images.find((img) => img.is_thumbnail);
  if (deletedThumbnail) {
    await setFirstImageAsThumbnail(deletedThumbnail.product_id);
  }

  return true;
}

/**
 * Replace/update a single image
 */
export async function replaceImage(userId, imageId, newFile) {
  // Fetch the existing image
  const { data: existingImage, error: fetchErr } = await supabase
    .from("product_images")
    .select("image_url, product_id, is_thumbnail")
    .eq("id", imageId)
    .single();

  if (fetchErr) throw fetchErr;
  if (!existingImage) throw new Error("Image not found");

  // Delete old image from storage
  const oldFileName = existingImage.image_url.split("user_uploads/")[1];
  const { error: deleteErr } = await supabase.storage
    .from("user_uploads")
    .remove([oldFileName]);

  if (deleteErr) throw deleteErr;

  // Upload new image
  const { publicUrl } = await uploadSingleImage(
    userId,
    existingImage.product_id,
    newFile
  );

  // Update database record
  const { data: updatedImage, error: updateErr } = await supabase
    .from("product_images")
    .update({ image_url: publicUrl })
    .eq("id", imageId)
    .select()
    .single();

  if (updateErr) throw updateErr;

  // Update thumbnail if this was the thumbnail image
  if (existingImage.is_thumbnail) {
    await updateThumbnail(existingImage.product_id, publicUrl);
  }

  return updatedImage;
}

/**
 * Update the thumbnail for a product
 */
export async function updateThumbnail(productId, imageUrl) {
  // First, unset all thumbnails for this product
  const { error: unsetErr } = await supabase
    .from("product_images")
    .update({ is_thumbnail: false })
    .eq("product_id", productId);

  if (unsetErr) throw unsetErr;

  // Set the new thumbnail
  const { error: setErr } = await supabase
    .from("product_images")
    .update({ is_thumbnail: true })
    .eq("product_id", productId)
    .eq("image_url", imageUrl);

  if (setErr) throw setErr;

  // Update the products table
  const { error: thumbErr } = await supabase
    .from("products")
    .update({ thumbnail_url: imageUrl })
    .eq("id", productId);

  if (thumbErr) throw thumbErr;

  return true;
}

/**
 * Set thumbnail by image ID
 */
export async function setThumbnailById(imageId) {
  // Fetch the image
  const { data: image, error: fetchErr } = await supabase
    .from("product_images")
    .select("image_url, product_id")
    .eq("id", imageId)
    .single();

  if (fetchErr) throw fetchErr;
  if (!image) throw new Error("Image not found");

  return await updateThumbnail(image.product_id, image.image_url);
}

/**
 * Set the first available image as thumbnail (fallback)
 * @private
 */
async function setFirstImageAsThumbnail(productId) {
  const { data: remainingImages, error: fetchErr } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", productId)
    .limit(1);

  if (fetchErr) throw fetchErr;

  if (remainingImages && remainingImages.length > 0) {
    await updateThumbnail(productId, remainingImages[0].image_url);
  } else {
    // No images left, clear thumbnail
    await supabase
      .from("products")
      .update({ thumbnail_url: null })
      .eq("id", productId);
  }
}

/**
 * Delete all images for a product (used when deleting a product)
 */
export async function deleteAllProductImages(productId) {
  const { data: images, error: fetchErr } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", productId);

  if (fetchErr) throw fetchErr;
  if (!images || images.length === 0) return true;

  const fileNames = images.map((img) => img.image_url.split("user_uploads/")[1]);

  // Delete from storage
  const { error: storageErr } = await supabase.storage
    .from("user_uploads")
    .remove(fileNames);

  if (storageErr) throw storageErr;

  // Delete from database
  const { error: deleteErr } = await supabase
    .from("product_images")
    .delete()
    .eq("product_id", productId);

  if (deleteErr) throw deleteErr;

  // Clear thumbnail in products table
  await supabase
    .from("products")
    .update({ thumbnail_url: null })
    .eq("id", productId);

  return true;
}

/**
 * Get all images for a product
 */
export async function getProductImages(productId) {
  const { data: images, error } = await supabase
    .from("product_images")
    .select("*")
    .eq("product_id", productId)
    .order("is_thumbnail", { ascending: false })
    .order("created_at", { ascending: true });

  if (error) throw error;

  return images;
}
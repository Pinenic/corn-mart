import { supabase } from "../supabaseClient.js";

export async function deleteImageSafely(image) { // image = { id, image_url }
  const bucket = "user_uploads";

  // Extract path from public URL
  const path = image.image_url.split("/user_uploads/")[1];

  if (!path) {
    throw new Error("Invalid image path");
  }

  // 1️⃣ Delete from storage
  const { error: storageError } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (storageError) {
    throw storageError;
  }

  // 2️⃣ Delete DB record
  const { error: dbError } = await supabase
    .from("product_images")
    .delete()
    .eq("id", image.id);

  if (dbError) {
    throw dbError;
  }

  return true;
}

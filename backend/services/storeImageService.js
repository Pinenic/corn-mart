// services/storeImageService.js
import { supabase } from "../supabaseClient.js";
import { randomUUID } from "crypto";

/**
 * Upload logo and/or banner images for a store.
 * Returns an object containing the uploaded URLs.
 */
export async function uploadStoreImages(userId, storeId, files = {}) {
  const uploaded = {};

  for (const key of ["logo", "banner"]) {
    const file = files[key];
    if (!file) continue;

    const fileName = `${userId}/${storeId}/${key}-${randomUUID()}-${file.originalname}`;
    const { error: uploadErr } = await supabase.storage
      .from("user_uploads")
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
      });

    if (uploadErr) throw uploadErr;

    const { data: { publicUrl } } = supabase
      .storage
      .from("user_uploads")
      .getPublicUrl(fileName);

    uploaded[key] = publicUrl;
  }

  return uploaded; // { logo: "https://...", banner: "https://..." }
}

/**
 * Replace existing logo/banner images (delete old one if exists)
 */
export async function updateStoreImages(store, newFiles = {}) {
  const updated = {};

  for (const key of ["logo", "banner"]) {
    const newFile = newFiles[key];
    if (!newFile) continue;

    // Delete old file from storage if exists
    const oldUrl = store[key];
    if (oldUrl) {
      const fileName = oldUrl.split("/").pop();
      await supabase.storage.from("user_uploads").remove([fileName]);
    }

    // Upload new one
    const fileName = `${store.owner_id}/${store.id}/${key}-${randomUUID()}-${newFile.originalname}`;
    const { error: uploadErr } = await supabase.storage
      .from("user_uploads")
      .upload(fileName, newFile.buffer, {
        contentType: newFile.mimetype,
      });

    if (uploadErr) throw uploadErr;

    const { data: { publicUrl } } = supabase
      .storage
      .from("user_uploads")
      .getPublicUrl(fileName);

    updated[key] = publicUrl;
  }

  return updated; // return new URLs for logo/banner
}

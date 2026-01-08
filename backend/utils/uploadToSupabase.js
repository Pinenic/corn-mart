import { supabase } from "../supabaseClient.js";
import crypto from "crypto";

export async function uploadImageToSupabase({
  buffer,
  mimetype,
  folder,
}) {
  const ext = mimetype.split("/")[1];
  const filename = `${crypto.randomUUID()}.${ext}`;
  const filePath = `${folder}/${filename}`;

  const { error } = await supabase.storage
    .from("user_uploads")
    .upload(filePath, buffer, {
      contentType: mimetype,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage
    .from("user_uploads")
    .getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: data.publicUrl,
  };
}

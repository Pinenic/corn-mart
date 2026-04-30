import { supabaseAdmin } from "../config/supabase.js";
import crypto from "crypto";

export async function uploadImageToSupabase({
  buffer,
  mimetype,
  folder,
}) {
  if (!buffer) {
    throw {
      statusCode: 400,
      code: "INVALID_BUFFER",
      message: "File buffer is required",
    };
  }

  if (!mimetype) {
    throw {
      statusCode: 400,
      code: "INVALID_MIMETYPE",
      message: "File MIME type is required",
    };
  }

  if (!folder) {
    throw {
      statusCode: 400,
      code: "INVALID_FOLDER",
      message: "Upload folder path is required",
    };
  }

  try {
    const ext = mimetype.split("/")[1];
    const filename = `${crypto.randomUUID()}.${ext}`;
    const filePath = `${folder}/${filename}`;

    const { error } = await supabaseAdmin.storage
      .from("user_uploads")
      .upload(filePath, buffer, {
        contentType: mimetype,
        upsert: false,
      });

    if (error) {
      throw {
        statusCode: 500,
        code: "SUPABASE_UPLOAD_ERROR",
        message: error.message || "Failed to upload file to Supabase storage",
      };
    }

    const { data } = supabaseAdmin.storage
      .from("user_uploads")
      .getPublicUrl(filePath);

    return {
      path: filePath,
      publicUrl: data.publicUrl,
    };
  } catch (error) {
    // Re-throw application errors
    if (error.statusCode) throw error;

    throw {
      statusCode: 500,
      code: "UPLOAD_ERROR",
      message: error.message || "An error occurred while uploading the image",
    };
  }
}

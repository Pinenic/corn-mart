import { uploadImageToSupabase } from "./uploadToSupabase.js";
import logger from "../utils/logger.js";

export async function processImageUploads({
  files,
  folder,
}) {
  if (!files || files.length === 0) {
    throw {
      statusCode: 400,
      code: "NO_FILES",
      message: "No files provided for upload",
    };
  }

  const uploads = [];

  for (const file of files) {
    try {
      // Validate file before upload
      if (!file.buffer) {
        throw {
          statusCode: 400,
          code: "INVALID_FILE",
          message: "File buffer is missing",
        };
      }

      if (!file.mimetype || !file.mimetype.startsWith("image/")) {
        throw {
          statusCode: 400,
          code: "INVALID_FILE_TYPE",
          message: "Only image files are allowed",
        };
      }

      const result = await uploadImageToSupabase({
        buffer: file.buffer,
        mimetype: file.mimetype,
        folder,
      });

      uploads.push(result);
    } catch (error) {
      logger.error("Image upload failed", {
        folder,
        filename: file.originalname,
        error: error.message,
      });

      throw {
        statusCode: error.statusCode || 500,
        code: error.code || "UPLOAD_FAILED",
        message: error.message || "Failed to upload image to storage",
      };
    }
  }

  return uploads;
}

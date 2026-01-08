import { uploadImageToSupabase } from "../utils/uploadToSupabase.js";

export async function processImageUploads({
  files,
  folder,
}) {
  const uploads = [];

  for (const file of files) {
    const result = await uploadImageToSupabase({
      buffer: file.buffer,
      mimetype: file.mimetype,
      folder,
    });

    uploads.push(result);
  }

  return uploads;
}

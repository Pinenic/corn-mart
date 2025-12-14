// middlewares/multerConfig.js
import multer from "multer";

// Memory storage means files are kept in RAM as Buffers (not saved to disk)
const storage = multer.memoryStorage();

// Optional: limit file size or filter file types
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) cb(null, true);
  else cb(new Error("Only image files are allowed!"), false);
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
});

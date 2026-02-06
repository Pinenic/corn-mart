// ============================================
// controllers/imageController.js
// ============================================
import AppError from '../utils/AppError.js';
import * as imageService from "../services/prodimageService.js";

/**
 * Upload multiple images for a product
 * POST /api/products/:productId/images
 */
export async function uploadProductImages(req, res, next) {
  try {
    const { productId } = req.params;
    const { thumbnailIndex = 0 } = req.body;
    const { userId } = req.body; // Assuming auth middleware sets req.user

    if (!req.files || req.files.length === 0) {
      throw new AppError('No files uploaded', 400, { code: 'NO_FILES_UPLOADED' });
    }

    const uploadedImages = await imageService.uploadImages(
      userId,
      productId,
      req.files,
      parseInt(thumbnailIndex)
    );

    res.status(201).json({
      success: true,
      message: "Images uploaded successfully",
      data: uploadedImages,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get all images for a product
 * GET /api/products/:productId/images
 */
export async function getProductImages(req, res, next) {
  try {
    const { productId } = req.params;

    const images = await imageService.getProductImages(productId);

    res.status(200).json({
      success: true,
      data: images,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete a single image
 * DELETE /api/images/:imageId
 */
export async function deleteImage(req, res, next) {
  try {
    const { imageId } = req.params;

    await imageService.deleteImage(imageId);

    res.status(200).json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete multiple images
 * DELETE /api/images/batch
 */
export async function deleteMultipleImages(req, res, next) {
  try {
    const { imageIds } = req.body;

    if (!imageIds || !Array.isArray(imageIds) || imageIds.length === 0) {
      throw new AppError('Image IDs array is required', 400, { code: 'MISSING_IMAGE_IDS' });
    }

    await imageService.deleteImages(imageIds);

    res.status(200).json({
      success: true,
      message: "Images deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Replace/update a single image
 * PUT /api/images/:imageId
 */
export async function replaceImage(req, res, next) {
  try {
    const { imageId } = req.params;
    const userId = req.user?.id;

    if (!req.file) {
      throw new AppError('No file uploaded', 400, { code: 'NO_FILE_UPLOADED' });
    }

    const updatedImage = await imageService.replaceImage(
      userId,
      imageId,
      req.file
    );

    res.status(200).json({
      success: true,
      message: "Image replaced successfully",
      data: updatedImage,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Set thumbnail for a product
 * PATCH /api/images/:imageId/thumbnail
 */
export async function setThumbnail(req, res, next) {
  try {
    const { imageId } = req.params;

    await imageService.setThumbnailById(imageId);

    res.status(200).json({
      success: true,
      message: "Thumbnail updated successfully",
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete all images for a product
 * DELETE /api/products/:productId/images
 */
export async function deleteAllProductImages(req, res, next) {
  try {
    const { productId } = req.params;

    await imageService.deleteAllProductImages(productId);

    res.status(200).json({
      success: true,
      message: "All product images deleted successfully",
    });
  } catch (error) {
    next(error);
  }
}

// ============================================
// routes/imageRoutes.js
// ============================================
// import express from "express";
// import multer from "multer";
// import * as imageController from "../controllers/imageController.js";
// import { authMiddleware } from "../middleware/auth.js"; // Your auth middleware

// const router = express.Router();

// // Configure multer for memory storage
// const upload = multer({
//   storage: multer.memoryStorage(),
//   limits: {
//     fileSize: 5 * 1024 * 1024, // 5MB limit
//   },
//   fileFilter: (req, file, cb) => {
//     // Accept images only
//     if (!file.mimetype.startsWith("image/")) {
//       return cb(new Error("Only image files are allowed"), false);
//     }
//     cb(null, true);
//   },
// });

// // All routes require authentication
// router.use(authMiddleware);

// // Product image routes
// router.post(
//   "/products/:productId/images",
//   upload.array("images", 10), // Max 10 images
//   imageController.uploadProductImages
// );

// router.get(
//   "/products/:productId/images",
//   imageController.getProductImages
// );

// router.delete(
//   "/products/:productId/images",
//   imageController.deleteAllProductImages
// );

// // Individual image routes
// router.delete(
//   "/images/:imageId",
//   imageController.deleteImage
// );

// router.delete(
//   "/images/batch",
//   imageController.deleteMultipleImages
// );

// router.put(
//   "/images/:imageId",
//   upload.single("image"),
//   imageController.replaceImage
// );

// router.patch(
//   "/images/:imageId/thumbnail",
//   imageController.setThumbnail
// );

// export default router;

// ============================================
// app.js or server.js (Integration Example)
// ============================================
/*
import express from "express";
import imageRoutes from "./routes/imageRoutes.js";

const app = express();

app.use(express.json());
app.use("/api", imageRoutes);

// Error handling middleware for multer errors
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size is too large. Max 5MB allowed.",
      });
    }
    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Too many files. Max 10 files allowed.",
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

export default app;
*/

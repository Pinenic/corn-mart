import express from "express";
import asyncHandler from '../utils/asyncHandler.js';
import {
  getProducts,
  getProductById,
  createNewProduct,
  updateProduct,
  toggleActiveStatus,
  deleteProduct,
  getProductVariants,
  getVariantById,
  createNewVariant,
  updateVariant,
  restockVariant,
  deleteVariant,
} from "../controllers/inventoryController.js";
import * as imageController from "../controllers/prodImageController.js";
import { upload } from "../middlewares/multerConfig.js";
import {
  deleteImageController,
  uploadProductImagesController,
  uploadVariantImagesController,
} from "../controllers/images.controller.js";

const router = express.Router();

router.get("/:storeId", asyncHandler(getProducts));
router.get("/product/:productId", asyncHandler(getProductById));
router.post("/product", upload.array("images"), asyncHandler(createNewProduct));
router.put("/product/:productId", upload.array("images"), asyncHandler(updateProduct));
router.put("/product/status/:productId", asyncHandler(toggleActiveStatus));
router.delete("/product/:productId", asyncHandler(deleteProduct));
router.get("/product/variants/:productId", asyncHandler(getProductVariants));
router.get("/product/variant/:variantId", asyncHandler(getVariantById));
router.post("/product/variants", asyncHandler(createNewVariant));
router.put("/product/variant/:variantId", asyncHandler(updateVariant));
router.delete("/product/variant/:variantId", asyncHandler(deleteVariant));
router.put("/restock/variant/:variantId", asyncHandler(restockVariant));

// Product image routes
router.post(
  "/products/:productId/thumbnail",
  upload.array("images", 2), // Max 2 images
  asyncHandler(imageController.uploadProductImages)
);

router.post(
  "/products/:productId/images",
  upload.array("images", 4), // Max 4 images
  asyncHandler(uploadProductImagesController)
);

// Product variant image route
router.post(
  "/products/variants/:variantId/images",
  upload.array("images", 4), // Max 4 images
  asyncHandler(uploadVariantImagesController)
);

router.get("/products/:productId/images", asyncHandler(imageController.getProductImages));

// router.delete(
//   "/products/:productId/images",
//   imageController.deleteAllProductImages
// );

// Individual image routes
router.delete("/images/:imageId", asyncHandler(deleteImageController));

// router.delete("/images/batch", imageController.deleteMultipleImages);

// router.put(
//   "/images/:imageId",
//   upload.single("image"),
//   imageController.replaceImage
// );

router.patch("/images/:imageId/thumbnail", asyncHandler(imageController.setThumbnail));

export default router;

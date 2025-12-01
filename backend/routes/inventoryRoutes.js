import express from "express";
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

const router = express.Router();

router.get("/:storeId", getProducts);
router.get("/product/:productId", getProductById);
router.post("/product", upload.array("images"), createNewProduct);
router.put("/product/:productId", upload.array("images"), updateProduct);
router.put("/product/status/:productId", toggleActiveStatus);
router.delete("/product/:productId", deleteProduct);
router.get("/product/variants/:productId", getProductVariants);
router.get("/product/variant/:variantId", getVariantById);
router.post("/product/variants", createNewVariant);
router.put("/product/variant/:variantId", updateVariant);
router.delete("/product/variant/:variantId", deleteVariant);
router.put("/restock/variant/:variantId", restockVariant);

// Product image routes
router.post(
  "/products/:productId/images",
  upload.array("images", 4), // Max 10 images
  imageController.uploadProductImages
);

router.get("/products/:productId/images", imageController.getProductImages);

router.delete(
  "/products/:productId/images",
  imageController.deleteAllProductImages
);

// Individual image routes
router.delete("/images/:imageId", imageController.deleteImage);

router.delete("/images/batch", imageController.deleteMultipleImages);

router.put(
  "/images/:imageId",
  upload.single("image"),
  imageController.replaceImage
);

router.patch("/images/:imageId/thumbnail", imageController.setThumbnail);

export default router;

import express from "express";
import asyncHandler from "../utils/asyncHandler.js";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
//   getProductsByStoreId,
} from "../controllers/productController.js";

const router = express.Router();

// Get all products
router.get("/", asyncHandler(getProducts));

// Get products for a store
// router.get("/store/:id", asyncHandler(getProductsByStoreId));

// Get a single product by ID
router.get("/:id", asyncHandler(getProductById));

// Create a new product
router.post("/", asyncHandler(createProduct));

// Update a product
router.put("/:id", asyncHandler(updateProduct));

export default router;

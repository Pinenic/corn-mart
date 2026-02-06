import express from "express";
import asyncHandler from '../utils/asyncHandler.js';
import { getCategories, getCategory, getSingleSubCategory, getProducts, searchMarket, getAllCategoryProducts, getSingleProductById } from "../controllers/marketplaceController.js";

const router = express.Router();

router.get("/", asyncHandler(getProducts));
router.get("/categories", asyncHandler(getCategories));
router.get("/search", asyncHandler(searchMarket));
router.get("/categories/:category", asyncHandler(getCategory));
router.get("/categories/:category/:subcat", asyncHandler(getSingleSubCategory));
router.get("/:category/products", asyncHandler(getAllCategoryProducts));
router.get("/:id", asyncHandler(getSingleProductById));

export default router;
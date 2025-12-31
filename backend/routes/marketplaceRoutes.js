import express from "express";
import { getCategories, getCategory, getSingleSubCategory, getProducts, searchMarket, getAllCategoryProducts, getSingleProductById } from "../controllers/marketplaceController.js";

const router = express.Router();

router.get("/", getProducts);
router.get("/categories", getCategories);
router.get("/search", searchMarket);
router.get("/categories/:category", getCategory);
router.get("/categories/:category/:subcat", getSingleSubCategory);
router.get("/:category/products", getAllCategoryProducts);
router.get("/:id", getSingleProductById);

export default router;
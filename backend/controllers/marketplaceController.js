import AppError from "../utils/AppError.js";
import {
  getAllCategories,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getSingleCategory,
  getSubCategory,
  searchDb,
} from "../services/marketplaceService.js";

export const getProducts = async (req, res, next) => {
  try {
    const offset = parseInt(req.query.offset || "0", 10);
    const limit = Math.min(parseInt(req.query.limit || "20", 10), 100);
    const response = await getAllProducts({ offset, limit });
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

export const getSingleProductById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await getProductById(id);
    if (!response)
      throw new AppError("Product not found", 404, {
        code: "PRODUCT_NOT_FOUND",
      });
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

export const getAllCategoryProducts = async (req, res, next) => {
  try {
    const { category } = req.params;
    const response = await getProductsByCategory(category);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const response = await getAllCategories();
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

export const getCategory = async (req, res, next) => {
  try {
    const { category } = req.params;
    const response = await getSingleCategory(category);
    if (!response)
      throw new AppError("Category not found", 404, {
        code: "CATEGORY_NOT_FOUND",
      });
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

export const getSingleSubCategory = async (req, res, next) => {
  try {
    const { category, subcat } = req.params;
    const response = await getSubCategory(category, subcat);
    if (!response)
      throw new AppError("Subcategory not found", 404, {
        code: "SUBCATEGORY_NOT_FOUND",
      });
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

export const searchMarket = async (req, res, next) => {
  try {
    const { q, sid } = req.query;
    if (!q || q.trim().length === 0)
      throw new AppError("Search query is required", 400, {
        code: "MISSING_QUERY",
      });
    if (sid == "null") {
      const response = await searchDb(q);
      res.status(200).json({ success: true, data: response });
      return;
    }
    const response = await searchDb(q, sid);
    res.status(200).json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

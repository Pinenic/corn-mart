// src/controllers/categoryController.js
import categoryService from "../services/categoryService.js";
import response        from "../utils/response.js";
import asyncHandler    from "../utils/asyncHandler.js";

const categoryController = {
  // GET /api/v1/categories
  // Returns all categories with nested subcategories
  getAll: asyncHandler(async (req, res) => {
    const categories = await categoryService.getAllWithSubs();
    return response.ok(res, categories);
  }),

  // GET /api/v1/categories/flat
  // Returns a flat list of categories only — for filter dropdowns
  getFlat: asyncHandler(async (req, res) => {
    const categories = await categoryService.getAll();
    return response.ok(res, categories);
  }),

  // GET /api/v1/categories/:categoryId/subcategories
  getSubcategories: asyncHandler(async (req, res) => {
    const category = await categoryService.getById(req.params.categoryId);
    if (!category) return response.notFound(res, "Category not found");

    const subs = await categoryService.getSubcategories(req.params.categoryId);
    return response.ok(res, subs);
  }),
};

export default categoryController;

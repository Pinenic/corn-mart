// src/controllers/marketplace/marketplaceProductController.js
import marketplaceProductService from "../../services/marketplace/marketplaceProductService.js";
import response                  from "../../utils/response.js";
import asyncHandler               from "../../utils/asyncHandler.js";

const marketplaceProductController = {

  // GET /api/v1/marketplace/products
  // Global product search across all stores
  list: asyncHandler(async (req, res) => {
    const { products, total } = await marketplaceProductService.list(req.query);
    return response.ok(
      res,
      products,
      response.pageMeta({ page: req.query.page, limit: req.query.limit, total })
    );
  }),

  // GET /api/v1/marketplace/products/:productId
  // Full product detail including variants and images
  getOne: asyncHandler(async (req, res) => {
    const product = await marketplaceProductService.getById(req.params.productId);
    if (!product) return response.notFound(res, "Product not found");
    return response.ok(res, product);
  }),
};

export default marketplaceProductController;

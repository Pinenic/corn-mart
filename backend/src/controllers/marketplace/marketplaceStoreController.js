// src/controllers/marketplace/marketplaceStoreController.js
import marketplaceStoreService from "../../services/marketplace/marketplaceStoreService.js";
import response                from "../../utils/response.js";
import asyncHandler            from "../../utils/asyncHandler.js";

const marketplaceStoreController = {

  // GET /api/v1/marketplace/stores
  list: asyncHandler(async (req, res) => {
    const { stores, total } = await marketplaceStoreService.list(req.query);
    return response.ok(
      res,
      stores,
      response.pageMeta({ page: req.query.page, limit: req.query.limit, total })
    );
  }),

  // GET /api/v1/marketplace/stores/:storeId
  // Optionally enhanced with follow status for authenticated buyers
  getOne: asyncHandler(async (req, res) => {
    const store = await marketplaceStoreService.getById(req.params.storeId);
    if (!store) return response.notFound(res, "Store not found");

    // If the buyer is logged in, tell them whether they follow this store
    const isFollowing = req.user
      ? await marketplaceStoreService.isFollowing(req.params.storeId, req.user.id)
      : false;

    return response.ok(res, { ...store, is_following: isFollowing });
  }),

  // GET /api/v1/marketplace/stores/:storeId/products
  // Thin wrapper — delegates to the product service with store_id filter
  getProducts: asyncHandler(async (req, res) => {
    // Handled by marketplaceProductController.list with store_id injected
    // This route exists for URL clarity; the controller forwards to product list
    const marketplaceProductService =
      (await import("../../services/marketplace/marketplaceProductService.js")).default;

    const { products, total } = await marketplaceProductService.listForStore(
      req.params.storeId,
      req.query
    );
    return response.ok(
      res,
      products,
      response.pageMeta({ page: req.query.page, limit: req.query.limit, total })
    );
  }),

  // GET /api/v1/marketplace/stores/:storeId/locations
  getLocations: asyncHandler(async (req, res) => {
    const store = await marketplaceStoreService.getById(req.params.storeId);
    if (!store) return response.notFound(res, "Store not found");

    const locations = await marketplaceStoreService.getLocations(req.params.storeId);
    return response.ok(res, locations);
  }),

  // POST /api/v1/marketplace/stores/:storeId/follow  [auth required]
  follow: asyncHandler(async (req, res) => {
    const result = await marketplaceStoreService.follow(
      req.params.storeId,
      req.user.id
    );

    if (result === null) return response.notFound(res, "Store not found");
    if (result.alreadyFollowing) {
      return response.ok(res, { following: true, message: "Already following this store" });
    }
    return response.created(res, { following: true });
  }),

  // DELETE /api/v1/marketplace/stores/:storeId/follow  [auth required]
  unfollow: asyncHandler(async (req, res) => {
    const unfollowed = await marketplaceStoreService.unfollow(
      req.params.storeId,
      req.user.id
    );
    // Return 200 whether or not they were following — idempotent
    return response.ok(res, { following: false });
  }),
};

export default marketplaceStoreController;

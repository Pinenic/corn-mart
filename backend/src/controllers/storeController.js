// src/controllers/storeController.js
import storeService from "../services/storeService.js";
import response     from "../utils/response.js";
import asyncHandler from "../utils/asyncHandler.js";

const storeController = {
  // POST /api/v1/stores
  createOne: asyncHandler( async (req, res) => {
    const store = await storeService.createStore({owner_id: req.user.id, ...req.body});
    return response.created(res, store);
  }) ,
  // GET /api/v1/stores/mine
  getMine: asyncHandler(async (req, res) => {
    const stores = await storeService.getByOwner(req.user.id);
    return response.ok(res, stores);
  }),

  // GET /api/v1/stores/:storeId
  getOne: asyncHandler(async (req, res) => {
    return response.ok(res, req.store);
  }),

  // PATCH /api/v1/stores/:storeId
  update: asyncHandler(async (req, res) => {
    const updated = await storeService.update(req.store.id, req.body);
    return response.ok(res, updated);
  }),

  // GET /api/v1/stores/:storeId/locations
  getLocations: asyncHandler(async (req, res) => {
    const locations = await storeService.getLocations(req.store.id);
    return response.ok(res, locations);
  }),

  // POST /api/v1/stores/:storeId/locations
  createLocation: asyncHandler(async (req, res) => {
    const location = await storeService.createLocation(req.store.id, req.body);
    return response.created(res, location);
  }),

  // PATCH /api/v1/stores/:storeId/locations/:locationId
  updateLocation: asyncHandler(async (req, res) => {
    const location = await storeService.updateLocation(
      req.store.id, req.params.locationId, req.body
    );
    if (!location) return response.notFound(res, "Location not found");
    return response.ok(res, location);
  }),

  // DELETE /api/v1/stores/:storeId/locations/:locationId
  deleteLocation: asyncHandler(async (req, res) => {
    const deleted = await storeService.deleteLocation(
      req.store.id, req.params.locationId
    );
    if (!deleted) return response.notFound(res, "Location not found");
    return response.noContent(res);
  }),
};

export default storeController;

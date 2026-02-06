import express from "express";
import asyncHandler from '../utils/asyncHandler.js';
import {
  getStores,
  getStoreById,
  createStore,
  updateStore,
  follow,
  unfollow,
  checkUserFollow,
  getFollowersCount,
  createStoreLocation,
  updateStoreLocation,
  getStoreLocation,
  deleteStoreLocation,
} from "../controllers/storeController.js";
import { upload } from "../middlewares/multerConfig.js";

const router = express.Router();

// Get all stores
router.get("/", asyncHandler(getStores));

// Get a single store by ID
router.get("/:id", asyncHandler(getStoreById));

// Create a new store
router.post(
  "/",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  asyncHandler(createStore)
);

// Update an existing store
router.put(
  "/:id",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  asyncHandler(updateStore)
);

/**
 *  STORE FOLLOW ROUTES
 */

router.post("/:storeId/follow", asyncHandler(follow));
router.delete("/:storeId/follow", asyncHandler(unfollow));
router.get("/:storeId/is-following", asyncHandler(checkUserFollow));
router.get("/:storeId/followers", asyncHandler(getFollowersCount));

/**
 * STORE LOCATION AND DELIVERY ROUTES
 */


router.post("/:storeId/location", asyncHandler(createStoreLocation));
router.get("/:storeId/location", asyncHandler(getStoreLocation));
router.put("/:storeId/location", asyncHandler(updateStoreLocation));
router.delete("/:storeId/location", asyncHandler(deleteStoreLocation));


export default router;

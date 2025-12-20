import express from "express";
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
router.get("/", getStores);

// Get a single store by ID
router.get("/:id", getStoreById);

// Create a new store
router.post(
  "/",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  createStore
);

// Update an existing store
router.put(
  "/:id",
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
  updateStore
);

/**
 *  STORE FOLLOW ROUTES
 */

router.post("/:storeId/follow", follow);
router.delete("/:storeId/follow", unfollow);
router.get("/:storeId/is-following", checkUserFollow);
router.get("/:storeId/followers", getFollowersCount);

/**
 * STORE LOCATION AND DELIVERY ROUTES
 */


router.post("/:storeId/location", createStoreLocation);
router.get("/:storeId/location", getStoreLocation);
router.put("/:storeId/location", updateStoreLocation);
router.delete("/:storeId/location", deleteStoreLocation);


export default router;

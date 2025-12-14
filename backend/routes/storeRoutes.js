import express from "express";
import {
  getStores,
  getStoreById,
  createStore,
  updateStore,
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

export default router;

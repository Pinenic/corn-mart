import express from "express";
import asyncHandler from '../utils/asyncHandler.js';
import { getAnalytics } from "../controllers/anaytics.controller.js";

const router = express.Router();

router.post("/:storeId", asyncHandler(getAnalytics));

export default router;
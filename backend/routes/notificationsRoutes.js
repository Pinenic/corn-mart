import express from "express";
import asyncHandler from '../utils/asyncHandler.js';
import { getAllBuyerNotifications, getAllSellerNotifications, readAllNotifications, readSingleNotification, viewAllNotifications } from "../controllers/notificationsController.js";


const router = express.Router();

router.get("/:userId", asyncHandler(getAllBuyerNotifications));
router.get("/store/:userId", asyncHandler(getAllSellerNotifications));
router.patch("/:id/read", asyncHandler(readSingleNotification));
router.patch("/:userId/read-all", asyncHandler(readAllNotifications));
router.patch("/:userId/view-all", asyncHandler(viewAllNotifications));

export default router
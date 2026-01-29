import express from "express";
import { getAllBuyerNotifications, getAllSellerNotifications, readAllNotifications, readSingleNotification } from "../controllers/notificationsController.js";


const router = express.Router();

router.get("/:userId", getAllBuyerNotifications);
router.get("/store/:userId", getAllSellerNotifications);
router.patch("/:id/read", readSingleNotification);
router.patch("/:userId/read-all", readAllNotifications);

export default router
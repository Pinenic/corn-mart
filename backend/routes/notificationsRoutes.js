import express from "express";
import { getAllBuyerNotifications, readAllNotifications, readSingleNotification } from "../controllers/notificationsController.js";


const router = express.Router();

router.get("/:userId", getAllBuyerNotifications);
router.patch("/:id/read", readSingleNotification);
router.patch("/:userId/read-all", readAllNotifications);

export default router
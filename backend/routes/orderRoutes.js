import express from "express";
import asyncHandler from '../utils/asyncHandler.js';
import {
  updateStoreOrder,
  getOrders,
  getOrderDetails,
  getUserStoreOrders,
  getUserStoreOrderDetails,
  createNewOrder,
  cancelOrder,
  getOrderMessageList,
  sendMessage,
  readChat,
  getRead,
  sendImageMessage,
  shipOrder,
} from "../controllers/orderController.js";
import { upload } from "../middlewares/multerConfig.js";

const router = express.Router();

router.post("/create", asyncHandler(createNewOrder));
router.post("/ship", asyncHandler(shipOrder));
router.post("/cancel", asyncHandler(cancelOrder));
router.get("/buyer/:buyerId", asyncHandler(getOrders));
router.get("/details/:orderId", asyncHandler(getOrderDetails));
router.get("/store/:storeId", asyncHandler(getUserStoreOrders));
router.get("/store/order/:orderId", asyncHandler(getUserStoreOrderDetails));
router.put("/update/store-order/:storeOrderId", asyncHandler(updateStoreOrder));
router.get("/:orderId/messages", asyncHandler(getOrderMessageList));
router.post("/:orderId/messages", asyncHandler(sendMessage));
router.post("/:orderId/messages/images", upload.array("images", 4), asyncHandler(sendImageMessage));
router.post("/:orderId/messages/read", asyncHandler(readChat));
router.get("/:orderId/:userId/messages/read", asyncHandler(getRead));

export default router;

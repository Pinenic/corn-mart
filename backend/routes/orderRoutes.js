import express from "express";
import {
  updateStoreOrder,
  getOrders,
  getOrderDetails,
  getUserStoreOrders,
  getUserStoreOrderDetails,
  createNewOrder,
  confirmOrder,
  cancelOrder,
  getOrderMessageList,
  sendMessage,
  readChat,
  getRead,
  sendImageMessage,
} from "../controllers/orderController.js";
import { upload } from "../middlewares/multerConfig.js";

const router = express.Router();

router.post("/create", createNewOrder);
router.post("/confirm", confirmOrder);
router.post("/cancel", cancelOrder);
router.get("/buyer/:buyerId", getOrders);
router.get("/details/:orderId", getOrderDetails);
router.get("/store/:storeId", getUserStoreOrders);
router.get("/store/order/:orderId", getUserStoreOrderDetails);
router.put("/update/store-order/:storeOrderId", updateStoreOrder);
router.get("/:orderId/messages", getOrderMessageList);
router.post("/:orderId/messages", sendMessage);
router.post("/:orderId/messages/images", upload.array("images", 4), sendImageMessage);
router.post("/:orderId/messages/read", readChat);
router.get("/:orderId/:userId/messages/read", getRead);

export default router;

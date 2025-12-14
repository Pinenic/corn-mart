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
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/create", createNewOrder);
router.post("/confirm", confirmOrder);
router.post("/cancel", cancelOrder);
router.get("/buyer/:buyerId", getOrders);
router.get("/details/:orderId", getOrderDetails);
router.get("/store/:storeId", getUserStoreOrders);
router.get("/store/order/:orderId", getUserStoreOrderDetails);
router.put("/update/store-order/:storeOrderId", updateStoreOrder);

export default router;

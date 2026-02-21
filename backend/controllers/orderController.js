import AppError from "../utils/AppError.js";
import {
  updateStoreOrderStatus,
  getBuyerOrderDetails,
  getBuyerOrders,
  getStoreOrders,
  getStoreOrderDetails,
  createOrder,
  SellerCancelOrder,
  getOrderMessagesById,
  postMessage,
  markChatasRead,
  getLastRead,
  postImagesMessage,
  SellerShipOrder,
} from "../services/orderService.js";

export const createNewOrder = async (req, res, next) => {
  try {
    const { cart_id, buyer_id } = req.body;
    if (!cart_id || !buyer_id)
      throw new AppError("cart_id and buyer_id required", 400, {
        code: "INVALID_PAYLOAD",
      });

    const response = await createOrder(cart_id, buyer_id);

    if (!response) {
      // If exception in DB function, Supabase returns error
      throw new AppError("Problem creating the order", 400, {
        code: "ORDER_CREATION_FAILED",
      });
    }

    return res.json({ order_id: response });
  } catch (err) {
    next(err);
  }
};

export const shipOrder = async (req, res, next) => {
  try {
    const { storeOrderId, sellerId } = req.body;
    if (!storeOrderId || !sellerId)
      throw new AppError("storeOrderId and sellerId required", 400, {
        code: "INVALID_PAYLOAD",
      });

    const response = await SellerShipOrder(storeOrderId, sellerId);

    if (!response) {
      // If exception in DB function, Supabase returns error
      throw new AppError("Problem confirming the order", 400, {
        code: "ORDER_CONFIRM_FAILED",
      });
    }

    return res.json({ order_id: response });
  } catch (err) {
    next(err);
  }
};
export const cancelOrder = async (req, res, next) => {
  try {
    const { storeOrderId, sellerId } = req.body;
    if (!storeOrderId || !sellerId)
      throw new AppError("storeOrderId and sellerId required", 400, {
        code: "INVALID_PAYLOAD",
      });

    const response = await SellerCancelOrder(storeOrderId, sellerId);

    if (!response) {
      // If exception in DB function, Supabase returns error
      throw new AppError("Problem cancelling the order", 400, {
        code: "ORDER_CANCEL_FAILED",
      });
    }

    return res.json({ order_id: response });
  } catch (err) {
    next(err);
  }
};

export const updateStoreOrder = async (req, res, next) => {
  try {
    const { storeOrderId } = req.params;
    const { storeId, action, actor_id, actorRole, metadata } = req.body;
    const response = await updateStoreOrderStatus(
      storeOrderId,
      storeId,
      action,
      actor_id,
      actorRole,
      metadata
    );
    if (response) return res.json({ success: true, data: response });
    throw new AppError("Problem updating store order", 400, {
      code: "STORE_ORDER_UPDATE_FAILED",
      data: response,
    });
  } catch (err) {
    next(err);
  }
};

export const getOrders = async (req, res, next) => {
  try {
    const { buyerId } = req.params;
    const orders = await getBuyerOrders(buyerId);
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getOrderDetails = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await getBuyerOrderDetails(orderId);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

export const getUserStoreOrders = async (req, res, next) => {
  try {
    const { storeId } = req.params;
    const orders = await getStoreOrders(storeId);
    res.json(orders);
  } catch (err) {
    next(err);
  }
};

export const getUserStoreOrderDetails = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const order = await getStoreOrderDetails(orderId);
    res.json(order);
  } catch (err) {
    next(err);
  }
};

/**
 * ORDER CHAT METHODS
 */

export const getOrderMessageList = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const response = await getOrderMessagesById(orderId);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const sendMessage = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { message, userId, role } = req.body;
    const response = await postMessage(orderId, userId, role, message);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const sendImageMessage = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { userId, role } = req.body;
    if (!req.files || req.files.length === 0)
      throw new AppError("No files uploaded", 400, {
        code: "NO_FILES_UPLOADED",
      });
    const response = await postImagesMessage(orderId, userId, role, req.files);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const readChat = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.body;
    const response = await markChatasRead(orderId, userId);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

export const getRead = async (req, res, next) => {
  try {
    const { orderId, userId } = req.params;
    const response = await getLastRead(orderId, userId);
    res.json(response);
  } catch (error) {
    next(error);
  }
};

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

export const createNewOrder = async (req, res) => {
  try {
    const { cart_id, buyer_id } = req.body;
    if (!cart_id || !buyer_id)
      return res.status(400).json({ error: "cart_id and buyer_id required" });

    const response = await createOrder(cart_id, buyer_id);

    if (!response) {
      // If exception in DB function, Supabase returns error
      return res.status(400).json({ error: "problem with creating the order" });
    }

    return res.json({ order_id: response });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
};

export const shipOrder = async (req, res) => {
  try {
    const { storeOrderId, sellerId } = req.body;
    if (!storeOrderId || !sellerId)
      return res
        .status(400)
        .json({ error: "storeOrderId and sellerId required" });

    const response = await SellerShipOrder(storeOrderId, sellerId);

    if (!response) {
      // If exception in DB function, Supabase returns error
      return res
        .status(400)
        .json({ error: "problem with confirming the order" });
    }

    return res.json({ order_id: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
};
export const cancelOrder = async (req, res) => {
  try {
    const { storeOrderId, sellerId } = req.body;
    if (!storeOrderId || !sellerId)
      return res
        .status(400)
        .json({ error: "storeOrderId and sellerId required" });

    const response = await SellerCancelOrder(storeOrderId, sellerId);

    if (!response) {
      // If exception in DB function, Supabase returns error
      return res
        .status(400)
        .json({ error: "problem with cancelling the order" });
    }

    return res.json({ order_id: data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "server error" });
  }
};

export const updateStoreOrder = async (req, res) => {
  try {
    const { storeOrderId } = req.params;
    console.log(storeOrderId);
    const { storeId, action, actor_id, actorRole, metadata } = req.body;
    const response = await updateStoreOrderStatus(
      storeOrderId,
      storeId,
      action,
      actor_id,
      actorRole,
      metadata
    );
    response
      ? res.json({ success: true, data: response })
      : res.status(305).json({ success: false, data: response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrders = async (req, res) => {
  try {
    const { buyerId } = req.params;
    const orders = await getBuyerOrders(buyerId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await getBuyerOrderDetails(orderId);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserStoreOrders = async (req, res) => {
  try {
    const { storeId } = req.params;
    const orders = await getStoreOrders(storeId);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const getUserStoreOrderDetails = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await getStoreOrderDetails(orderId);
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * ORDER CHAT METHODS
 */

export const getOrderMessageList = async (req, res) => {
  try {
    const { orderId } = req.params;
    const response = await getOrderMessagesById(orderId);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error.message);
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { message, userId, role } = req.body;
    const response = await postMessage(orderId, userId, role, message);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error.message);
  }
};

export const sendImageMessage = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId, role } = req.body;
    const { files } = req.files;
    if (!req.files|| req.files.length === 0)
      return res.status(400).json({ error: "No files uploaded" });
    const response = await postImagesMessage(orderId, userId, role, req.files);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error.message);
  }
};

export const readChat = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { userId } = req.body;
    const response = await markChatasRead(orderId, userId);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error.message);
  }
};

export const getRead = async (req, res) => {
  try {
    const { orderId, userId } = req.params;
    const response = await getLastRead(orderId, userId);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error.message);
  }
};

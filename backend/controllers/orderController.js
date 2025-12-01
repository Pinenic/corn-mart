import {
  updateStoreOrderStatus,
  getBuyerOrderDetails,
  getBuyerOrders,
  getStoreOrders,
  getStoreOrderDetails,
  createOrder,
  SellerConfirmOrder,
  SellerCancelOrder,
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

export const confirmOrder = async (req, res) => {
  try {
    const { storeOrderId, sellerId } = req.body;
    if (!storeOrderId || !sellerId)
      return res
        .status(400)
        .json({ error: "storeOrderId and sellerId required" });

    const response = await SellerConfirmOrder(storeOrderId, sellerId);

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
    const { storeId, newStatus, metadata } = req.body;
    const response = await updateStoreOrderStatus(
      storeOrderId,
      storeId,
      newStatus,
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

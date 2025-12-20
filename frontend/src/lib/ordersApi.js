import { fetchApi } from "./apiClient";

export async function createOrder(cart_id, buyer_id) {
  return fetchApi(`/api/orders/create`, {
    method: "POST",
    body: JSON.stringify({
      cart_id,
      buyer_id,
    }),
  });
}

export async function getStoreOrders(storeId) {
  return fetchApi(`/api/orders/store/${storeId}`);
}

export async function getStoreOrderDetails(orderId) {
  return fetchApi(`/api/orders/store/order/${orderId}`);
}

export async function updateStoreOrderStatus(
  storeOrderId,
  { storeId, newStatus, metadata }
) {
  return fetchApi(`/api/orders/update/store-order/${storeOrderId}`, {
    method: "PUT",
    body: JSON.stringify({
      storeId,
      newStatus,
      metadata,
    }),
  });
}

export async function getBuyerOrder(buyerId) {
  return fetchApi(`/api/orders/buyer/${buyerId}`);
}

export async function getBuyerOrderDetails(orderId) {
  return fetchApi(`/api/orders/details/${orderId}`);
}

export async function getOrderMessages(orderId) {
  return fetchApi(`/api/orders/${orderId}/messages`);
}

export async function sendOrderMessage(orderId, userId, role, message) {
  return fetchApi(`/api/orders/${orderId}/messages`, {
    method: "POST",
    body: JSON.stringify({
      userId,
      role,
      message,
    }),
  });
}

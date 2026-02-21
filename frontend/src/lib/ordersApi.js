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
  { storeId, action, actor_id, actorRole, metadata }
) {
  return fetchApi(`/api/orders/update/store-order/${storeOrderId}`, {
    method: "PUT",
    body: JSON.stringify({
      storeId,
      action,
      actor_id,
      actorRole,
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

export async function sendOrderMessageImages(orderId, data) {
  // const formData = new FormData();
  // formData.append("userId", userId);
  // formData.append("role", role)
  // images.forEach((file) => formData.append("images", file));
  return fetchApi(`/api/orders/${orderId}/messages/images`, {
    method: "POST",
    body: data,
  });
}

export async function markChatAsRead(orderId, userId) {
  return fetchApi(`/api/orders/${orderId}/messages/read`, {
    method: "POST",
    body: JSON.stringify({
      userId,
    }),
  });
}

export async function getLastRead(orderId, userId) {
  return fetchApi(`/api/orders/${orderId}/${userId}/messages/read`);
}

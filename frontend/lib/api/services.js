// lib/api/services.js
// Centralized API service layer
// All API endpoint calls go through here for consistency

import { apiClient } from "./client";

// ── Stores ────────────────────────────────────────────────────

export const storeService = {
  // GET /stores/mine
  getMine: () => apiClient.get("/stores/mine"),

  // GET /stores/:storeId
  getById: (storeId) => apiClient.get(`/stores/${storeId}`),

  // PATCH /stores/:storeId
  update: (storeId, data) => apiClient.patch(`/stores/${storeId}`, data),

  // GET /stores/:storeId/locations
  getLocations: (storeId) => apiClient.get(`/stores/${storeId}/locations`),

  // POST /stores/:storeId/locations
  createLocation: (storeId, data) =>
    apiClient.post(`/stores/${storeId}/locations`, data),

  // PATCH /stores/:storeId/locations/:locationId
  updateLocation: (storeId, locationId, data) =>
    apiClient.patch(`/stores/${storeId}/locations/${locationId}`, data),

  // DELETE /stores/:storeId/locations/:locationId
  deleteLocation: (storeId, locationId) =>
    apiClient.delete(`/stores/${storeId}/locations/${locationId}`),
};

// ── Products ──────────────────────────────────────────────────

export const productService = {
  // GET /stores/:storeId/products
  list: (storeId, params = {}) =>
    apiClient.get(`/stores/${storeId}/products`, { params }),

  // POST /stores/:storeId/products
  create: (storeId, data) =>
    apiClient.post(`/stores/${storeId}/products`, data),

  // GET /stores/:storeId/products/:productId
  getById: (storeId, productId) =>
    apiClient.get(`/stores/${storeId}/products/${productId}`),

  // PATCH /stores/:storeId/products/:productId
  update: (storeId, productId, data) =>
    apiClient.patch(`/stores/${storeId}/products/${productId}`, data),

  // DELETE /stores/:storeId/products/:productId
  delete: (storeId, productId) =>
    apiClient.delete(`/stores/${storeId}/products/${productId}`),

  // GET /stores/:storeId/products/:productId/variants
  listVariants: (storeId, productId) =>
    apiClient.get(`/stores/${storeId}/products/${productId}/variants`),

  // POST /stores/:storeId/products/:productId/variants
  createVariant: (storeId, productId, data) =>
    apiClient.post(`/stores/${storeId}/products/${productId}/variants`, data),

  // PATCH /stores/:storeId/products/:productId/variants/:variantId
  updateVariant: (storeId, productId, variantId, data) =>
    apiClient.patch(
      `/stores/${storeId}/products/${productId}/variants/${variantId}`,
      data
    ),

  // DELETE /stores/:storeId/products/:productId/variants/:variantId
  deleteVariant: (storeId, productId, variantId) =>
    apiClient.delete(
      `/stores/${storeId}/products/${productId}/variants/${variantId}`
    ),

  // PATCH /stores/:storeId/products/:productId/images/reorder
  reorderImages: (storeId, productId, data) =>
    apiClient.patch(
      `/stores/${storeId}/products/${productId}/images/reorder`,
      data
    ),

  // DELETE /stores/:storeId/products/:productId/images/:imageId
  deleteImage: (storeId, productId, imageId) =>
    apiClient.delete(
      `/stores/${storeId}/products/${productId}/images/${imageId}`
    ),
};

// ── Orders ────────────────────────────────────────────────────

export const orderService = {
  // GET /stores/:storeId/orders
  list: (storeId, params = {}) =>
    apiClient.get(`/stores/${storeId}/orders`, { params }),

  // GET /stores/:storeId/orders/status-counts
  getStatusCounts: (storeId) =>
    apiClient.get(`/stores/${storeId}/orders/status-counts`),

  // GET /stores/:storeId/orders/:orderId
  getById: (storeId, orderId) =>
    apiClient.get(`/stores/${storeId}/orders/${orderId}`),

  // PATCH /stores/:storeId/orders/:orderId/status
  updateStatus: (storeId, orderId, data) =>
    apiClient.patch(`/stores/${storeId}/orders/${orderId}/status`, data),

  // GET /stores/:storeId/orders/:orderId/history
  getHistory: (storeId, orderId) =>
    apiClient.get(`/stores/${storeId}/orders/${orderId}/history`),
};

// ── Analytics ─────────────────────────────────────────────────

export const analyticsService = {
  // GET /stores/:storeId/analytics/overview
  getOverview: (storeId, params = {}) =>
    apiClient.get(`/stores/${storeId}/analytics/overview`, { params }),

  // GET /stores/:storeId/analytics/revenue
  getRevenue: (storeId, params = {}) =>
    apiClient.get(`/stores/${storeId}/analytics/revenue`, { params }),

  // GET /stores/:storeId/analytics/orders-by-status
  getOrdersByStatus: (storeId) =>
    apiClient.get(`/stores/${storeId}/analytics/orders-by-status`),

  // GET /stores/:storeId/analytics/products
  getProducts: (storeId, params = {}) =>
    apiClient.get(`/stores/${storeId}/analytics/products`, { params }),

  // GET /stores/:storeId/analytics/followers
  getFollowers: (storeId, params = {}) =>
    apiClient.get(`/stores/${storeId}/analytics/followers`, { params }),

  // GET /stores/:storeId/analytics/categories
  getCategories: (storeId, params = {}) =>
    apiClient.get(`/stores/${storeId}/analytics/categories`, { params }),
};

// ── Categories ────────────────────────────────────────────────

export const categoryService = {
  // GET /categories
  getAll: () => apiClient.get("/categories"),

  // GET /categories/flat
  getFlat: () => apiClient.get("/categories/flat"),

  // GET /categories/:categoryId/subcategories
  getSubcategories: (categoryId) =>
    apiClient.get(`/categories/${categoryId}/subcategories`),
};

// ── Marketplace Stores ────────────────────────────────────────

export const marketplaceStoreService = {
  // GET /marketplace/stores
  list: (params = {}) => apiClient.get("/marketplace/stores", { params }),

  // GET /marketplace/stores/:storeId
  getById: (storeId) => apiClient.get(`/marketplace/stores/${storeId}`),

  // GET /marketplace/stores/:storeId/products
  getProducts: (storeId, params = {}) =>
    apiClient.get(`/marketplace/stores/${storeId}/products`, { params }),

  // GET /marketplace/stores/:storeId/locations
  getLocations: (storeId) =>
    apiClient.get(`/marketplace/stores/${storeId}/locations`),

  // POST /marketplace/stores/:storeId/follow
  follow: (storeId) => apiClient.post(`/marketplace/stores/${storeId}/follow`),

  // DELETE /marketplace/stores/:storeId/follow
  unfollow: (storeId) =>
    apiClient.delete(`/marketplace/stores/${storeId}/follow`),
};

// ── Marketplace Products ──────────────────────────────────────

export const marketplaceProductService = {
  // GET /marketplace/products
  list: (params = {}) => apiClient.get("/marketplace/products", { params }),

  // GET /marketplace/products/:productId
  getById: (productId) => apiClient.get(`/marketplace/products/${productId}`),
};

// ── Marketplace Buyer ─────────────────────────────────────────

export const marketplaceBuyerService = {
  // POST /marketplace/orders
  placeOrder: (data) => apiClient.post("/marketplace/orders", data),

  // GET /marketplace/orders
  listOrders: (params = {}) => apiClient.get("/marketplace/orders", { params }),

  // GET /marketplace/orders/:orderId
  getOrder: (orderId) => apiClient.get(`/marketplace/orders/${orderId}`),

  // PATCH /marketplace/orders/:orderId/cancel
  cancelOrder: (orderId, data) =>
    apiClient.patch(`/marketplace/orders/${orderId}/cancel`, data),

  // GET /marketplace/notifications
  listNotifications: (params = {}) =>
    apiClient.get("/marketplace/notifications", { params }),

  // PATCH /marketplace/notifications/read-all
  markAllNotificationsRead: () =>
    apiClient.patch("/marketplace/notifications/read-all"),

  // PATCH /marketplace/notifications/:notificationId/read
  markNotificationRead: (notificationId) =>
    apiClient.patch(`/marketplace/notifications/${notificationId}/read`),
};

// ── Health Check ──────────────────────────────────────────────

export const healthService = {
  // GET /health
  check: () => apiClient.get("/health"),
};

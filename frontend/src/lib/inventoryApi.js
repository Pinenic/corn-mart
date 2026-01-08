// src/lib/inventoryApi.js
import { fetchApi } from "./apiClient";

// ---------- 🛍 PRODUCTS ----------
export async function getProductsByStore(storeId) {
  return fetchApi(`/api/inventory/${storeId}`);
}

export async function getProductById(productId) {
  return fetchApi(`/api/inventory/product/${productId}`);
}

export async function createProduct({
  userId,
  name,
  description,
  price,
  store_id,
  category,
  brand,
  images = [],
  subcat
}) {
  const formData = new FormData();
  formData.append("userId", userId);
  formData.append("name", name);
  formData.append("description", description);
  formData.append("price", price);
  formData.append("store_id", store_id);
  formData.append("category", category);
  formData.append("brand", brand);
  formData.append("subcat", JSON.stringify(subcat));

  images.forEach((file) => formData.append("images", file));

  return fetchApi(`/api/inventory/product`, {
    method: "POST",
    body: formData,
  });
}

export async function updateProduct(
  productId,
  { userId, updates, newImages = [], removedImageIds = [] }
) {
  const formData = new FormData();

  formData.append("userId", userId);
  Object.entries(updates || {}).forEach(([key, val]) => {
    formData.append(key, val);
  });

  newImages.forEach((file) => formData.append("newImages", file));
  removedImageIds.forEach((id) => formData.append("removedImageIds", id));

  return fetchApi(`/api/inventory/product/${productId}`, {
    method: "PUT",
    body: formData,
  });
}

export async function deleteProduct(productId) {
  return fetchApi(`/api/inventory/product/${productId}`, { method: "DELETE" });
}

export async function toggleProductActiveStatus(productId, isActive) {
  return fetchApi(`/api/inventory/product/${productId}/toggle-active`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

// ---------- 🎨 VARIANTS ----------
export async function getAllVariants(productId) {
  return fetchApi(`/api/inventory/product/variants/${productId}`);
}

export async function getVariantById(variantId) {
  return fetchApi(`/api/inventory/variant/${variantId}`);
}

export async function createVariant({
  productId,
  name,
  description,
  price,
  stock,
  lowStockThreshold,
}) {
  return fetchApi(`/api/inventory/product/variants`, {
    method: "POST",
    body: JSON.stringify({
      productId,
      name,
      description,
      price,
      stock,
      lowStockThreshold,
    }),
  });
}

export async function updateVariant(variantId, updates) {
  return fetchApi(`/api/inventory/product/variant/${variantId}`, {
    method: "PUT",
    body: JSON.stringify(updates),
  });
}

export async function restockVariant(variantId, updates) {
  return fetchApi(`/api/inventory/variant/${variantId}/restock`, {
    method: "PATCH",
    body: JSON.stringify(updates),
  });
}

export async function deleteVariant(variantId) {
  return fetchApi(`/api/inventory/product/variant/${variantId}`, {
    method: "DELETE",
  });
}

// ---------- 🖼️ IMAGES ----------

/**
 * Get all images for a product
 * @param {string} productId - The product ID
 * @returns {Promise<Object>} Response with image array
 */
export async function getProductImages(productId) {
  return fetchApi(`/api/inventory/products/${productId}/images`);
}

/**
 * Upload multiple images for a product
 * @param {string} productId - The product ID
 * @param {File[]} files - Array of image files
 * @param {number} thumbnailIndex - Index of the thumbnail image (default: 0)
 * @returns {Promise<Object>} Response with uploaded images
 */
export async function uploadProductImages(
  userId,
  productId,
  files,
  thumbnailIndex = 0
) {
  const formData = new FormData();

  // Append all files
  files.forEach((file) => {
    formData.append("images", file);
  });

  // Append thumbnail index
  formData.append("thumbnailIndex", thumbnailIndex);

  // Append user Id
  formData.append("userId", userId);

  return fetchApi(`/api/inventory/products/${productId}/thumbnail`, {
    method: "POST",
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary
    headers: {
      // Remove Content-Type from default headers if fetchApi sets it
    },
  });
}

export async function addProductImages(
  userId,
  productId,
  files
) {
  const formData = new FormData();

  // Append all files
  files.forEach((file) => {
    formData.append("images", file);
  });

  // Append user Id
  formData.append("userId", userId);

  return fetchApi(`/api/inventory/products/${productId}/images`, {
    method: "POST",
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary
    headers: {
      // Remove Content-Type from default headers if fetchApi sets it
    },
  });
}

export async function addProductVariantImages(
  userId,
  productId,
  variantId,
  files
) {
  const formData = new FormData();

  // Append all files
  files.forEach((file) => {
    formData.append("images", file);
  });

  // Append user Id
  formData.append("userId", userId);
  formData.append("product_id", productId);

  return fetchApi(`/api/inventory/products/variants/${variantId}/images`, {
    method: "POST",
    body: formData,
    // Don't set Content-Type header - browser will set it with boundary
    headers: {
      // Remove Content-Type from default headers if fetchApi sets it
    },
  });
}


/**
 * Delete a single image
 * @param {string} imageId - The image ID
 * @returns {Promise<Object>} Response confirming deletion
 */
export async function deleteImage(imageId) {
  return fetchApi(`/api/inventory/images/${imageId}`, {
    method: "DELETE",
  });
}

/**
 * Delete multiple images at once
 * @param {string[]} imageIds - Array of image IDs to delete
 * @returns {Promise<Object>} Response confirming deletion
 */
export async function deleteMultipleImages(imageIds) {
  return fetchApi(`/api/inventory/images/batch`, {
    method: "DELETE",
    body: JSON.stringify({ imageIds }),
  });
}

/**
 * Replace/update a single image
 * @param {string} imageId - The image ID to replace
 * @param {File} file - New image file
 * @returns {Promise<Object>} Response with updated image
 */
export async function replaceImage(imageId, file) {
  const formData = new FormData();
  formData.append("image", file);

  return fetchApi(`/api/inventory/images/${imageId}`, {
    method: "PUT",
    body: formData,
  });
}

/**
 * Set an image as the product thumbnail
 * @param {string} imageId - The image ID to set as thumbnail
 * @returns {Promise<Object>} Response confirming thumbnail update
 */
export async function setImageAsThumbnail(imageId) {
  return fetchApi(`/api/inventory/images/${imageId}/thumbnail`, {
    method: "PATCH",
  });
}

/**
 * Delete all images for a product
 * @param {string} productId - The product ID
 * @returns {Promise<Object>} Response confirming deletion
 */
export async function deleteAllProductImages(productId) {
  return fetchApi(`/api/inventory/products/${productId}/images`, {
    method: "DELETE",
  });
}

// ---------- 🎯 USAGE EXAMPLES ----------

/*
// Get all images for a product
const { data: images } = await getProductImages(productId);

// Upload new images
const files = [file1, file2, file3];
const { data: uploadedImages } = await uploadProductImages(productId, files, 0);

// Delete a single image
await deleteImage(imageId);

// Delete multiple images
await deleteMultipleImages([imageId1, imageId2, imageId3]);

// Replace an image
const newFile = e.target.files[0];
const { data: updatedImage } = await replaceImage(imageId, newFile);

// Set thumbnail
await setImageAsThumbnail(imageId);

// Delete all product images
await deleteAllProductImages(productId);
*/

// ---------- 🔧 HELPER: fetchApi wrapper for FormData ----------

/*
If your fetchApi function automatically sets Content-Type to application/json,
you'll need to handle FormData differently. Here's a modified version:

export async function fetchApi(url, options = {}) {
  const token = localStorage.getItem('authToken');
  
  const config = {
    ...options,
    headers: {
      ...options.headers,
    },
  };

  // Add auth token
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  // Only set Content-Type for non-FormData requests
  if (!(options.body instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, config);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || 'Request failed');
  }

  return data;
}
*/

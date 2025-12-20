import { fetchApi } from "./apiClient";

export async function createStore(userId, payload) {
  const formData = new FormData();
  formData.append("owner_id", userId);
  formData.append("name", payload.name);
  formData.append("description", payload.description);
  formData.append("logo", payload.logo);
  formData.append("banner", payload.banner);
  //   formData.append("category", category);

  //   images.forEach((file) => formData.append("files", file));

  return fetchApi(`/api/stores`, {
    method: "POST",
    body: formData,
  });
}

export async function updateStore(storeId, payload) {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("description", payload.description);
  if(payload.logo) formData.append("logo", payload.logo);
  if(payload.banner) formData.append("banner", payload.banner);

  return fetchApi(`/api/stores/${storeId}`, {
    method: "PUT",
    body: formData,
  });
}

export async function getStoreById(id) {
  return fetchApi(`/api/stores/${id}`);
}

export async function getStores() {
  return fetchApi(`/api/stores/`);
}

// STORE FOLLOWS

export async function followStore(userId, storeId) {
  return fetchApi(`/api/stores/${storeId}/follow?userId=${userId}`, {
    method: "POST",
  });
}

export async function unfollowStore(userId, storeId) {
  return fetchApi(`/api/stores/${storeId}/follow?userId=${userId}`, {
    method: "DELETE",
  });
}

export async function isFollowingStore(userId, storeId) {
  return fetchApi(`/api/stores/${storeId}/is-following?userId=${userId}`);
}

export async function getFollowerCount(storeId) {
  return fetchApi(`/api/stores/${storeId}/followers`);
}

// STORE LOCATION

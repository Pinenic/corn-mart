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
  if (payload.name) formData.append("name", payload.name);
  if (payload.description) formData.append("description", payload.description);
  if (payload.logo) formData.append("logo", payload.logo);
  if (payload.banner) formData.append("banner", payload.banner);

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

export async function addLocation(storeId, locationData) {
  const body = buildLocationFormData(locationData);
  return fetchApi(`/api/stores/${storeId}/location`, {
    method: "POST",
    body,
  });
}

export async function getLocation(storeId) {
  return fetchApi(`/api/stores/${storeId}/location`);
}

export async function updateLocation(storeId, data) {
  return fetchApi(`/api/stores/${storeId}/location`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function updatePreferences(storeId, data) {
  return fetchApi(`/api/stores/${storeId}/location`, {
    method: "PUT",
    body: data,
  });
}

// STORE ANALYTICS

export default function getStoreAnalytics(storeId, start, end) {
  return fetchApi(`/api/analytics/${storeId}`, {
    method: "POST",
    body: JSON.stringify({
      start_date: start,
      end_date: end,
    }),
  });
}

// helper formdata builder function

export function buildLocationFormData(data) {
  const form = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    // Skip undefined or null
    if (value === undefined || value === null) return;

    // Skip empty strings
    if (typeof value === "string" && value.trim() === "") return;

    // Handle arrays (e.g. delivery_methods)
    if (Array.isArray(value)) {
      value.forEach((item) => {
        form.append(`${key}[]`, item);
      });
      return;
    }

    // Handle booleans
    if (typeof value === "boolean") {
      form.append(key, value ? "true" : "false");
      return;
    }

    // Numbers & everything else
    form.append(key, value);
  });

  return form;
}

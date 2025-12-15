import { fetchApi } from "./apiClient";


export async function createStore(userId, payload ) {
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

export async function getStoreById(id) {
  return fetchApi(`/api/stores/${id}`)
}

export async function getStores() {
  return fetchApi(`/api/stores/`)
}
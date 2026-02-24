import { fetchApi } from "./apiClient";

export async function getBuyerNotifications(userId) {
    return fetchApi(`/api/notifications/${userId}`);
}

export async function getSellerNotifications(userId) {
    return fetchApi(`/api/notifications/store/${userId}`);
}

export async function readOne(id) {
    return fetchApi(`/api/notifications/${id}/read`, {
        method: "PATCH"
    })
}

export async function readAll(userId) {
    return fetchApi(`/api/notifications/${userId}/read-all`, {
        method: "PATCH"
    });
}

export async function viewAll(userId) {
    return fetchApi(`/api/notifications/${userId}/view-all`, {
        method: "PATCH"
    });
}
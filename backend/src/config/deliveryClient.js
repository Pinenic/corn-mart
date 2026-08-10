// src/config/deliveryClient.js
// Thin client for calling the delivery platform's public API
// (POST/GET /api/v1/deliveries — see the delivery platform's own
// docs). Mirrors the retry-free, typed-error style of your existing
// lib/api/client.js on the frontend, but server-side and much
// smaller since this only needs two calls.
//
// Required env vars:
//   DELIVERY_API_URL   e.g. https://delivery.corn-mart.net
//   DELIVERY_API_KEY   the x-api-key issued to the "Corn Mart" client
//                       (see the delivery platform's clients table —
//                       seed.js prints it on first run)

const DELIVERY_API_URL = process.env.DELIVERY_API_URL;
const DELIVERY_API_KEY = process.env.DELIVERY_API_KEY;

class DeliveryApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "DeliveryApiError";
    this.status = status;
    // Populated when the delivery platform rejects a request for a
    // missing/invalid parcel_size — the response includes the valid
    // tier list (key, label, price) so the caller can recover
    // gracefully (e.g. re-show the size picker) instead of just
    // failing.
    this.tiers = details?.tiers ?? null;
  }
}

async function deliveryRequest(method, path, body) {
  if (!DELIVERY_API_URL || !DELIVERY_API_KEY) {
    throw new DeliveryApiError(
      "DELIVERY_API_URL or DELIVERY_API_KEY is not configured",
      500
    );
  }

  const res = await fetch(`${DELIVERY_API_URL}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      "x-api-key": DELIVERY_API_KEY,
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });

  let json;
  try {
    json = await res.json();
  } catch {
    throw new DeliveryApiError("Delivery platform returned invalid JSON", res.status);
  }

  if (!res.ok) {
    throw new DeliveryApiError(json?.error ?? "Delivery API request failed", res.status, json);
  }

  return json;
}

export const deliveryClient = {
  post: (path, body) => deliveryRequest("POST", path, body),
  get: (path) => deliveryRequest("GET", path),
};

export { DeliveryApiError };
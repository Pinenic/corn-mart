// lib/api/client.js
// ─────────────────────────────────────────────────────────────
// Core HTTP client. All API calls go through here.
//
// Features:
//   • Auth header injected automatically from the Zustand auth store
//   • AbortController-based timeout (default 10s, configurable)
//   • Automatic retry on network errors and 5xx responses (up to 3 attempts)
//     with exponential back-off — but NOT on 4xx (those are user errors)
//   • Parses the API's standard { success, data, error, meta } shape
//   • Throws ApiError on any non-ok response so callers have a typed error
//   • Dev-mode console logging for every request/response
// ─────────────────────────────────────────────────────────────

import { ApiError } from "./errors.js";

const BASE_URL     = process.env.NEXT_PUBLIC_API_URL     ?? "http://localhost:4000/api/v1";
const TIMEOUT_MS   = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT ?? "10000", 10);
const MAX_RETRIES  = 2;   // total of 3 attempts (initial + 2 retries)
const RETRY_DELAY  = 800; // ms — doubles on each retry

const isDev = process.env.NODE_ENV === "development";

// ── Token accessor ────────────────────────────────────────────
// Lazy-import so the auth store (which uses Zustand) is only required
// in a browser context and never during Next.js server-side rendering.
let _getToken = () => null;

export function setTokenAccessor(fn) {
  _getToken = fn;
}

// ── Retry logic ───────────────────────────────────────────────
function shouldRetry(status, attempt) {
  if (attempt >= MAX_RETRIES) return false;
  // Retry on network errors (status 0) and server errors (5xx)
  // Never retry on 4xx — those are client mistakes, not transient failures
  return status === 0 || status >= 500;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ── Core fetch ────────────────────────────────────────────────
async function fetchWithTimeout(url, options, timeoutMs) {
  const controller = new AbortController();
  const timeoutId  = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (err) {
    // AbortError means our timeout fired
    if (err.name === "AbortError") {
      const timeoutError = new ApiError({ code: "TIMEOUT", status: 0 });
      throw timeoutError;
    }
    // Any other fetch failure is a network error
    throw new ApiError({ code: "NETWORK_ERROR", status: 0, rawMessage: err.message });
  } finally {
    clearTimeout(timeoutId);
  }
}

// ── Main request function ─────────────────────────────────────
async function request(method, path, { body, params, timeout = TIMEOUT_MS } = {}, attempt = 0) {
  const token = _getToken();

  // Build URL with query params
  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== null && v !== undefined && v !== "") {
        url.searchParams.set(k, String(v));
      }
    });
  }

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const options = {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  };

  if (isDev) {
    console.debug(`[API] → ${method} ${url.pathname}${url.search || ""}`, body ?? "");
  }

  let response;
  try {
    response = await fetchWithTimeout(url.toString(), options, timeout);
  } catch (err) {
    // Network/timeout error — retry if allowed
    if (err instanceof ApiError && shouldRetry(err.status, attempt)) {
      await delay(RETRY_DELAY * Math.pow(2, attempt));
      return request(method, path, { body, params, timeout }, attempt + 1);
    }
    throw err;
  }

  // Parse response body (always JSON for our API)
  let json;
  try {
    json = await response.json();
  } catch {
    // Malformed response body
    throw new ApiError({
      code:       "SERVER_ERROR",
      status:     response.status,
      rawMessage: "Response was not valid JSON",
    });
  }

  if (isDev) {
    console.debug(`[API] ← ${response.status} ${url.pathname}`, json);
  }

  // 204 No Content — successful delete
  if (response.status === 204) return null;

  // Success
  if (response.ok && json.success) {
    return { data: json.data, meta: json.meta ?? null };
  }

  // Server error — retry if allowed
  if (shouldRetry(response.status, attempt)) {
    await delay(RETRY_DELAY * Math.pow(2, attempt));
    return request(method, path, { body, params, timeout }, attempt + 1);
  }

  // Throw a typed ApiError using the error code from the API
  throw new ApiError({
    code:       json.error?.code ?? "UNKNOWN",
    status:     response.status,
    details:    json.error?.details ?? null,
    rawMessage: json.error?.message ?? "",
  });
}

// ── Public interface ──────────────────────────────────────────
export const apiClient = {
  get:    (path, opts)        => request("GET",    path, opts),
  post:   (path, body, opts)  => request("POST",   path, { ...opts, body }),
  patch:  (path, body, opts)  => request("PATCH",  path, { ...opts, body }),
  delete: (path, opts)        => request("DELETE", path, opts),
};

// SWR-compatible fetcher — takes a [path, params] tuple or just a path string
// Usage: useSWR(["/stores/:id/orders", { page: 1 }], swrFetcher)
export async function swrFetcher([path, params]) {
  const result = await apiClient.get(path, { params });
  return result; // { data, meta }
}

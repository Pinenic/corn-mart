// src/lib/apiClient.js
export async function fetchApi(endpoint, options = {}) {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const url = `${baseUrl}${endpoint}`;

  const defaultHeaders = options.headers || {};

  // If not uploading a file, send JSON
  if (!(options.body instanceof FormData)) {
    defaultHeaders["Content-Type"] = "application/json";
  }

  const res = await fetch(url, {
    ...options,
    headers: defaultHeaders,
  });

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API Error: ${res.status} - ${errorText}`);
  }

  // Some responses may have no JSON
  try {
    return await res.json();
  } catch {
    return null;
  }
}

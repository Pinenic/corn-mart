import { fetchApi } from "./apiClient";

export async function forgotPassword(email) {
  return fetchApi(`/api/auth/forgot-password`, {
    method: "POST",
    body: JSON.stringify({
      email: email,
    }),
  });
}

export async function resetPassword(password) {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/reset-password`, {
    method: "POST",
    credentials: "include",       // ← sends the reset_session cookie
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ newPassword: password }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Failed to reset password");
  }

  return data;
}

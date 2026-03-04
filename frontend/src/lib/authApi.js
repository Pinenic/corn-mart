import { fetchApi } from "./apiClient";

export async function forgotPassword(email) {
  const formData = new FormData();
  console.log(email);
  formData.append("email", email);
  return fetchApi(`/api/auth/forgot-password`, {
    method: "POST",
    body: formData,
  });
}

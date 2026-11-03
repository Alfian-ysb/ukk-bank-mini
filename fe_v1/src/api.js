import { getStoredToken } from "./context/authSession";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export async function request(path, options = {}) {
  const headers = {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...options.headers,
  };
  const token = getStoredToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const apiPath = path.startsWith("/api/") ? path.slice(4) : path;
  const response = await fetch(`${API_URL}/api${apiPath}`, {
    ...options,
    headers,
  });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const validationMessage = payload.errors
      ? Object.values(payload.errors).flat().join(" ")
      : "";
    const error = new Error(
      validationMessage || payload.message || "Request gagal.",
    );
    error.status = response.status;
    throw error;
  }

  return payload;
}

export const get = (path) => request(path);
export const post = (path, body) =>
  request(path, { method: "POST", body: JSON.stringify(body) });
export const patch = (path, body) =>
  request(path, { method: "PATCH", body: JSON.stringify(body) });
export const remove = (path) => request(path, { method: "DELETE" });

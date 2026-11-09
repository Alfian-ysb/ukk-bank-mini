import { getStoredToken } from "./context/authSession";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

function getHeaders(options) {
  const isFormData = options.body instanceof FormData;
  const headers = {
    Accept: "application/json",
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };
  const token = getStoredToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function getApiUrl(path) {
  const apiPath = path.startsWith("/api/") ? path.slice(4) : path;
  return `${API_URL}/api${apiPath}`;
}

async function getError(response) {
  const payload = await response.json().catch(() => ({}));
  const validationMessage = payload.errors
    ? Object.values(payload.errors).flat().join(" ")
    : "";
  const error = new Error(
    validationMessage || payload.message || "Request gagal.",
  );
  error.status = response.status;
  return error;
}

export async function request(path, options = {}) {
  const response = await fetch(getApiUrl(path), {
    ...options,
    headers: getHeaders(options),
  });

  if (!response.ok) {
    throw await getError(response);
  }

  return response.json().catch(() => ({}));
}

export async function downloadFile(path, fallbackFilename) {
  const options = {
    headers: {
      Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    },
  };
  const response = await fetch(getApiUrl(path), {
    ...options,
    headers: getHeaders(options),
  });

  if (!response.ok) {
    throw await getError(response);
  }

  const blob = await response.blob();
  const contentDisposition = response.headers.get("content-disposition") || "";
  const filename = contentDisposition.match(/filename="?([^";]+)"?/i)?.[1]
    || fallbackFilename;
  const fileUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = fileUrl;
  link.download = filename;
  document.body.appendChild(link);
  try {
    link.click();
  } finally {
    link.remove();
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 0);
  }
}

export const get = (path) => request(path);
export const post = (path, body) =>
  request(path, { method: "POST", body: JSON.stringify(body) });
export const upload = (path, file) => {
  const body = new FormData();
  body.append("file", file);
  return request(path, { method: "POST", body });
};
export const patch = (path, body) =>
  request(path, { method: "PATCH", body: JSON.stringify(body) });
export const remove = (path) => request(path, { method: "DELETE" });

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const API_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem("hrms_token");
  const baseUrl = path.startsWith("/../") ? API_ROOT_URL : API_BASE_URL;
  const requestPath = path.startsWith("/../") ? path.replace("/..", "") : path;
  const response = await fetch(`${baseUrl}${requestPath}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "Unable to complete request");
  }

  return data;
}

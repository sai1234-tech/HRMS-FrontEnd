const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:3000/api").replace(/\/$/, "");
const API_ROOT_URL = API_BASE_URL.replace(/\/api\/?$/, "");

export async function apiRequest(path, options = {}) {
  const token = sessionStorage.getItem("hrms_token");
  const baseUrl = path.startsWith("/../") ? API_ROOT_URL : API_BASE_URL;
  const requestPath = path.startsWith("/../") ? path.replace("/..", "") : path;
  const isFormData = options.body instanceof FormData;
  let response;
  try {
    response = await fetch(`${baseUrl}${requestPath}`, {
      ...options,
      headers: {
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (error) {
    throw new Error(`Cannot reach the HRMS API at ${baseUrl}. Check that the backend is running. ${error.message}`);
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = data.message || data.error || (typeof data === "string" ? data : "");
    if (response.status === 401) {
      const error = new Error("Your session has expired. Sign in again and retry.");
      error.status = response.status;
      throw error;
    }
    const error = new Error(detail || `Request failed (${response.status} ${response.statusText})`);
    error.status = response.status;
    throw error;
  }

  return data;
}

// frontend/api.js

// Base API URL: prefer Vite env (VITE_API_URL), fallback to CRA style (REACT_APP_API_URL), then localhost
const API_BASE =
  import.meta.env.VITE_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:4000";

/**
 * Generic request wrapper for API calls
 * @param {string} path - API endpoint path
 * @param {object} options - method, body, token, headers
 */
async function request(
  path,
  { method = "GET", body, token, headers = {} } = {}
) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;

  const finalHeaders = {
    "Content-Type": "application/json",
    ...headers,
  };

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(url, {
      method,
      headers: finalHeaders,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error(`Network error: ${networkErr.message}`);
  }

  const contentType = res.headers.get("content-type") || "";
  const isJson = contentType.includes("application/json");
  const data = isJson ? await res.json().catch(() => ({})) : await res.text();

  if (!res.ok) {
    const message = isJson
      ? data?.error || data?.message || JSON.stringify(data)
      : data;
    throw new Error(message || `Request failed: ${res.status}`);
  }

  return data;
}

// Exported API methods
export const api = {
  // Auth
  login: async (payload) => {
    // payload should be { email, password }
    const res = await request("/api/auth/login", {
      method: "POST",
      body: payload,
    });

    // Ensure consistent return shape { token, user }
    if (!res.token || !res.user) {
      throw new Error("Invalid login response format");
    }
    return res;
  },

  register: (payload) =>
    request("/api/auth/register", { method: "POST", body: payload }),

  requestEmailReset: (email) =>
    request("/api/auth/request-password-reset", {
      method: "POST",
      body: { email },
    }),

  requestSMSReset: (phone_number) =>
    request("/api/auth/request-password-reset-sms", {
      method: "POST",
      body: { phone_number },
    }),

  resetPassword: (payload) =>
    request("/api/auth/reset-password", { method: "POST", body: payload }),

  // Users
  getUser: (id, token) => request(`/api/users/${id}`, { token }),

  // Loyalty
  earnPoints: (token, payload) =>
    request("/api/loyalty/earn", { method: "POST", body: payload, token }),

  getTransactions: (token) =>
    request("/api/loyalty/transactions", { token }),

  // Notifications
  getNotifications: (token) =>
    request("/api/notifications", { token }),

  setPreferences: (token, payload) =>
    request("/api/notifications/preferences", {
      method: "POST",
      body: payload,
      token,
    }),
};

export { API_BASE };

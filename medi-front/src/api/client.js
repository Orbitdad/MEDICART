const base =
  (import.meta.env.VITE_API_URL || "https://medicart-backend.onrender.com/api")
    .replace(/\/$/, "");

/* =========================
   HEADERS
========================= */
function buildHeaders() {
  const token = localStorage.getItem("medicart_token");

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/* =========================
   SAFE FETCH (MOBILE FIX)
========================= */
async function safeFetch(url, options = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // ⏱️ 30s

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    return res;
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Server timeout. Please try again.");
    }

    throw new Error(
      "Network error. Check internet or backend connection."
    );
  } finally {
    clearTimeout(timeout);
  }
}

/* =========================
   RESPONSE HANDLER
========================= */
async function handleResponse(res) {
  if (res.status === 204) return null;

  let text = "";
  try {
    text = await res.text();
  } catch {
    throw new Error("Server response error");
  }

  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.message || "Request failed");
  }

  return data;
}

/* =========================
   URL BUILDER
========================= */
function buildUrl(path) {
  if (!path.startsWith("/")) path = "/" + path;
  return base + path;
}

/* =========================
   METHODS
========================= */
export async function get(path) {
  const res = await safeFetch(buildUrl(path), {
    method: "GET",
    headers: buildHeaders(),
  });

  return handleResponse(res);
}

export async function post(path, body) {
  const res = await safeFetch(buildUrl(path), {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

export async function put(path, body) {
  const res = await safeFetch(buildUrl(path), {
    method: "PUT",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

export async function del(path) {
  const res = await safeFetch(buildUrl(path), {
    method: "DELETE",
    headers: buildHeaders(),
  });

  return handleResponse(res);
}

export default {
  get,
  post,
  put,
  delete: del,
};

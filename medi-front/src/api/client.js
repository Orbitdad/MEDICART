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
   SAFE FETCH (MOBILE FIX + RENDER COLD START)
========================= */
async function safeFetch(url, options = {}, retries = 1) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000); // ⏱️ 30s for Render cold starts

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
    });

    return res;
  } catch (err) {
    if (err.name === "AbortError") {
      // Retry once: Render free-tier cold start can take ~20-30s
      if (retries > 0) {
        clearTimeout(timeout);
        return safeFetch(url, options, retries - 1);
      }
      throw new Error("Server timeout. Please try again.");
    }

    // Network error — also retry once
    if (retries > 0) {
      clearTimeout(timeout);
      return safeFetch(url, options, retries - 1);
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

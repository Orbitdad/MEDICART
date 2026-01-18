const base = import.meta.env.VITE_API_BASE_URL.replace(/\/$/, "");

function buildHeaders() {
  const token = localStorage.getItem("medicart_token");

  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

async function handleResponse(res) {
  // 204 No Content (OPTIONS, DELETE sometimes)
  if (res.status === 204) {
    return null;
  }

  const text = await res.text();

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

function buildUrl(path) {
  if (!path.startsWith("/")) {
    path = "/" + path;
  }
  return base + path;
}

export async function get(path) {
  const res = await fetch(buildUrl(path), {
    method: "GET",
    headers: buildHeaders(),
  });

  return handleResponse(res);
}

export async function post(path, body) {
  const res = await fetch(buildUrl(path), {
    method: "POST",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

export async function put(path, body) {
  const res = await fetch(buildUrl(path), {
    method: "PUT",
    headers: buildHeaders(),
    body: JSON.stringify(body),
  });

  return handleResponse(res);
}

export async function del(path) {
  const res = await fetch(buildUrl(path), {
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

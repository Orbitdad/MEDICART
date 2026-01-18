import client from "./client.js";

export async function placeOrder(payload) {
  return client.post("/orders", payload);
}

export async function adminFetchOrders() {
  return client.get("/admin/orders");
}

/* ✅ NEW */
export async function updateOrderStatus(orderId, status) {
  const res = await fetch(
    `${import.meta.env.VITE_API_BASE_URL}/admin/orders/${orderId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("medicart_token")}`,
      },
      body: JSON.stringify({ status }),
    }
  );

  if (!res.ok) {
    throw new Error("Failed to update order status");
  }

  return res.json();
}

export async function fetchInventorySummary() {
  return client.get("/admin/orders/inventory");
}

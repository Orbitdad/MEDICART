import client from "./client.js";

export async function placeOrder(payload) {
  return client.post("/orders", payload);
}

export async function adminFetchOrders() {
  return client.get("/admin/orders");
}

/* ✅ ADMIN: UPDATE ORDER STATUS */
export async function updateOrderStatus(orderId, orderStatus) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/admin/orders/${orderId}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("medicart_token")}`,
      },
      body: JSON.stringify({ orderStatus }),
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

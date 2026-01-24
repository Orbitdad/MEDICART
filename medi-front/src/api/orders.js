import client from "./client.js";

/* =========================
   DOCTOR
========================= */
export async function placeOrder(payload) {
  return client.post("/orders", payload);
}
/* ----------------------------------
   DOCTOR: RECENT ORDERS
----------------------------------- */
export const getRecentOrders = async () => {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/orders/recent`,
    {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to fetch recent orders");
  }

  return res.json();
};

/* =========================
   ADMIN
========================= */
export async function adminFetchOrders() {
  return client.get("/admin/orders");
}

/* ----------------------------------
   ADMIN: DELIVERY STATUS
   (placed → approved → dispatched)
----------------------------------- */
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

/* ----------------------------------
   ADMIN: MARK ORDER COMPLETED
   (ADMIN DECISION)
----------------------------------- */
export async function markOrderCompleted(orderId) {
  const res = await fetch(
    `${import.meta.env.VITE_API_URL}/admin/orders/${orderId}/complete`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("medicart_token")}`,
      },
    }
  );

  if (!res.ok) {
    throw new Error("Failed to mark order completed");
  }

  return res.json();
}

/* =========================
   INVENTORY
========================= */
export async function fetchInventorySummary() {
  return client.get("/admin/orders/inventory");
}

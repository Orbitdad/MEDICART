import client from "./client.js";

/* =========================
   DOCTOR
========================= */

/* PLACE ORDER */
export async function placeOrder(payload) {
  return client.post("/orders", payload);
}

/* RECENT ORDERS */
export async function getRecentOrders() {
  return client.get("/orders/recent"); // ✅ RETURN DIRECTLY
}

/* =========================
   ADMIN
========================= */

/* FETCH ALL ORDERS */
export async function adminFetchOrders() {
  return client.get("/admin/orders");
}

/* UPDATE ORDER STATUS */
export async function updateOrderStatus(orderId, orderStatus) {
  return client.put(
    `/admin/orders/${orderId}/status`,
    { orderStatus }
  );
}

/* MARK ORDER COMPLETED */
export async function markOrderCompleted(orderId) {
  return client.put(`/admin/orders/${orderId}/complete`);
}

/* =========================
   INVENTORY
========================= */
export async function fetchInventorySummary() {
  return client.get("/admin/orders/inventory");
}

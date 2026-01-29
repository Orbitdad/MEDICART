import client from "./client.js";

/* =========================
   DOCTOR
========================= */

/* PLACE ORDER */
export async function placeOrder(payload) {
  const res = await client.post("/orders", payload);
  return res.data;
}

/* RECENT ORDERS */
export async function getRecentOrders() {
  const res = await client.get("/orders/recent");
  return res.data;
}

/* =========================
   ADMIN
========================= */

/* FETCH ALL ORDERS */
export async function adminFetchOrders() {
  const res = await client.get("/admin/orders");
  return res.data;
}

/* UPDATE ORDER STATUS */
export async function updateOrderStatus(orderId, orderStatus) {
  const res = await client.put(
    `/admin/orders/${orderId}/status`,
    { orderStatus }
  );
  return res.data;
}

/* MARK ORDER COMPLETED */
export async function markOrderCompleted(orderId) {
  const res = await client.put(
    `/admin/orders/${orderId}/complete`
  );
  return res.data;
}

/* =========================
   INVENTORY
========================= */

export async function fetchInventorySummary() {
  const res = await client.get("/admin/orders/inventory");
  return res.data;
}

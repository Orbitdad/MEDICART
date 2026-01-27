import client from "./client.js";

/* =========================
   RAZORPAY PAYMENT
========================= */

/* Create Razorpay Order */
export async function createRazorpayOrder(amount) {
  return client.post("/payment/create-order", { amount });
}

/* Verify Razorpay Payment */
export async function verifyRazorpayPayment(paymentData) {
  return client.post("/payment/verify", paymentData);
}


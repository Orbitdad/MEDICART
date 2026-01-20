import express from "express";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";

const router = express.Router();

/* ===========================
   CREATE PAYMENT ORDER
=========================== */
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "medicart_" + Date.now(),
    });

    res.json(order);
  } catch (error) {
    console.error("Razorpay create order error:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
});

/* ===========================
   VERIFY PAYMENT
=========================== */
router.post("/verify", (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const body =
    razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
});

export default router;

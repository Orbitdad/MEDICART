import express from "express";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";

const router = express.Router();

/**
 * CREATE PAYMENT ORDER
 */
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100, // rupees → paise
      currency: "INR",
      receipt: "medicart_" + Date.now(),
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Payment order failed" });
  }
});

/**
 * VERIFY PAYMENT
 */
router.post("/verify", (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const sign = razorpay_order_id + "|" + razorpay_payment_id;

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(sign)
    .digest("hex");

  if (expected === razorpay_signature) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
});

export default router;

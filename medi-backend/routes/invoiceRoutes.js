import express from "express";
import Invoice from "../models/Invoice.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET invoice by orderId
 * Accessible by doctor & admin
 */
router.get(
  "/by-order/:orderId",
  protect(["doctor", "admin"]),
  async (req, res) => {
    try {
      const invoice = await Invoice.findOne({
        orderId: req.params.orderId,
      });

      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      res.json(invoice);
    } catch (error) {
      console.error("Invoice fetch error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;

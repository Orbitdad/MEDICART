import express from "express";
import {
  adminGetOrders,
  adminUpdateOrderStatus,
  adminMarkOrderCompleted,
  inventorySummary,
} from "../controllers/orderController.js";
import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, adminOnly, adminGetOrders);

router.put(
  "/:id/status",
  protect,
  adminOnly,
  adminUpdateOrderStatus
);

/* ✅ ADD THIS */
router.put(
  "/:id/complete",
  protect,
  adminOnly,
  adminMarkOrderCompleted
);

router.get(
  "/inventory",
  protect,
  adminOnly,
  inventorySummary
);

export default router;

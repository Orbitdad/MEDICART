import express from "express";
import {
  adminGetOrders,
  adminUpdateOrderStatus,
  adminUpdatePaymentStatus,
  adminMarkOrderCompleted,
  inventorySummary,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ADMIN ONLY */

/* ⚠️ Specific literal paths MUST come before parameterised /:id routes */
router.get(
  "/inventory",
  protect(["admin"]),
  inventorySummary
);

router.get(
  "/",
  protect(["admin"]),
  adminGetOrders
);

router.put(
  "/:id/status",
  protect(["admin"]),
  adminUpdateOrderStatus
);

router.put(
  "/:id/payment",
  protect(["admin"]),
  adminUpdatePaymentStatus
);

/* ✅ MARK COMPLETED */
router.put(
  "/:id/complete",
  protect(["admin"]),
  adminMarkOrderCompleted
);

export default router;

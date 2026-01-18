import express from "express";
import {
  adminGetOrders,
  inventorySummary,
  adminUpdateOrderStatus,
} from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect(["admin"]), adminGetOrders);
router.get("/inventory", protect(["admin"]), inventorySummary);

/* ✅ NEW */
router.put("/:id/status", protect(["admin"]), adminUpdateOrderStatus);

export default router;

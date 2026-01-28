import express from "express";
import {
  placeOrder,
  getRecentOrders,
  getOrderById,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Doctor actions */
router.post("/", protect(["doctor"]), placeOrder);
router.get("/recent", protect(["doctor"]), getRecentOrders);

/* Invoice (doctor + admin) */
router.get("/:id", protect(["doctor", "admin"]), getOrderById);

export default router;

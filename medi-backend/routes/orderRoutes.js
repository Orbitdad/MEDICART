import express from "express";
import { placeOrder } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";
import { getRecentOrders } from "../controllers/orderController.js";

const router = express.Router();

router.post("/", protect(["doctor"]), placeOrder);
router.get("/recent", protect, getRecentOrders);


export default router;

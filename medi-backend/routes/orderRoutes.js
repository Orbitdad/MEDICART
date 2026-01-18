import express from "express";
import { placeOrder } from "../controllers/orderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect(["doctor"]), placeOrder);

export default router;

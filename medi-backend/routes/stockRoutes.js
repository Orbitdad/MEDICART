import express from "express";
import { getMedicineStock } from "../controllers/purchaseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/medicine/:medicineId", protect(["admin"]), getMedicineStock);

export default router;

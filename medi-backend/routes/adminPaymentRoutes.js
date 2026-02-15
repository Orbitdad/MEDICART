import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
    searchDoctors,
    getDoctorDue,
    deductPayment
} from "../controllers/adminPaymentController.js";

const router = express.Router();

// protect(["admin"]) implies only admins can access

router.get("/doctors", protect(["admin"]), searchDoctors);
router.get("/doctors/:id/due", protect(["admin"]), getDoctorDue);
router.post("/deduct", protect(["admin"]), deductPayment);

export default router;

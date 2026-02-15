import express from "express";
import { loginDoctor, registerDoctor, updateDoctorProfile } from "../controllers/doctorAuthController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginDoctor);
router.post("/register", registerDoctor);
router.put("/profile", protect(["doctor"]), updateDoctorProfile);

export default router;

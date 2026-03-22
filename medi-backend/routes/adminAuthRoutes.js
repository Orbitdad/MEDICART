import express from "express";
import { loginAdmin, forgotPasswordAdmin, resetPasswordAdmin } from "../controllers/adminAuthController.js";

const router = express.Router();

// Only login — no public registration
router.post("/login", loginAdmin);
router.post("/forgot-password", forgotPasswordAdmin);
router.post("/reset-password", resetPasswordAdmin);

export default router;

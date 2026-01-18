import express from "express";
import { loginAdmin } from "../controllers/adminAuthController.js";

const router = express.Router();

// Only login — no public registration
router.post("/login", loginAdmin);

export default router;

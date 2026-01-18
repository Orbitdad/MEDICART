import express from "express";
import { loginDoctor, registerDoctor } from "../controllers/doctorAuthController.js";

const router = express.Router();

router.post("/login", loginDoctor);
router.post("/register", registerDoctor);

export default router;

import express from "express";
import { getMedicines } from "../controllers/medicineController.js";

const router = express.Router();

router.get("/", getMedicines);

export default router;




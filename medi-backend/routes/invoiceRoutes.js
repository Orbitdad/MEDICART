import express from "express";
import { generateInvoicePDF } from "../controllers/invoiceController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/generate/:id", protect(["admin"]), generateInvoicePDF);

export default router;

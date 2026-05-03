import express from "express";
import { scanInvoice, searchMedicine } from "../controllers/ocrController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.post("/scan-invoice", protect(["admin"]), upload.single("invoice"), scanInvoice);
router.get("/search-medicine", protect(["admin"]), searchMedicine);

export default router;

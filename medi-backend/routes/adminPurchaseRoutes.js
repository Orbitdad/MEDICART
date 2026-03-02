import express from "express";
import {
    createPurchase,
    getPurchases,
    getPurchaseById,
    deletePurchase,
} from "../controllers/purchaseController.js";

import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =========================
   ADMIN PURCHASE ROUTES
========================= */

// GET  /api/admin/purchases       — list all
router.get("/", protect(["admin"]), getPurchases);

// GET  /api/admin/purchases/:id   — get one
router.get("/:id", protect(["admin"]), getPurchaseById);

// POST /api/admin/purchases       — create (with images)
router.post(
    "/",
    protect(["admin"]),
    upload.any(),           // accept any file fields (image_0, image_1, ...)
    createPurchase
);

// DELETE /api/admin/purchases/:id — delete
router.delete("/:id", protect(["admin"]), deletePurchase);

export default router;

import express from "express";
import {
  adminGetMedicines,
  adminCreateMedicine,
  adminUpdateMedicine,
  adminDeleteMedicine,
} from "../controllers/medicineController.js";

import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

/* =========================
   ADMIN MEDICINE ROUTES
========================= */

router.get("/", protect(["admin"]), adminGetMedicines);

router.post(
  "/",
  protect(["admin"]),
  upload.array("images"),
  adminCreateMedicine
);

router.put("/:id", protect(["admin"]), adminUpdateMedicine);

router.delete("/:id", protect(["admin"]), adminDeleteMedicine);

export default router;

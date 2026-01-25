import express from "express";
import {
  adminGetMedicines,
  adminCreateMedicine,
  adminUpdateMedicine,
  adminDeleteMedicine,
} from "../controllers/medicineController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* ADMIN MEDICINE ROUTES */

router.get("/medicines", protect(["admin"]), adminGetMedicines);

router.post(
  "/medicines",
  protect(["admin"]),
  adminCreateMedicine
);

router.put(
  "/medicines/:id",
  protect(["admin"]),
  adminUpdateMedicine
);

router.delete(
  "/medicines/:id",
  protect(["admin"]),
  adminDeleteMedicine
);

export default router;

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

import connectDB from "./config/db.js";

// Routes
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import adminMedicineRoutes from "./routes/adminMedicineRoutes.js";
import doctorAuthRoutes from "./routes/doctorAuthRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

// Middleware
import { errorHandler } from "./middleware/errorMiddleware.js";

// =========================
// DATABASE
// =========================
connectDB();

const app = express();

// =========================
// MIDDLEWARE
// =========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// =========================
// CORS — FINAL & CORRECT
// =========================
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// =========================
// ROUTES
// =========================
app.use("/api/auth/admin", adminAuthRoutes);
app.use("/api/auth/doctor", doctorAuthRoutes);

app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/admin/medicines", adminMedicineRoutes);
app.use("/api/admin/orders", adminOrderRoutes);

// =========================
// STATIC FILES
// =========================
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// =========================
// ERROR HANDLER
// =========================
app.use(errorHandler);

// =========================
// SERVER
// =========================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
  
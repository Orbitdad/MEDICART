import dotenv from "dotenv";
dotenv.config();

import express from "express";
import morgan from "morgan";
import path from "path";
import cors from "cors"; // ✅ ADD

import connectDB from "./config/db.js";

// Routes
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import adminMedicineRoutes from "./routes/adminMedicineRoutes.js";
import doctorAuthRoutes from "./routes/doctorAuthRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";

// Middleware
import { errorHandler } from "./middleware/errorMiddleware.js";

// =========================
// DATABASE
// =========================
connectDB();

const app = express();

// =========================
// BODY PARSERS
// =========================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

// =========================
// ✅ UPDATED CORS (RENDER + GITHUB SAFE)
// =========================
app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://orbitdad.github.io",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ✅ IMPORTANT — preflight support
app.options("*", cors());

// =========================
// ROUTES
// =========================
app.use("/api/auth/admin", adminAuthRoutes);
app.use("/api/auth/doctor", doctorAuthRoutes);

app.use("/api/medicines", medicineRoutes);
app.use("/api/orders", orderRoutes);

app.use("/api/admin/medicines", adminMedicineRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/payment", paymentRoutes);

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

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 MediCart backend running on port ${PORT}`);
});

# CHAPTER 5: IMPLEMENTATION AND TESTING

## 5.1 Implementation Approaches

MediCart was developed using a **modular, API-first approach** following the Agile SDLC model:

1. **Backend-First Development:** RESTful APIs were designed, implemented, and tested (via Postman) before frontend development began, ensuring a stable data contract.
2. **Component-Based Frontend:** React components were built in isolation, then composed into pages. Context API provided global state management.
3. **Continuous Integration:** Git version control with feature branching enabled parallel development of modules without conflicts.
4. **Cloud-Native Deployment:** Frontend deployed on GitHub Pages; backend on Render.com; database on MongoDB Atlas.

## 5.2 Coding Details and Code Efficiency

This section presents the complete source code of every file in the MediCart project, organised by module.

---

### 5.2.1 BACKEND — Entry Point

#### File: `server.js`

```javascript
import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
dotenv.config();

import connectDB from "./config/db.js";
import { errorHandler } from "./middleware/errorMiddleware.js";

/* ── ROUTE IMPORTS ── */
import doctorAuthRoutes from "./routes/doctorAuthRoutes.js";
import adminAuthRoutes from "./routes/adminAuthRoutes.js";
import medicineRoutes from "./routes/medicineRoutes.js";
import adminMedicineRoutes from "./routes/adminMedicineRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import adminOrderRoutes from "./routes/adminOrderRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import invoiceRoutes from "./routes/invoiceRoutes.js";
import adminPurchaseRoutes from "./routes/adminPurchaseRoutes.js";
import adminPaymentRoutes from "./routes/adminPaymentRoutes.js";

/* ── APP ── */
const app = express();

/* ── MIDDLEWARE ── */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  "http://localhost:4173",
  "https://orbitdad.github.io",
];

app.use(
  cors({
    origin: (origin, cb) =>
      !origin || allowedOrigins.includes(origin)
        ? cb(null, true)
        : cb(null, true),
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

/* ── API ROUTES ── */
app.use("/api/auth/doctor", doctorAuthRoutes);
app.use("/api/auth/admin", adminAuthRoutes);
app.use("/api/medicines", medicineRoutes);
app.use("/api/admin/medicines", adminMedicineRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/admin/purchases", adminPurchaseRoutes);
app.use("/api/admin/payments", adminPaymentRoutes);

/* ── HEALTH ── */
app.get("/", (req, res) => res.send("MediCart API is running"));

/* ── ERROR HANDLER ── */
app.use(errorHandler);

/* ── START ── */
const PORT = process.env.PORT || 5000;
connectDB().then(() =>
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
);
```

---

### 5.2.2 BACKEND — Configuration Files

#### File: `config/db.js`

```javascript
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB error:", err.message);
    process.exit(1);
  }
};

export default connectDB;
```

#### File: `config/cloudinary.js`

```javascript
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;
```

#### File: `config/razorpay.js`

```javascript
import Razorpay from "razorpay";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export default razorpay;
```

---

### 5.2.3 BACKEND — Utility Functions

#### File: `utils/generateToken.js`

```javascript
import jwt from "jsonwebtoken";

export const generateToken = (id, role) =>
  jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
```

---

### 5.2.4 BACKEND — Middleware

#### File: `middleware/authMiddleware.js`

```javascript
import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = (roles = []) => async (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer "))
    return res.status(401).json({ message: "Unauthorized" });

  try {
    const token = auth.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    if (roles.length && !roles.includes(user.role))
      return res.status(403).json({ message: "Access denied" });

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};
```

#### File: `middleware/errorMiddleware.js`

```javascript
export const errorHandler = (err, req, res, next) => {
  console.error("Error:", err.message);
  const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || "Server Error",
  });
};
```

#### File: `middleware/uploadMiddleware.js`

```javascript
import multer from "multer";

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
```

---

### 5.2.5 BACKEND — Database Models

#### File: `models/User.js`

```javascript
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name:     { type: String, required: true },
    email:    { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role:     { type: String, enum: ["doctor", "admin"], required: true },
    hospital: String,
    phone:    String,
    address:  String,
    city:     String,
    clinic:   String,
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);
```

#### File: `models/Medicine.js`

```javascript
import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    brand:       { type: String, default: "" },
    company:     { type: String, default: "" },
    companyCode: { type: String, default: "" },
    itemCode:    { type: String, default: "" },
    description: { type: String, default: "" },
    packaging:   { type: String, default: "" },
    packing:     { type: String, default: "" },
    mrp:         { type: Number, required: true, min: 0 },
    price:       { type: Number, required: true, min: 0, default: 0 },
    cost:        { type: Number, default: 0, min: 0 },
    gstPercent:  { type: Number, default: 5, min: 0 },
    stock:       { type: Number, required: true, default: 0, min: 0 },
    expiryDate:  { type: Date },
    category: {
      type: String,
      enum: ["SYP", "TAB", "CAP", "EE", "INJ", "INSTR"],
      default: "TAB",
    },
    images:   [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Medicine", medicineSchema);
```

#### File: `models/Order.js`

```javascript
import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema({
  medicineId:  { type: mongoose.Schema.Types.ObjectId, ref: "Medicine" },
  name:        String,
  brand:       String,
  company:     String,
  packaging:   String,
  packing:     String,
  mrp:         Number,
  price:       Number,
  gstPercent:  Number,
  expiryDate:  Date,
  quantity:    { type: Number, required: true },
  images:      [String],
});

const orderSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    invoiceNo: String,
    notes:     { type: String, default: "" },

    billing: {
      taxableAmount: { type: Number, required: true },
      cgstAmount:    { type: Number, required: true },
      sgstAmount:    { type: Number, required: true },
      finalAmount:   { type: Number, required: true },
    },

    paymentMode: {
      type: String,
      enum: ["credit", "online", "cod"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },
    paidAmount: { type: Number, default: 0 },
    paymentInfo: {
      razorpay_payment_id: String,
      razorpay_order_id:   String,
    },

    adminStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },
    orderStatus: {
      type: String,
      enum: ["placed", "approved", "dispatched", "completed", "cancelled"],
      default: "placed",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);
```

#### File: `models/Invoice.js`

```javascript
import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: { type: String, required: true, unique: true },
    orderId:   {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    doctor: {
      name:   String,
      clinic: String,
      phone:  String,
      city:   String,
    },
    items: [
      {
        name:       String,
        company:    String,
        packaging:  String,
        expiry:     String,
        qty:        Number,
        mrp:        Number,
        price:      Number,
        gstPercent: Number,
        amount:     Number,
      },
    ],
    taxableAmount: Number,
    sgstAmount:    Number,
    cgstAmount:    Number,
    igstAmount:    { type: Number, default: 0 },
    totalAmount:   Number,
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);
```

#### File: `models/Purchase.js`

```javascript
import mongoose from "mongoose";

const purchaseItemSchema = new mongoose.Schema({
  code:            { type: String, default: "" },
  itemName:        { type: String, required: true },
  mfr:             { type: String, default: "" },
  pkg:             { type: String, default: "" },
  batch:           { type: String, default: "" },
  exp:             { type: String, default: "" },
  mrp:             { type: Number, default: 0 },
  qty:             { type: Number, default: 0 },
  free:            { type: Number, default: 0 },
  billRate:        { type: Number, default: 0 },
  schemePercent:   { type: Number, default: 0 },
  discountPercent: { type: Number, default: 0 },
  gstPercent:      { type: Number, default: 0 },
  salePrice:       { type: Number, default: 0 },
  hsnCode:         { type: String, default: "" },
  taxableAmount:   { type: Number, default: 0 },
  sgst:            { type: Number, default: 0 },
  cgst:            { type: Number, default: 0 },
  amount:          { type: Number, default: 0 },
  imageUrl:        { type: String, default: "" },
});

const purchaseSchema = new mongoose.Schema(
  {
    purchaseType:   { type: String, enum: ["CREDIT PURCHASE", "CASH PURCHASE"], default: "CREDIT PURCHASE" },
    purchaseNo:     { type: String, required: true },
    partyCode:      { type: String, default: "" },
    partyName:      { type: String, default: "" },
    billNo:         { type: String, default: "" },
    entryNo:        { type: String, default: "" },
    location:       { type: String, default: "L" },
    creditDays:     { type: Number, default: 0 },
    headerDiscount: { type: Number, default: 0 },
    entryDate:      { type: Date, default: Date.now },
    billDate:       { type: Date, default: Date.now },
    receivedDate:   { type: Date, default: Date.now },
    items:          [purchaseItemSchema],
    totalQty:       { type: Number, default: 0 },
    totalTaxable:   { type: Number, default: 0 },
    totalSgst:      { type: Number, default: 0 },
    totalCgst:      { type: Number, default: 0 },
    totalAmount:    { type: Number, default: 0 },
    netAmount:      { type: Number, default: 0 },
    createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.model("Purchase", purchaseSchema);
```

---

### 5.2.6 BACKEND — Controllers

#### File: `controllers/doctorAuthController.js`

```javascript
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

/* ── REGISTER DOCTOR ── */
export const registerDoctor = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    const doctor = await User.create({ name, email, password, role: "doctor" });

    res.status(201).json({
      token: generateToken(doctor._id, "doctor"),
      role: "doctor",
      user: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
      },
    });
  } catch (error) {
    console.error("Doctor register error:", error);
    res.status(500).json({ message: "Registration failed" });
  }
};

/* ── LOGIN DOCTOR ── */
export const loginDoctor = async (req, res) => {
  try {
    const { email, password } = req.body;
    const doctor = await User.findOne({ email, role: "doctor" });

    if (!doctor)
      return res.status(401).json({ message: "Invalid credentials" });

    if (!(await doctor.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      token: generateToken(doctor._id, "doctor"),
      role: "doctor",
      user: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        hospital: doctor.hospital,
        phone: doctor.phone,
        address: doctor.address,
        city: doctor.city,
        clinic: doctor.clinic,
      },
    });
  } catch (error) {
    console.error("Doctor login error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

/* ── UPDATE PROFILE ── */
export const updateDoctorProfile = async (req, res) => {
  try {
    const doctor = await User.findById(req.user._id);
    if (!doctor)
      return res.status(404).json({ message: "Doctor not found" });

    const { name, email, hospital, phone, address, city, clinic } = req.body;

    if (name)     doctor.name     = name;
    if (email)    doctor.email    = email;
    if (hospital) doctor.hospital = hospital;
    if (phone)    doctor.phone    = phone;
    if (address)  doctor.address  = address;
    if (city)     doctor.city     = city;
    if (clinic)   doctor.clinic   = clinic;

    await doctor.save();

    res.json({
      user: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        hospital: doctor.hospital,
        phone: doctor.phone,
        address: doctor.address,
        city: doctor.city,
        clinic: doctor.clinic,
      },
    });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Profile update failed" });
  }
};
```

#### File: `controllers/adminAuthController.js`

```javascript
import User from "../models/User.js";
import { generateToken } from "../utils/generateToken.js";

export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await User.findOne({ email, role: "admin" });
    if (!admin)
      return res.status(403).json({ message: "Not admin" });

    if (!(await admin.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    res.json({
      token: generateToken(admin._id, "admin"),
      role: "admin",
      user: { id: admin._id, name: admin.name, email: admin.email },
    });
  } catch (error) {
    console.error("Admin login error:", error);
    res.status(500).json({ message: "Admin login failed" });
  }
};
```

#### File: `controllers/medicineController.js`

```javascript
import Medicine from "../models/Medicine.js";
import cloudinary from "../config/cloudinary.js";

/* ── DOCTOR: GET MEDICINES ── */
export const getMedicines = async (req, res) => {
  try {
    const { search, category } = req.query;
    const filter = { isActive: true, stock: { $gt: 0 } };

    if (search) filter.name = { $regex: search, $options: "i" };
    if (category) filter.category = category;

    const medicines = await Medicine.find(filter).sort({ name: 1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── ADMIN: GET ALL MEDICINES ── */
export const adminGetMedicines = async (req, res) => {
  try {
    const medicines = await Medicine.find().sort({ createdAt: -1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── ADMIN: CREATE MEDICINE ── */
export const adminCreateMedicine = async (req, res) => {
  try {
    const {
      name, brand, company, companyCode, itemCode, description,
      packaging, packing, mrp, price, cost, gstPercent,
      stock, expiryDate, category,
    } = req.body;

    if (!name || !price || !stock || !category || !mrp || !expiryDate)
      return res.status(400).json({ message: "Required fields missing" });

    const imageUrls = [];
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "medicart/medicines" }
        );
        imageUrls.push(result.secure_url);
      }
    }

    const medicine = await Medicine.create({
      name: name.trim(), brand, company, companyCode, itemCode,
      description, packaging, packing,
      mrp: Number(mrp), price: Number(price), cost: Number(cost || 0),
      gstPercent: Number(gstPercent || 5),
      stock: Number(stock), expiryDate, category,
      images: imageUrls,
    });

    res.status(201).json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── ADMIN: UPDATE MEDICINE ── */
export const adminUpdateMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findById(req.params.id);
    if (!medicine)
      return res.status(404).json({ message: "Medicine not found" });

    const fields = [
      "name", "brand", "company", "companyCode", "itemCode",
      "description", "packaging", "packing", "category",
    ];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) medicine[f] = req.body[f];
    });

    ["mrp", "price", "cost", "gstPercent", "stock"].forEach((f) => {
      if (req.body[f] !== undefined) medicine[f] = Number(req.body[f]);
    });

    if (req.body.expiryDate) medicine.expiryDate = req.body.expiryDate;

    if (req.files?.length) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "medicart/medicines" }
        );
        medicine.images.push(result.secure_url);
      }
    }

    await medicine.save();
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── ADMIN: DELETE MEDICINE ── */
export const adminDeleteMedicine = async (req, res) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine)
      return res.status(404).json({ message: "Medicine not found" });
    res.json({ message: "Medicine deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── ADMIN: DELETE OUT-OF-STOCK ── */
export const adminDeleteOutOfStock = async (req, res) => {
  try {
    const result = await Medicine.deleteMany({ stock: 0 });
    res.json({
      message: `Deleted ${result.deletedCount} out-of-stock medicines`,
      deletedCount: result.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

#### File: `controllers/orderController.js`

```javascript
import Order from "../models/Order.js";
import Medicine from "../models/Medicine.js";
import { createInvoice } from "./invoiceCreateController.js";

/* ── DOCTOR: PLACE ORDER ── */
export const placeOrder = async (req, res) => {
  try {
    const { items, notes, paymentMode, paymentInfo } = req.body;

    if (!items?.length)
      return res.status(400).json({ message: "No items provided" });

    const orderItems = [];
    let subTotal = 0;
    let gstTotal = 0;

    for (const item of items) {
      const medicine = await Medicine.findOneAndUpdate(
        { _id: item.medicineId, stock: { $gte: item.quantity } },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!medicine) {
        // Rollback previously deducted stock
        for (const prev of orderItems) {
          await Medicine.updateOne(
            { _id: prev.medicineId },
            { $inc: { stock: prev.quantity } }
          );
        }
        return res.status(400).json({
          message: `Insufficient stock for ${item.name || "a medicine"}`,
        });
      }

      const price = Number(medicine.price) || 0;
      const gstPercent = Number(medicine.gstPercent ?? 5);
      const itemTotal = price * item.quantity;
      const itemGst = (itemTotal * gstPercent) / 100;

      subTotal += itemTotal;
      gstTotal += itemGst;

      orderItems.push({
        medicineId: medicine._id,
        name: medicine.name,
        brand: medicine.brand || medicine.company,
        company: medicine.company || medicine.brand,
        packaging: medicine.packaging || medicine.packing,
        packing: medicine.packing || medicine.packaging,
        mrp: medicine.mrp,
        price,
        gstPercent,
        expiryDate: medicine.expiryDate,
        quantity: item.quantity,
        images: medicine.images,
      });
    }

    const cgstAmount = Number((gstTotal / 2).toFixed(2));
    const sgstAmount = Number((gstTotal / 2).toFixed(2));
    const finalAmount = Number((subTotal + gstTotal).toFixed(2));

    const order = await Order.create({
      doctor: req.user._id,
      items: orderItems,
      notes: notes || "",
      billing: {
        taxableAmount: Number(subTotal.toFixed(2)),
        cgstAmount,
        sgstAmount,
        finalAmount,
      },
      paymentMode,
      paymentStatus:
        paymentMode === "online" && paymentInfo?.razorpay_payment_id
          ? "paid"
          : "pending",
      paymentInfo: paymentInfo || {},
    });

    // Auto-generate invoice
    try {
      await createInvoice(order._id);
    } catch (invoiceErr) {
      console.error("Invoice creation failed:", invoiceErr.message);
    }

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error("Place order error:", error);
    res.status(500).json({ message: "Order placement failed" });
  }
};

/* ── DOCTOR: GET RECENT ORDERS ── */
export const getRecentOrders = async (req, res) => {
  try {
    const orders = await Order.find({ doctor: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── GET ORDER BY ID ── */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate(
      "doctor",
      "name email hospital phone city clinic"
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── ADMIN: GET ALL ORDERS ── */
export const adminGetOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("doctor", "name email hospital phone city clinic")
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── ADMIN: UPDATE ORDER STATUS ── */
export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── ADMIN: UPDATE PAYMENT STATUS ── */
export const adminUpdatePaymentStatus = async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── ADMIN: MARK ORDER COMPLETED ── */
export const adminMarkOrderCompleted = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { adminStatus: "completed", orderStatus: "completed" },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ── ADMIN: INVENTORY SUMMARY ── */
export const inventorySummary = async (req, res) => {
  try {
    const totalMedicines = await Medicine.countDocuments();
    const totalUnits = await Medicine.aggregate([
      { $group: { _id: null, total: { $sum: "$stock" } } },
    ]);
    const lowStock = await Medicine.countDocuments({
      stock: { $gt: 0, $lte: 10 },
    });
    const outOfStock = await Medicine.countDocuments({ stock: 0 });

    res.json({
      totalMedicines,
      totalUnits: totalUnits[0]?.total || 0,
      lowStock,
      outOfStock,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

#### File: `controllers/invoiceCreateController.js`

```javascript
import Invoice from "../models/Invoice.js";
import Order from "../models/Order.js";

export const createInvoice = async (orderId) => {
  const order = await Order.findById(orderId).populate("doctor");

  if (!order) throw new Error("Order not found");

  const year = new Date().getFullYear();

  const invoiceCount = await Invoice.countDocuments({
    invoiceNo: new RegExp(`MC-${year}`),
  });

  const invoiceNo = `MC-${year}-${String(invoiceCount + 1).padStart(4, "0")}`;

  const invoice = await Invoice.create({
    invoiceNo,
    orderId: order._id,

    doctor: {
      name: order.doctor.name,
      clinic: order.doctor.clinic,
      phone: order.doctor.phone,
      city: order.doctor.city,
    },

    items: order.items.map((item) => ({
      name: item.name,
      company: item.brand,
      packaging: item.packaging,
      expiry: item.expiryDate
        ? new Date(item.expiryDate).toLocaleDateString()
        : "",
      qty: item.quantity,
      mrp: item.mrp,
      price: item.price,
      gstPercent: item.gstPercent,
      amount: item.price * item.quantity,
    })),

    taxableAmount: order.billing.taxableAmount,
    sgstAmount: order.billing.sgstAmount,
    cgstAmount: order.billing.cgstAmount,
    igstAmount: 0,

    totalAmount: order.billing.finalAmount,
  });

  return invoice;
};
```

#### File: `controllers/invoiceController.js`

```javascript
import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import Invoice from "../models/Invoice.js";

export const generateInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ orderId: req.params.id });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found for this order" });
    }

    const invoicePath = `invoices/invoice-${invoice.invoiceNo}.pdf`;

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(fs.createWriteStream(invoicePath));

    /* HEADER */
    doc.fontSize(16).text("SHREE SAI SURGICAL", { align: "center" }).moveDown(0.3);
    doc.fontSize(10).text("Medical & Surgical Supplier", { align: "center" }).moveDown(1);
    doc.fontSize(9);
    doc.text(`Invoice No: ${invoice.invoiceNo}`);
    doc.text(`Invoice Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
    doc.text(`Order ID: ${invoice.orderId}`);
    doc.moveDown();

    /* DOCTOR */
    doc.fontSize(10).text("Bill To:");
    doc.fontSize(9);
    doc.text(`Doctor: ${invoice.doctor.name}`);
    doc.text(`Clinic: ${invoice.doctor.clinic}`);
    doc.text(`Mobile: ${invoice.doctor.phone}`);
    doc.text(`City: ${invoice.doctor.city}`);
    doc.moveDown();

    /* TABLE HEADER */
    const tableTop = doc.y;
    doc.fontSize(9);
    doc.text("Qty", 40, tableTop);
    doc.text("Item", 70, tableTop);
    doc.text("Company", 200, tableTop);
    doc.text("Pack", 290, tableTop);
    doc.text("Exp", 330, tableTop);
    doc.text("MRP", 370, tableTop);
    doc.text("Rate", 420, tableTop);
    doc.text("Amount", 470, tableTop);
    doc.text("GST%", 530, tableTop);
    doc.moveDown(0.5);
    let y = tableTop + 15;

    /* ITEMS */
    invoice.items.forEach((item) => {
      doc.text(item.qty, 40, y);
      doc.text(item.name, 70, y, { width: 120 });
      doc.text(item.company, 200, y);
      doc.text(item.packaging, 290, y);
      doc.text(item.expiry, 330, y);
      doc.text(item.mrp.toFixed(2), 370, y);
      doc.text(item.price.toFixed(2), 420, y);
      doc.text(item.amount.toFixed(2), 470, y);
      doc.text(item.gstPercent + "%", 530, y);
      y += 18;
    });

    doc.moveDown(2);

    /* TOTALS */
    doc.text(`Taxable Amount: ₹${invoice.taxableAmount.toFixed(2)}`, { align: "right" });
    doc.text(`SGST Amount: ₹${invoice.sgstAmount.toFixed(2)}`, { align: "right" });
    doc.text(`CGST Amount: ₹${invoice.cgstAmount.toFixed(2)}`, { align: "right" });
    doc.moveDown(0.5);
    doc.fontSize(11).text(`FINAL AMOUNT: ₹${invoice.totalAmount.toFixed(2)}`, { align: "right" });
    doc.moveDown(2);

    /* FOOTER */
    doc.fontSize(9);
    doc.text("Bank: Bank of India");
    doc.text("A/C No: 010020110000004");
    doc.text("IFSC: BKID0000100");
    doc.moveDown(1);
    doc.text("Authorized Signatory");

    doc.end();

    res.json({ message: "Invoice generated", file: invoicePath });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
```

#### File: `controllers/adminPaymentController.js`

```javascript
import User from "../models/User.js";
import Order from "../models/Order.js";

/* SEARCH DOCTORS */
export const searchDoctors = async (req, res) => {
  try {
    const { q } = req.query;
    const query = { role: "doctor" };

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const doctors = await User.find(query).select("name email hospital");
    res.json(doctors);
  } catch (error) {
    res.status(500).json({ message: "Search failed", error: error.message });
  }
};

/* GET DOCTOR DUE DETAILS */
export const getDoctorDue = async (req, res) => {
  try {
    const { id } = req.params;
    const orders = await Order.find({ doctor: id, paymentStatus: "pending" });

    const totalDue = orders.reduce((sum, o) => {
      const orderTotal = o.billing?.finalAmount || 0;
      const alreadyPaid = o.paidAmount || 0;
      return sum + (orderTotal - alreadyPaid);
    }, 0);

    res.json({ doctorId: id, totalDue, pendingOrdersCount: orders.length });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch due", error: error.message });
  }
};

/* DEDUCT PAYMENT (FIFO) */
export const deductPayment = async (req, res) => {
  try {
    const { doctorId, amount } = req.body;

    if (!doctorId || !amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid data" });
    }

    const orders = await Order.find({
      doctor: doctorId,
      paymentStatus: "pending",
    }).sort({ createdAt: 1 });

    let remaining = Number(amount);
    let paidOrderIds = [];
    let partiallyPaidOrderIds = [];

    for (let order of orders) {
      if (remaining <= 0) break;

      const orderTotal = order.billing?.finalAmount || 0;
      const alreadyPaid = order.paidAmount || 0;
      const orderRemaining = orderTotal - alreadyPaid;

      if (orderRemaining <= 0) continue;

      if (remaining >= orderRemaining) {
        order.paymentStatus = "paid";
        order.paidAmount = orderTotal;
        await order.save();
        remaining -= orderRemaining;
        paidOrderIds.push(order._id);
      } else {
        order.paidAmount = alreadyPaid + remaining;
        await order.save();
        remaining = 0;
        partiallyPaidOrderIds.push(order._id);
      }
    }

    res.json({
      message: "Payment applied",
      paidOrders: paidOrderIds,
      partiallyPaidOrders: partiallyPaidOrderIds,
      remainingExcess: remaining,
      totalProcessed: Number(amount) - remaining,
    });
  } catch (error) {
    res.status(500).json({ message: "Payment processing failed", error: error.message });
  }
};
```

#### File: `controllers/purchaseController.js`

```javascript
import Purchase from "../models/Purchase.js";
import Medicine from "../models/Medicine.js";
import cloudinary from "../config/cloudinary.js";

/* ADMIN: CREATE PURCHASE */
export const createPurchase = async (req, res, next) => {
  try {
    const {
      purchaseType, purchaseNo, partyCode, partyName, billNo, entryNo,
      location, creditDays, headerDiscount, entryDate, billDate,
      receivedDate, items: itemsJSON,
    } = req.body;

    if (!purchaseNo)
      return res.status(400).json({ message: "Purchase number is required" });

    let items = [];
    try { items = JSON.parse(itemsJSON || "[]"); }
    catch { return res.status(400).json({ message: "Invalid items data" }); }

    if (!items.length)
      return res.status(400).json({ message: "At least one item is required" });

    /* Upload images to Cloudinary */
    const fileMap = {};
    if (req.files?.length) {
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(
          `data:${file.mimetype};base64,${file.buffer.toString("base64")}`,
          { folder: "medicart/purchases" }
        );
        fileMap[file.fieldname] = result.secure_url;
      }
    }

    /* Build item docs & compute totals */
    let totalQty = 0, totalTaxable = 0, totalSgst = 0, totalCgst = 0, totalAmount = 0;

    const itemDocs = items.map((item, idx) => {
      const imageKey = `image_${idx}`;
      const imageUrl = fileMap[imageKey] || "";
      const qty = Number(item.qty || 0);
      const rate = item.billRate !== "" && item.billRate != null
        ? Number(item.billRate) : Number(item.mrp || 0);
      const disc = Number(item.discountPercent || 0);
      const gst = Number(item.gstPercent || 0);

      const gross = qty * rate;
      const afterDisc = gross - (gross * disc) / 100;
      const gstAmt = (afterDisc * gst) / 100;
      const halfGst = gstAmt / 2;
      const amount = afterDisc + gstAmt;

      totalQty += qty;
      totalTaxable += afterDisc;
      totalSgst += halfGst;
      totalCgst += halfGst;
      totalAmount += amount;

      return {
        code: item.code || "", itemName: item.itemName, mfr: item.mfr || "",
        pkg: item.pkg || "", batch: item.batch || "", exp: item.exp || "",
        mrp: Number(item.mrp || 0), qty, free: Number(item.free || 0),
        billRate: Number(item.billRate || 0),
        schemePercent: Number(item.schemePercent || 0),
        discountPercent: disc, gstPercent: gst,
        salePrice: Number(item.salePrice || 0), hsnCode: item.hsnCode || "",
        taxableAmount: afterDisc, sgst: halfGst, cgst: halfGst,
        amount, imageUrl,
      };
    });

    const hdrDisc = Number(headerDiscount || 0);
    const discAmt = (totalAmount * hdrDisc) / 100;
    const netAmount = totalAmount - discAmt;

    /* Save to DB */
    const purchase = await Purchase.create({
      purchaseType: purchaseType || "CREDIT PURCHASE",
      purchaseNo, partyCode: partyCode || "", partyName: partyName || "",
      billNo: billNo || "", entryNo: entryNo || "",
      location: location || "L",
      creditDays: Number(creditDays || 0), headerDiscount: hdrDisc,
      entryDate: entryDate ? new Date(entryDate) : new Date(),
      billDate: billDate ? new Date(billDate) : new Date(),
      receivedDate: receivedDate ? new Date(receivedDate) : new Date(),
      items: itemDocs, totalQty, totalTaxable, totalSgst, totalCgst,
      totalAmount, netAmount, createdBy: req.user?._id,
    });

    /* Update / create Medicine stock for each item */
    const validCategories = ["SYP", "TAB", "CAP", "EE", "INJ", "INSTR"];

    for (const item of itemDocs) {
      if (item.itemName) {
        const stockDelta = item.qty + (item.free || 0);
        const inferredCategory = validCategories.includes(
          (item.pkg || "").toUpperCase()
        ) ? (item.pkg || "").toUpperCase() : "TAB";

        await Medicine.findOneAndUpdate(
          { name: { $regex: `^${item.itemName.trim()}$`, $options: "i" } },
          {
            $inc: { stock: stockDelta },
            $setOnInsert: {
              name: item.itemName.trim(),
              brand: item.mfr || "Unknown",
              mrp: item.mrp || 0,
              price: item.salePrice || item.billRate || item.mrp || 0,
              gstPercent: item.gstPercent || 5,
              expiryDate: item.exp
                ? new Date(item.exp)
                : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
              category: inferredCategory,
              images: item.imageUrl ? [item.imageUrl] : [],
              description: "", packaging: item.pkg || "", isActive: true,
            },
          },
          { upsert: true, new: true }
        );
      }
    }

    res.status(201).json({
      message: `Purchase saved — ${itemDocs.length} item(s) recorded.`,
      purchase,
    });
  } catch (err) { next(err); }
};

/* ADMIN: GET ALL PURCHASES */
export const getPurchases = async (req, res, next) => {
  try {
    const purchases = await Purchase.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");
    res.json(purchases);
  } catch (err) { next(err); }
};

/* ADMIN: GET SINGLE PURCHASE */
export const getPurchaseById = async (req, res, next) => {
  try {
    const purchase = await Purchase.findById(req.params.id).populate(
      "createdBy", "name email"
    );
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });
    res.json(purchase);
  } catch (err) { next(err); }
};

/* ADMIN: DELETE PURCHASE */
export const deletePurchase = async (req, res, next) => {
  try {
    const purchase = await Purchase.findByIdAndDelete(req.params.id);
    if (!purchase) return res.status(404).json({ message: "Purchase not found" });
    res.json({ success: true, message: "Purchase deleted" });
  } catch (err) { next(err); }
};
```

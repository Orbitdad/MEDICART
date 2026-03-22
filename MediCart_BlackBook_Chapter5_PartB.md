### 5.2.7 BACKEND — Route Files

#### File: `routes/doctorAuthRoutes.js`

```javascript
import express from "express";
import { loginDoctor, registerDoctor, updateDoctorProfile }
  from "../controllers/doctorAuthController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/login", loginDoctor);
router.post("/register", registerDoctor);
router.put("/profile", protect(["doctor"]), updateDoctorProfile);

export default router;
```

#### File: `routes/adminAuthRoutes.js`

```javascript
import express from "express";
import { loginAdmin } from "../controllers/adminAuthController.js";

const router = express.Router();

// Only login — no public registration
router.post("/login", loginAdmin);

export default router;
```

#### File: `routes/medicineRoutes.js`

```javascript
import express from "express";
import { getMedicines } from "../controllers/medicineController.js";

const router = express.Router();

router.get("/", getMedicines);

export default router;
```

#### File: `routes/adminMedicineRoutes.js`

```javascript
import express from "express";
import {
  adminGetMedicines,
  adminCreateMedicine,
  adminUpdateMedicine,
  adminDeleteMedicine,
  adminDeleteOutOfStock,
} from "../controllers/medicineController.js";

import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();

router.get("/", protect(["admin"]), adminGetMedicines);

router.post("/", protect(["admin"]), upload.array("images"), adminCreateMedicine);

router.delete("/out-of-stock", protect(["admin"]), adminDeleteOutOfStock);

router.put("/:id", protect(["admin"]), upload.array("images"), adminUpdateMedicine);

router.delete("/:id", protect(["admin"]), adminDeleteMedicine);

export default router;
```

#### File: `routes/orderRoutes.js`

```javascript
import express from "express";
import {
  placeOrder,
  getRecentOrders,
  getOrderById,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Doctor actions */
router.post("/", protect(["doctor"]), placeOrder);
router.get("/recent", protect(["doctor"]), getRecentOrders);

/* Invoice (doctor + admin) */
router.get("/:id", protect(["doctor", "admin"]), getOrderById);

export default router;
```

#### File: `routes/adminOrderRoutes.js`

```javascript
import express from "express";
import {
  adminGetOrders,
  adminUpdateOrderStatus,
  adminUpdatePaymentStatus,
  adminMarkOrderCompleted,
  inventorySummary,
} from "../controllers/orderController.js";

import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/* Specific literal paths MUST come before parameterised /:id routes */
router.get("/inventory", protect(["admin"]), inventorySummary);
router.get("/", protect(["admin"]), adminGetOrders);
router.put("/:id/status", protect(["admin"]), adminUpdateOrderStatus);
router.put("/:id/payment", protect(["admin"]), adminUpdatePaymentStatus);
router.put("/:id/complete", protect(["admin"]), adminMarkOrderCompleted);

export default router;
```

#### File: `routes/paymentRoutes.js`

```javascript
import express from "express";
import razorpay from "../config/razorpay.js";
import crypto from "crypto";

const router = express.Router();

/* CREATE PAYMENT ORDER */
router.post("/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({ message: "Amount is required" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "medicart_" + Date.now(),
    });

    res.json(order);
  } catch (error) {
    console.error("Razorpay create order error:", error);
    res.status(500).json({ message: "Failed to create payment order" });
  }
});

/* VERIFY PAYMENT */
router.post("/verify", (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false });
  }
});

export default router;
```

#### File: `routes/invoiceRoutes.js`

```javascript
import express from "express";
import Invoice from "../models/Invoice.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * GET invoice by orderId
 * Accessible by doctor & admin
 */
router.get(
  "/by-order/:orderId",
  protect(["doctor", "admin"]),
  async (req, res) => {
    try {
      const invoice = await Invoice.findOne({
        orderId: req.params.orderId,
      });

      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }

      res.json(invoice);
    } catch (error) {
      console.error("Invoice fetch error:", error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

export default router;
```

#### File: `routes/adminPurchaseRoutes.js`

```javascript
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

router.get("/", protect(["admin"]), getPurchases);
router.get("/:id", protect(["admin"]), getPurchaseById);
router.post("/", protect(["admin"]), upload.any(), createPurchase);
router.delete("/:id", protect(["admin"]), deletePurchase);

export default router;
```

#### File: `routes/adminPaymentRoutes.js`

```javascript
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  searchDoctors,
  getDoctorDue,
  deductPayment,
} from "../controllers/adminPaymentController.js";

const router = express.Router();

router.get("/doctors", protect(["admin"]), searchDoctors);
router.get("/doctors/:id/due", protect(["admin"]), getDoctorDue);
router.post("/deduct", protect(["admin"]), deductPayment);

export default router;
```

---

### 5.2.8 FRONTEND — Entry Point & Root Component

#### File: `main.jsx`

```jsx
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { AuthProvider } from "./context/AuthContext.jsx";
import { CartProvider } from "./context/CartContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HashRouter
      future={{
        v7_startTransition: true,
        v7_relativeSplatPath: true,
      }}
    >
      <AuthProvider>
        <CartProvider>
          <App />
        </CartProvider>
      </AuthProvider>
    </HashRouter>
  </React.StrictMode>
);
```

#### File: `App.jsx`

```jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import MobileBottomNav from "./components/MobileBottomNav.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import InitialLoadingScreen from "./components/InitialLoadingScreen.jsx";
import Footer from "./components/Footer";
import ScrollToTop from "./components/ScrollToTop.jsx";

/* DOCTOR PAGES */
import DoctorLogin from "./pages/doctor/DoctorLogin.jsx";
import DoctorSignup from "./pages/doctor/DoctorSignup.jsx";
import Home from "./pages/doctor/Home.jsx";
import DoctorOrders from "./pages/doctor/Orders.jsx";
import MedicineList from "./pages/doctor/MedicineList.jsx";
import Cart from "./pages/doctor/Cart.jsx";
import OrderSuccess from "./pages/doctor/OrderSuccess.jsx";
import InvoicePage from "./pages/doctor/InvoicePage.jsx";
import Profile from "./pages/doctor/Profile.jsx";

/* ADMIN PAGES */
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Orders from "./pages/admin/Orders.jsx";
import Medicines from "./pages/admin/Medicines.jsx";
import Inventory from "./pages/admin/Inventory.jsx";
import PurchaseEntry from "./pages/admin/PurchaseEntry.jsx";
import PaymentEntry from "./pages/admin/PaymentEntry.jsx";

/* PUBLIC PAGES */
import ContactSupport from "./pages/public/ContactSupport.jsx";
import AboutMediCart from "./pages/public/AboutMediCart.jsx";
import PrivacyPolicy from "./pages/public/PrivacyPolicy.jsx";
import TermsAndConditions from "./pages/public/TermsAndConditions.jsx";
import RefundPolicy from "./pages/public/RefundPolicy.jsx";

function App() {
  return (
    <div className="app-root">
      <ScrollToTop />
      <InitialLoadingScreen />
      <Navbar />

      <main className="app-main">
        <Routes>
          {/* ROOT */}
          <Route path="/" element={<Navigate to="/doctor/login" replace />} />

          {/* AUTH */}
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor/signup" element={<DoctorSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* DOCTOR ROUTES */}
          <Route element={
            <ProtectedRoute allowedRoles={["doctor"]} redirectTo="/doctor/login" />
          }>
            <Route path="/doctor/home" element={<Home />} />
            <Route path="/doctor/orders" element={<DoctorOrders />} />
            <Route path="/doctor/medicines" element={<MedicineList />} />
            <Route path="/doctor/cart" element={<Cart />} />
            <Route path="/doctor/order-success/:id" element={<OrderSuccess />} />
            <Route path="/doctor/orders/:id/invoice" element={<InvoicePage />} />
            <Route path="/doctor/profile" element={<Profile />} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route element={
            <ProtectedRoute allowedRoles={["admin"]} redirectTo="/admin/login" />
          }>
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/orders" element={<Orders />} />
            <Route path="/admin/medicines" element={<Medicines />} />
            <Route path="/admin/inventory" element={<Inventory />} />
            <Route path="/admin/purchase" element={<PurchaseEntry />} />
            <Route path="/admin/payments" element={<PaymentEntry />} />
          </Route>

          {/* PUBLIC PAGES */}
          <Route path="/contact" element={<ContactSupport />} />
          <Route path="/about" element={<AboutMediCart />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms" element={<TermsAndConditions />} />
          <Route path="/refund-policy" element={<RefundPolicy />} />

          {/* 404 */}
          <Route path="*" element={
            <h2 style={{ padding: "2rem" }}>404 – Page Not Found</h2>
          } />
        </Routes>
      </main>

      <Footer />
      <MobileBottomNav />
    </div>
  );
}

export default App;
```

---

### 5.2.9 FRONTEND — Context Providers (State Management)

#### File: `context/AuthContext.jsx`

```jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);

const TOKEN_KEY = "medicart_token";
const ROLE_KEY = "medicart_role";
const USER_KEY = "medicart_user";

/* SAFE HELPERS */
function safeValue(value) {
  if (!value || value === "undefined" || value === "null") return null;
  return value;
}

function safeParse(value) {
  try {
    if (!value || value === "undefined" || value === "null") return null;
    return JSON.parse(value);
  } catch { return null; }
}

/* PROVIDER */
export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [role, setRole] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);  // hydration flag

  /* HYDRATE FROM STORAGE */
  useEffect(() => {
    const storedToken = safeValue(localStorage.getItem(TOKEN_KEY));
    const storedRole = safeValue(localStorage.getItem(ROLE_KEY));
    const storedUser = safeParse(localStorage.getItem(USER_KEY));
    setToken(storedToken);
    setRole(storedRole);
    setUser(storedUser);
    setLoading(false);  // hydration complete
  }, []);

  /* LOGIN */
  const login = ({ token, role, user }) => {
    if (!token) return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(ROLE_KEY, role);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setToken(token);
    setRole(role);
    setUser(user);
  };

  /* LOGOUT */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ROLE_KEY);
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setRole(null);
    setUser(null);
  };

  /* UPDATE USER */
  const updateUser = (userData) => {
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  return (
    <AuthContext.Provider value={{
      token, role, user, loading,
      login, logout, updateUser,
      isAuthenticated: Boolean(token),
    }}>
      {children}
    </AuthContext.Provider>
  );
}

/* HOOK */
export function useAuth() {
  return useContext(AuthContext);
}
```

#### File: `context/CartContext.jsx`

```jsx
import React, { createContext, useContext, useMemo, useState } from "react";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [notes, setNotes] = useState("");

  /* ADD TO CART */
  const addToCart = (medicine) => {
    setItems((prev) => {
      const existing = prev.find((it) => it._id === medicine._id);
      if (existing) return prev;
      return [...prev, { ...medicine, quantity: "1" }];
    });
  };

  /* REMOVE */
  const removeFromCart = (id) => {
    setItems((prev) => prev.filter((it) => it._id !== id));
  };

  /* UPDATE QUANTITY (SAFE) */
  const updateQty = (id, quantity) => {
    setItems((prev) =>
      prev.map((it) =>
        it._id === id
          ? { ...it, quantity: quantity === "" ? ""
              : Math.min(Number(quantity), it.stock) }
          : it
      )
    );
  };

  /* CLEAR CART */
  const clearCart = () => { setItems([]); setNotes(""); };

  /* TAXABLE AMOUNT */
  const taxableAmount = useMemo(() => {
    return items.reduce(
      (sum, it) => sum + (Number(it.price) || 0) * (Number(it.quantity) || 0),
      0
    );
  }, [items]);

  /* GST CALCULATION */
  const gstSummary = useMemo(() => {
    let cgst = 0, sgst = 0;
    items.forEach((it) => {
      const qty = Number(it.quantity) || 0;
      const price = Number(it.price) || 0;
      const gstPercent = Number(it.gstPercent) || 0;
      const amount = qty * price;
      const gst = (amount * gstPercent) / 100;
      cgst += gst / 2;
      sgst += gst / 2;
    });
    return { cgst: cgst.toFixed(2), sgst: sgst.toFixed(2), totalGST: (cgst + sgst).toFixed(2) };
  }, [items]);

  /* FINAL AMOUNT */
  const finalAmount = useMemo(() => {
    return (taxableAmount + Number(gstSummary.totalGST)).toFixed(2);
  }, [taxableAmount, gstSummary]);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQty, clearCart,
      notes, setNotes,
      taxableAmount: taxableAmount.toFixed(2),
      cgst: gstSummary.cgst, sgst: gstSummary.sgst, finalAmount,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
```

---

### 5.2.10 FRONTEND — API / HTTP Client Layer

#### File: `api/client.js`

```javascript
const base =
  (import.meta.env.VITE_API_URL || "https://medicart-backend.onrender.com/api")
    .replace(/\/$/, "");

/* HEADERS */
function buildHeaders() {
  const token = localStorage.getItem("medicart_token");
  return {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
  };
}

/* SAFE FETCH (MOBILE FIX + RENDER COLD START) */
async function safeFetch(url, options = {}, retries = 1) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30000);

  try {
    const res = await fetch(url, { ...options, signal: controller.signal });
    return res;
  } catch (err) {
    if (err.name === "AbortError") {
      if (retries > 0) { clearTimeout(timeout); return safeFetch(url, options, retries - 1); }
      throw new Error("Server timeout. Please try again.");
    }
    if (retries > 0) { clearTimeout(timeout); return safeFetch(url, options, retries - 1); }
    throw new Error("Network error. Check internet or backend connection.");
  } finally { clearTimeout(timeout); }
}

/* RESPONSE HANDLER */
async function handleResponse(res) {
  if (res.status === 204) return null;
  let text = "";
  try { text = await res.text(); } catch { throw new Error("Server response error"); }
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = null; }
  if (!res.ok) throw new Error(data?.message || "Request failed");
  return data;
}

/* URL BUILDER */
function buildUrl(path) {
  if (!path.startsWith("/")) path = "/" + path;
  return base + path;
}

/* HTTP METHODS */
export async function get(path) {
  const res = await safeFetch(buildUrl(path), { method: "GET", headers: buildHeaders() });
  return handleResponse(res);
}

export async function post(path, body) {
  const res = await safeFetch(buildUrl(path), {
    method: "POST", headers: buildHeaders(), body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function put(path, body) {
  const res = await safeFetch(buildUrl(path), {
    method: "PUT", headers: buildHeaders(), body: JSON.stringify(body),
  });
  return handleResponse(res);
}

export async function del(path) {
  const res = await safeFetch(buildUrl(path), { method: "DELETE", headers: buildHeaders() });
  return handleResponse(res);
}

export default { get, post, put, delete: del };
```

#### File: `api/auth.js`

```javascript
import * as client from "./client";

/* DOCTOR AUTH */
export const doctorLogin = async (email, password) => {
  const res = await client.post("/auth/doctor/login", { email, password });
  if (!res || !res.token) throw new Error("Invalid login response");
  return { token: res.token, role: res.role, user: res.user };
};

export const doctorSignup = async (name, email, password) => {
  const res = await client.post("/auth/doctor/register", { name, email, password });
  if (!res || !res.token) throw new Error("Invalid signup response");
  return { token: res.token, role: res.role, user: res.user };
};

export const updateProfile = async (data) => {
  const res = await client.put("/auth/doctor/profile", data);
  return res.user;
};

/* ADMIN AUTH */
export const adminLogin = async (email, password) => {
  const res = await client.post("/auth/admin/login", { email, password });
  if (!res || !res.token) throw new Error("Invalid admin login response");
  return { token: res.token, role: res.role, user: res.user };
};
```

#### File: `api/medicines.js`

```javascript
const BASE = import.meta.env.VITE_API_URL;

/* DOCTOR */
export const getMedicines = async (search = "") => {
  const res = await fetch(`${BASE}/medicines?search=${encodeURIComponent(search)}`);
  if (!res.ok) throw new Error("Failed to fetch medicines");
  return res.json();
};

/* ADMIN */
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("medicart_token")}`,
});

export const adminGetMedicines = async () => {
  const res = await fetch(`${BASE}/admin/medicines`, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to load medicines");
  return res.json();
};

export const adminAddMedicine = async (formData) => {
  const res = await fetch(`${BASE}/admin/medicines`, {
    method: "POST", headers: authHeader(), body: formData,
  });
  if (!res.ok) throw new Error("Failed to add medicine");
  return res.json();
};

export const adminUpdateMedicine = async (id, formData) => {
  const res = await fetch(`${BASE}/admin/medicines/${id}`, {
    method: "PUT", headers: authHeader(), body: formData,
  });
  if (!res.ok) throw new Error("Failed to update medicine");
  return res.json();
};

export const adminDeleteMedicine = async (id) => {
  const res = await fetch(`${BASE}/admin/medicines/${id}`, {
    method: "DELETE", headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to delete medicine");
  return res.json();
};

export const adminDeleteOutOfStock = async () => {
  const res = await fetch(`${BASE}/admin/medicines/out-of-stock`, {
    method: "DELETE", headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to delete out-of-stock medicines");
  return res.json();
};
```

#### File: `api/orders.js`

```javascript
import client from "./client.js";

/* DOCTOR */
export async function placeOrder(payload) {
  return client.post("/orders", payload);
}

export async function getRecentOrders() {
  const orders = await client.get("/orders/recent");
  return Array.isArray(orders) ? orders : [];
}

/* ADMIN */
export async function adminFetchOrders() { return client.get("/admin/orders"); }

export async function updateOrderStatus(orderId, orderStatus) {
  return client.put(`/admin/orders/${orderId}/status`, { orderStatus });
}

export async function updatePaymentStatus(orderId, paymentStatus) {
  return client.put(`/admin/orders/${orderId}/payment`, { paymentStatus });
}

export async function markOrderCompleted(orderId) {
  return client.put(`/admin/orders/${orderId}/complete`);
}

/* INVENTORY */
export async function fetchInventorySummary() {
  return client.get("/admin/orders/inventory");
}
```

#### File: `api/payment.js`

```javascript
import client from "./client.js";

/* Create Razorpay Order */
export async function createRazorpayOrder(amount) {
  return client.post("/payment/create-order", { amount });
}

/* Verify Razorpay Payment */
export async function verifyRazorpayPayment(paymentData) {
  return client.post("/payment/verify", paymentData);
}
```

#### File: `api/purchase.js`

```javascript
const BASE = import.meta.env.VITE_API_URL;

const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("medicart_token")}`,
});

/* CREATE PURCHASE (multipart/form-data) */
export const savePurchase = async (header, items) => {
  const formData = new FormData();
  Object.entries(header).forEach(([key, value]) => formData.append(key, value));

  const cleanItems = items.map(({ imageFile, imagePreview, ...rest }) => rest);
  formData.append("items", JSON.stringify(cleanItems));

  items.forEach((item, idx) => {
    if (item.imageFile) formData.append(`image_${idx}`, item.imageFile);
  });

  const res = await fetch(`${BASE}/admin/purchases`, {
    method: "POST", headers: authHeader(), body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || "Failed to save purchase");
  }
  return res.json();
};

/* GET ALL PURCHASES */
export const getPurchases = async () => {
  const res = await fetch(`${BASE}/admin/purchases`, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to fetch purchases");
  return res.json();
};

/* GET SINGLE PURCHASE */
export const getPurchaseById = async (id) => {
  const res = await fetch(`${BASE}/admin/purchases/${id}`, { headers: authHeader() });
  if (!res.ok) throw new Error("Failed to fetch purchase");
  return res.json();
};

/* DELETE PURCHASE */
export const deletePurchase = async (id) => {
  const res = await fetch(`${BASE}/admin/purchases/${id}`, {
    method: "DELETE", headers: authHeader(),
  });
  if (!res.ok) throw new Error("Failed to delete purchase");
  return res.json();
};
```

#### File: `api/adminPayment.js`

```javascript
import client from "./client";

/* SEARCH DOCTORS */
export const searchDoctors = async (query) => {
  return client.get(`/admin/payments/doctors?q=${encodeURIComponent(query)}`);
};

/* GET DOCTOR DUE */
export const getDoctorDue = async (doctorId) => {
  return client.get(`/admin/payments/doctors/${doctorId}/due`);
};

/* DEDUCT PAYMENT */
export const deductPayment = async (doctorId, amount) => {
  return client.post("/admin/payments/deduct", { doctorId, amount });
};
```

---

### 5.2.11 Code Efficiency Summary

| Technique | File(s) | Benefit |
|:----------|:--------|:--------|
| Atomic `findOneAndUpdate` with `$gte` | `orderController.js` | Race-condition-safe stock deduction in single DB op |
| Stock rollback via `$inc: +qty` | `orderController.js` | Data consistency on partial order failures |
| `isModified()` pre-save check | `models/User.js` | Prevents unnecessary re-hashing on non-password updates |
| In-memory image upload (Multer memoryStorage) | `uploadMiddleware.js` + controllers | Avoids temporary disk I/O |
| `useMemo` for derived state | `CartContext.jsx` | Prevents redundant GST recalculations per render |
| Stored computed totals | `Purchase` model | Eliminates re-computation on dashboard reads |
| `.populate()` for references | Order queries | Single query resolves related documents (doctor info) |
| Nullish coalescing (`??`) | Billing computations | Safe defaults prevent NaN propagation |
| `safeFetch` with auto-retry | `api/client.js` | Handles Render cold starts and network flakiness |
| AbortController with 30s timeout | `api/client.js` | Prevents indefinite hang on slow endpoints |
| FIFO payment deduction | `adminPaymentController.js` | Oldest debts cleared first — fair accounting practice |
| `$setOnInsert` in upsert | `purchaseController.js` | Creates medicine only if not exists; always increments stock |
| Middleware factory pattern `protect(roles)` | `authMiddleware.js` | Reusable auth + role check in a single composable HOF |
| Hydration flag (`loading`) | `AuthContext.jsx` | Prevents flash of unauthenticated content on page load |

---

## 5.3 Testing Approach

### 5.3.1 Unit Testing

Individual functional units were tested in isolation using **Postman** for API endpoint testing:

- **Authentication:** All edge cases — valid login, wrong password, duplicate email signup, role mismatch, expired tokens, missing Authorization header.
- **Medicine CRUD:** Add/edit/delete with various field combinations, image uploads, and validation errors.
- **GST Calculation:** Mathematical accuracy verified for multiple GST brackets (5%, 12%, 18%) with varying quantities and prices.
- **Stock Operations:** Atomic deduction, insufficient stock handling, and rollback behaviour.

### 5.3.2 Integration Testing

End-to-end flows were tested across frontend and backend:

1. **Order Checkout Flow:** Doctor login → browse catalogue → add to cart → checkout → Razorpay test payment → verify order creation → check stock deduction → view invoice.
2. **Purchase + Inventory Sync:** Admin records purchase → verify stock increment → doctor sees updated stock.
3. **Admin Order Processing:** New order → admin approves → dispatches → completes → verify transitions.
4. **Payment Reconciliation:** Credit order → admin records FIFO payment → verify paymentStatus transition.

### 5.3.3 Beta Testing

- **2 medical practitioners** tested the doctor ordering flow for usability
- **1 pharmaceutical distributor** tested admin features including purchase entries
- Feedback incorporated: improved mobile layout, added order notes field, enhanced loading states

## 5.4 Modifications and Improvements

1. **Dual Field Support:** Added `company`/`brand` and `packing`/`packaging` dual fields for compatibility.
2. **Stock Rollback:** Automatic stock reversal when order creation fails mid-processing.
3. **Invoice Auto-Generation:** Changed from on-demand to auto-generate immediately on order placement.
4. **Out-of-Stock Filter:** Doctor catalogue query updated to `{ stock: { $gt: 0 } }`.
5. **CORS Expansion:** Added multiple development origins for local testing.
6. **SafeFetch with Retry:** Added Render cold-start handling with 30s timeout and auto-retry.

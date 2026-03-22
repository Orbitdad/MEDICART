# CHAPTER 5: IMPLEMENTATION AND TESTING

## 5.1 Implementation Approaches

MediCart was developed using a **modular, API-first approach** following the Agile SDLC model. The implementation strategy was:

1. **Backend-First Development:** RESTful APIs were designed, implemented, and tested (via Postman) before frontend development began, ensuring a stable data contract.
2. **Component-Based Frontend:** React components were built in isolation, then composed into pages. Context API provided global state management.
3. **Continuous Integration:** Git version control with feature branching enabled parallel development of modules without conflicts.
4. **Cloud-Native Deployment:** Frontend deployed on GitHub Pages; backend on Render.com; database on MongoDB Atlas — enabling zero-downtime updates.

## 5.2 Coding Details and Code Efficiency

### 5.2.1 Project Structure and Module Organisation

**Backend (`medi-backend/`):**
```
medi-backend/
├── config/          # db.js (MongoDB connection), cloudinary.js
├── controllers/     # 8 controller files (business logic)
│   ├── adminAuthController.js
│   ├── adminPaymentController.js
│   ├── doctorAuthController.js
│   ├── invoiceController.js
│   ├── invoiceCreateController.js
│   ├── medicineController.js
│   ├── orderController.js
│   └── purchaseController.js
├── middleware/       # errorMiddleware.js, authMiddleware.js
├── models/          # 5 Mongoose models
│   ├── User.js, Medicine.js, Order.js, Invoice.js, Purchase.js
├── routes/          # 10 route files
├── utils/           # generateToken.js
├── server.js        # Entry point
└── package.json
```

**Frontend (`medi-front/`):**
```
medi-front/
├── src/
│   ├── api/         # Axios API modules
│   ├── components/  # 22 shared components
│   │   ├── Navbar.jsx, Footer.jsx, MedicineCard.jsx
│   │   ├── ProtectedRoute.jsx, CartFloatingButton.jsx
│   │   ├── Toast.jsx, LoadingScreen.jsx, etc.
│   ├── context/     # AuthContext.jsx, CartContext.jsx
│   ├── pages/
│   │   ├── admin/   # Dashboard, Medicines, Orders, Inventory,
│   │   │            # PurchaseEntry, PaymentEntry, AdminLogin
│   │   ├── doctor/  # Home, MedicineList, Cart, Orders,
│   │   │            # InvoicePage, Profile, DoctorLogin, DoctorSignup
│   │   └── public/  # About, Contact, Terms, Privacy, Refund
│   ├── App.jsx      # Root component with React Router
│   ├── main.jsx     # Entry point
│   └── index.css    # Global styles
├── index.html
├── vite.config.js
└── package.json
```

### 5.2.2 Database Connection — `connectDB()`

*(File: `config/db.js`)*

```javascript
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
```

**Efficiency:** Uses Mongoose's built-in connection pooling (default 5 connections). The `process.exit(1)` ensures the server doesn't start without a valid database connection, preventing silent failures.

### 5.2.3 Admin Authentication — `loginDoctor()` and Password Hashing

*(File: `controllers/doctorAuthController.js`)*

```javascript
export const loginDoctor = async (req, res) => {
  const { email, password } = req.body;
  const doctor = await User.findOne({ email });

  if (!doctor || doctor.role !== "doctor") {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await doctor.matchPassword(password);
  if (!isMatch) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = generateToken(doctor._id, "doctor");
  return res.status(200).json({ token, role: "doctor", user: { ... } });
};
```

*(File: `models/User.js` — Pre-save hook)*

```javascript
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.matchPassword = function (password) {
  return bcrypt.compare(password, this.password);
};
```

**Efficiency:** The `isModified("password")` check prevents re-hashing passwords on non-password updates, avoiding unnecessary computational overhead. Salt factor of 10 provides strong security (~100ms hash time) without impacting login latency.

### 5.2.4 Medicine Management — `adminCreateMedicine()` and Image Upload Pipeline

*(File: `controllers/medicineController.js`)*

```javascript
export const adminCreateMedicine = async (req, res) => {
  const { name, mrp, price, stock, category, expiryDate, ... } = req.body;

  // Hard validation
  if (!name || !price || !stock || !category || !mrp || !expiryDate) {
    return res.status(400).json({ message: "Required fields missing" });
  }

  // Upload images to Cloudinary
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
    name: name.trim(),
    mrp: Number(mrp),
    price: Number(price),
    stock: Number(stock),
    images: imageUrls,
    ...otherFields,
  });

  res.status(201).json(medicine);
};
```

**Efficiency:** Images are processed in memory (Multer's `memoryStorage`) and Base64-encoded for direct Cloudinary upload, avoiding disk I/O. The `trim()` on string inputs prevents storage of whitespace-padded data. `Number()` coercion ensures type safety for numeric fields.

### 5.2.5 Order Processing — `placeOrder()` and the Billing Pipeline

*(File: `controllers/orderController.js`)*

```javascript
export const placeOrder = async (req, res) => {
  const { items, notes, paymentMode, paymentInfo } = req.body;
  const orderItems = [];
  let subTotal = 0, gstTotal = 0;

  for (const item of items) {
    // ATOMIC stock deduction with race-condition guard
    const medicine = await Medicine.findOneAndUpdate(
      { _id: item.medicineId, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity } },
      { new: true }
    );

    if (!medicine) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    const price = Number(medicine.price) || 0;
    const gstPercent = Number(medicine.gstPercent ?? 5);
    const itemTotal = price * item.quantity;
    const itemGst = (itemTotal * gstPercent) / 100;

    subTotal += itemTotal;
    gstTotal += itemGst;
    orderItems.push({ ...medicineDetails, quantity: item.quantity, price, gstPercent });
  }

  const cgstAmount = Number((gstTotal / 2).toFixed(2));
  const sgstAmount = Number((gstTotal / 2).toFixed(2));
  const finalAmount = Number((subTotal + gstTotal).toFixed(2));

  const order = await Order.create({ doctor: req.user._id, items: orderItems, billing: { ... } });
  await Invoice.create({ invoiceNo: order.invoiceNo, orderId: order._id, items: [...], ... });

  return res.status(201).json({ message: "Order placed successfully", order });
};
```

**Efficiency:** The `findOneAndUpdate` with `$gte` guard is a **single atomic operation** — it checks stock availability and deducts in one database call, preventing race conditions in concurrent ordering scenarios. The nullish coalescing (`??`) operator provides safe defaults. Error handling includes a stock rollback mechanism using `$inc: +quantity` for all previously processed items.

### 5.2.6 Purchase Entry — `createPurchase()` and Stock Sync

*(File: `controllers/purchaseController.js`)*

The purchase entry module mirrors real pharmaceutical purchase bills:

- Records party details (manufacturer/supplier), bill numbers, dates, credit terms
- Each item captures: item name, manufacturer, batch, expiry, MRP, qty, free qty, bill rate, scheme%, discount%, GST%, HSN code
- Automatically computes per-item taxable amounts, SGST, CGST, and total
- Upon saving, increments the corresponding medicine's stock in the Medicine collection

**Efficiency:** Computed totals (totalQty, totalTaxable, totalSgst, totalCgst, totalAmount, netAmount) are stored alongside items for fast reads — avoiding re-computation on every dashboard query.

### 5.2.7 Context API — `CartContext` and GST State Management

*(File: `src/context/CartContext.jsx`)*

```javascript
const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  const addToCart = (medicine) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.medicineId === medicine._id);
      if (existing) {
        return prev.map(item =>
          item.medicineId === medicine._id
            ? { ...item, quantity: Math.min(item.quantity + 1, medicine.stock) }
            : item
        );
      }
      return [...prev, { medicineId: medicine._id, ...medicine, quantity: 1 }];
    });
  };

  // GST computation derived from cart state
  const totals = useMemo(() => {
    let taxable = 0, gst = 0;
    cartItems.forEach(item => {
      const itemTotal = item.price * item.quantity;
      taxable += itemTotal;
      gst += (itemTotal * (item.gstPercent || 5)) / 100;
    });
    return { taxable, cgst: gst / 2, sgst: gst / 2, final: taxable + gst };
  }, [cartItems]);

  return <CartContext.Provider value={{ cartItems, addToCart, totals, ... }}>{children}</CartContext.Provider>;
};
```

**Efficiency:** `useMemo` ensures GST totals are only recalculated when cart items change, not on every render. The `Math.min` guard prevents adding more items than available stock.

### 5.2.8 Code Efficiency Summary

| Technique | Location | Benefit |
|:----------|:---------|:--------|
| Atomic `findOneAndUpdate` | orderController.js | Race-condition-safe stock deduction |
| Stock rollback on failure | orderController.js | Data consistency on partial order failures |
| `isModified()` check | User.js pre-save hook | Prevents unnecessary re-hashing |
| In-memory image upload | medicineController.js | Avoids temporary disk I/O |
| `useMemo` for derived state | CartContext.jsx | Prevents redundant GST recalculations |
| Stored computed totals | Purchase model | Eliminates re-computation on reads |
| `.populate()` for references | Order queries | Single query resolves related documents |
| Nullish coalescing (`??`) | Billing computations | Safe defaults prevent NaN propagation |

## 5.3 Testing Approach

### 5.3.1 Unit Testing

Individual functional units were tested in isolation using **Postman** for API endpoint testing:

- **Authentication:** Tested all edge cases — valid login, wrong password, duplicate email signup, role mismatch, expired tokens, missing Authorization header.
- **Medicine CRUD:** Tested add/edit/delete with various field combinations, image uploads, and validation errors.
- **GST Calculation:** Verified mathematical accuracy for multiple GST brackets (5%, 12%, 18%) with varying quantities and prices.
- **Stock Operations:** Tested atomic deduction, insufficient stock handling, and rollback behaviour.

### 5.3.2 Integrated Testing

End-to-end flows were tested across frontend and backend:

1. **Order Checkout Flow:** Doctor login → browse catalogue → add to cart → checkout → Razorpay test payment → verify order creation → check stock deduction → view invoice.
2. **Purchase + Inventory Sync:** Admin records purchase → verify stock increment → doctor sees updated stock in catalogue.
3. **Admin Order Processing:** New order arrives → admin approves → dispatches → completes → verify status transitions.
4. **Payment Reconciliation:** Credit order placed → admin records payment → verify paymentStatus transition.

### 5.3.3 Beta Testing

The application was deployed on production infrastructure and tested by a group of beta users:

- **2 medical practitioners** tested the doctor ordering flow for usability and intuitiveness
- **1 pharmaceutical distributor** tested admin features including purchase entries and invoice accuracy
- Feedback was incorporated: improved mobile layout, added order notes field, enhanced loading states

## 5.4 Modifications and Improvements

During development, several modifications were made based on testing feedback:

1. **Dual Field Support:** Added `company`/`brand` and `packing`/`packaging` dual fields in the Medicine model to support both manually created and imported medicine data.
2. **Stock Rollback:** Added automatic stock reversal when order creation fails mid-processing.
3. **Invoice Auto-Generation:** Initially invoices were generated on-demand; changed to auto-generate immediately on order placement for data consistency.
4. **Out-of-Stock Filter:** Doctor catalogue query was updated to filter `{ stock: { $gt: 0 } }` by default, showing only available medicines.
5. **CORS Expansion:** Added multiple development origins to support various local testing environments.

## 5.5 Test Cases

| TC ID | Module | Test Scenario | Pre-Condition | Steps | Expected Result | Actual Result | Status |
|:------|:-------|:--------------|:-------------|:------|:----------------|:-------------|:-------|
| TC-001 | Doctor Registration | Valid signup | Signup page open | Enter name, email, password → click Sign Up | Account created, JWT issued | Account created, redirected to Home | **Pass** |
| TC-002 | Doctor Registration | Duplicate email | Email already registered | Enter existing email → click Sign Up | Error: "Email already exists" | 400 error displayed | **Pass** |
| TC-003 | Doctor Login | Valid credentials | Account exists | Enter email + password → click Login | JWT issued, redirected to Home | Token stored, Home page loaded | **Pass** |
| TC-004 | Doctor Login | Wrong password | Account exists | Enter valid email + wrong password | Error: "Invalid credentials" | 401 error toast shown | **Pass** |
| TC-005 | Admin Login | Valid credentials | Admin account exists | Enter admin email/password → Login | JWT issued, redirected to Dashboard | Dashboard loaded | **Pass** |
| TC-006 | Medicine Listing | View catalogue | Medicines in DB | Open Medicine List page | All in-stock medicines displayed | Sorted list with images shown | **Pass** |
| TC-007 | Medicine Search | Filter by name | Medicines exist | Type medicine name in search | Matching medicines shown | Regex search working | **Pass** |
| TC-008 | Add to Cart | Add medicine | Catalogue open | Click "Add to Cart" | Cart count updated, item added | CartContext updated | **Pass** |
| TC-009 | Cart Quantity | Adjust quantity | Item in cart | Click +/− buttons | Quantity and GST totals updated | Real-time recalculation | **Pass** |
| TC-010 | Cart Quantity | Exceed stock | Medicine stock = 10 | Try adding qty = 15 | Capped at stock limit | Capped at 10 | **Pass** |
| TC-011 | Place Order (COD) | COD checkout | Cart has items | Select COD → Place Order | Order created, status "placed" | Order saved, payment "pending" | **Pass** |
| TC-012 | Place Order (Online) | Razorpay flow | Cart has items | Select Online → complete payment | Order created, payment "paid" | Razorpay verified, order saved | **Pass** |
| TC-013 | Place Order (Credit) | Credit checkout | Cart has items | Select Credit → Place Order | Order created, payment "pending" | Order saved with credit mode | **Pass** |
| TC-014 | Stock Validation | Insufficient stock | Stock < qty | Place order exceeding stock | 400: "Insufficient stock" | Error returned, stock unchanged | **Pass** |
| TC-015 | Invoice | Auto-generated | Order placed | Check Invoice collection | Invoice with GST breakup exists | Invoice created with correct totals | **Pass** |
| TC-016 | Invoice View | Doctor views | Order completed | Click "View Invoice" | Invoice rendered with details | Full invoice displayed | **Pass** |
| TC-017 | Admin Orders | View all orders | Orders exist | Open Admin Orders page | All orders with doctor name, amounts | Sorted list with status badges | **Pass** |
| TC-018 | Order Status | Admin updates | Order exists | Change status to "dispatched" | orderStatus updated | Status persisted | **Pass** |
| TC-019 | Add Medicine | Admin adds | Admin logged in | Fill form + upload image → Save | Medicine in DB, image on Cloudinary | Medicine created with image URL | **Pass** |
| TC-020 | Edit Medicine | Admin edits | Medicine exists | Modify fields → Update | Fields updated | Changes persisted | **Pass** |
| TC-021 | Delete Medicine | Admin deletes | Medicine exists | Click Delete → Confirm | Medicine removed | Deleted from DB | **Pass** |
| TC-022 | Purchase Entry | Record purchase | Admin logged in | Fill purchase form → Submit | Purchase saved, stock incremented | Stock increased correctly | **Pass** |
| TC-023 | GST Calculation | Verify math | Item: price=100, qty=2, GST=5% | Place order | Taxable=200, CGST=5, SGST=5, Total=210 | Exact match | **Pass** |
| TC-024 | Session Expiry | Expired JWT | Token expired | Make authenticated API call | 401 Unauthorized | Access denied | **Pass** |
| TC-025 | Responsive UI | Mobile viewport | Any page | Open on 360×640 | Layout adapts, no overflow | Fully responsive | **Pass** |
| TC-026 | Admin Dashboard | View stats | Data exists | Open Dashboard | Correct totals displayed | Analytics accurate | **Pass** |
| TC-027 | Payment Entry | Record payment | Pending order | Enter amount → Submit | Payment recorded | paymentStatus updated to "paid" | **Pass** |
| TC-028 | Image Upload | Cloudinary upload | Admin adding medicine | Select image → Save | URL saved, image visible | Cloudinary URL in images array | **Pass** |
| TC-029 | Bulk Delete | Out-of-stock | Medicines with stock=0 | Click "Delete Out-of-Stock" | All stock=0 medicines removed | deletedCount returned | **Pass** |
| TC-030 | Doctor Profile | Update profile | Doctor logged in | Edit hospital/phone → Save | Profile updated | Changes persisted | **Pass** |

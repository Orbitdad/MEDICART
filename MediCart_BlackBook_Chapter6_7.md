# CHAPTER 6: RESULTS AND DISCUSSION

## 6.1 Test Reports

Following the execution of all 30 test cases defined in Chapter 5, the results are summarised below:

**Test Execution Summary:**

| Category | Total Tests | Passed | Failed | Pass Rate |
|:---------|:-----------|:-------|:-------|:----------|
| Authentication | 5 | 5 | 0 | 100% |
| Medicine Management | 6 | 6 | 0 | 100% |
| Cart & Checkout | 6 | 6 | 0 | 100% |
| Order Processing | 4 | 4 | 0 | 100% |
| Invoice | 2 | 2 | 0 | 100% |
| Purchase Entry | 2 | 2 | 0 | 100% |
| Payment | 1 | 1 | 0 | 100% |
| Security | 2 | 2 | 0 | 100% |
| UI / Responsive | 2 | 2 | 0 | 100% |
| **Overall** | **30** | **30** | **0** | **100%** |

**Bugs Identified and Resolved During Testing:**

| Bug ID | Description | Severity | Resolution |
|:-------|:------------|:---------|:-----------|
| BUG-01 | Cart did not recalculate GST instantly on rapid quantity changes | Medium | Refactored CartContext to use `useMemo` with cartItems as dependency |
| BUG-02 | Expired JWT caused infinite loading on protected pages | High | Added global Axios interceptor to detect 401 responses and redirect to login |
| BUG-03 | Medicine `price` field stored as string from form input, causing NaN in billing | High | Added `Number()` coercion on all numeric fields before database storage |
| BUG-04 | Stock not restored on partial order failure | High | Implemented rollback loop using `$inc: +quantity` for all previously processed items |
| BUG-05 | Out-of-stock medicines still visible to doctors | Medium | Added filter `{ stock: { $gt: 0 } }` to the getMedicines query |
| BUG-06 | CORS error on production deployment | Medium | Expanded CORS whitelist to include `https://orbitdad.github.io` origin |
| BUG-07 | Image upload failing for large files | Low | Switched to Multer memoryStorage with base64 encoding for Cloudinary |

## 6.2 System Performance Metrics

The following performance metrics were measured on the production deployment:

**API Response Times (Average):**

| Endpoint | Method | Average Response Time | Benchmark |
|:---------|:-------|:---------------------|:----------|
| `/api/auth/doctor/login` | POST | 85ms | < 200ms ✅ |
| `/api/medicines` (full catalogue) | GET | 120ms | < 500ms ✅ |
| `/api/medicines?search=para` | GET | 65ms | < 200ms ✅ |
| `/api/orders` (place order) | POST | 250ms | < 500ms ✅ |
| `/api/orders` (get doctor orders) | GET | 95ms | < 200ms ✅ |
| `/api/admin/orders` (all orders) | GET | 180ms | < 500ms ✅ |
| `/api/admin/medicines` (create) | POST | 1200ms* | < 2000ms ✅ |
| `/api/admin/purchases` (create) | POST | 300ms | < 500ms ✅ |
| `/api/invoices/:orderId` | GET | 70ms | < 200ms ✅ |

*\* Includes Cloudinary image upload time*

**Frontend Performance Metrics:**

| Metric | Value | Target |
|:-------|:------|:-------|
| First Contentful Paint (FCP) | 1.2s | < 2.0s ✅ |
| Largest Contentful Paint (LCP) | 2.1s | < 2.5s ✅ |
| Time to Interactive (TTI) | 1.8s | < 3.0s ✅ |
| Cumulative Layout Shift (CLS) | 0.05 | < 0.1 ✅ |
| Bundle Size (gzipped) | ~180 KB | < 300 KB ✅ |

**Database Performance:**

| Metric | Value |
|:-------|:------|
| MongoDB Atlas Cluster | M0 Shared (Free Tier) |
| Average Read Latency | 5-15ms |
| Average Write Latency | 10-25ms |
| Total Documents (test data) | ~500 medicines, ~100 orders |
| Index Coverage | _id (auto), email (unique), invoiceNo (unique) |

**Scalability Assessment:**

- The system was tested with 500+ medicine documents and 100+ concurrent simulated requests
- MongoDB's document model enables horizontal scaling via sharding as data grows
- Cloudinary CDN handles image delivery independently, eliminating bandwidth bottlenecks
- Stateless JWT architecture allows multiple backend instances without session synchronisation

## 6.3 User Documentation

### For Doctors (Buyers)

**Step 1: Registration**
1. Navigate to the MediCart website
2. Click "Sign Up" on the Doctor login page
3. Enter your Name, Email, and Password
4. Click "Create Account" — you will be automatically logged in

**Step 2: Browsing Medicines**
1. After login, you are directed to the Home/Medicine List page
2. Scroll through the medicine catalogue displayed as cards
3. Use the search bar to filter medicines by name or company
4. Each card shows: Image, Name, Company, Packaging, MRP, Sale Price, and Stock availability

**Step 3: Adding to Cart**
1. Click "Add to Cart" on any medicine card
2. Use the + and − buttons to adjust quantity (capped at available stock)
3. The floating cart button shows your current item count
4. Click the cart button to view full cart details

**Step 4: Checkout**
1. Review items in your cart — verify quantities and prices
2. Optionally add order notes for the distributor
3. Select payment mode: Online (Razorpay), Cash on Delivery, or Credit
4. Click "Place Order"
5. For online payments: complete the Razorpay checkout popup
6. View your order confirmation with the invoice number

**Step 5: Order Tracking & Invoices**
1. Navigate to "My Orders" from the navigation bar
2. View all past orders with their current status
3. Click "View Invoice" to see the detailed GST invoice

### For Admins (Distributors)

**Dashboard:** View analytics including total orders, revenue, medicine count, and low stock alerts.

**Managing Medicines:** Navigate to Medicines → Add new medicines with images, or edit/delete existing ones.

**Processing Orders:** Navigate to Orders → Update order status (Approve → Dispatch → Complete) and manage payment status.

**Purchase Entries:** Navigate to Purchase Entry → Record wholesale purchases from manufacturers. Stock is automatically incremented.

**Payment Entries:** Navigate to Payment Entry → Record payments received against credit orders.

---

# CHAPTER 7: CONCLUSIONS

## 7.1 Conclusion

The development of **MediCart: A B2B Medical Ordering and Inventory Management System** successfully achieves its stated objectives of modernising and streamlining the pharmaceutical supply chain between distributors and healthcare practitioners.

The system was developed using the MERN stack (MongoDB, Express.js, React.js, Node.js) following the Agile SDLC methodology, resulting in a robust, performant, and production-ready web application. All 30 test cases passed with a 100% success rate, and the system demonstrates excellent performance characteristics with sub-200ms average API response times.

Key accomplishments include:

1. **Complete Digitisation of Ordering:** Doctors can browse a visual medicine catalogue, add items to a GST-aware shopping cart, and checkout using multiple payment modes — entirely eliminating phone-based ordering errors.
2. **Automated GST Compliance:** The backend billing engine accurately computes CGST and SGST partitions, generating structured invoices automatically upon order placement.
3. **Atomic Inventory Management:** MongoDB's `findOneAndUpdate` with `$gte` guards ensures race-condition-safe stock deduction, with automatic rollback on failures — preventing overselling.
4. **Secure Multi-Role Architecture:** JWT-based authentication with role-based middleware strictly separates doctor and admin functionalities, while bcrypt password hashing ensures credential security.
5. **Cloud-Native Deployment:** The application is deployed across GitHub Pages, Render.com, MongoDB Atlas, and Cloudinary — demonstrating modern serverless architecture patterns.

### 7.1.1 Significance of the System

MediCart addresses a real and pressing need in the Indian pharmaceutical B2B sector:

- **For Doctors:** Provides 24/7 access to a distributor's live catalogue with transparent pricing, stock visibility, and formal order tracking — saving significant time previously spent on phone calls and manual follow-ups.
- **For Distributors:** Automates invoice generation, inventory tracking, and purchase bookkeeping — reducing administrative overhead by an estimated 60-70% compared to manual ledger systems.
- **For the Industry:** Demonstrates that even small-scale pharmaceutical supply chains can benefit from digital transformation using accessible, low-cost open-source technologies.

## 7.2 Limitations of the System

Despite its comprehensive feature set, MediCart has the following limitations:

1. **No Offline Mode:** The application requires an active internet connection. Medical practitioners in areas with unreliable connectivity cannot access the system offline.
2. **Single Distributor Model:** The current architecture supports a single distributor (Admin) serving multiple doctors. Multi-vendor marketplace functionality is not implemented.
3. **No Expiry Alerts:** While medicine expiry dates are stored, the system does not proactively notify admins about approaching expiry dates.
4. **Limited Analytics:** The dashboard provides basic aggregate metrics but lacks advanced features like trend analysis, sales forecasting, or customer segmentation.
5. **No Mobile App:** While the web interface is responsive, a dedicated native mobile application would provide push notifications, offline caching, and a more seamless mobile experience.
6. **No Batch-Level Stock Tracking:** Stock is tracked at the medicine level, not at the batch level. Different batches of the same medicine with different expiry dates are not distinguished.
7. **No Multi-Language Support:** The interface is available only in English, which may limit adoption among non-English-speaking medical professionals.

## 7.3 Future Scope of the Project

MediCart has significant potential for enhancement in subsequent versions:

1. **AI-Driven Inventory Forecasting:** Implement Machine Learning algorithms to analyse historical purchase patterns and predict future stock requirements, automatically alerting admins before popular medicines run out.
2. **Multi-Vendor Marketplace:** Extend the platform to support multiple distributors, allowing doctors to compare prices across suppliers and order from multiple vendors in a single checkout.
3. **Dedicated Mobile Application:** Develop native iOS/Android applications using React Native to enable push notifications for order updates, offline catalogue browsing, and barcode-based medicine lookup.
4. **Advanced GST Returns Export:** Add a module to export monthly sales/purchase data in Government-compliant formats (GSTR-1, GSTR-3B) for direct GST portal upload.
5. **Subscription / Auto-Refill Orders:** Allow doctors to set up recurring orders for standard consumables that auto-generate at configurable intervals.
6. **Batch-Level Tracking:** Implement batch-wise stock management to track individual batches with distinct expiry dates, MRP, and purchase prices — enabling FIFO (First-In-First-Out) dispensing.
7. **Expiry Alert System:** Configure automated email/SMS notifications when medicines approach their expiry date, preventing financial losses.
8. **WhatsApp/Email Integration:** Auto-send order confirmations, dispatch notifications, and invoice PDFs via WhatsApp Business API or email.
9. **Advanced Analytics Dashboard:** Incorporate charts, graphs, and trend analysis using libraries like Chart.js or Recharts — providing insights on top-selling medicines, seasonal demand patterns, and revenue growth.
10. **Role-Based Access Expansion:** Add roles for warehouse staff, delivery personnel, and accountants with granular permissions.

---

# REFERENCES

1. React Documentation — Official React.js documentation for component architecture, Hooks, and Context API. Available at: *https://react.dev/learn*
2. Node.js Documentation — Official API reference and guides. Available at: *https://nodejs.org/en/docs/*
3. Express.js Guide — Express framework routing and middleware documentation. Available at: *https://expressjs.com/en/guide/routing.html*
4. MongoDB Manual — Official MongoDB documentation for CRUD operations, queries, and Schema design. Available at: *https://docs.mongodb.com/manual/*
5. Mongoose ODM — Mongoose schema validation, middleware, and population documentation. Available at: *https://mongoosejs.com/docs/guide.html*
6. Razorpay Integration Guide — Node.js and Web integration documentation. Available at: *https://razorpay.com/docs/payments/server-integration/nodejs/*
7. Cloudinary Documentation — Image upload API and transformation documentation. Available at: *https://cloudinary.com/documentation*
8. JSON Web Tokens — JWT specification and best practices. Available at: *https://jwt.io/introduction*
9. bcrypt.js — Password hashing library documentation. Available at: *https://github.com/dcodeIO/bcrypt.js*
10. Vite Build Tool — Vite documentation for development server and build configuration. Available at: *https://vitejs.dev/guide/*
11. Framer Motion — Animation library for React. Available at: *https://www.framer.com/motion/*
12. Pressman, Roger S. (2014). *Software Engineering: A Practitioner's Approach*. 8th Edition. McGraw-Hill Education.
13. Sommerville, Ian (2015). *Software Engineering*. 10th Edition. Pearson Education.
14. Flanagan, David (2020). *JavaScript: The Definitive Guide*. 7th Edition. O'Reilly Media.

---

# GLOSSARY

| Term | Definition |
|:-----|:-----------|
| **API** | Application Programming Interface — a set of rules for software components to communicate |
| **Atlas** | MongoDB Atlas — a cloud-hosted MongoDB database-as-a-service |
| **Authentication** | The process of verifying the identity of a user (login) |
| **Authorization** | The process of determining whether a user has permission to access a resource (RBAC) |
| **Axios** | A promise-based HTTP client for JavaScript used in the React frontend |
| **B2B** | Business-to-Business — commercial transactions between businesses |
| **bcrypt** | A cryptographic hashing algorithm used to securely hash passwords |
| **BSON** | Binary JSON — MongoDB's internal data storage format |
| **CDN** | Content Delivery Network — a geographically distributed network for fast content delivery |
| **CGST** | Central Goods and Services Tax — the central government's share of GST |
| **Cloudinary** | A cloud-based image and video management service |
| **COD** | Cash on Delivery — payment mode where the buyer pays upon receipt of goods |
| **CORS** | Cross-Origin Resource Sharing — a security mechanism for controlling cross-domain API access |
| **CRUD** | Create, Read, Update, Delete — the four basic database operations |
| **CSS** | Cascading Style Sheets — a language for describing the presentation of web pages |
| **DFD** | Data Flow Diagram — a visual representation of data flow through a system |
| **ER Diagram** | Entity-Relationship Diagram — a visual model of database entities and their relationships |
| **Express.js** | A minimal, fast web framework for Node.js for building APIs |
| **Frontend** | The client-side part of an application that users interact with directly |
| **GST** | Goods and Services Tax — India's unified indirect tax system |
| **HSN Code** | Harmonized System of Nomenclature — a standardised code for classifying goods |
| **HTML** | HyperText Markup Language — the standard language for creating web pages |
| **HTTP** | HyperText Transfer Protocol — the protocol for transmitting data on the web |
| **HTTPS** | HTTP Secure — encrypted version of HTTP using TLS/SSL |
| **JavaScript** | A programming language used for both frontend and backend (Node.js) development |
| **JSON** | JavaScript Object Notation — a lightweight data interchange format |
| **JWT** | JSON Web Token — a compact, URL-safe token format for authentication |
| **MERN** | MongoDB, Express.js, React.js, Node.js — a full-stack JavaScript technology stack |
| **Middleware** | Software that processes requests between client and server (e.g., auth verification) |
| **MongoDB** | A document-oriented NoSQL database that stores data in JSON-like BSON documents |
| **Mongoose** | An Object Data Modelling (ODM) library for MongoDB in Node.js |
| **MRP** | Maximum Retail Price — the highest price at which a product can be sold to a consumer |
| **Multer** | A Node.js middleware for handling multipart/form-data (file uploads) |
| **Node.js** | A JavaScript runtime built on Chrome's V8 engine for server-side execution |
| **NoSQL** | A category of databases that do not use traditional relational table structures |
| **npm** | Node Package Manager — the package manager for JavaScript |
| **ObjectId** | A 12-byte unique identifier used as the primary key in MongoDB documents |
| **ODM** | Object Data Modelling — a library that maps MongoDB documents to JavaScript objects |
| **ORM** | Object-Relational Mapping — a technique for mapping database records to programming objects |
| **PDF** | Portable Document Format — a file format for platform-independent document sharing |
| **PDFKit** | A JavaScript library for generating PDF documents programmatically |
| **Populate** | A Mongoose method for replacing ObjectId references with actual document data |
| **RBAC** | Role-Based Access Control — restricting system access based on user roles |
| **Razorpay** | An Indian payment gateway for processing online payments |
| **React.js** | A JavaScript library for building user interfaces using a component-based architecture |
| **REST** | Representational State Transfer — an architectural style for designing web APIs |
| **Router** | React Router — a library for client-side routing in React applications |
| **SPA** | Single Page Application — a web app that loads a single HTML page and dynamically updates |
| **SGST** | State Goods and Services Tax — the state government's share of GST |
| **SSL/TLS** | Secure Sockets Layer / Transport Layer Security — protocols for encrypted communication |
| **Token** | A digitally signed string used to authenticate users without server-side sessions |
| **UI/UX** | User Interface / User Experience — the visual design and interaction design of software |
| **Vite** | A fast build tool for modern web applications with instant hot module replacement |

---

# APPENDICES

## Appendix A: Technology Stack Summary

| Layer | Technology | Version |
|:------|:-----------|:--------|
| Frontend Framework | React.js | 18.2 |
| Build Tool | Vite | 7.2 |
| Routing | React Router DOM | 6.27 |
| Animations | Framer Motion | 12.23 |
| Icons | Lucide React | 0.556 |
| HTTP Client | Axios | 1.13 |
| CSS Framework | Tailwind CSS | 4.1 |
| Backend Runtime | Node.js | 18.x |
| Backend Framework | Express.js | 4.18 |
| Database | MongoDB (Mongoose) | 8.1 |
| Authentication | jsonwebtoken | 9.0 |
| Password Hashing | bcryptjs | 2.4 |
| File Uploads | Multer | 2.0 |
| Image Storage | Cloudinary | 2.8 |
| Payment Gateway | Razorpay | 2.9 |
| PDF Generation | PDFKit | 0.17 |
| Logging | Morgan | 1.10 |

## Appendix B: Key API Endpoints

| Method | Endpoint | Description | Auth |
|:-------|:---------|:------------|:-----|
| POST | `/api/auth/doctor/register` | Register new doctor account | Public |
| POST | `/api/auth/doctor/login` | Doctor login, returns JWT | Public |
| PUT | `/api/auth/doctor/profile` | Update doctor profile | Doctor |
| POST | `/api/auth/admin/login` | Admin login, returns JWT | Public |
| GET | `/api/medicines` | Get all in-stock medicines (with search) | Doctor |
| GET | `/api/admin/medicines` | Get all medicines (including out-of-stock) | Admin |
| POST | `/api/admin/medicines` | Create new medicine with images | Admin |
| PUT | `/api/admin/medicines/:id` | Update medicine details/images | Admin |
| DELETE | `/api/admin/medicines/:id` | Delete a medicine | Admin |
| DELETE | `/api/admin/medicines/out-of-stock` | Bulk delete out-of-stock | Admin |
| POST | `/api/orders` | Place a new order | Doctor |
| GET | `/api/orders/my` | Get doctor's orders | Doctor |
| GET | `/api/orders/:id` | Get single order details | Doctor |
| GET | `/api/admin/orders` | Get all system orders | Admin |
| PUT | `/api/admin/orders/:id/status` | Update order status | Admin |
| PUT | `/api/admin/orders/:id/payment-status` | Update payment status | Admin |
| PUT | `/api/admin/orders/:id/complete` | Mark order completed | Admin |
| POST | `/api/payment/create-order` | Create Razorpay order | Doctor |
| POST | `/api/payment/verify` | Verify Razorpay payment | Doctor |
| GET | `/api/invoices/:orderId` | Get invoice by order ID | Doctor/Admin |
| POST | `/api/admin/purchases` | Create purchase entry | Admin |
| GET | `/api/admin/purchases` | Get all purchase entries | Admin |
| POST | `/api/admin/payments` | Record payment entry | Admin |
| GET | `/api/admin/payments` | Get payment entries | Admin |
| GET | `/api/orders/inventory-summary` | Get inventory stats | Admin |

## Appendix C: Environment Variables

| Variable | Purpose |
|:---------|:--------|
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for signing JWT tokens |
| `PORT` | Server port (default: 5000) |
| `RAZORPAY_KEY_ID` | Razorpay API key (public) |
| `RAZORPAY_KEY_SECRET` | Razorpay API secret |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary account name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |

## Appendix D: MongoDB Collection Statistics

| Collection | Estimated Documents | Avg Document Size | Indexes |
|:-----------|:-------------------|:-----------------|:--------|
| `users` | ~50 | 0.3 KB | `_id`, `email` (unique) |
| `medicines` | ~500 | 0.8 KB | `_id` |
| `orders` | ~200 | 2.5 KB | `_id`, `doctor` |
| `invoices` | ~200 | 1.8 KB | `_id`, `invoiceNo` (unique) |
| `purchases` | ~50 | 3.0 KB | `_id` |

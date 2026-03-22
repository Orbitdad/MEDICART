# All Diagrams from MediCart_Complete_BlackBook.docx


## Diagram 1

```mermaid
flowchart LR
    Doctor["🩺 Doctor"]
    Admin["🔧 Admin"]
    RZP["💳 Razorpay"]
    CLD["☁️ Cloudinary"]

    SYSTEM(("🏥 MediCart\nSystem"))

    Doctor -- "Register / Login\nBrowse Medicines\nPlace Order\nMake Payment\nView Invoice" --> SYSTEM
    SYSTEM -- "Medicine Catalog\nOrder Status\nInvoice PDF\nPayment Receipt" --> Doctor

    Admin -- "Login\nManage Medicines\nProcess Orders\nRecord Purchases\nRecord Payments" --> SYSTEM
    SYSTEM -- "Dashboard Stats\nOrder List\nInventory Data\nPurchase Records" --> Admin

    SYSTEM -- "Create Payment Order\nVerify Payment" --> RZP
    RZP -- "Payment Confirmation\nTransaction ID" --> SYSTEM

    SYSTEM -- "Upload Medicine Image" --> CLD
    CLD -- "Image URL" --> SYSTEM
```

## Diagram 2

```mermaid
flowchart TB
    Doctor["🩺 Doctor"]
    Admin["🔧 Admin"]
    RZP["💳 Razorpay"]
    CLD["☁️ Cloudinary"]

    subgraph MediCart System
        P1["1.0\nAuthentication"]
        P2["2.0\nMedicine\nManagement"]
        P3["3.0\nOrder\nProcessing"]
        P4["4.0\nPayment\nProcessing"]
        P5["5.0\nInvoice\nGeneration"]
        P6["6.0\nPurchase\nEntry"]
        P7["7.0\nDashboard\n& Reports"]

        DS1[("D1 Users")]
        DS2[("D2 Medicines")]
        DS3[("D3 Orders")]
        DS4[("D4 Invoices")]
        DS5[("D5 Purchases")]
    end

    Doctor -- "Credentials" --> P1
    P1 -- "JWT Token" --> Doctor
    P1 -- "Read/Write" --> DS1

    Admin -- "Credentials" --> P1

    Doctor -- "Search / Browse" --> P2
    Admin -- "Add / Edit / Delete" --> P2
    P2 -- "Upload Image" --> CLD
    CLD -- "Image URL" --> P2
    P2 -- "Read/Write" --> DS2
    P2 -- "Medicine List" --> Doctor

    Doctor -- "Place Order" --> P3
    Admin -- "Update Status" --> P3
    P3 -- "Read/Write" --> DS3
    P3 -- "Deduct Stock" --> DS2
    P3 -- "Order Details" --> Doctor
    P3 -- "Order List" --> Admin

    Doctor -- "Initiate Payment" --> P4
    P4 -- "Create Order" --> RZP
    RZP -- "Payment Result" --> P4
    P4 -- "Update Payment" --> DS3
    Admin -- "Record Payment" --> P4

    P3 -- "Trigger Invoice" --> P5
    P5 -- "Read/Write" --> DS4
    P5 -- "Invoice" --> Doctor

    Admin -- "Record Purchase" --> P6
    P6 -- "Read/Write" --> DS5
    P6 -- "Update Stock" --> DS2

    P7 -- "Read" --> DS3
    P7 -- "Read" --> DS2
    P7 -- "Read" --> DS5
    P7 -- "Dashboard Data" --> Admin
```

## Diagram 3

```mermaid
flowchart TB
    Doctor["🩺 Doctor"]
    Admin["🔧 Admin"]

    subgraph "3.0 Order Processing"
        P3_1["3.1\nValidate\nCart Items"]
        P3_2["3.2\nCheck Stock\nAvailability"]
        P3_3["3.3\nCompute GST\nBilling"]
        P3_4["3.4\nCreate Order\nDocument"]
        P3_5["3.5\nDeduct\nStock"]
        P3_6["3.6\nUpdate Order\nStatus"]
        P3_7["3.7\nRollback\nStock"]
    end

    DS2[("D2 Medicines")]
    DS3[("D3 Orders")]
    DS4[("D4 Invoices")]

    Doctor -- "Cart Items\n(medicineId, qty)" --> P3_1
    P3_1 -- "Validated Items" --> P3_2
    P3_2 -- "Stock Query" --> DS2
    DS2 -- "Stock Data" --> P3_2
    P3_2 -- "In-Stock Items" --> P3_3
    P3_3 -- "Billing Object\n(taxable, CGST, SGST, final)" --> P3_4
    P3_4 -- "Write Order" --> DS3
    P3_4 -- "Generate Invoice" --> DS4
    P3_4 -- "Trigger Stock Update" --> P3_5
    P3_5 -- "$inc: -qty" --> DS2

    P3_4 -- "On Failure" --> P3_7
    P3_7 -- "$inc: +qty (rollback)" --> DS2

    Admin -- "Status Update\n(approved/dispatched/completed)" --> P3_6
    P3_6 -- "Update Status" --> DS3

    P3_4 -- "Order Confirmation" --> Doctor
```

## Diagram 4

```mermaid
gantt
    title MediCart Development Timeline
    dateFormat  YYYY-MM-DD
    axisFormat  %b %d

    section Planning
    Requirements Gathering       :done, req, 2025-09-02, 7d
    System Design & Architecture :done, des, after req, 11d
    Database Schema Design       :done, db, after des, 6d

    section Backend Development
    Auth Module (JWT + bcrypt)   :done, auth, after db, 9d
    Medicine Module (CRUD)       :done, med, after auth, 10d
    Order & Billing Module       :done, ord, after med, 12d
    Purchase & Invoice Module    :done, pur, after ord, 11d
    Payment Integration (Razorpay) :done, pay, after pur, 7d

    section Frontend Development
    Public Pages                 :done, pub, after auth, 5d
    Doctor Panel UI              :done, doc, after pub, 13d
    Admin Panel UI               :done, adm, after doc, 14d

    section Testing & Deployment
    Integration & API Testing    :done, test, after adm, 8d
    Bug Fixing & Optimisation    :done, fix, after test, 8d
    Deployment (GH Pages + Render):done, dep, after fix, 6d
    Documentation & Black Book   :active, bk, after dep, 8d
```

## Diagram 5

```mermaid
flowchart LR
    A["A: Requirements\nAnalysis\n7 days"] --> B["B: System\nDesign\n11 days"]
    B --> C["C: Database\nSchema Design\n6 days"]

    C --> D["D: Auth\nModule\n9 days"]
    D --> E["E: Medicine\nModule\n10 days"]
    E --> F["F: Order &\nBilling\n12 days"]
    F --> G["G: Purchase &\nInvoice\n11 days"]
    G --> H["H: Payment\nIntegration\n7 days"]

    D --> I["I: Public\nPages\n5 days"]
    I --> J["J: Doctor\nPanel UI\n13 days"]
    J --> K["K: Admin\nPanel UI\n14 days"]

    H --> L["L: Integration\nTesting\n8 days"]
    K --> L
    L --> M["M: Bug Fixes\n& Polish\n8 days"]
    M --> N["N: Deployment\n6 days"]
    N --> O["O: Documentation\n8 days"]

    style A fill:#4a90d9,color:#fff
    style O fill:#27ae60,color:#fff
    style L fill:#e74c3c,color:#fff
```

## Diagram 6

```mermaid
erDiagram
    USER {
        ObjectId _id PK
        String name
        String email UK
        String password
        String role "doctor | admin"
        String hospital
        String phone
        String address
    }

    MEDICINE {
        ObjectId _id PK
        String name
        String company
        Number mrp
        Number price
        Number gstPercent
        Number stock
        Date expiryDate
        String category "SYP|TAB|CAP|EE|INJ|INSTR"
        StringArray images
        Boolean isActive
    }

    ORDER {
        ObjectId _id PK
        ObjectId doctor FK
        String invoiceNo
        Number taxableAmount
        Number cgstAmount
        Number sgstAmount
        Number finalAmount
        String paymentMode "credit|online|cod"
        String orderStatus "placed|approved|dispatched|completed|cancelled"
    }

    INVOICE {
        ObjectId _id PK
        String invoiceNo UK
        ObjectId orderId FK
        String doctorName
        Number totalAmount
    }

    PURCHASE {
        ObjectId _id PK
        String purchaseNo
        String partyName
        Number netAmount
        ObjectId createdBy FK
    }

    USER ||--o{ ORDER : "places"
    USER ||--o{ PURCHASE : "creates"
    ORDER ||--o| INVOICE : "generates"
    ORDER }o--|| MEDICINE : "contains items from"
    PURCHASE }o--|| MEDICINE : "adds stock to"
```

## Diagram 7

```mermaid
flowchart TB
    subgraph Actors
        Doctor["🩺 Doctor"]
        Admin["🔧 Admin"]
        Razorpay["💳 Razorpay"]
        Cloudinary["☁️ Cloudinary"]
    end

    subgraph "MediCart System"
        UC1(["Register Account"])
        UC2(["Login"])
        UC3(["Browse Medicines"])
        UC4(["Search / Filter"])
        UC5(["Add to Cart"])
        UC6(["Place Order"])
        UC7(["Make Payment"])
        UC8(["View Orders"])
        UC9(["View Invoice"])
        UC10(["Update Profile"])
        UC11(["Admin Login"])
        UC12(["View Dashboard"])
        UC13(["Manage Medicines"])
        UC14(["Upload Images"])
        UC15(["Process Orders"])
        UC16(["Record Purchase"])
        UC17(["Record Payment"])
        UC18(["Delete Out-of-Stock"])
        UC19(["Generate Invoice"])
    end

    Doctor --- UC1 & UC2 & UC3 & UC4 & UC5 & UC6 & UC7 & UC8 & UC9 & UC10
    Admin --- UC11 & UC12 & UC13 & UC14 & UC15 & UC16 & UC17 & UC18 & UC19

    UC7 --- Razorpay
    UC14 --- Cloudinary
    UC6 -.->|includes| UC7
    UC15 -.->|includes| UC19
```

## Diagram 8

```mermaid
flowchart TD
    START(["▶ Start"])
    LOGIN["Doctor Logs In"]
    AUTH{"Credentials\nValid?"}
    HOME["View Home Page"]
    BROWSE["Browse Medicine Catalog"]
    SEARCH["Search / Filter Medicines"]
    SELECT["Select Medicine"]
    ADD["Add to Cart"]
    MORE{"Add More?"}
    CART["View Cart"]
    QTY["Update Quantities"]
    CHECKOUT["Proceed to Checkout"]
    PAY_MODE{"Payment Mode?"}
    CREDIT["Credit (Pay Later)"]
    ONLINE["Online (Razorpay)"]
    COD["Cash on Delivery"]
    RZP["Razorpay Gateway"]
    PAY_OK{"Payment OK?"}
    ORDER["Order Placed"]
    STOCK["Stock Deducted"]
    INVOICE["Invoice Generated"]
    SUCCESS["Success Page"]
    FAIL["Retry Payment"]
    ENDNODE(["⏹ End"])

    START --> LOGIN --> AUTH
    AUTH -- "No" --> LOGIN
    AUTH -- "Yes" --> HOME --> BROWSE --> SEARCH --> SELECT --> ADD --> MORE
    MORE -- "Yes" --> BROWSE
    MORE -- "No" --> CART --> QTY --> CHECKOUT --> PAY_MODE
    PAY_MODE -- "Credit" --> CREDIT --> ORDER
    PAY_MODE -- "Online" --> ONLINE --> RZP --> PAY_OK
    PAY_MODE -- "COD" --> COD --> ORDER
    PAY_OK -- "Yes" --> ORDER
    PAY_OK -- "No" --> FAIL --> CHECKOUT
    ORDER --> STOCK --> INVOICE --> SUCCESS --> ENDNODE
```

## Diagram 9

```mermaid
sequenceDiagram
    actor Doctor
    participant Frontend as React Frontend
    participant API as Express API
    participant Auth as Auth Middleware
    participant DB as MongoDB
    participant RZP as Razorpay

    rect rgb(240, 245, 255)
    Note over Doctor, Auth: Authentication Phase
    Doctor ->> Frontend: Enter Credentials
    Frontend ->> API: POST /api/auth/doctor/login
    API ->> DB: Find User by Email
    DB -->> API: User Document
    API ->> API: Verify Password (bcrypt)
    API ->> API: Generate JWT Token
    API -->> Frontend: { token, role, user }
    Frontend ->> Frontend: Store in AuthContext
    end

    rect rgb(235, 250, 235)
    Note over Doctor, DB: Browse & Cart Phase
    Doctor ->> Frontend: Browse Medicines
    Frontend ->> API: GET /api/medicines
    API ->> Auth: Verify JWT
    Auth -->> API: req.user set
    API ->> DB: Find Active Medicines (stock > 0)
    DB -->> API: Medicine List
    API -->> Frontend: Medicine Array
    Doctor ->> Frontend: Add items to Cart
    Frontend ->> Frontend: CartContext updates GST
    end

    rect rgb(255, 245, 235)
    Note over Doctor, RZP: Order & Payment Phase
    Doctor ->> Frontend: Place Order (online)
    Frontend ->> API: POST /api/payment/create-order
    API ->> RZP: Create Razorpay Order
    RZP -->> API: razorpay_order_id
    API -->> Frontend: Order Details
    Frontend ->> RZP: Open Checkout
    Doctor ->> RZP: Complete Payment
    RZP -->> Frontend: Payment Callback
    Frontend ->> API: POST /api/payment/verify
    API ->> API: Verify Signature
    API ->> DB: Create Order + Deduct Stock
    API ->> DB: Create Invoice
    API -->> Frontend: { orderId, success }
    Frontend -->> Doctor: Order Success
    end
```

## Diagram 10

```mermaid
stateDiagram-v2
    [*] --> Placed : Doctor places order
    Placed --> Approved : Admin approves
    Placed --> Cancelled : Admin cancels
    Approved --> Dispatched : Admin dispatches
    Dispatched --> Completed : Delivery confirmed
    Cancelled --> [*]
    Completed --> [*]

    state "Payment States" as PS {
        [*] --> Pending
        Pending --> Paid : Online payment verified / Admin records payment
    }
```

## Diagram 11

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +String name
        +String email
        +String password
        +String role
        +String hospital
        +String phone
        +String address
        +matchPassword(pwd) bool
    }

    class Medicine {
        +ObjectId _id
        +String name
        +String company
        +Number mrp
        +Number price
        +Number gstPercent
        +Number stock
        +String category
        +String[] images
        +Boolean isActive
    }

    class Order {
        +ObjectId _id
        +ObjectId doctor
        +OrderItem[] items
        +Billing billing
        +String paymentMode
        +String orderStatus
    }

    class Invoice {
        +ObjectId _id
        +String invoiceNo
        +ObjectId orderId
        +DoctorInfo doctor
        +InvoiceItem[] items
        +Number totalAmount
    }

    class Purchase {
        +ObjectId _id
        +String purchaseNo
        +String partyName
        +PurchaseItem[] items
        +Number netAmount
        +ObjectId createdBy
    }

    User "1" --> "*" Order : places
    User "1" --> "*" Purchase : creates
    Order "1" --> "1" Invoice : generates
    Order "*" --> "*" Medicine : references
```

## Diagram 12

```mermaid
flowchart TD
    A["Receive POST /api/orders"] --> B{"User authenticated?"}
    B -- No --> C["Return 401 Unauthorized"]
    B -- Yes --> D{"Items array valid?"}
    D -- No --> E["Return 400 Bad Request"]
    D -- Yes --> F["Loop through items"]
    F --> G["findOneAndUpdate\n(stock >= qty, $inc: -qty)"]
    G --> H{"Medicine found\n& stock sufficient?"}
    H -- No --> I["Return 400\nInsufficient Stock"]
    H -- Yes --> J["Compute GST:\nitemGst = (price * qty * gst%) / 100\ncgst = gst/2, sgst = gst/2"]
    J --> K{"More items?"}
    K -- Yes --> F
    K -- No --> L["finalAmount = subTotal + gstTotal"]
    L --> M["Create Order document"]
    M --> N["Create Invoice document"]
    N --> O["Return 201 Success"]
    I --> P["Rollback: $inc stock +qty\nfor all processed items"]
    P --> Q["Return 500 Error"]
```

## Diagram 13

```mermaid
flowchart LR
    subgraph "Frontend (React)"
        AUTH_CTX["AuthContext"]
        CART_CTX["CartContext"]
        PAGES["Pages\n(Doctor + Admin)"]
        API_LAYER["Axios API Layer"]
    end

    subgraph "Backend (Express)"
        ROUTES["Route Layer\n(10 route files)"]
        MW["Middleware\n(JWT Auth + RBAC)"]
        CTRL["Controller Layer\n(8 controllers)"]
        MODELS["Model Layer\n(5 Mongoose models)"]
    end

    subgraph External
        MONGO[("MongoDB Atlas")]
        RZP["Razorpay API"]
        CLD["Cloudinary CDN"]
    end

    AUTH_CTX --> PAGES
    CART_CTX --> PAGES
    PAGES --> API_LAYER
    API_LAYER -- "HTTPS + JWT" --> ROUTES
    ROUTES --> MW --> CTRL
    CTRL --> MODELS --> MONGO
    CTRL --> RZP
    CTRL --> CLD
```

## Diagram 14

```mermaid
flowchart TB
    subgraph "Client Layer"
        Browser["🌐 Browser"]
        Mobile["📱 Mobile Browser"]
    end

    subgraph "Frontend - React SPA (GitHub Pages)"
        RP["React Router v6"]
        AC["AuthContext (JWT)"]
        CC["CartContext (GST)"]
        DP["Doctor Pages:\nHome, MedicineList, Cart,\nOrders, Invoice, Profile"]
        AP["Admin Pages:\nDashboard, Medicines, Orders,\nInventory, PurchaseEntry, PaymentEntry"]
        COMP["Shared Components:\nNavbar, Footer, MedicineCard,\nProtectedRoute, Toast"]
        AXIOS["Axios API Layer"]
    end

    subgraph "Backend - Express.js (Render.com)"
        SRV["Express Server :5000"]
        MW["Middleware: CORS, JSON, Morgan"]
        AUTH_MW["Auth Middleware (JWT + RBAC)"]
        ROUTES["10 Route Files"]
        CTRL["8 Controllers"]
        MODELS["5 Mongoose Models"]
    end

    subgraph "External Services"
        MONGO[("MongoDB Atlas")]
        RAZORPAY["Razorpay Gateway"]
        CLOUDINARY["Cloudinary CDN"]
    end

    Browser & Mobile --> RP
    RP --> AC & CC
    AC & CC --> DP & AP
    DP & AP --> COMP
    COMP --> AXIOS
    AXIOS -- "REST API (HTTPS + JWT)" --> SRV
    SRV --> MW --> AUTH_MW --> ROUTES --> CTRL --> MODELS --> MONGO
    CTRL --> RAZORPAY
    CTRL --> CLOUDINARY
```


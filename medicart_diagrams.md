# 📋 MediCart — Complete Software Engineering Diagrams

All diagrams below are generated from the actual MediCart codebase analysis.

---

## 1. Gantt Chart — Project Development Timeline

![diagram](./medicart_diagrams_out-1.svg)

---

## 2. Data Flow Diagram — Level 0 (Context Diagram)

![diagram](./medicart_diagrams_out-2.svg)

---

## 3. Data Flow Diagram — Level 1

![diagram](./medicart_diagrams_out-3.svg)

---

## 4. Use Case Diagram

![diagram](./medicart_diagrams_out-4.svg)

---

## 5. ER Diagram (Entity Relationship Diagram)

![diagram](./medicart_diagrams_out-5.svg)

---

## 6. Database Schema Diagram

![diagram](./medicart_diagrams_out-6.svg)

> [!NOTE]
> ★ = required field. `→` denotes a foreign key reference. Subdocuments (OrderItem, Billing, PaymentInfo, PurchaseItem, InvoiceItem) are embedded within their parent documents (MongoDB style).

---

## 7. System Architecture Diagram

![diagram](./medicart_diagrams_out-7.svg)

---

## 8. Activity Diagram — Doctor Order Placement Flow

![diagram](./medicart_diagrams_out-8.svg)

---

## 9. Sequence Diagram — Order & Payment Flow

![diagram](./medicart_diagrams_out-9.svg)

---

## 10. PERT Chart — Project Task Dependencies

![diagram](./medicart_diagrams_out-10.svg)

> [!IMPORTANT]
> **Critical Path**: A → B → C → D → E → F → G → H → I → J → K → S → T → U → V (total ≈ 143 days)

---

## 11. Flowchart — Complete System Workflow

![diagram](./medicart_diagrams_out-11.svg)

---

> [!TIP]
> All diagrams are rendered using **Mermaid.js** syntax. They can be exported to PNG/SVG using tools like [mermaid.live](https://mermaid.live), or rendered directly in GitHub, VS Code (with Mermaid extension), or documentation tools like Notion/Confluence.

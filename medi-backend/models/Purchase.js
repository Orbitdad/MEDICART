import mongoose from "mongoose";

/* ─────────────────────────────────────────
   PURCHASE ITEM SUB-DOCUMENT
   One row of the invoice = one batch entry.
   Links back to Medicine master via medicineId.
───────────────────────────────────────── */
const purchaseItemSchema = new mongoose.Schema(
  {
    /* ── Link to Medicine master ── */
    medicineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Medicine",
      required: true,
    },

    /* ── Kept for invoice display (denormalised snapshot) ── */
    // Storing these here means old invoices still print correctly
    // even if the Medicine master record is later edited.
    itemName: { type: String, required: true, trim: true },
    mfr:      { type: String, trim: true, default: "" }, // manufacturer / Co.
    pkg:      { type: String, trim: true, default: "" }, // e.g. "10TAB"
    code:     { type: String, trim: true, default: "" }, // supplier item code

    /* ── Batch-specific (changes every delivery) ── */
    batch: { type: String, trim: true, default: "" },
    exp:   { type: String, trim: true, default: "" }, // "MM/YY" as printed on invoice
    mrp:   { type: Number, default: 0 },

    /* ── Quantity ── */
    qty:  { type: Number, default: 0 },
    free: { type: Number, default: 0 },

    /* ── Pricing ── */
    billRate:       { type: Number, default: 0 }, // purchase rate (Price col)
    schemePercent:  { type: Number, default: 0 },
    discountPercent:{ type: Number, default: 0 },
    gstPercent:     { type: Number, default: 5 },
    hsnCode:        { type: String, trim: true, default: "" },

    /* ── Computed amounts (saved for audit trail) ── */
    taxableAmount: { type: Number, default: 0 },
    sgst:          { type: Number, default: 0 },
    cgst:          { type: Number, default: 0 },
    amount:        { type: Number, default: 0 }, // final incl. GST

    /* ── OCR metadata (for review / audit) ── */
    ocrRawName:      { type: String, default: "" }, // raw text from invoice photo
    matchConfidence: { type: Number, default: 1 },  // 0–1, 1 = manual/exact
    isNewMedicine:   { type: Boolean, default: false }, // true if created on this purchase
  },
  { _id: true }
);

/* ─────────────────────────────────────────
   PURCHASE (HEADER)
   One invoice = one Purchase document.
───────────────────────────────────────── */
const purchaseSchema = new mongoose.Schema(
  {
    /* ── Invoice header ── */
    purchaseType: {
      type: String,
      enum: ["CREDIT PURCHASE", "CASH PURCHASE", "RETURN"],
      default: "CREDIT PURCHASE",
    },
    purchaseNo: { type: String, required: true, unique: true, trim: true },
    billNo:     { type: String, trim: true, default: "" }, // supplier's invoice no
    entryNo:    { type: String, trim: true, default: "" },

    /* ── Supplier ── */
    partyCode: { type: String, trim: true, default: "" },
    partyName: { type: String, trim: true, default: "" }, // e.g. "VIMAL MEDICO"

    /* ── Dates ── */
    entryDate:    { type: Date, default: Date.now },
    billDate:     { type: Date, default: Date.now },
    receivedDate: { type: Date, default: Date.now },
    dueDate:      { type: Date },

    /* ── Terms ── */
    location:       { type: String, default: "L" },
    creditDays:     { type: Number, default: 0 },
    headerDiscount: { type: Number, default: 0 }, // % on total

    /* ── Items ── */
    items: [purchaseItemSchema],

    /* ── Totals ── */
    totalQty:     { type: Number, default: 0 },
    totalTaxable: { type: Number, default: 0 },
    totalSgst:    { type: Number, default: 0 },
    totalCgst:    { type: Number, default: 0 },
    totalAmount:  { type: Number, default: 0 },
    netAmount:    { type: Number, default: 0 }, // after header discount

    /* ── Meta ── */
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    invoicePhotoUrl: { type: String, default: "" }, // original scanned invoice image
  },
  { timestamps: true }
);

purchaseSchema.index({ purchaseNo: 1 });
purchaseSchema.index({ partyName: 1 });
purchaseSchema.index({ billDate: -1 });
purchaseSchema.index({ "items.medicineId": 1 }); // fast stock lookup per medicine

const Purchase = mongoose.model("Purchase", purchaseSchema);
export default Purchase;

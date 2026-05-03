import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    /* ── Identity ── */
    name:        { type: String, required: true, trim: true },
    brand:       { type: String, trim: true, default: "" },
    company:     { type: String, trim: true, default: "" },
    companyCode: { type: String, trim: true, default: "" },
    itemCode:    { type: String, trim: true, default: "" },

    /* ── Classification ── */
    category: {
      type: String,
      enum: ["SYP", "TAB", "CAP", "EE", "INJ", "INSTR", "OTH"],
      default: "TAB",
    },
    packaging:   { type: String, trim: true, default: "" }, // e.g. "10TAB", "100ML"
    packing:     { type: String, trim: true, default: "" },
    salt:        { type: String, trim: true, default: "" }, // composition / generic name
    description: { type: String, trim: true, default: "" },

    /* ── Tax / GST ── */
    hsnCode:    { type: String, trim: true, default: "" },
    gstPercent: { type: Number, default: 5 },

    /* ── Pricing (master defaults — overridden per batch) ── */
    salePrice: { type: Number, default: 0 }, // selling price to doctor

    /* ── Images (AutoImage lives here) ── */
    images: [{ type: String }],

    /* ── Search helpers ── */
    // Aliases let fuzzy OCR match "Crocin 500" → "Crocin Tab 500mg"
    searchAliases: [{ type: String, trim: true }],

    /* ── Alerts ── */
    minStockAlert: { type: Number, default: 10 }, // trigger low-stock warning

    /* ── Flags ── */
    isActive:  { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  {
    timestamps: true,
    toJSON:   { virtuals: true },
    toObject: { virtuals: true },
  }
);

/* ─────────────────────────────────────────
   VIRTUALS — computed from PurchaseItem
   These replace the old flat stock / mrp / expiryDate fields.
   Call Medicine.findById(id).populate('batches') to use them,
   OR use the aggregation helpers in medicineController.
───────────────────────────────────────── */

// currentStock: sum of (qty + free) across all non-expired active batches
// → computed in controller via aggregation (can't do cross-collection in virtual)

/* ─────────────────────────────────────────
   INDEXES
───────────────────────────────────────── */
medicineSchema.index({ name: 1 });
medicineSchema.index({ itemCode: 1 });
medicineSchema.index({ name: "text", brand: "text", searchAliases: "text" });

const Medicine = mongoose.model("Medicine", medicineSchema);
export default Medicine;

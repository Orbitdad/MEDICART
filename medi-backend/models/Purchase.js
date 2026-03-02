import mongoose from "mongoose";

/* ─────────────────────────────────────
   PURCHASE ITEM (sub-document)
───────────────────────────────────── */
const purchaseItemSchema = new mongoose.Schema({
    code: { type: String, default: "" },
    itemName: { type: String, required: true, trim: true },
    mfr: { type: String, default: "" },
    pkg: { type: String, default: "" },
    batch: { type: String, default: "" },
    exp: { type: String, default: "" },
    mrp: { type: Number, default: 0, min: 0 },
    qty: { type: Number, default: 0, min: 0 },
    free: { type: Number, default: 0, min: 0 },
    billRate: { type: Number, default: 0, min: 0 },
    schemePercent: { type: Number, default: 0, min: 0 },
    discountPercent: { type: Number, default: 0, min: 0 },
    gstPercent: { type: Number, default: 0, min: 0 },
    salePrice: { type: Number, default: 0, min: 0 },
    hsnCode: { type: String, default: "" },
    taxableAmount: { type: Number, default: 0 },
    sgst: { type: Number, default: 0 },
    cgst: { type: Number, default: 0 },
    amount: { type: Number, default: 0 },
    imageUrl: { type: String, default: "" }, // Cloudinary URL
});

/* ─────────────────────────────────────
   PURCHASE (main document)
───────────────────────────────────── */
const purchaseSchema = new mongoose.Schema(
    {
        purchaseType: {
            type: String,
            enum: ["CREDIT PURCHASE", "CASH PURCHASE"],
            default: "CREDIT PURCHASE",
        },
        purchaseNo: { type: String, required: true },
        partyCode: { type: String, default: "" },
        partyName: { type: String, default: "" },
        billNo: { type: String, default: "" },
        entryNo: { type: String, default: "" },
        location: { type: String, default: "L" },
        creditDays: { type: Number, default: 0, min: 0 },
        headerDiscount: { type: Number, default: 0, min: 0 },
        entryDate: { type: Date, default: Date.now },
        billDate: { type: Date, default: Date.now },
        receivedDate: { type: Date, default: Date.now },

        /* Items array */
        items: [purchaseItemSchema],

        /* Computed totals (stored for quick reads) */
        totalQty: { type: Number, default: 0 },
        totalTaxable: { type: Number, default: 0 },
        totalSgst: { type: Number, default: 0 },
        totalCgst: { type: Number, default: 0 },
        totalAmount: { type: Number, default: 0 },
        netAmount: { type: Number, default: 0 },

        /* Who created it */
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);

export default mongoose.model("Purchase", purchaseSchema);

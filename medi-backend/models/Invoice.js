import mongoose from "mongoose";

const invoiceItemSchema = new mongoose.Schema(
  {
    name: String,
    company: String,
    packaging: String,
    expiry: String,
    qty: Number,
    mrp: Number,
    price: Number,
    gstPercent: Number,
    amount: Number,
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: true,
      unique: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },

    doctor: {
      name: String,
      clinic: String,
      phone: String,
      city: String,
    },

    items: [invoiceItemSchema],

    taxableAmount: Number,
    sgstAmount: Number,
    cgstAmount: Number,
    igstAmount: Number,

    totalAmount: Number,

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Invoice", invoiceSchema);

import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    /* --------------------
       BASIC INFO
    -------------------- */
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Old field (manually-created via GPT)
    brand: {
      type: String,
      default: "",
    },

    // New field (imported backup JSON) — equivalent of brand
    company: {
      type: String,
      default: "",
    },

    companyCode: {
      type: String,
      default: "",
    },

    itemCode: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    // Old field (manually-created via GPT)
    packaging: {
      type: String,
      default: "",
    },

    // New field (imported backup JSON) — equivalent of packaging
    packing: {
      type: String,
      default: "",
    },

    /* --------------------
       PRICING
    -------------------- */
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0, // 🔥 SAFETY: prevents NaN
    },

    // Purchase cost (from imported backup)
    cost: {
      type: Number,
      default: 0,
      min: 0,
    },

    gstPercent: {
      type: Number,
      default: 5, // 🔥 SAFETY: always defined
      min: 0,
    },

    /* --------------------
       STOCK
    -------------------- */
    stock: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },

    expiryDate: {
      type: Date,
    },

    /* --------------------
       CATEGORY
    -------------------- */
    category: {
      type: String,
      enum: ["SYP", "TAB", "CAP", "EE", "INJ", "INSTR"],
      default: "TAB",
    },

    /* --------------------
       IMAGES
    -------------------- */
    images: [
      {
        type: String,
      },
    ],

    /* --------------------
       STATUS
    -------------------- */
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Medicine", medicineSchema);

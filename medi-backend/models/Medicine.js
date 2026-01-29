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

    brand: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    packaging: {
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
      required: true,
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

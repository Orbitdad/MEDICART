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
      type: String, // company / manufacturer
      required: true,
    },

    description: {
      type: String,
    },

    packaging: {
      type: String, // Strip of 10 tablets
    },

    /* --------------------
       PRICING
    -------------------- */
    mrp: {
      type: Number,
      required: true,
    },

    price: {
      type: Number, // selling price
      required: true,
    },

    /* --------------------
       STOCK
    -------------------- */
    stock: {
      type: Number,
      required: true,
      default: 0,
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
      required: true,
      default: "TAB",
    },

    /* --------------------
       IMAGES
    -------------------- */
    images: [
      {
        type: String, // filename
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

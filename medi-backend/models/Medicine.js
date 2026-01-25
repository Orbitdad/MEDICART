import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    brand: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, required: true },

    category: {
      type: String,
      enum: ["SYP", "TAB", "CAP", "EE", "INJ", "INSTR"],
      required: true,
      default: "TAB",
    },

    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Medicine", medicineSchema);

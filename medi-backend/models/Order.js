import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    items: [
      {
        medicineId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Medicine",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
        },
      },
    ],

    notes: String,

    totalAmount: {
      type: Number,
      required: true,
    },

    /* ======================
       PAYMENT
    ====================== */
    paymentMode: {
      type: String,
      enum: ["credit", "online"],
      required: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid"],
      default: "pending",
    },

    paymentInfo: {
      razorpay_payment_id: String,
      razorpay_order_id: String,
    },

    /* ======================
       ADMIN DECISION STATUS
    ====================== */
    adminStatus: {
      type: String,
      enum: ["pending", "completed"],
      default: "pending",
    },

    /* ======================
       ORDER FLOW
    ====================== */
    orderStatus: {
      type: String,
      enum: [
        "placed",
        "approved",
        "dispatched",
        "completed",
        "cancelled",
      ],
      default: "placed",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Order", orderSchema);

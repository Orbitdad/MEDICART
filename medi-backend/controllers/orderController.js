import Order from "../models/Order.js";
import Medicine from "../models/Medicine.js";
import Invoice from "../models/Invoice.js";

/* ----------------------------------
   DOCTOR: PLACE ORDER
----------------------------------- */
export const placeOrder = async (req, res) => {
  try {
    const { items, notes, paymentMode, paymentInfo } = req.body;

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    const orderItems = [];
    let subTotal = 0;
    let gstTotal = 0;

    for (const item of items) {
      if (!item.medicineId || !item.quantity) {
        return res.status(400).json({ message: "Invalid order item" });
      }

      const medicine = await Medicine.findOneAndUpdate(
        {
          _id: item.medicineId,
          stock: { $gte: item.quantity },
        },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!medicine) {
        return res.status(400).json({ message: "Insufficient stock" });
      }

      const price = medicine.price;
      const gstPercent = medicine.gstPercent ?? 5;

      const itemTotal = price * item.quantity;
      const itemGst = (itemTotal * gstPercent) / 100;

      subTotal += itemTotal;
      gstTotal += itemGst;

      orderItems.push({
        medicineId: medicine._id,
        quantity: item.quantity,
        price,
        gstPercent,
      });
    }

    const cgstAmount = gstTotal / 2;
    const sgstAmount = gstTotal / 2;
    const finalAmount = subTotal + gstTotal;

    /* -----------------------------
       CREATE ORDER
    ------------------------------ */
    const order = await Order.create({
      doctor: req.user._id,
      items: orderItems,
      notes,

      billing: {
        taxableAmount: subTotal,
        cgstAmount,
        sgstAmount,
        finalAmount,
      },

      subTotal,
      gstAmount: gstTotal,
      totalAmount: finalAmount,

      paymentMode,
      paymentStatus: paymentMode === "online" ? "paid" : "pending",
paymentInfo: paymentMode === "online" ? paymentInfo : {},

      orderStatus: "placed",
      adminStatus: "pending",
    });

    /* -----------------------------
       CREATE INVOICE
    ------------------------------ */
    await Invoice.create({
      orderId: order._id,
      doctor: order.doctor,
      items: order.items,

      billing: order.billing,

      subTotal: order.subTotal,
      gstAmount: order.gstAmount,
      totalAmount: order.totalAmount,

      status: "generated",
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });
  } catch (err) {
    console.error("ORDER ERROR:", err);

    if (req.body?.items) {
      for (const item of req.body.items) {
        await Medicine.updateOne(
          { _id: item.medicineId },
          { $inc: { stock: item.quantity } }
        );
      }
    }

    res.status(500).json({
      message: "Order creation failed",
      error: err.message,
    });
  }
};

/* ----------------------------------
   ADMIN: MARK ORDER COMPLETED
----------------------------------- */
export const adminMarkOrderCompleted = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.adminStatus = "completed";
    await order.save();

    res.json({
      message: "Order marked as completed",
      order,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to mark order completed",
      error: err.message,
    });
  }
};

/* ----------------------------------
   ADMIN: UPDATE ORDER STATUS
----------------------------------- */
export const adminUpdateOrderStatus = async (req, res) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    order.orderStatus = orderStatus || order.orderStatus;
    await order.save();

    res.json({
      message: "Order status updated",
      order,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to update order status",
      error: err.message,
    });
  }
};


/* ----------------------------------
   ADMIN: GET ALL ORDERS
----------------------------------- */
export const adminGetOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("doctor", "name email")
      .populate("items.medicineId", "name brand price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ----------------------------------
   DOCTOR: RECENT ORDERS
----------------------------------- */
export const getRecentOrders = async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const orders = await Order.find({ doctor: req.user._id })
    .sort({ createdAt: -1 })
    .limit(3)
    .populate("items.medicineId", "name");

  res.json(orders);
};


/* ----------------------------------
   ADMIN: INVENTORY SUMMARY
----------------------------------- */
export const inventorySummary = async (req, res) => {
  try {
    const medicines = await Medicine.find();

    res.json({
      totalMedicines: medicines.length,
      totalUnits: medicines.reduce(
        (sum, m) => sum + m.stock,
        0
      ),
      lowStockCount: medicines.filter(
        (m) => m.stock <= 5
      ).length,
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch inventory summary",
      error: err.message,
    });
  }
};

/* ----------------------------------
   GET SINGLE ORDER (INVOICE)
----------------------------------- */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("doctor", "name email")
      .populate("items.medicineId");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(order);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch order" });
  }
};

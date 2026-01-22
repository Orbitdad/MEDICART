import Order from "../models/Order.js";
import Medicine from "../models/Medicine.js";

/* ----------------------------------
   DOCTOR: PLACE ORDER
----------------------------------- */
export const placeOrder = async (req, res, next) => {
  try {
    const {
      items,
      notes,
      paymentMode,
      paymentInfo,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "No items in order" });
    }

    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const medicine = await Medicine.findOneAndUpdate(
        {
          _id: item.medicineId,
          stock: { $gte: item.quantity },
        },
        { $inc: { stock: -item.quantity } },
        { new: true }
      );

      if (!medicine) {
        return res
          .status(400)
          .json({ message: "Insufficient stock" });
      }

      total += medicine.price * item.quantity;

      orderItems.push({
        medicineId: medicine._id,
        quantity: item.quantity,
      });
    }

    const order = await Order.create({
      doctor: req.user._id,
      items: orderItems,
      notes,
      totalAmount: total,

      paymentMode, // "credit" | "online"

      paymentStatus:
        paymentMode === "online" ? "paid" : "pending",

      paymentInfo:
        paymentMode === "online" ? paymentInfo : null,

      orderStatus: "placed",
    });

    res.status(201).json({
      message: "Order placed successfully",
      order,
    });

  } catch (err) {
    console.error("ORDER ERROR:", err);
    next(err);
  }
};

/* ----------------------------------
   ADMIN: GET ALL ORDERS
----------------------------------- */
export const adminGetOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("doctor", "name email")
      .populate("items.medicineId", "name brand price")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (err) {
    next(err);
  }
};

/* ----------------------------------
   ADMIN: UPDATE ORDER STATUS
----------------------------------- */
export const adminUpdateOrderStatus = async (req, res, next) => {
  try {
    const { orderStatus } = req.body;

    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ message: "Order not found" });
    }

    order.orderStatus = orderStatus || order.orderStatus;
    await order.save();

    res.json({
      message: "Order updated successfully",
      order,
    });
  } catch (err) {
    next(err);
  }
};

/* ----------------------------------
   ADMIN: INVENTORY SUMMARY
----------------------------------- */
export const inventorySummary = async (req, res, next) => {
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
    next(err);
  }
};

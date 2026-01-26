import Invoice from "../models/Invoice.js";
import Order from "../models/Order.js";

export const createInvoice = async (orderId) => {
  const order = await Order.findById(orderId).populate("doctor");

  if (!order) throw new Error("Order not found");

  const year = new Date().getFullYear();

  const invoiceCount = await Invoice.countDocuments({
    invoiceNo: new RegExp(`MC-${year}`),
  });

  const invoiceNo = `MC-${year}-${String(invoiceCount + 1).padStart(4, "0")}`;

  const invoice = await Invoice.create({
    invoiceNo,
    orderId: order._id,

    doctor: {
      name: order.doctor.name,
      clinic: order.doctor.clinic,
      phone: order.doctor.phone,
      city: order.doctor.city,
    },

    items: order.items.map((item) => ({
      name: item.name,
      company: item.company,
      packaging: item.packaging,
      expiry: item.expiry,
      qty: item.qty,
      mrp: item.mrp,
      price: item.price,
      gstPercent: item.gstPercent,
      amount: item.amount,
    })),

    taxableAmount: order.taxableAmount,
    sgstAmount: order.sgstAmount,
    cgstAmount: order.cgstAmount,
    igstAmount: order.igstAmount || 0,

    totalAmount: order.totalAmount,
  });

  return invoice;
};

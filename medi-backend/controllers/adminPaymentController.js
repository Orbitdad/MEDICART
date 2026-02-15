import User from "../models/User.js";
import Order from "../models/Order.js";

/* ----------------------------------
   SEARCH DOCTORS
----------------------------------- */
export const searchDoctors = async (req, res) => {
    try {
        const { q } = req.query;
        // content search on name or email
        const query = {
            role: "doctor",
        };

        if (q) {
            query.$or = [
                { name: { $regex: q, $options: "i" } },
                { email: { $regex: q, $options: "i" } },
            ];
        }

        const doctors = await User.find(query).select("name email hospital");

        // Optional: Calculate outstanding for each doctor (might be slow if many doctors, but ok for search results)
        // For now, let's just return basic info, and fetch details when selected.

        res.json(doctors);
    } catch (error) {
        res.status(500).json({ message: "Search failed", error: error.message });
    }
};

/* ----------------------------------
   GET DOCTOR DUE DETAILS
----------------------------------- */
export const getDoctorDue = async (req, res) => {
    try {
        const { id } = req.params;

        const orders = await Order.find({
            doctor: id,
            paymentStatus: "pending"
        });

        const totalDue = orders.reduce((sum, o) => sum + (o.totalAmount || o.billing?.finalAmount || 0), 0);

        res.json({
            doctorId: id,
            totalDue,
            pendingOrdersCount: orders.length
        });

    } catch (error) {
        res.status(500).json({ message: "Failed to fetch due", error: error.message });
    }
};

/* ----------------------------------
   DEDUCT PAYMENT (FIFO)
----------------------------------- */
export const deductPayment = async (req, res) => {
    try {
        const { doctorId, amount } = req.body;

        if (!doctorId || !amount || amount <= 0) {
            return res.status(400).json({ message: "Invalid data" });
        }

        // 1. Fetch pending orders sorted by Date (Oldest first)
        // We want to clear strict debts first.
        const orders = await Order.find({
            doctor: doctorId,
            paymentStatus: "pending"
        }).sort({ createdAt: 1 });

        let remaining = Number(amount);
        let paidOrderIds = [];

        for (let order of orders) {
            const orderTotal = order.totalAmount || order.billing?.finalAmount || 0;

            if (remaining >= orderTotal) {
                // Pay this order fully
                order.paymentStatus = "paid";
                await order.save();

                remaining -= orderTotal;
                paidOrderIds.push(order._id);
            } else {
                // Cannot pay full order, stop here
                // (Unless we support partial, but User requested "deduct from total", 
                // implies clearing orders. Standard practice: clear whole orders first)
                break;
            }
        }

        res.json({
            message: "Payment applied",
            paidOrders: paidOrderIds,
            remainingExcess: remaining, // Amount that couldn't cover a full order
            totalProcessed: Number(amount) - remaining
        });

    } catch (error) {
        res.status(500).json({ message: "Payment processing failed", error: error.message });
    }
};

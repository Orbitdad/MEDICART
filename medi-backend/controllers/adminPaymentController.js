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

        const totalDue = orders.reduce((sum, o) => {
            const orderTotal = o.billing?.finalAmount || 0;
            const alreadyPaid = o.paidAmount || 0;
            return sum + (orderTotal - alreadyPaid);
        }, 0);

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

        // Fetch pending orders sorted oldest-first (FIFO)
        const orders = await Order.find({
            doctor: doctorId,
            paymentStatus: "pending"
        }).sort({ createdAt: 1 });

        let remaining = Number(amount);
        let paidOrderIds = [];
        let partiallyPaidOrderIds = [];

        for (let order of orders) {
            if (remaining <= 0) break;

            const orderTotal = order.billing?.finalAmount || 0;
            const alreadyPaid = order.paidAmount || 0;
            const orderRemaining = orderTotal - alreadyPaid;

            if (orderRemaining <= 0) continue; // already covered

            if (remaining >= orderRemaining) {
                // Payment covers the full remaining balance of this order
                order.paymentStatus = "paid";
                order.paidAmount = orderTotal;
                await order.save();

                remaining -= orderRemaining;
                paidOrderIds.push(order._id);
            } else {
                // Partial payment — apply what we can
                order.paidAmount = alreadyPaid + remaining;
                await order.save();

                remaining = 0;
                partiallyPaidOrderIds.push(order._id);
            }
        }

        res.json({
            message: "Payment applied",
            paidOrders: paidOrderIds,
            partiallyPaidOrders: partiallyPaidOrderIds,
            remainingExcess: remaining,
            totalProcessed: Number(amount) - remaining
        });

    } catch (error) {
        res.status(500).json({ message: "Payment processing failed", error: error.message });
    }
};

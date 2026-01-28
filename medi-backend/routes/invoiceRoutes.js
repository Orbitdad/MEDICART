import Invoice from "../models/Invoice.js";

router.get(
  "/by-order/:orderId",
  protect(["doctor", "admin"]),
  async (req, res) => {
    const invoice = await Invoice.findOne({
      orderId: req.params.orderId,
    });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  }
);

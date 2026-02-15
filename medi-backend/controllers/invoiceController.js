import PDFDocument from "pdfkit";
import fs from "fs";
import path from "path";
import Invoice from "../models/Invoice.js";

export const generateInvoicePDF = async (req, res) => {
  try {
    const invoice = await Invoice.findOne({ orderId: req.params.id });

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found for this order" });
    }

    const invoicePath = `invoices/invoice-${invoice.invoiceNo}.pdf`;

    const doc = new PDFDocument({ margin: 40 });
    doc.pipe(fs.createWriteStream(invoicePath));

    /* ---------------- HEADER ---------------- */

    doc
      .fontSize(16)
      .text("SHREE SAI SURGICAL", { align: "center" })
      .moveDown(0.3);

    doc
      .fontSize(10)
      .text("Medical & Surgical Supplier", { align: "center" })
      .moveDown(1);

    doc.fontSize(9);
    doc.text(`Invoice No: ${invoice.invoiceNo}`);
    doc.text(`Invoice Date: ${new Date(invoice.createdAt).toLocaleDateString()}`);
    doc.text(`Order ID: ${invoice.orderId}`);
    doc.moveDown();

    /* ---------------- DOCTOR ---------------- */

    doc.fontSize(10).text("Bill To:");
    doc.fontSize(9);
    doc.text(`Doctor: ${invoice.doctor.name}`);
    doc.text(`Clinic: ${invoice.doctor.clinic}`);
    doc.text(`Mobile: ${invoice.doctor.phone}`);
    doc.text(`City: ${invoice.doctor.city}`);
    doc.moveDown();

    /* ---------------- TABLE HEADER ---------------- */

    const tableTop = doc.y;

    doc.fontSize(9);
    doc.text("Qty", 40, tableTop);
    doc.text("Item", 70, tableTop);
    doc.text("Company", 200, tableTop);
    doc.text("Pack", 290, tableTop);
    doc.text("Exp", 330, tableTop);
    doc.text("MRP", 370, tableTop);
    doc.text("Rate", 420, tableTop);
    doc.text("Amount", 470, tableTop);
    doc.text("GST%", 530, tableTop);

    doc.moveDown(0.5);

    let y = tableTop + 15;

    /* ---------------- ITEMS ---------------- */

    invoice.items.forEach((item) => {
      doc.text(item.qty, 40, y);
      doc.text(item.name, 70, y, { width: 120 });
      doc.text(item.company, 200, y);
      doc.text(item.packaging, 290, y);
      doc.text(item.expiry, 330, y);
      doc.text(item.mrp.toFixed(2), 370, y);
      doc.text(item.price.toFixed(2), 420, y);
      doc.text(item.amount.toFixed(2), 470, y);
      doc.text(item.gstPercent + "%", 530, y);
      y += 18;
    });

    doc.moveDown(2);

    /* ---------------- TOTALS ---------------- */

    doc.text(`Taxable Amount: ₹${invoice.taxableAmount.toFixed(2)}`, {
      align: "right",
    });

    doc.text(`SGST Amount: ₹${invoice.sgstAmount.toFixed(2)}`, {
      align: "right",
    });

    doc.text(`CGST Amount: ₹${invoice.cgstAmount.toFixed(2)}`, {
      align: "right",
    });

    doc.moveDown(0.5);

    doc
      .fontSize(11)
      .text(`FINAL AMOUNT: ₹${invoice.totalAmount.toFixed(2)}`, {
        align: "right",
      });

    doc.moveDown(2);

    /* ---------------- FOOTER ---------------- */

    doc.fontSize(9);
    doc.text("Bank: Bank of India");
    doc.text("A/C No: 010020110000004");
    doc.text("IFSC: BKID0000100");

    doc.moveDown(1);
    doc.text("Authorized Signatory");

    doc.end();

    res.json({
      message: "Invoice generated",
      file: invoicePath,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./Invoice.css";
import axios from "axios";

export default function InvoicePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Invalid order ID.");
      return;
    }
    fetchInvoice();
  }, [id]);

  async function fetchInvoice() {
    try {
      const res = await axios.get(
  `${import.meta.env.VITE_API_URL}/invoice/by-order/${id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem(
              "medicart_token"
            )}`,
          },
        }
      );
      setOrder(res.data);
    } catch (err) {
      console.error("Invoice fetch error:", err);
      setError(
        err?.response?.data?.message ||
          "Failed to load invoice."
      );
    }
  }

  if (error) {
    return (
      <div className="invoice-wrapper">
        <div className="invoice-box">
          <p className="error">{error}</p>
          <button
            className="primary-btn"
            onClick={() => navigate("/doctor")}
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!order) return <p>Loading invoice...</p>;

  return (
    <div className="invoice-wrapper">
      <div className="invoice-box">
        {/* HEADER */}
        <div className="invoice-header">
          <h2>SHREE SAI SURGICAL</h2>
          <p>Pharmaceutical & Surgical Distributor</p>
          <p>GSTIN: 27AKVPM197Q1Z4</p>
          <p>Andheri (E), Mumbai – 400069</p>
        </div>

        {/* META */}
        <div className="invoice-meta">
          <div>
            <strong>Invoice No:</strong>{" "}
            INV-{order._id.slice(-6)}
          </div>
          <div>
            <strong>Date:</strong>{" "}
            {new Date(order.createdAt).toLocaleDateString()}
          </div>
        </div>


        {/* DOCTOR */}
        <div className="invoice-doctor">
          <strong>Doctor:</strong>{" "}
          {order.doctor?.name}
        </div>

        {/* ITEMS */}
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Qty</th>
              <th>Description</th>
              <th>Price</th>
              <th>Amount</th>
              <th>GST%</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((it, i) => {
              const price =
                it.medicineId?.price || 0;
              const qty = it.quantity;
              const amount = price * qty;

              return (
                <tr key={i}>
                  <td>{qty}</td>
                  <td>{it.medicineId?.name}</td>
                  <td>₹{price}</td>
                  <td>₹{amount.toFixed(2)}</td>
                  <td>
                    {it.medicineId?.gstPercent || 5}%
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* SUMMARY */}
        <div className="invoice-summary">
          <div>
            <span>Taxable Amount</span>
            <span>
              ₹{order.billing.taxableAmount}
            </span>
          </div>

          <div>
            <span>CGST</span>
            <span>
              ₹{order.billing.cgstAmount}
            </span>
          </div>

          <div>
            <span>SGST</span>
            <span>
              ₹{order.billing.sgstAmount}
            </span>
          </div>

          <hr />

          <div className="final">
            <span>FINAL AMOUNT</span>
            <span>
              ₹{order.billing.finalAmount}
            </span>
          </div>
        </div>

        {/* FOOTER */}
        <div className="invoice-footer">
          <p>
            This is a computer generated invoice.
          </p>

          <button
            onClick={() => window.print()}
            className="print-btn"
            
          >

            <a
  href={`${import.meta.env.VITE_API_URL}/invoice/generate/${invoice._id}`}
  target="_blank"
  rel="noreferrer"
>
  Download PDF
</a>

            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function OrderSuccess() {
  const { id } = useParams(); // this comes from /order-success/:id
  const navigate = useNavigate();

  return (
    <div className="order-success">
      <h2>Order Placed Successfully ✅</h2>
      <p>Order ID: <strong>{id}</strong></p>

      <button
        className="primary-btn"
        onClick={() =>
          navigate(`/doctor/orders/${id}/invoice`)
        }
      >
        View Invoice
      </button>

      <button
        className="secondary-btn"
        onClick={() => navigate("/doctor/medicines")}
      >
        Continue Shopping
      </button>
    </div>
  );
}

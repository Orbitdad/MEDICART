import React from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";

export default function OrderSuccess() {
  const { id } = useParams();           // friendly orderNo, e.g. ORD-20260406-0001
  const navigate = useNavigate();
  const location = useLocation();
  const rawOrderId = location.state?.orderId || id; // MongoDB _id for invoice lookup

  return (
    <div className="order-success">
      <h2>Order Placed Successfully ✅</h2>
      <p>
        Order ID: <strong>{id}</strong>
      </p>

      <button
        className="primary-btn"
        onClick={() =>
          navigate(`/doctor/orders/${rawOrderId}/invoice`)
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

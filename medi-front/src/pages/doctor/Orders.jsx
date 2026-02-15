import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentOrders } from "../../api/orders";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import "./Orders.css";

export default function DoctorOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getRecentOrders()
      .then((res) => {
        setOrders(Array.isArray(res) ? res : []);
      })
      .catch(() => {
        setError("Failed to load orders");
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;

  if (error)
    return <p className="page-msg error">{error}</p>;

  if (orders.length === 0)
    return (
      <div className="empty-orders">
        <p>No orders placed yet</p>
        <button onClick={() => navigate("/doctor/medicines")}>
          Place First Order
        </button>
      </div>
    );

  return (
    <div className="orders-page">
      <h2>My Orders</h2>

      {orders.map((order) => (
        <div
          key={order._id}
          className="order-card"
          onClick={() =>
            navigate(`/doctor/orders/${order._id}/invoice`)
          }
        >
          <div>
            <strong>Order ID</strong>
            <p>{order._id.slice(-6)}</p>
          </div>

          <div>
            <strong>Total</strong>
            <p>
              ₹{(
                order.totalAmount ??
                order.billing?.finalAmount ??
                0
              ).toFixed(2)}
            </p>
          </div>

          <div>
            <strong>Payment</strong>
            <p
              className={
                order.paymentStatus === "paid"
                  ? "text-green-600"
                  : "text-orange-600"
              }
            >
              {order.paymentStatus}
            </p>
          </div>

          <div>
            <strong>Status</strong>
            <p>{order.orderStatus}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

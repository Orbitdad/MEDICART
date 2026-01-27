import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminFetchOrders } from "../../api/orders.js";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import {
  ClipboardList,
  Clock,
  CheckCircle,
  IndianRupee,
  ArrowRight,
} from "lucide-react";

function StatCard({ label, value, icon: Icon, urgent, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`card cursor-pointer transition ${
        urgent
          ? "ring-2 ring-orange-400/40 bg-orange-50"
          : "hover:shadow-md"
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-muted">{label}</p>
          <p
            className={`text-2xl font-semibold mt-1 ${
              urgent ? "text-orange-600" : ""
            }`}
          >
            {value}
          </p>
        </div>
        <Icon
          size={28}
          className={
            urgent ? "text-orange-500" : "text-gray-400"
          }
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const data = await adminFetchOrders();
      setOrders(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  };

  const totalOrders = orders.length;
  const pendingOrders = orders.filter(
    (o) => o.status === "pending"
  ).length;
  const completedOrders = orders.filter(
    (o) => o.status === "completed"
  ).length;
  const revenue = orders.reduce(
    (sum, o) => sum + (o.totalAmount || 0),
    0
  );

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div>
        <span className="badge">Admin</span>
        <h1 className="mt-2">Dashboard</h1>
        <p className="text-muted">
          Order fulfilment and system overview
        </p>
      </div>

      {/* STATS */}
      <div className="stats-grid">
        {loading ? (
          <div style={{ gridColumn: "1 / -1" }}>
            <LoadingScreen />
          </div>
        ) : (
          <>
            <StatCard
              label="Total Orders"
              value={totalOrders}
              icon={ClipboardList}
              onClick={() => navigate("/admin/orders")}
            />
            <StatCard
              label="Pending Orders"
              value={pendingOrders}
              icon={Clock}
              urgent={pendingOrders > 0}
              onClick={() => navigate("/admin/orders")}
            />
            <StatCard
              label="Completed Orders"
              value={completedOrders}
              icon={CheckCircle}
              onClick={() => navigate("/admin/orders")}
            />
            <StatCard
              label="Revenue"
              value={`₹${revenue}`}
              icon={IndianRupee}
            />
          </>
        )}
      </div>

      {/* NEXT ACTION */}
      {pendingOrders > 0 && (
        <div className="card flex items-center justify-between bg-orange-50 border border-orange-100">
          <p className="text-sm text-orange-700">
            You have {pendingOrders} pending order
            {pendingOrders > 1 ? "s" : ""} requiring action.
          </p>
          <button
            className="button button-primary flex items-center gap-1"
            onClick={() => navigate("/admin/orders")}
          >
            Review
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* RECENT ORDERS */}
      <div className="card">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3>Recent Orders</h3>
            <p className="text-muted text-sm">
              Latest doctor activity
            </p>
          </div>

          <button
            className="button button-outline text-sm"
            onClick={() => navigate("/admin/orders")}
          >
            View All
          </button>
        </div>

        {loading ? (
          <LoadingScreen />
        ) : orders.length === 0 ? (
          <p className="text-muted text-sm">
            No orders yet.
          </p>
        ) : (
          <div className="space-y-2">
            {orders.slice(0, 5).map((o) => (
              <div
                key={o._id}
                onClick={() => navigate("/admin/orders")}
                className="flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-gray-50"
              >
                <div>
                  <p className="text-sm font-medium">
                    #{o._id.slice(-6)}
                  </p>
                  <p className="text-xs text-muted">
                    Dr. {o.doctor?.name || "Unknown"}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-sm font-medium">
                    ₹{o.totalAmount}
                  </p>
                  <span
                    className={`text-xs font-medium ${
                      o.status === "pending"
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {o.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

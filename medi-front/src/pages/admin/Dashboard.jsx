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
  TrendingUp,
  Users,
  Package,
  Calendar,
} from "lucide-react";
import "./Dashboard.css";

function StatCard({ label, value, subtitle, icon: Icon, color, onClick }) {
  return (
    <div className="dash-stat-card" onClick={onClick} style={{ cursor: onClick ? "pointer" : "default" }}>
      <div className="dash-stat-icon-wrap" style={{ background: `${color}14`, color }}>
        <Icon size={22} />
      </div>
      <div className="dash-stat-info">
        <p className="dash-stat-label">{label}</p>
        <p className="dash-stat-value">{value}</p>
        {subtitle && <p className="dash-stat-subtitle">{subtitle}</p>}
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
  const pendingOrders = orders.filter((o) => o.adminStatus === "pending").length;
  const completedOrders = orders.filter((o) => o.adminStatus === "completed").length;
  const revenue = orders.reduce((sum, o) => sum + (o.billing?.finalAmount || 0), 0);

  const uniqueDoctors = new Set(orders.map((o) => o.doctor?._id).filter(Boolean)).size;

  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);
  const todayOrders = orders.filter(
    (o) => o.createdAt?.slice(0, 10) === todayStr
  ).length;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="admin-dashboard" aria-label="Admin dashboard">
      {/* HEADER */}
      <div className="dash-header">
        <div>
          <span className="badge">Admin</span>
          <h1 className="dash-title">Dashboard</h1>
          <p className="dash-subtitle">
            Welcome back! Here's your business overview.
          </p>
        </div>
        <div className="dash-date">
          <Calendar size={16} />
          <span>
            {today.toLocaleDateString("en-IN", {
              weekday: "long",
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* STATS */}
      {loading ? (
        <LoadingScreen />
      ) : (
        <>
          <div className="dash-stats-grid">
            <StatCard
              label="Total Revenue"
              value={`₹${revenue.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`}
              subtitle={`From ${totalOrders} orders`}
              icon={IndianRupee}
              color="#16a34a"
            />
            <StatCard
              label="Pending Orders"
              value={pendingOrders}
              subtitle="Awaiting completion"
              icon={Clock}
              color="#ea580c"
              onClick={() => navigate("/admin/orders?status=pending")}
            />
            <StatCard
              label="Completed"
              value={completedOrders}
              subtitle="Fulfilled orders"
              icon={CheckCircle}
              color="#2563eb"
              onClick={() => navigate("/admin/orders?status=completed")}
            />
            <StatCard
              label="Today's Orders"
              value={todayOrders}
              subtitle="Received today"
              icon={TrendingUp}
              color="#7c3aed"
            />
            <StatCard
              label="Doctors"
              value={uniqueDoctors}
              subtitle="Active doctors"
              icon={Users}
              color="#0891b2"
            />
            <StatCard
              label="All Orders"
              value={totalOrders}
              subtitle="Lifetime total"
              icon={Package}
              color="#64748b"
              onClick={() => navigate("/admin/orders")}
            />
          </div>

          {/* PENDING ALERT */}
          {pendingOrders > 0 && (
            <div className="dash-alert">
              <div className="dash-alert-content">
                <div className="dash-alert-icon">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="dash-alert-title">
                    {pendingOrders} pending order{pendingOrders > 1 ? "s" : ""} need attention
                  </p>
                  <p className="dash-alert-sub">Review and mark orders as completed</p>
                </div>
              </div>
              <button
                className="button button-primary dash-alert-btn"
                onClick={() => navigate("/admin/orders?status=pending")}
              >
                Review <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* RECENT ORDERS */}
          <div className="dash-recent-card card">
            <div className="dash-recent-header">
              <div>
                <h3>Recent Orders</h3>
                <p className="text-muted" style={{ fontSize: "0.82rem" }}>
                  Latest {Math.min(orders.length, 8)} of {orders.length} total
                </p>
              </div>
              <button
                className="button button-outline"
                style={{ fontSize: "0.82rem" }}
                onClick={() => navigate("/admin/orders")}
              >
                View All
              </button>
            </div>

            {orders.length === 0 ? (
              <p className="text-muted" style={{ fontSize: "0.85rem", padding: "1rem 0" }}>
                No orders yet. Orders will appear here once doctors start ordering.
              </p>
            ) : (
              <div className="dash-table-wrap">
                <table className="dash-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Doctor</th>
                      <th>Amount</th>
                      <th>Payment</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 8).map((o) => (
                      <tr
                        key={o._id}
                        onClick={() => navigate("/admin/orders")}
                        className="dash-table-row"
                      >
                        <td className="dash-order-id">#{o._id.slice(-6)}</td>
                        <td>
                          <span className="dash-doctor-name">
                            {o.doctor?.name || "Unknown"}
                          </span>
                        </td>
                        <td className="dash-amount">
                          ₹{(o.billing?.finalAmount ?? 0).toFixed(2)}
                        </td>
                        <td>
                          <span
                            className={`dash-badge ${
                              o.paymentStatus === "paid"
                                ? "dash-badge-green"
                                : "dash-badge-orange"
                            }`}
                          >
                            {o.paymentStatus}
                          </span>
                        </td>
                        <td>
                          <span
                            className={`dash-badge ${
                              o.adminStatus === "completed"
                                ? "dash-badge-blue"
                                : "dash-badge-amber"
                            }`}
                          >
                            {o.adminStatus}
                          </span>
                        </td>
                        <td className="dash-date-cell">
                          <span>{formatDate(o.createdAt)}</span>
                          <span className="dash-time">{formatTime(o.createdAt)}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </main>
  );
}

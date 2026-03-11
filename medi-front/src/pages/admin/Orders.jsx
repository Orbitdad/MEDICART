import React, { useEffect, useState } from "react";
import {
  adminFetchOrders,
  markOrderCompleted,
} from "../../api/orders.js";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import {
  CheckCircle,
  Clock,
  Filter,
  Package,
  ChevronDown,
  ChevronUp,
  AlertCircle,
} from "lucide-react";
import { useSearchParams } from "react-router-dom";
import "./AdminOrders.css";

export default function Orders() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get("status") || "all";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState(initialFilter);
  const [confirmingId, setConfirmingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    const status = searchParams.get("status");
    if (status) setFilter(status);
  }, [searchParams]);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await adminFetchOrders();
      setOrders(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter((o) => o.adminStatus === filter);

  async function markCompleted(orderId) {
    setUpdatingId(orderId);
    try {
      await markOrderCompleted(orderId);
      setOrders((prev) =>
        prev.map((o) =>
          o._id === orderId
            ? { ...o, adminStatus: "completed" }
            : o
        )
      );
    } catch (err) {
      console.error("Failed to update order", err);
    } finally {
      setUpdatingId(null);
      setConfirmingId(null);
    }
  }

  const pendingCount = orders.filter((o) => o.adminStatus === "pending").length;
  const completedCount = orders.filter((o) => o.adminStatus === "completed").length;

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <main className="ao-page" aria-label="Admin orders">
      {/* HEADER */}
      <div className="ao-header">
        <div>
          <span className="badge">Admin</span>
          <h1 className="ao-title">Orders</h1>
          <p className="ao-subtitle">Review and fulfil doctor orders</p>
        </div>
        <div className="ao-header-stats">
          <div className="ao-mini-stat">
            <span className="ao-mini-stat-count" style={{ color: "#ea580c" }}>{pendingCount}</span>
            <span className="ao-mini-stat-label">Pending</span>
          </div>
          <div className="ao-mini-stat">
            <span className="ao-mini-stat-count" style={{ color: "#2563eb" }}>{completedCount}</span>
            <span className="ao-mini-stat-label">Completed</span>
          </div>
          <div className="ao-mini-stat">
            <span className="ao-mini-stat-count">{orders.length}</span>
            <span className="ao-mini-stat-label">Total</span>
          </div>
        </div>
      </div>

      {/* FILTER */}
      <div className="ao-filter-bar">
        <div className="ao-filter-group">
          <Filter size={16} className="ao-filter-icon" />
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setSearchParams({ status: e.target.value });
            }}
            className="input ao-filter-select"
          >
            <option value="all">All Orders ({orders.length})</option>
            <option value="pending">Pending ({pendingCount})</option>
            <option value="completed">Completed ({completedCount})</option>
          </select>
        </div>
        <p className="ao-result-count">
          Showing {filteredOrders.length} order{filteredOrders.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* ORDERS */}
      {loading ? (
        <LoadingScreen />
      ) : filteredOrders.length === 0 ? (
        <div className="ao-empty card">
          <Package size={32} className="ao-empty-icon" />
          <p>No orders found.</p>
        </div>
      ) : (
        <div className="ao-table-card card">
          <div className="ao-table-wrap">
            <table className="ao-table">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Doctor</th>
                  <th>Items</th>
                  <th>Amount</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="ao-th-action">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((o) => (
                  <React.Fragment key={o._id}>
                    <tr
                      className={`ao-row ${expandedId === o._id ? "ao-row-expanded" : ""}`}
                      onClick={() => setExpandedId(expandedId === o._id ? null : o._id)}
                    >
                      <td className="ao-order-id">#{o._id.slice(-6)}</td>
                      <td>
                        <span className="ao-doctor-name">
                          {o.doctor?.name || "Unknown"}
                        </span>
                        {o.doctor?.email && (
                          <span className="ao-doctor-email">{o.doctor.email}</span>
                        )}
                      </td>
                      <td>
                        <span className="ao-items-count">
                          {o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? "s" : ""}
                        </span>
                      </td>
                      <td className="ao-amount">
                        ₹{(o.billing?.finalAmount ?? 0).toFixed(2)}
                      </td>
                      <td>
                        <span className={`ao-badge ${o.paymentStatus === "paid" ? "ao-badge-green" : "ao-badge-orange"}`}>
                          {o.paymentStatus}
                        </span>
                      </td>
                      <td>
                        <span className={`ao-badge ${o.adminStatus === "completed" ? "ao-badge-blue" : "ao-badge-amber"}`}>
                          {o.adminStatus === "completed" ? (
                            <><CheckCircle size={12} /> Completed</>
                          ) : (
                            <><Clock size={12} /> Pending</>
                          )}
                        </span>
                      </td>
                      <td className="ao-date-cell">
                        <span>{formatDate(o.createdAt)}</span>
                        <span className="ao-time">{formatTime(o.createdAt)}</span>
                      </td>
                      <td className="ao-action-cell">
                        {o.adminStatus === "pending" && (
                          <button
                            type="button"
                            className="ao-complete-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmingId(confirmingId === o._id ? null : o._id);
                            }}
                          >
                            <CheckCircle size={14} /> Complete
                          </button>
                        )}
                        <button
                          type="button"
                          className="ao-expand-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setExpandedId(expandedId === o._id ? null : o._id);
                          }}
                          aria-label="Toggle details"
                        >
                          {expandedId === o._id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        </button>
                      </td>
                    </tr>

                    {/* EXPANDED DETAILS */}
                    {expandedId === o._id && (
                      <tr className="ao-detail-row">
                        <td colSpan={8}>
                          <div className="ao-detail-content">
                            {/* BILLING */}
                            <div className="ao-detail-section">
                              <h4>Billing Breakdown</h4>
                              <div className="ao-billing-grid">
                                <div className="ao-billing-item">
                                  <span>Taxable</span>
                                  <strong>₹{(o.billing?.taxableAmount ?? 0).toFixed(2)}</strong>
                                </div>
                                <div className="ao-billing-item">
                                  <span>CGST</span>
                                  <strong>₹{(o.billing?.cgstAmount ?? 0).toFixed(2)}</strong>
                                </div>
                                <div className="ao-billing-item">
                                  <span>SGST</span>
                                  <strong>₹{(o.billing?.sgstAmount ?? 0).toFixed(2)}</strong>
                                </div>
                                <div className="ao-billing-item ao-billing-total">
                                  <span>Total</span>
                                  <strong>₹{(o.billing?.finalAmount ?? 0).toFixed(2)}</strong>
                                </div>
                              </div>
                            </div>

                            {/* ITEMS */}
                            <div className="ao-detail-section">
                              <h4>Items Ordered</h4>
                              <div className="ao-items-list">
                                {o.items.map((it, idx) => (
                                  <div key={idx} className="ao-item-row">
                                    <span className="ao-item-name">
                                      {it.name || it.medicineId?.name || "Deleted medicine"}
                                    </span>
                                    <span className="ao-item-qty">× {it.quantity}</span>
                                    <span className="ao-item-price">₹{(it.price * it.quantity).toFixed(2)}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* NOTES */}
                            {o.notes && o.notes.trim() !== "" && (
                              <div className="ao-detail-section">
                                <h4>Notes</h4>
                                <p className="ao-notes">{o.notes}</p>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}

                    {/* CONFIRM DIALOG */}
                    {confirmingId === o._id && (
                      <tr className="ao-confirm-row">
                        <td colSpan={8}>
                          <div className="ao-confirm-bar">
                            <div className="ao-confirm-msg">
                              <AlertCircle size={16} />
                              <span>Mark order <strong>#{o._id.slice(-6)}</strong> as completed?</span>
                            </div>
                            <div className="ao-confirm-actions">
                              <button
                                className="button button-outline ao-confirm-cancel"
                                onClick={() => setConfirmingId(null)}
                              >
                                Cancel
                              </button>
                              <button
                                className="button button-primary ao-confirm-yes"
                                disabled={updatingId === o._id}
                                onClick={() => markCompleted(o._id)}
                              >
                                {updatingId === o._id ? "Updating…" : "Confirm"}
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </main>
  );
}

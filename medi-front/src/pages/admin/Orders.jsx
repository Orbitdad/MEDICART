import React, { useEffect, useState } from "react";
import {
  adminFetchOrders,
  markOrderCompleted,
} from "../../api/orders.js";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import { CheckCircle, Clock, Filter } from "lucide-react";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [confirmingId, setConfirmingId] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setLoading(true);
    try {
      const data = await adminFetchOrders();
      setOrders(Array.isArray(data) ? data : []);
    } finally {
      setLoading(false);
    }
  }

  /* =========================
     FILTER LOGIC
  ========================== */
  const filteredOrders =
    filter === "all"
      ? orders
      : orders.filter(
          (o) => o.adminStatus === filter
        );

  /* =========================
     ADMIN ACTION
  ========================== */
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

  return (
    <main
      className="space-y-6 max-w-5xl mx-auto"
      aria-label="Admin orders"
    >
      {/* HEADER */}
      <div>
        <div className="badge mb-2">Admin</div>
        <h1 className="text-3xl font-semibold">Orders</h1>
        <p className="text-muted">
          Review and fulfil doctor orders
        </p>
      </div>

      {/* FILTER */}
      <div className="flex items-center gap-2">
        <Filter size={16} className="text-muted" />
        <select
          value={filter}
          onChange={(e) =>
            setFilter(e.target.value)
          }
          className="input max-w-xs"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="completed">
            Completed
          </option>
        </select>
      </div>

      {/* ORDERS LIST */}
      {loading ? (
        <LoadingScreen />
      ) : filteredOrders.length === 0 ? (
        <div className="card text-center" aria-label="No admin orders">
          <p className="text-muted text-sm">
            No orders found.
          </p>
        </div>
      ) : (
        <div className="space-y-4" aria-label="Admin orders list">
          {filteredOrders.map((o) => (
            <section
              key={o._id}
              className="card space-y-3 relative"
              aria-label={`Order ${o._id.slice(-6)}`}
            >
              {/* TOP ROW */}
              <div className="flex items-start justify-between">
                {/* LEFT */}
                <div className="space-y-1">
                  <p className="font-medium text-sm">
                    #{o._id.slice(-6)}
                  </p>
                  <p className="text-xs text-muted">
                    Dr.{" "}
                    {o.doctor?.name ||
                      "Unknown"}
                  </p>
                  <p className="text-xs text-muted">
                    {o.items?.length || 0}{" "}
                    items
                  </p>
                </div>

                {/* RIGHT */}
                <div className="text-right space-y-1 relative">
                  {/* ✅ FINAL BILL AMOUNT */}
                  <p className="text-sm font-medium">
                    ₹
                    {o.billing?.finalAmount ??
                      0}
                  </p>

                  {/* ✅ BILLING BREAKDOWN */}
                  {o.billing && (
                    <div className="text-[11px] text-muted leading-tight">
                      <div>
                        Taxable: ₹
                        {
                          o.billing
                            .taxableAmount
                        }
                      </div>
                      <div>
                        CGST: ₹
                        {o.billing.cgstAmount}
                      </div>
                      <div>
                        SGST: ₹
                        {o.billing.sgstAmount}
                      </div>
                    </div>
                  )}

                  <span
                    className={`flex items-center justify-end gap-1 text-xs font-medium ${
                      o.adminStatus ===
                      "pending"
                        ? "text-orange-600"
                        : "text-green-600"
                    }`}
                  >
                    {o.adminStatus ===
                    "pending" ? (
                      <Clock size={14} />
                    ) : (
                      <CheckCircle size={14} />
                    )}
                    {o.adminStatus}
                  </span>

                  {o.adminStatus ===
                    "pending" && (
                    <>
                      <button
                        type="button"
                        onClick={() =>
                          setConfirmingId(
                            confirmingId ===
                              o._id
                              ? null
                              : o._id
                          )
                        }
                        className="text-xs text-primary"
                      >
                        Mark as completed
                      </button>

                      {/* CONFIRM BOX */}
                      {confirmingId ===
                        o._id && (
                        <div className="absolute right-0 mt-2 w-52 bg-white border rounded-lg shadow-lg p-3 z-20">
                          <p className="text-xs text-muted mb-2">
                            Confirm
                            completion?
                          </p>

                          <div className="flex gap-2">
                            <button
                              className="button button-outline w-full text-xs"
                              onClick={() =>
                                setConfirmingId(
                                  null
                                )
                              }
                            >
                              Cancel
                            </button>

                            <button
                              disabled={
                                updatingId ===
                                o._id
                              }
                              className="button button-primary w-full text-xs"
                              onClick={() =>
                                markCompleted(
                                  o._id
                                )
                              }
                            >
                              {updatingId ===
                              o._id
                                ? "Updating…"
                                : "Confirm"}
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>

              {/* NOTES */}
              {o.notes &&
                o.notes.trim() !== "" && (
                  <div className="bg-slate-50 border rounded-md p-2 text-xs text-slate-700">
                    <span className="font-medium">
                      Notes:
                    </span>{" "}
                    {o.notes}
                  </div>
                )}

              {/* MEDICINES */}
              <div className="pt-2 border-t text-xs text-muted space-y-1">
                {o.items.map(
                  (it, idx) => (
                    <div key={idx}>
                      •{" "}
                      {it.medicineId
                        ?.name ||
                        "Deleted medicine"}{" "}
                      × {it.quantity}
                    </div>
                  )
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}

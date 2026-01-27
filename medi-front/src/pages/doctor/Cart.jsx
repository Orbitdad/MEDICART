import React, { useState } from "react";
import { useCart } from "../../context/CartContext.jsx";
import { placeOrder } from "../../api/orders.js";
import { createRazorpayOrder, verifyRazorpayPayment } from "../../api/payment.js";
import { useNavigate } from "react-router-dom";
import "./Cart.css";

export default function Cart() {
  const {
    items,
    updateQty,
    removeFromCart,
    clearCart,
    totalAmount,
    notes,
    setNotes,
  } = useCart();

  const [paymentMode, setPaymentMode] = useState("credit");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  /* =============================
     TOTAL ITEMS (EMPTY SAFE)
  ============================== */
  const totalItems = items.reduce(
    (sum, it) => sum + Number(it.quantity || 0),
    0
  );

  /* =============================
     QTY HANDLER (EMPTY ALLOWED)
  ============================== */
  const handleQtyChange = (id, value) => {
    if (value === "") {
      updateQty(id, "");
      return;
    }

    if (!/^\d+$/.test(value)) return;

    updateQty(id, Number(value));
  };

  /* =============================
     RAZORPAY PAYMENT HANDLER
  ============================== */
  const handleRazorpayPayment = async () => {
    setLoading(true);
    setError("");

    try {
      // Create Razorpay order
      const razorpayOrder = await createRazorpayOrder(totalAmount);

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: "MediCart",
        description: `Order for ${totalItems} items`,
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            // Verify payment
            await verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Place order with payment info
            await placeOrder({
              items: items
                .filter((it) => Number(it.quantity) > 0)
                .map((it) => ({
                  medicineId: it._id,
                  quantity: Number(it.quantity),
                })),
              notes,
              paymentMode: "online",
              paymentInfo: {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
              },
            });

            clearCart();
            navigate("/doctor/order-success");
          } catch (err) {
            setError("Payment verification failed. Please try again.");
            setLoading(false);
          }
        },
        prefill: {
          name: "Doctor",
          email: "",
          contact: "",
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      // Check if Razorpay is loaded
      if (!window.Razorpay) {
        setError("Payment gateway not loaded. Please refresh the page.");
        setLoading(false);
        return;
      }

      const razorpay = new window.Razorpay(options);
      razorpay.on("payment.failed", function (response) {
        setError("Payment failed. Please try again.");
        setLoading(false);
      });
      razorpay.open();
    } catch (err) {
      setError(err.message || "Payment initialization failed. Please try again.");
      setLoading(false);
    }
  };

  /* =============================
     PLACE ORDER (COD)
  ============================== */
  const confirmPlaceOrder = async () => {
    setLoading(true);
    setError("");

    try {
      await placeOrder({
        items: items
          .filter((it) => Number(it.quantity) > 0)
          .map((it) => ({
            medicineId: it._id,
            quantity: Number(it.quantity),
          })),
        notes,
        paymentMode: "credit",
        paymentInfo: null,
      });

      clearCart();
      navigate("/doctor/order-success");
    } catch (err) {
      setError(err.message || "Order failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  /* =============================
     EMPTY CART
  ============================== */
  if (!items.length) {
    return (
      <div className="empty-cart">
        <p>Your cart is empty.</p>
        <button
          className="primary-btn"
          onClick={() => navigate("/doctor/medicines")}
        >
          Browse Medicines
        </button>
      </div>
    );
  }

  /* =============================
     UI
  ============================== */
  return (
    <div className="cart-layout">

      {/* LEFT PANEL */}
      <div className="cart-left">
        <h2 className="cart-title">Review Order</h2>

        <div className="medicine-stack">
          {items.map((it) => (
            <div key={it._id} className="medicine-row">

              <div className="med-info">
                <p className="med-name">{it.name}</p>
                <p className="med-price">
                  ₹{it.price} × {it.quantity || 0}
                  <span>
                    ₹{Number(it.price) * Number(it.quantity || 0)}
                  </span>
                </p>
              </div>

              <div className="med-actions">
                <div className="qty-control">
                  <button
                    onClick={() =>
                      updateQty(
                        it._id,
                        Number(it.quantity || 0) - 1
                      )
                    }
                  >
                    −
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    className="qty-input"
                    value={it.quantity}
                    placeholder="Qty"
                    onChange={(e) =>
                      handleQtyChange(it._id, e.target.value)
                    }
                  />

                  <button
                    onClick={() =>
                      updateQty(
                        it._id,
                        Number(it.quantity || 0) + 1
                      )
                    }
                  >
                    +
                  </button>
                </div>

                <button
                  className="remove-link"
                  onClick={() => removeFromCart(it._id)}
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="cart-right">
        <div className="snapshot-card">
          <h3>Order Snapshot</h3>

          <div className="snapshot-row">
            <span>Total Items</span>
            <span>{totalItems}</span>
          </div>

          <div className="snapshot-row total">
            <span>Total Amount</span>
            <span>₹{totalAmount}</span>
          </div>

          <div className="snapshot-section">
            <label>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="snapshot-section">
            <label>Payment</label>

            <label className="radio">
              <input
                type="radio"
                checked={paymentMode === "credit"}
                onChange={() => setPaymentMode("credit")}
              />
              Cash on Delivery
            </label>

            <label className="radio">
              <input
                type="radio"
                checked={paymentMode === "online"}
                onChange={() => setPaymentMode("online")}
              />
              Pay Now
            </label>
          </div>

          {error && <p className="error">{error}</p>}

          <button
            className="primary-btn"
            disabled={loading}
            onClick={() =>
              paymentMode === "online"
                ? handleRazorpayPayment()
                : confirmPlaceOrder()
            }
          >
            {loading ? "Processing..." : "Confirm Order"}
          </button>
        </div>
      </div>

    </div>
  );
}

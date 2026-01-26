import React, { useState } from "react";
import { useCart } from "../../context/CartContext.jsx";
import { placeOrder } from "../../api/orders.js";
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


  const totalItems = items.reduce(
    (sum, it) => sum + it.quantity,
    0
  );

  const handleQtyChange = (id, value) => {
    // allow empty input
    if (value === "") {
      updateQty(id, "");
      return;
    }

    // allow only numbers
    if (!/^\d+$/.test(value)) return;

    updateQty(id, Number(value));
  };



  const confirmPlaceOrder = async (paymentInfo = null) => {
    setLoading(true);
    setError("");

    try {
      await placeOrder({
        items: items.map((it) => ({
          medicineId: it._id,
          quantity: it.quantity,
        })),
        notes,
        paymentMode: paymentInfo ? "online" : "credit",
        paymentInfo,
      });

      clearCart();
      navigate("/doctor/order-success");
    } catch {
      setError("Order failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

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
                  ₹{it.price} × {it.quantity}
                  <span>₹{it.price * it.quantity}</span>
                </p>
              </div>

              <div className="med-actions">
                <div className="qty-control">
                  <button
                    onClick={() =>
                      updateQty(it._id, Math.max(1, it.quantity - 1))
                    }
                  >
                    −
                  </button>

                  <input
                    type="text"
                    inputMode="numeric"
                    className="qty-input"
                    value={it.quantity}
                    onChange={(e) =>
                      handleQtyChange(it._id, e.target.value)
                    }
                  />

                  <button
                    onClick={() =>
                      updateQty(it._id, it.quantity + 1)
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
                ? alert("Online flow later")
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

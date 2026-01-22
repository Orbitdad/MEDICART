import React, { useState } from "react";
import { useCart } from "../../context/CartContext.jsx";
import { placeOrder } from "../../api/orders.js";
import { useNavigate } from "react-router-dom";

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

  const [paymentMode, setPaymentMode] = useState("later");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirming, setConfirming] = useState(false);

  const navigate = useNavigate();

  const itemCount = items.reduce(
    (sum, it) => sum + it.quantity,
    0
  );

  /* =====================================================
     PLACE ORDER (USED AFTER PAYMENT OR PAY LATER)
  ====================================================== */
  const confirmPlaceOrder = async () => {
    setConfirming(false);
    setLoading(true);
    setError("");

    try {
      await placeOrder({
        items: items.map((it) => ({
          medicineId: it._id,
          quantity: it.quantity,
        })),
        notes,
        paymentMode,
      });

      clearCart();
      navigate("/doctor/order-success");
    } catch {
      setError("Order failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     RAZORPAY PAYMENT
  ====================================================== */
  const handleOnlinePayment = async () => {
    try {
      setLoading(true);
      setError("");

      // 1️⃣ Create Razorpay order from backend
      const res = await fetch(
        `${BASE}/payment/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: totalAmount,
          }),
        }
      );

      const order = await res.json();

      // 2️⃣ Razorpay checkout options
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        order_id: order.id,
        name: "MediCart",
        description: "Medicine Order Payment",

        handler: async function (response) {
          // 3️⃣ Verify payment on backend
          const verify = await fetch(
            `${BASE}/payment/verify`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            }
          );

          const data = await verify.json();

          if (data.success) {
            await confirmPlaceOrder();
          } else {
            setError("Payment verification failed.");
          }
        },

        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch {
      setError("Payment failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /* =====================================================
     EMPTY CART
  ====================================================== */
  if (!items.length) {
    return (
      <div className="card text-center max-w-md mx-auto">
        <p className="text-muted">Your cart is empty.</p>
        <button
          className="button button-primary mt-4"
          onClick={() => navigate("/doctor/medicines")}
        >
          Browse Medicines
        </button>
      </div>
    );
  }

  /* =====================================================
     UI
  ====================================================== */
  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* HEADER */}
      <div className="text-center">
        <h2 className="text-2xl font-semibold">Review Order</h2>
        <p className="text-muted text-sm mt-1">
          {itemCount} items in your cart
        </p>
      </div>

      {/* ITEMS */}
      <div className="card space-y-4">
        {items.map((it) => (
          <div
            key={it._id}
            className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-none"
          >
            <div>
              <p className="font-medium">{it.name}</p>
              <p className="text-xs text-muted">
                ₹{it.price} × {it.quantity}
              </p>

              {it.quantity >= it.stock && (
                <p className="text-xs text-red-400 mt-1">
                  Max stock reached
                </p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center border rounded-lg">
                <button
                  className="px-2"
                  onClick={() =>
                    updateQty(it._id, it.quantity - 1)
                  }
                >
                  –
                </button>
                <span className="px-3 text-sm">
                  {it.quantity}
                </span>
                <button
                  className="px-2"
                  onClick={() =>
                    updateQty(it._id, it.quantity + 1)
                  }
                >
                  +
                </button>
              </div>

              <button
                onClick={() => setConfirming(it._id)}
                className="text-red-400 text-xs hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* NOTES */}
      <div className="card">
        <label className="label">Notes (optional)</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any special instructions?"
          className="input min-h-[80px]"
        />
      </div>

      {/* SUMMARY */}
      <div className="card space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted">
            Subtotal ({itemCount} items)
          </span>
          <span>₹{totalAmount}</span>
        </div>

        <div className="flex justify-between font-semibold">
          <span>Total Amount</span>
          <span className="text-primary">₹{totalAmount}</span>
        </div>
      </div>

      {/* PAYMENT MODE */}
      <div className="card space-y-2">
        <p className="font-medium">Payment Option</p>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={paymentMode === "later"}
            onChange={() => setPaymentMode("later")}
          />
          Pay Later (Hospital Credit)
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="radio"
            checked={paymentMode === "now"}
            onChange={() => setPaymentMode("now")}
          />
          Pay Now
        </label>
      </div>

      {error && (
        <p className="text-red-400 text-sm">{error}</p>
      )}

      {/* PLACE ORDER BUTTON */}
      <button
        disabled={loading}
        className="button button-primary w-full py-3 text-base"
        onClick={() => {
          if (paymentMode === "now") {
            handleOnlinePayment();
          } else {
            setConfirming("order");
          }
        }}
      >
        {loading ? "Processing..." : "Place Order"}
      </button>

      {/* CONFIRM MODAL */}
      {confirming && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="card max-w-sm w-full text-center">
            <h3 className="font-semibold">
              {confirming === "order"
                ? "Place this order?"
                : "Remove item?"}
            </h3>

            <p className="text-muted text-sm mt-2">
              {confirming === "order"
                ? "This action cannot be undone."
                : "This item will be removed from your cart."}
            </p>

            <div className="flex gap-3 mt-5">
              <button
                className="button button-outline w-full"
                onClick={() => setConfirming(false)}
              >
                Cancel
              </button>

              <button
                className="button button-primary w-full"
                onClick={() => {
                  if (confirming === "order") {
                    confirmPlaceOrder();
                  } else {
                    removeFromCart(confirming);
                    setConfirming(false);
                  }
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

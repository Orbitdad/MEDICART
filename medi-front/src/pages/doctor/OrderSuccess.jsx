import React from "react";
import { useNavigate } from "react-router-dom";
import { CheckCircle } from "lucide-react";

export default function OrderSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="card max-w-md w-full text-center space-y-5">
        {/* ICON */}
        <div className="flex justify-center">
          <CheckCircle
            size={72}
            className="text-green-500"
          />
        </div>

        {/* MESSAGE */}
        <div>
          <h2 className="text-2xl font-semibold">
            Order Placed Successfully
          </h2>
          <p className="text-muted text-sm mt-2">
            Your order has been received and is being processed.
          </p>
        </div>

        {/* WHAT NEXT */}
        <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-sm text-green-700">
          You’ll be notified once the order is approved and dispatched.
        </div>

        {/* ACTIONS */}
        <div className="flex flex-col gap-3">
          <button
            className="button button-primary w-full"
            onClick={() => navigate("/doctor/medicines")}
          >
            Place Another Order
          </button>

          <button
            className="button button-outline w-full"
            onClick={() => navigate("/doctor/home")}
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}

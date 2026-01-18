import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { ChevronRight } from "lucide-react";

export default function DoctorHome() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { items } = useCart();

  const hasCartItems = items.length > 0;

  return (
    <div className="space-y-6">
      {/* HERO */}
      <section className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold leading-tight">
              Welcome back, {user?.name}
            </h1>

            <p className="text-muted mt-1 text-sm md:text-base">
              Order medicines and track requests securely
            </p>

            {/* CHIPS (VISUALLY DEMOTED) */}
            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="chip text-xs">Pay Later Enabled</span>
              <span className="chip text-xs">Live Inventory</span>
            </div>
          </div>

          {/* CTA — DOMINANT */}
          <button
            className="button button-primary w-full md:w-auto mt-3 md:mt-0 shadow-lg"
            onClick={() => navigate("/doctor/medicines")}
          >
            + Place New Order
          </button>
        </div>
      </section>

      {/* QUICK STATS */}
      <section className="stats-grid">
        <div
          className="card cursor-pointer transition hover:shadow-md"
          onClick={() => navigate("/doctor/cart")}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Cart</h3>
            <ChevronRight size={16} className="text-muted" />
          </div>
          <p className="text-muted mt-1 text-sm">
            {hasCartItems ? `${items.length} items` : "Empty"}
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium">Payment</h3>
          <p className="text-muted mt-1 text-sm">
            Hospital Credit
          </p>
        </div>

        <div
          className="card cursor-pointer transition hover:shadow-md"
          onClick={() => navigate("/doctor/medicines")}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Medicines</h3>
            <ChevronRight size={16} className="text-muted" />
          </div>
          <p className="text-muted mt-1 text-sm">
            Browse inventory
          </p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium">Orders</h3>
          <p className="text-muted mt-1 text-sm">
            Recent activity
          </p>
        </div>
      </section>

      {/* EMPTY STATE (CALM, GUIDING) */}
      {!hasCartItems && (
        <section className="card text-center">
          <p className="text-muted text-sm">
            You haven’t added any medicines yet.
          </p>
          <button
            className="button button-primary mt-3 w-full md:w-auto"
            onClick={() => navigate("/doctor/medicines")}
          >
            Browse Medicines
          </button>
        </section>
      )}
    </div>
  );
}

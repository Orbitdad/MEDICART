import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import { getRecentOrders } from "../../api/orders";


import heroImage from "../../../assets/hero.png";
import "./DoctorHome.css";

export default function DoctorHome() {
  const navigate = useNavigate();
  const [recentOrders, setRecentOrders] = useState([]);

  const { user } = useAuth() || {};
  const { items = [] } = useCart() || {};

  const hasCartItems = items.length > 0;

  useEffect(() => {
    getRecentOrders()
      .then(setRecentOrders)
      .catch(() => { });
  }, []);

  return (
    <>
      {/* ================= HERO BANNER ================= */}
      {/* ================= HERO WITH FLOATING SEARCH ================= */}
      <div className="hero-wrapper">
        <div className="hero-banner">
          <img src={heroImage} alt="MediCart banner" />

          {/* floating search */}
          <div className="hero-search">
            <input
              type="text"
              placeholder="Search medicines, salts, brands..."
            />
          </div>
        </div>
      </div>

      {/* ================= WELCOME CARD ================= */}
      <section className="card">
        <div className="welcome-row">
          <div>
            <h2>
              Welcome back{user?.name ? `, ${user.name}` : ""}
            </h2>

            <p className="muted">
              Order medicines and track requests securely
            </p>

            <div className="chip-row">
              <span className="chip small">Pay Later Enabled</span>
              <span className="chip small">Live Inventory</span>
            </div>
          </div>

          <button
            className="btn-primary"
            onClick={() => navigate("/doctor/medicines")}
          >
            + Place New Order
          </button>
        </div>
      </section>

      {/* ================= QUICK STATS ================= */}
      <section className="stats-grid">
        <div
          className="card clickable"
          onClick={() => navigate("/doctor/cart")}
        >
          <div className="stat-header">
            <h4>Cart</h4>
            <ChevronRight size={16} />
          </div>
          <p className="muted">
            {hasCartItems ? `${items.length} items` : "Empty"}
          </p>
        </div>

        <div className="card">
          <h4>Payment</h4>
          <p className="muted">Hospital Credit</p>
        </div>

        <div
          className="card clickable"
          onClick={() => navigate("/doctor/medicines")}
        >
          <div className="stat-header">
            <h4>Medicines</h4>
            <ChevronRight size={16} />
          </div>
          <p className="muted">Browse inventory</p>
        </div>

        <div className="card">
          <h4>Orders</h4>
          <p className="muted">
            {recentOrders.length > 0
              ? `${recentOrders.length} recent orders`
              : "No recent orders"}
          </p>
        </div>
      </section>

      {/* ================= EMPTY STATE ================= */}
      {!hasCartItems && (
        <section className="card center">
          <p className="muted">
            You haven't added any medicines yet.
          </p>

          <button
            className="btn-primary"
            onClick={() => navigate("/doctor/medicines")}
          >
            Browse Medicines
          </button>
        </section>
      )}
    </>
  );
}

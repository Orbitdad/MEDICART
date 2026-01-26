import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight } from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { getRecentOrders } from "../../api/orders";

import heroImage from "../../../assets/hero.png";
import "./DoctorHome.css";

export default function DoctorHome() {
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const { items = [] } = useCart() || {};

  const [recentOrders, setRecentOrders] = useState([]);

  const hasCartItems = items.length > 0;

  useEffect(() => {
    getRecentOrders()
      .then(setRecentOrders)
      .catch(() => {});
  }, []);

  return (
    <>
      {/* ================= HERO ================= */}
      <div className="hero-wrapper">
        <div className="hero-banner">
          <img src={heroImage} alt="MediCart Banner" />

          {/* <div className="hero-search">
            <input
              type="text"
              placeholder="Search medicines, salts, brands..."
            />
          </div> */}
        </div>
      </div>

      {/* ================= WELCOME ================= */}
      <section className="card">
        <div className="welcome-row">
          <div>
            <h2>Welcome{user?.name ? `, ${user.name}` : ""}</h2>
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

      {/* ================= STATS ================= */}
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

      {/* ================= EMPTY ================= */}
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

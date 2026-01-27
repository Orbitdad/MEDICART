import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, Search, ShoppingCart, Pill, FileText, CreditCard } from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { getRecentOrders } from "../../api/orders";

import "./DoctorHome.css";

export default function DoctorHome() {
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const { items = [] } = useCart() || {};

  const [recentOrders, setRecentOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const hasCartItems = items.length > 0;

  useEffect(() => {
    getRecentOrders()
      .then(setRecentOrders)
      .catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctor/medicines?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/doctor/medicines");
    }
  };

  return (
    <>

      {/* ================= SEARCH BAR ================= */}
      <section className="search-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-container-main">
            <Search size={18} className="search-icon-main" />
            <input
              type="text"
              placeholder="Search medicines, salts, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input-main"
            />
          </div>
        </form>
      </section>

      {/* ================= WELCOME ================= */}
      <section className="welcome-section">
        <div className="welcome-content">
          <div className="welcome-text">
            <h1 className="welcome-title">
              Welcome{user?.name ? `, ${user.name}` : ""}
            </h1>
            <p className="welcome-subtitle">
              Order medicines and track requests securely
            </p>
            <div className="chip-row">
              <span className="chip chip-success">Pay Later Enabled</span>
              <span className="chip chip-info">Live Inventory</span>
            </div>
          </div>
          <button
            className="btn-primary-action"
            onClick={() => navigate("/doctor/medicines")}
          >
            <Pill size={18} />
            Place New Order
          </button>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="stats-section">
        <div className="stats-grid">
          <div
            className="stat-card stat-card-clickable"
            onClick={() => navigate("/doctor/cart")}
          >
            <div className="stat-icon-wrapper stat-icon-cart">
              <ShoppingCart size={20} />
            </div>
            <div className="stat-content">
              <h3 className="stat-title">Cart</h3>
              <p className="stat-value">
                {hasCartItems ? `${items.length} items` : "Empty"}
              </p>
            </div>
            <ChevronRight size={18} className="stat-arrow" />
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-payment">
              <CreditCard size={20} />
            </div>
            <div className="stat-content">
              <h3 className="stat-title">Payment</h3>
              <p className="stat-value">Hospital Credit</p>
            </div>
          </div>

          <div
            className="stat-card stat-card-clickable"
            onClick={() => navigate("/doctor/medicines")}
          >
            <div className="stat-icon-wrapper stat-icon-medicine">
              <Pill size={20} />
            </div>
            <div className="stat-content">
              <h3 className="stat-title">Medicines</h3>
              <p className="stat-value">Browse inventory</p>
            </div>
            <ChevronRight size={18} className="stat-arrow" />
          </div>

          <div className="stat-card">
            <div className="stat-icon-wrapper stat-icon-orders">
              <FileText size={20} />
            </div>
            <div className="stat-content">
              <h3 className="stat-title">Orders</h3>
              <p className="stat-value">
                {recentOrders.length > 0
                  ? `${recentOrders.length} recent`
                  : "No recent orders"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= EMPTY STATE ================= */}
      {!hasCartItems && (
        <section className="empty-state-section">
          <div className="empty-state-card">
            <p className="empty-state-text">
              You haven't added any medicines yet.
            </p>
            <button
              className="btn-primary-action"
              onClick={() => navigate("/doctor/medicines")}
            >
              <Pill size={18} />
              Browse Medicines
            </button>
          </div>
        </section>
      )}
    </>
  );
}

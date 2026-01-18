import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./MobileBottomNav.css";

function MobileBottomNav() {
  const { role, isAuthenticated } = useAuth();
  const { pathname } = useLocation();

  if (!isAuthenticated) return null;

  return (
    <nav className="mobile-bottom-nav">
      {role === "doctor" && (
        <>
          <Link to="/doctor/home" className={pathname.includes("/doctor/home") ? "active" : ""}>
            Home
          </Link>
          <Link to="/doctor/medicines" className={pathname.includes("/doctor/medicines") ? "active" : ""}>
            Medicines
          </Link>
          <Link to="/doctor/cart" className={pathname.includes("/doctor/cart") ? "active" : ""}>
            Cart
          </Link>
          <Link to="/doctor/profile" className={pathname.includes("/doctor/profile") ? "active" : ""}>
            Profile
          </Link>
        </>
      )}

      {role === "admin" && (
        <>
          <Link to="/admin/dashboard">Dashboard</Link>
          <Link to="/admin/orders">Orders</Link>
          <Link to="/admin/medicines">Medicines</Link>
          <Link to="/admin/inventory">Inventory</Link>
        </>
      )}
    </nav>
  );
}

export default MobileBottomNav;

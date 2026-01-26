import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import "./Navbar.css";
// import logo from "../../assets/SSS logo.png";


function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { role, logout, user, isAuthenticated } = useAuth();

  const onLogout = () => {
    const redirect =
      role === "admin" ? "/admin/login" : "/doctor/login";
    logout();
    navigate(redirect);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
      {/* <img src={logo} alt="MediCart Logo" className="logo" /> */}
        <div
          className="navbar-logo"
          onClick={() => {
            if (role === "admin") navigate("/admin/dashboard");
            else if (role === "doctor") navigate("/doctor/home");
            else navigate("/");
          }}
        >
          <span className="logo-main">Medi</span>
          <span className="logo-accent">Cart</span>
        </div>

        {/* DESKTOP LINKS */}
        <nav className="nav-links">
          {!isAuthenticated && (
            <>
              <Link
                to="/doctor/login"
                className={pathname.includes("/doctor/login") ? "active" : ""}
              >
                Doctor Login
              </Link>
              <Link
                to="/admin/login"
                className={pathname.includes("/admin/login") ? "active" : ""}
              >
                Admin Login
              </Link>
            </>
          )}

          {role === "doctor" && (
            <>
              <Link to="/doctor/home">Home</Link>
              <Link to="/doctor/medicines">Medicines</Link>
              <Link to="/doctor/cart">Cart</Link>
              <Link to="/doctor/profile">Profile</Link>
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

        {/* RIGHT */}
        {isAuthenticated && (
          <div className="navbar-right">
            <span className="nav-user">
              {user?.name}
              <span className="nav-role">{role}</span>
            </span>
            <button className="nav-logout" onClick={onLogout}>
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default Navbar;

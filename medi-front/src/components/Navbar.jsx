import React, { useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Search, MapPin, ShoppingCart, Menu, X, Download } from "lucide-react";
import { useAuth } from "../context/AuthContext.jsx";
import { useCart } from "../context/CartContext.jsx";
import "./Navbar.css";

function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { role, logout, user, isAuthenticated } = useAuth();
  const { items = [] } = useCart() || {};
  const [searchQuery, setSearchQuery] = useState("");
  const [locationText, setLocationText] = useState("Deliver to");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationDropdownOpen, setLocationDropdownOpen] = useState(false);
  
  // Ref for secret admin tap login
  const adminTapRef = useRef({ count: 0, lastTap: 0 });

  const cartCount = items.length;
  const isLanding = pathname === "/";

  const onLogout = () => {
    const redirect = role === "admin" ? "/admin/login" : "/doctor/login";
    logout();
    navigate(redirect);
    setMobileMenuOpen(false);
  };

  const goHome = () => {
    const now = Date.now();
    const { count, lastTap } = adminTapRef.current;

    // Secret 5-tap logic
    if (now - lastTap < 800) {
      adminTapRef.current.count = count + 1;
      // 4 means 5 total taps including the first one (0, 1, 2, 3, 4)
      if (adminTapRef.current.count >= 4) {
        adminTapRef.current.count = 0;
        navigate("/admin/login");
        setMobileMenuOpen(false);
        return; // Don't fall through to normal goHome logic
      }
    } else {
      adminTapRef.current.count = 0; // Reset if too slow
    }
    adminTapRef.current.lastTap = now;

    if (role === "admin") navigate("/admin/dashboard");
    else if (role === "doctor") navigate("/doctor/home");
    else navigate("/");
    setMobileMenuOpen(false);
  };


  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (isAuthenticated && role === "admin") {
      navigate(q ? `/admin/inventory?search=${encodeURIComponent(q)}` : "/admin/inventory");
    } else if (isAuthenticated && role === "doctor") {
      navigate(q ? `/doctor/medicines?search=${encodeURIComponent(q)}` : "/doctor/medicines");
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button type="button" className="navbar-logo" onClick={goHome} aria-label="MediCart Home">
          <span className="logo-text">
            <span className="logo-main">Medi</span>
            <span className="logo-accent">Cart</span>
          </span>
        </button>

        {isAuthenticated && (
          <form onSubmit={handleSearch} className="navbar-search-wrap">
            <Search size={18} className="navbar-search-icon" aria-hidden />
            <input
              type="text"
              placeholder="Search medicines, salts, brands..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="navbar-search-input"
              aria-label="Search medicines"
            />
          </form>
        )}


        <div className="navbar-actions">
          <a href={`${import.meta.env.BASE_URL}medicart.apk`} download className="navbar-btn navbar-btn-apk" aria-label="Download App APK">
            <Download size={16} strokeWidth={2.5} style={{ marginRight: "6px" }} /> App
          </a>

          {!isAuthenticated && (
            <>
              <Link to="/doctor/login" className="navbar-link navbar-link-login">Login</Link>
              <Link to="/doctor/signup" className="navbar-btn navbar-btn-signup">Sign up</Link>
            </>
          )}

          {role === "doctor" && (
            <>
              <nav className="navbar-nav-links">
                <Link to="/doctor/home" className={pathname === "/doctor/home" ? "active" : ""}>Home</Link>
                <Link to="/doctor/medicines" className={pathname.includes("/doctor/medicines") ? "active" : ""}>Medicines</Link>
                <Link to="/doctor/orders" className={pathname.includes("/doctor/orders") ? "active" : ""}>Orders</Link>
                <Link to="/doctor/profile" className={pathname.includes("/doctor/profile") ? "active" : ""}>Profile</Link>
              </nav>
              <span className="navbar-user-name">{user?.name}</span>
              <button type="button" className="nav-logout" onClick={onLogout}>Logout</button>
            </>
          )}

          {role === "admin" && (
            <>
              <nav className="navbar-nav-links">
                <Link to="/admin/dashboard">Dashboard</Link>
                <Link to="/admin/orders">Orders</Link>
                <Link to="/admin/inventory">Inventory</Link>
                <Link to="/admin/payments">Payments</Link>
              </nav>
              <span className="navbar-user-name">{user?.name}</span>
              <button type="button" className="nav-logout" onClick={onLogout}>Logout</button>
            </>
          )}

          {(isLanding || role === "doctor") && (
            <Link to={isAuthenticated && role === "doctor" ? "/doctor/cart" : "/doctor/login"} className="navbar-cart">
              <ShoppingCart size={20} aria-hidden />
              <span className="navbar-cart-label">Cart</span>
              {cartCount > 0 && <span className="navbar-cart-badge">{cartCount}</span>}
            </Link>
          )}
        </div>

        <button
          type="button"
          className="navbar-mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="navbar-mobile-menu">
          {isAuthenticated && (
            <form onSubmit={handleSearch} className="navbar-mobile-search">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search medicines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="navbar-mobile-search-input"
              />
            </form>
          )}
          <div className="navbar-mobile-location">
            <MapPin size={16} />
            <span>{locationText}</span>
          </div>
          <nav className="navbar-mobile-links">
            <a href={`${import.meta.env.BASE_URL}medicart.apk`} download onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={18} /> Download App
            </a>
            {!isAuthenticated && (
              <>
                <Link to="/doctor/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
                <Link to="/doctor/signup" onClick={() => setMobileMenuOpen(false)}>Sign up</Link>
              </>
            )}
            {role === "doctor" && (
              <>
                <Link to="/doctor/home" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                <Link to="/doctor/medicines" onClick={() => setMobileMenuOpen(false)}>Medicines</Link>
                <Link to="/doctor/orders" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
                <Link to="/doctor/profile" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                <Link to="/doctor/cart" onClick={() => setMobileMenuOpen(false)}>Cart {cartCount > 0 && `(${cartCount})`}</Link>
                <button type="button" onClick={onLogout}>Logout</button>
              </>
            )}
            {role === "admin" && (
              <>
                <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)}>Dashboard</Link>
                <Link to="/admin/orders" onClick={() => setMobileMenuOpen(false)}>Orders</Link>
                <Link to="/admin/inventory" onClick={() => setMobileMenuOpen(false)}>Inventory</Link>
                <Link to="/admin/payments" onClick={() => setMobileMenuOpen(false)}>Payments</Link>
                <button type="button" onClick={onLogout}>Logout</button>
              </>
            )}
            {isLanding && !isAuthenticated && (
              <Link to="/doctor/cart" onClick={() => setMobileMenuOpen(false)}>Cart</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export default Navbar;

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronRight,
  Search,
  ShoppingCart,
  Pill,
  FileText,
  CreditCard,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { getRecentOrders } from "../../api/orders";
import doctorHeroImg from "../../public/illustrations/shreelogo.png";
import ParallaxHero from "../../components/ParallaxHero.jsx";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./DoctorHome.css";

gsap.registerPlugin(ScrollTrigger);

export default function DoctorHome() {
  const navigate = useNavigate();
  const { user } = useAuth() || {};
  const { items = [] } = useCart() || {};

  const [recentOrders, setRecentOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const hasCartItems = items.length > 0;

  /* =========================
     LOAD RECENT ORDERS (SAFE)
  ========================= */
  useEffect(() => {
    getRecentOrders()
      .then((res) => {
        // ✅ HARD GUARANTEE ARRAY
        if (Array.isArray(res)) {
          console.log("Recent Orders Detailed:", res.map(o => ({
            id: o._id,
            payStatus: o.paymentStatus,
            payMode: o.paymentMode,
            total: o.billing?.finalAmount,
            billingFinal: o.billing?.finalAmount
          })));
          setRecentOrders(res);
        } else {
          setRecentOrders([]);
        }
      })
      .catch(() => {
        setRecentOrders([]);
      });
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    navigate(
      q
        ? `/doctor/medicines?search=${encodeURIComponent(q)}`
        : "/doctor/medicines"
    );
  };

  useEffect(() => {
    const triggers = [];

    // We select sections that should fade in
    const sections = gsap.utils.toArray([
      ".welcome-section", 
      ".stats-section",
      ".empty-state-section"
    ].join(","));

    sections.forEach(section => {
      if(!section) return;
      const sectionAnim = gsap.fromTo(section, 
        { opacity: 0, y: 60, scale: 0.98 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 1.2,
          ease: "expo.out",
          scrollTrigger: {
            trigger: section,
            start: "top 85%",
          }
        }
      );
      triggers.push(sectionAnim.scrollTrigger);

      // Stagger child elements
      const children = section.querySelectorAll(".welcome-content > *, .stats-grid > *");
      if(children.length > 0) {
        const childrenAnim = gsap.fromTo(children,
          { opacity: 0, y: 30, scale: 0.96 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 1,
            stagger: 0.1,
            ease: "expo.out",
            scrollTrigger: {
              trigger: section,
              start: "top 85%",
            }
          }
        );
        triggers.push(childrenAnim.scrollTrigger);
      }
    });

    return () => {
      triggers.forEach(t => { if(t) t.kill(); });
    };
  }, [hasCartItems]);

  return (
    <>
      <section className="landing-hero">
        <ParallaxHero />
        <div className="landing-hero-inner">
          {/* Flow: image above, then Shree Sai text, subtitle, search, chips */}
          <div className="landing-hero-visual anti-gravity-2">
            <div className="landing-hero-image-wrap">
              <img
                src={doctorHeroImg}
                alt="Healthcare professional and medicines"
                className="landing-hero-image anti-gravity-3"
                width={400}
                height={320}
              />
            </div>
          </div>
          <div className="landing-hero-content anti-gravity-1">
            <h1 className="landing-hero-title">
              Shree Sai Surgical <br />
              <span className="landing-hero-title-accent">Pharmaceutical & Surgical Distributor</span>
            </h1>
            <p className="landing-hero-subtitle">
              Ghatkopar (W), Mumbai – 86. Order medicines, surgical instruments & supplies.
              Contact: 9833667560, 9967684004 · shreesaisurgical16@yahoo.in
            </p>
            <form onSubmit={handleSearch} className="landing-hero-search">
              <Search size={20} className="landing-hero-search-icon" aria-hidden />
              <input
                type="text"
                placeholder="Search for medicines, salts, or brands..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="landing-hero-search-input"
                aria-label="Search medicines"
              />
              <button type="submit" className="landing-hero-search-btn">
                Search
              </button>
            </form>
            <div className="landing-hero-chips">
              <span className="landing-chip">Pharmaceutical</span>
              <span className="landing-chip">Surgical</span>
              <span className="landing-chip">Trusted distributor</span>
            </div>
          </div>
        </div>
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
              <h3 className="stat-title">Outstanding Due</h3>
              <p className="stat-value">
                ₹
                {recentOrders
                  .filter((o) => o?.paymentStatus === "pending")
                  .reduce((sum, o) => sum + (o.billing?.finalAmount || 0), 0)
                  .toFixed(2)}
              </p>
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

          <div
            className="stat-card stat-card-clickable"
            onClick={() => navigate("/doctor/orders")}
          >
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

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext.jsx";
import { useCart } from "../../context/CartContext.jsx";
import { ChevronRight } from "lucide-react";

// hero image from assets
import heroImage from "../../../assets/hero.png";

export default function DoctorHome() {
  const navigate = useNavigate();

  const { user } = useAuth() || {};
  const { items = [] } = useCart() || {};

  const hasCartItems = items.length > 0;

  return (
    <>
      {/* =========================
          HERO IMAGE BANNER
          Edge-to-edge on mobile, contained on desktop
      ========================== */}
      <div className="w-full -mx-8 overflow-hidden md:rounded-xl md:mx-0 md:px-4 md:px-6 lg:px-8">
        <div className="relative w-full h-[240px] sm:h-[280px] md:h-[320px]">
          <img
            src={heroImage}
            alt="MediCart banner"
            className="absolute inset-0 w-full h-full object-cover"
            loading="eager"
          />
        </div>
      </div>

      {/* Content wrapper with padding */}
      <div className="w-full px-4 md:px-6 lg:px-8 space-y-6">


      {/* =========================
          HERO CONTENT
      ========================== */}
<div
  className="
    bg-white rounded-xl p-6 md:p-10 shadow-sm
    md:-mt-16
    relative z-10
    md:max-w-6xl md:mx-auto
  "
>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          MediCart Medical Store
        </h1>

        <p className="text-gray-600 mt-2">
          Verified supplier • Trusted hospital medicine partner
        </p>

        {/* Search bar */}
        <div className="mt-5 max-w-xl">
          <input
            type="text"
            placeholder="Search medicines, salts, brands..."
            className="w-full px-6 py-3 rounded-full border outline-none shadow-sm"
          />
        </div>

        {/* Trust chips */}
        <div className="flex gap-3 mt-4 flex-wrap">
          <span className="bg-green-100 text-green-700 text-sm px-4 py-1 rounded-full">
            Pay Later
          </span>
          <span className="bg-blue-100 text-blue-700 text-sm px-4 py-1 rounded-full">
            Live Inventory
          </span>
          <span className="bg-purple-100 text-purple-700 text-sm px-4 py-1 rounded-full">
            Fast Fulfillment
          </span>
        </div>
      </div>

      {/* =========================
          WELCOME CARD
      ========================== */}
      <section className="card">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl md:text-2xl font-semibold leading-tight">
              Welcome back{user?.name ? `, ${user.name}` : ""}
            </h1>

            <p className="text-muted mt-1 text-sm md:text-base">
              Order medicines and track requests securely
            </p>

            <div className="flex gap-2 mt-2 flex-wrap">
              <span className="chip text-xs">Pay Later Enabled</span>
              <span className="chip text-xs">Live Inventory</span>
            </div>
          </div>

          <button
            className="button button-primary w-full md:w-auto mt-3 md:mt-0 shadow-lg"
            onClick={() => navigate("/doctor/medicines")}
          >
            + Place New Order
          </button>
        </div>
      </section>

      {/* =========================
          QUICK STATS
      ========================== */}
<section className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
          <p className="text-muted mt-1 text-sm">Hospital Credit</p>
        </div>

        <div
          className="card cursor-pointer transition hover:shadow-md"
          onClick={() => navigate("/doctor/medicines")}
        >
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Medicines</h3>
            <ChevronRight size={16} className="text-muted" />
          </div>

          <p className="text-muted mt-1 text-sm">Browse inventory</p>
        </div>

        <div className="card">
          <h3 className="text-sm font-medium">Orders</h3>
          <p className="text-muted mt-1 text-sm">Recent activity</p>
        </div>
      </section>

      {/* =========================
          EMPTY STATE
      ========================== */}
      {!hasCartItems && (
        <section className="card text-center">
          <p className="text-muted text-sm">
            You haven't added any medicines yet.
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
    </>
  );
}

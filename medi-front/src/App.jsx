import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar.jsx";
import MobileBottomNav from "./components/MobileBottomNav.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import InitialLoadingScreen from "./components/InitialLoadingScreen.jsx";

/* =========================
   DOCTOR PAGES
========================= */
import DoctorLogin from "./pages/doctor/DoctorLogin.jsx";
import DoctorSignup from "./pages/doctor/DoctorSignup.jsx";
import Home from "./pages/doctor/Home.jsx";
import DoctorOrders from "./pages/doctor/Orders.jsx";
import MedicineList from "./pages/doctor/MedicineList.jsx";
import Cart from "./pages/doctor/Cart.jsx";
import OrderSuccess from "./pages/doctor/OrderSuccess.jsx";
import InvoicePage from "./pages/doctor/InvoicePage.jsx";
import Profile from "./pages/doctor/Profile.jsx";

/* =========================
   ADMIN PAGES
========================= */
import AdminLogin from "./pages/admin/AdminLogin.jsx";
import Dashboard from "./pages/admin/Dashboard.jsx";
import Orders from "./pages/admin/Orders.jsx";
import Medicines from "./pages/admin/Medicines.jsx";
import Inventory from "./pages/admin/Inventory.jsx";

function App() {
  return (
    <div className="app-root">
      {/* INITIAL LOADING SCREEN */}
      <InitialLoadingScreen />

      {/* DESKTOP NAVBAR */}
      <Navbar />

      {/* MAIN CONTENT */}
      <main className="app-main">
        <Routes>
          {/* ROOT */}
          <Route path="/" element={<Navigate to="/doctor/login" replace />} />

          {/* AUTH */}
          <Route path="/doctor/login" element={<DoctorLogin />} />
          <Route path="/doctor/signup" element={<DoctorSignup />} />
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* DOCTOR ROUTES */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["doctor"]}
                redirectTo="/doctor/login"
              />
            }
          >
            <Route path="/doctor/home" element={<Home />} />
            <Route path="/doctor/orders" element={<DoctorOrders />} />


            <Route path="/doctor/medicines" element={<MedicineList />} />
            <Route path="/doctor/cart" element={<Cart />} />
            <Route
              path="/doctor/order-success/:id"
              element={<OrderSuccess />}
            />

            <Route
              path="/doctor/orders/:id/invoice"
              element={<InvoicePage />}
            />



            <Route path="/doctor/profile" element={<Profile />} />
          </Route>

          {/* ADMIN ROUTES */}
          <Route
            element={
              <ProtectedRoute
                allowedRoles={["admin"]}
                redirectTo="/admin/login"
              />
            }
          >
            <Route path="/admin/dashboard" element={<Dashboard />} />
            <Route path="/admin/orders" element={<Orders />} />
            <Route path="/admin/medicines" element={<Medicines />} />
            <Route path="/admin/inventory" element={<Inventory />} />
          </Route>

          {/* 404 */}
          <Route
            path="*"
            element={
              <h2 style={{ padding: "2rem" }}>
                404 – Page Not Found
              </h2>
            }
          />
        </Routes>
      </main>

      {/* MOBILE BOTTOM NAV (ISOLATED, SAFE) */}
      <MobileBottomNav />
    </div>
  );
}

export default App;

import React from "react";
import "./LoadingScreen.css";

export default function LoadingScreen() {
  return (
    <div className="loading-card">
      <div className="loading-loader">
        <p>Loading...</p>
        <div className="loading-words">
          <span className="loading-word">Medicines</span>
          <span className="loading-word">Prescriptions</span>
          <span className="loading-word">Orders</span>
          <span className="loading-word">Inventory</span>
          <span className="loading-word">Cart</span>
        </div>
      </div>
    </div>
  );
}


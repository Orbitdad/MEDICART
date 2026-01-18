import React from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext.jsx";
import "./CartFloatingButton.css";

function CartFloatingButton() {
  const { items } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) return null;

  return (
    <button
      className="cart-float-btn"
      onClick={() => navigate("/doctor/cart")}
    >
      🛒 Cart
      <span className="cart-count">{items.length}</span>
    </button>
  );
}

export default CartFloatingButton;

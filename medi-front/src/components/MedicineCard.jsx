import React from "react";
import { useCart } from "../context/CartContext.jsx";
import { Check } from "lucide-react";
import "./MedicineCard.css";

export default function MedicineCard({ med }) {
  const { addToCart, items } = useCart();

  const inCart = items.find((it) => it._id === med._id);

  const image =
    med.images && med.images.length > 0 ? med.images[0] : null;

  return (
    <div className="medicine-card transition hover:shadow-lg">
      {/* IMAGE */}
      <div className="medicine-image">
        {image ? (
          <img src={image} alt={med.name} />
        ) : (
          <div className="image-skeleton" />
        )}
      </div>

      {/* INFO */}
      <div className="medicine-info">
        <p className="medicine-name" title={med.name}>
          {med.name}
        </p>

        <p className="medicine-brand">
          {med.brand || "—"}
        </p>

        <div className="medicine-meta">
          <span className="medicine-price">
            ₹{med.price}
          </span>
          <span
            className={
              med.stock > 0
                ? "medicine-stock in"
                : "medicine-stock out"
            }
          >
            {med.stock > 0 ? "In Stock" : "Out of Stock"}
          </span>
        </div>

        {/* CTA */}
        <button
          className="medicine-btn"
          disabled={med.stock <= 0}
          onClick={() => addToCart(med)}
        >
          {inCart ? (
            <>
              <Check size={14} /> Added ({inCart.quantity})
            </>
          ) : (
            "Add to Cart"
          )}
        </button>
      </div>
    </div>
  );
}

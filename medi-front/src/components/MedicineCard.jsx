import React from "react";
import { useCart } from "../context/CartContext.jsx";
import { Check } from "lucide-react";
import "./MedicineCard.css";

export default function MedicineCard({ med }) {
  const { addToCart, items = [] } = useCart();

  if (!med) return null;

  const inCart = items.find((it) => it?._id === med?._id);

  const image =
    med?.images && med.images.length > 0 ? med.images[0] : null;

  const isExpired =
    med?.expiryDate &&
    new Date(med.expiryDate) < new Date();

  const nearExpiry =
    med?.expiryDate &&
    new Date(med.expiryDate) <
      new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days

  return (
    <div className="medicine-card">
      <div className="medicine-image">
        {image ? (
          <img src={image} alt={med?.name || "medicine"} />
        ) : (
          <div className="image-skeleton" />
        )}
      </div>

      <div className="medicine-info">
        {/* NAME */}
        <p className="medicine-name">
          {med?.name || "Unnamed medicine"}
        </p>

        {/* COMPANY */}
        <p className="medicine-brand">
          {med?.brand || "—"}
        </p>

        {/* PACKAGING */}
        {med?.packaging && (
          <p className="medicine-packaging">
            {med.packaging}
          </p>
        )}

        {/* DESCRIPTION */}
        {med?.description && (
          <p className="medicine-desc">
            {med.description}
          </p>
        )}

        {/* PRICE ROW */}
        <div className="medicine-meta">
          <div className="price-group">
            {med?.mrp && (
              <span className="medicine-mrp">
                ₹{med.mrp}
              </span>
            )}

            <span className="medicine-price">
              ₹{med?.price ?? "--"}
            </span>
          </div>

          <span
            className={
              (med?.stock ?? 0) > 0
                ? "medicine-stock in"
                : "medicine-stock out"
            }
          >
            {(med?.stock ?? 0) > 0
              ? "In Stock"
              : "Out of Stock"}
          </span>
        </div>

        {/* EXPIRY */}
        {med?.expiryDate && (
          <p
            className={`medicine-expiry ${
              isExpired
                ? "expired"
                : nearExpiry
                ? "near"
                : ""
            }`}
          >
            Exp:{" "}
            {new Date(med.expiryDate).toLocaleDateString()}
          </p>
        )}

        {/* BUTTON */}
        <button
          className="medicine-btn"
          disabled={(med?.stock ?? 0) <= 0 || isExpired}
          onClick={() => addToCart(med)}
        >
          {inCart ? (
            <>
              <Check size={14} /> Added ({inCart.quantity})
            </>
          ) : isExpired ? (
            "Expired"
          ) : (
            "Add to Cart"
          )}
        </button>
      </div>
    </div>
  );
}

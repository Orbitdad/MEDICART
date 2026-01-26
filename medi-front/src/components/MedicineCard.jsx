import React, { useState } from "react";
import { useCart } from "../context/CartContext.jsx";
import { Check } from "lucide-react";
import ImageViewer from "./ImageViewer.jsx";
import "./MedicineCard.css";

export default function MedicineCard({ med }) {
  const { addToCart, items = [] } = useCart();
  const [previewImage, setPreviewImage] = useState(null);

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
    <>
      <div className="medicine-card">
        {/* IMAGE */}
        <div
          className="medicine-image"
          onClick={() => image && setPreviewImage(image)}
          title="Tap to view"
        >
          {image ? (
            <img src={image} alt={med?.name || "medicine"} />
          ) : (
            <div className="image-skeleton" />
          )}
        </div>

        {/* INFO */}
        <div className="medicine-info">
          {/* NAME */}
          <p className="medicine-name">
            {med?.name || "Unnamed medicine"}
          </p>

          {/* BRAND */}
          <p className="medicine-brand">
                               <span className="label">co:   </span>

            {med?.brand || "—"}
          </p>

          {/* PACKAGING */}
          {med?.packaging && (
            <p className="medicine-packaging">
                    <span className="label">Pack of:   </span>
{med.packaging}
            </p>
          )}

          {/* DESCRIPTION */}
          {med?.description && (
            <p className="medicine-desc">
                   <span className="label">Info:   </span>
                   {med.description}

            </p>
          )}

{/* PRICE */}
<div className="medicine-price-box">
  {med?.mrp && (
    <div className="mrp-row">
      <span className="label">MRP</span>
      <span className="medicine-mrp">₹{med.mrp}</span>
    </div>
  )}

  <div className="price-row">
    <span className="label">Price</span>
    <span className="medicine-price">
      ₹{med?.price ?? "--"}
    </span>
  </div>
</div>

{/* STOCK */}
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

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <ImageViewer
          src={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </>
  );
}

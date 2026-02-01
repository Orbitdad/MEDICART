import React from "react";

/**
 * Minimal pill/capsule-shaped logo for medical e-commerce branding.
 * Renders as inline SVG; use className for size/color.
 */
export default function CapsuleLogo({ className = "", size = 32 }) {
  const h = (24 / 40) * size;
  return (
    <svg
      className={className}
      width={size}
      height={h}
      viewBox="0 0 40 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      {/* Horizontal pill/capsule: rounded ends + middle */}
      <path
        d="M12 0 L28 0 Q40 0 40 12 Q40 24 28 24 L12 24 Q0 24 0 12 Q0 0 12 0 Z"
        fill="currentColor"
      />
    </svg>
  );
}

import React, { useState } from "react";
import "./ImageViewer.css";

export default function ImageViewer({ src, onClose }) {
  const [scale, setScale] = useState(1);

  const zoomIn = () => setScale((s) => Math.min(s + 0.5, 4));
  const zoomOut = () => setScale((s) => Math.max(s - 0.5, 1));

  return (
    <div className="image-viewer-backdrop" onClick={onClose}>
      <div
        className="image-viewer-container"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt="medicine"
          style={{ transform: `scale(${scale})` }}
        />

        <div className="image-viewer-controls">
          <button onClick={zoomOut}>−</button>
          <button onClick={zoomIn}>＋</button>
          <button onClick={onClose}>✕</button>
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import "./InitialLoadingScreen.css";

export default function InitialLoadingScreen() {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Hide loading screen after app loads (3 seconds)
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="initial-loading-overlay">
      <div className="initial-loading-loader">
        <p>Loading</p>
        <div className="initial-loading-words">
          <span className="initial-loading-word">Prescriptions</span>
          <span className="initial-loading-word">Medicines</span>
          <span className="initial-loading-word">Doctor</span>
          <span className="initial-loading-word">Precautions</span>
        </div>
      </div>
    </div>
  );
}


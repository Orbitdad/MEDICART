import React, { useEffect, useState } from "react";
import "./InitialLoadingScreen.css";

const LOADING_SEEN_KEY = "medicart_initial_loading_seen";
const MIN_SHOW_MS = 1200;

export default function InitialLoadingScreen() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const alreadySeen = sessionStorage.getItem(LOADING_SEEN_KEY);
    if (alreadySeen === "true") {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    const timer = setTimeout(() => {
      sessionStorage.setItem(LOADING_SEEN_KEY, "true");
      setIsVisible(false);
    }, MIN_SHOW_MS);

    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="initial-loading-overlay" aria-live="polite" aria-busy="true">
      <div className="initial-loading-content">
        <div className="initial-loading-spinner" aria-hidden />
        <p className="initial-loading-text">Loading…</p>
      </div>
    </div>
  );
}

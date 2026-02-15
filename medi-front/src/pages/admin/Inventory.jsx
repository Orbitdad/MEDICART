import React, { useEffect, useState } from "react";
import { fetchInventorySummary } from "../../api/orders.js";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import Medicines from "./Medicines.jsx";
import PurchaseEntry from "./PurchaseEntry.jsx";

function Inventory() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "medicines" | "purchase"

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchInventorySummary();
        setSummary(data);
      } catch (err) {
        setError(err.message || "Failed to load inventory summary");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <LoadingScreen />;

  return (
    <main
      className="admin-inventory space-y-4"
      aria-label="Inventory and purchase management"
    >
      {/* HEADER */}
      <div className="card">
        <div className="card-header">
          <div className="badge">Admin</div>
          <h2 className="card-title">Inventory</h2>
          <p className="card-subtitle">
            Overview, medicine master and purchase entry in one place.
          </p>
        </div>

        {/* TABS */}
        <div className="flex gap-2 mt-2 border-t pt-2 text-sm" role="tablist">
          <button
            type="button"
            role="tab"
            className={`button button-sm ${activeTab === "overview"
                ? "button-primary"
                : "button-outline"
              }`}
            aria-selected={activeTab === "overview"}
            onClick={() => setActiveTab("overview")}
          >
            Overview
          </button>
          <button
            type="button"
            role="tab"
            className={`button button-sm ${activeTab === "medicines"
                ? "button-primary"
                : "button-outline"
              }`}
            aria-selected={activeTab === "medicines"}
            onClick={() => setActiveTab("medicines")}
          >
            Medicines
          </button>
          <button
            type="button"
            role="tab"
            className={`button button-sm ${activeTab === "purchase"
                ? "button-primary"
                : "button-outline"
              }`}
            aria-selected={activeTab === "purchase"}
            onClick={() => setActiveTab("purchase")}
          >
            Purchase Entry
          </button>
        </div>
      </div>

      {/* TAB CONTENT */}
      {activeTab === "overview" && (
        <section
          className="card"
          role="tabpanel"
          aria-label="Inventory overview metrics"
        >
          {error && (
            <p
              className="text-sm"
              style={{ color: "#dc2626" }}
              role="alert"
              aria-live="assertive"
            >
              {error}
            </p>
          )}

          {summary ? (
            <div className="form-grid" aria-label="Inventory metrics">
              <div>
                <div className="label">Total Medicines</div>
                <div>{summary.totalMedicines}</div>
              </div>
              <div>
                <div className="label">Total Stock Units</div>
                <div>{summary.totalUnits}</div>
              </div>
              <div>
                <div className="label">Low Stock Items</div>
                <div>{summary.lowStockCount}</div>
              </div>
            </div>
          ) : (
            !error && (
              <p className="text-muted" aria-live="polite">
                Waiting for data...
              </p>
            )
          )}
        </section>
      )}

      {activeTab === "medicines" && (
        <section role="tabpanel" aria-label="Medicine master and stock">
          <Medicines />
        </section>
      )}

      {activeTab === "purchase" && (
        <section role="tabpanel" aria-label="Purchase entry form">
          <PurchaseEntry />
        </section>
      )}
    </main>
  );
}

export default Inventory;

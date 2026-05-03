import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchInventorySummary } from "../../api/orders.js";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import Medicines from "./Medicines.jsx";
import PurchaseEntry from "./PurchaseEntry.jsx";
import InvoiceScan from "./InvoiceScan.jsx";
import SmartRestock from "./SmartRestock.jsx";

function Inventory() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const urlSearch = searchParams.get("search") || "";
  const [activeTab, setActiveTab] = useState(urlSearch ? "medicines" : "overview");

  // Auto-switch to medicines tab when navbar search is used
  useEffect(() => {
    if (urlSearch) setActiveTab("medicines");
  }, [urlSearch]);

  const loadSummary = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchInventorySummary();
      setSummary(data);
    } catch (err) {
      setError(err.message || "Failed to load inventory summary");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSummary();
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
            Manual Entry
          </button>
          <button
            type="button"
            role="tab"
            className={`button button-sm ${activeTab === "scan"
                ? "button-primary"
                : "button-outline"
              }`}
            aria-selected={activeTab === "scan"}
            onClick={() => setActiveTab("scan")}
          >
            Invoice Scan
          </button>
          <button
            type="button"
            role="tab"
            className={`button button-sm ${activeTab === "restock"
                ? "button-primary"
                : "button-outline"
              }`}
            aria-selected={activeTab === "restock"}
            onClick={() => setActiveTab("restock")}
          >
            Smart Restock
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
            <div
              className="text-sm flex gap-2 align-items-center"
              style={{ color: "#dc2626" }}
              role="alert"
              aria-live="assertive"
            >
              <span>{error}</span>
              <button
                type="button"
                className="button button-sm button-outline"
                onClick={loadSummary}
                style={{ marginLeft: "0.5rem" }}
              >
                Retry
              </button>
            </div>
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
          <Medicines initialSearch={urlSearch} />
        </section>
      )}

      {activeTab === "purchase" && (
        <section role="tabpanel" aria-label="Manual purchase entry form">
          <PurchaseEntry />
        </section>
      )}

      {activeTab === "scan" && (
        <section role="tabpanel" aria-label="Invoice scan and review">
          <InvoiceScan />
        </section>
      )}

      {activeTab === "restock" && (
        <section role="tabpanel" aria-label="Smart restock form">
          <SmartRestock />
        </section>
      )}
    </main>
  );
}

export default Inventory;

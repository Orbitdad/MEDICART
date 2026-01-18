import React, { useEffect, useState } from "react";
import { fetchInventorySummary } from "../../api/orders.js";

function Inventory() {
  const [summary, setSummary] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchInventorySummary();
        setSummary(data);
      } catch (err) {
        setError(err.message || "Failed to load inventory summary");
      }
    })();
  }, []);

  return (
    <div className="card">
      <div className="card-header">
        <div className="badge">Admin</div>
        <h2 className="card-title">Inventory Overview</h2>
        <p className="card-subtitle">
          High-level stock & movement metrics (depends on backend data).
        </p>
      </div>

      {error && (
        <p style={{ color: "#f97373", fontSize: "0.8rem" }}>{error}</p>
      )}

      {summary ? (
        <div className="form-grid">
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
        !error && <p className="text-muted">Waiting for data...</p>
      )}
    </div>
  );
}

export default Inventory;

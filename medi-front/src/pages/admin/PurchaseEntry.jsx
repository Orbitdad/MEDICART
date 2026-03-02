import React, { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { savePurchase } from "../../api/purchase";
import {
  Package,
  Save,
  Plus,
  Trash2,
  FileText,
  RotateCcw,
  Download,
  ShoppingCart,
  Calculator,
  CalendarDays,
} from "lucide-react";
import "../../components/MedicineImageUpload.css";

/* ─────────────── helpers ─────────────── */
const EMPTY_ROW = () => ({
  code: "",
  itemName: "",
  mfr: "",
  pkg: "",
  batch: "",
  exp: "",
  mrp: "",
  qty: "",
  free: "",
  billRate: "",
  schemePercent: "",
  discountPercent: "",
  gstPercent: "",
  salePrice: "",
  hsnCode: "",
  taxableAmount: 0,
  sgst: 0,
  cgst: 0,
  amount: 0,
  imageFile: null,
  imagePreview: "",
});

const TABS = [
  "Item Details",
  "GST Details",
  "Item Pur.",
  "In Stock",
  "Last Pur.",
  "Attachments",
];

const isRowFilled = (r) =>
  r.itemName || r.code || r.qty || r.mrp || r.batch;

/* ─────────────── component ─────────────── */
function PurchaseEntry() {
  /* ── header state ── */
  const [header, setHeader] = useState({
    purchaseType: "CREDIT PURCHASE",
    purchaseNo: "0001",
    partyCode: "",
    partyName: "",
    billNo: "",
    entryNo: "",
    location: "L",
    creditDays: 0,
    headerDiscount: 0,
    entryDate: new Date().toISOString().slice(0, 10),
    billDate: new Date().toISOString().slice(0, 10),
    receivedDate: new Date().toISOString().slice(0, 10),
  });

  /* ── item rows ── */
  const [rows, setRows] = useState(
    Array.from({ length: 5 }, () => EMPTY_ROW())
  );

  /* ── ui state ── */
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  /* ── refs ── */
  const fileInputRefs = useRef([]);

  /* ─────── handlers ─────── */
  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const recalcRow = useCallback((row) => {
    const qty = Number(row.qty || 0);
    const rate =
      row.billRate !== "" && row.billRate != null
        ? Number(row.billRate)
        : Number(row.mrp || 0);
    const disc = Number(row.discountPercent || 0);
    const gstPercent = Number(row.gstPercent || 0);

    const gross = qty * rate;
    const afterDisc = gross - (gross * disc) / 100;
    const gstAmount = (afterDisc * gstPercent) / 100;
    const halfGst = gstAmount / 2;

    return {
      ...row,
      taxableAmount: afterDisc,
      sgst: halfGst,
      cgst: halfGst,
      amount: afterDisc + gstAmount,
    };
  }, []);

  const handleRowChange = (index, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      const updated = { ...next[index], [field]: value };
      next[index] = recalcRow(updated);
      return next;
    });
  };

  const handleAddRow = () => {
    setRows((prev) => [...prev, EMPTY_ROW()]);
  };

  const handleDeleteRow = (index) => {
    setRows((prev) => {
      if (prev.length <= 1) return prev; // keep at least 1
      return prev.filter((_, i) => i !== index);
    });
  };

  /* ── image ── */
  const handleImageSelect = (index, e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setRows((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      };
      return next;
    });
    e.target.value = "";
  };

  const handleImageClear = (index) => {
    setRows((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], imageFile: null, imagePreview: "" };
      return next;
    });
  };

  /* ── save / clear ── */
  const showToast = (type, text) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  };

  const filledRows = rows.filter(isRowFilled);

  const handleSave = async () => {
    if (filledRows.length === 0) {
      showToast("error", "Please enter at least one item before saving.");
      return;
    }
    setSaving(true);
    try {
      // Send header + filled rows (with imageFile) to the API
      // Images are uploaded to Cloudinary, products saved to MongoDB
      const result = await savePurchase(header, filledRows);
      showToast("success", result.message || `Purchase saved — ${filledRows.length} item(s) recorded.`);
      return true;
    } catch (err) {
      showToast("error", err.message || "Failed to save purchase. Please try again.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const handleSaveAndNew = async () => {
    const success = await handleSave();
    if (success) {
      setHeader((prev) => ({
        ...prev,
        purchaseNo: String(Number(prev.purchaseNo || 0) + 1).padStart(4, "0"),
        partyCode: "",
        partyName: "",
        billNo: "",
        entryNo: "",
      }));
      setRows(Array.from({ length: 5 }, () => EMPTY_ROW()));
    }
  };

  const handleClearAll = () => {
    if (!window.confirm("Clear all entered data? This cannot be undone.")) return;
    setHeader((prev) => ({
      ...prev,
      partyCode: "",
      partyName: "",
      billNo: "",
      entryNo: "",
      creditDays: 0,
      headerDiscount: 0,
    }));
    setRows(Array.from({ length: 5 }, () => EMPTY_ROW()));
    showToast("info", "Form cleared.");
  };

  /* ── totals ── */
  const totalQty = rows.reduce((s, r) => s + Number(r.qty || 0), 0);
  const totalFree = rows.reduce((s, r) => s + Number(r.free || 0), 0);
  const totalTaxable = rows.reduce((s, r) => s + Number(r.taxableAmount || 0), 0);
  const totalSgst = rows.reduce((s, r) => s + Number(r.sgst || 0), 0);
  const totalCgst = rows.reduce((s, r) => s + Number(r.cgst || 0), 0);
  const totalAmount = rows.reduce((s, r) => s + Number(r.amount || 0), 0);
  const discountAmt = (totalAmount * Number(header.headerDiscount || 0)) / 100;
  const netAmount = totalAmount - discountAmt;

  /* ═══════════════════ RENDER ═══════════════════ */
  return (
    <motion.main
      className="card card-accent-bar"
      aria-label="Purchase entry"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* ── CARD HEADER ── */}
      <div className="card-header">
        <h2 className="card-title">
          <Package size={22} />
          Purchase Entry
        </h2>
        <p className="card-subtitle">
          Enter supplier purchase bill details to update stock.
        </p>
      </div>

      {/* ── HEADER SECTION ── */}
      <section className="purchase-header">
        {/* Row 1 */}
        <div className="purchase-header-row">
          <div className="field-group" style={{ width: 80 }}>
            <label>Purchase #</label>
            <input
              className="input"
              name="purchaseNo"
              value={header.purchaseNo}
              onChange={handleHeaderChange}
            />
          </div>
          <div className="field-group" style={{ minWidth: 160 }}>
            <label>Type</label>
            <select
              className="input"
              name="purchaseType"
              value={header.purchaseType}
              onChange={handleHeaderChange}
            >
              <option value="CREDIT PURCHASE">Credit Purchase</option>
              <option value="CASH PURCHASE">Cash Purchase</option>
            </select>
          </div>

          <div style={{ width: 1, background: "var(--border-soft)", alignSelf: "stretch", margin: "0 0.25rem" }} />

          <div className="field-group" style={{ width: 80 }}>
            <label>Party Code</label>
            <input
              className="input"
              name="partyCode"
              value={header.partyCode}
              onChange={handleHeaderChange}
            />
          </div>
          <div className="field-group" style={{ flex: 1, minWidth: 140 }}>
            <label>Party / Supplier Name</label>
            <input
              className="input"
              name="partyName"
              placeholder="Supplier name"
              value={header.partyName}
              onChange={handleHeaderChange}
            />
          </div>

          <div style={{ width: 1, background: "var(--border-soft)", alignSelf: "stretch", margin: "0 0.25rem" }} />

          <div className="field-group" style={{ width: 110 }}>
            <label>Bill No.</label>
            <input
              className="input"
              name="billNo"
              value={header.billNo}
              onChange={handleHeaderChange}
            />
          </div>
          <div>
            <span className="bill-amount-badge">₹{totalAmount.toFixed(2)}</span>
          </div>
          <button
            type="button"
            className="button button-outline button-sm button-icon"
            style={{ alignSelf: "end" }}
          >
            <Download size={14} /> Import
          </button>
        </div>

        {/* Row 2 */}
        <div className="purchase-header-row">
          <div className="field-group" style={{ width: 100 }}>
            <label>Entry No.</label>
            <input
              className="input"
              name="entryNo"
              value={header.entryNo}
              onChange={handleHeaderChange}
            />
          </div>
          <div className="field-group" style={{ width: 65 }}>
            <label>Location</label>
            <input
              className="input"
              name="location"
              value={header.location}
              onChange={handleHeaderChange}
            />
          </div>
          <div className="field-group" style={{ width: 75 }}>
            <label>Cr. Days</label>
            <input
              className="input"
              type="number"
              min="0"
              name="creditDays"
              value={header.creditDays}
              onChange={handleHeaderChange}
            />
          </div>
          <div className="field-group" style={{ width: 75 }}>
            <label>Disc. %</label>
            <input
              className="input"
              type="number"
              min="0"
              name="headerDiscount"
              value={header.headerDiscount}
              onChange={handleHeaderChange}
            />
          </div>

          <div style={{ flex: 1 }} />

          <div className="field-group">
            <label><CalendarDays size={10} style={{ display: "inline", marginRight: 3 }} />Entry Date</label>
            <input className="input" type="date" name="entryDate" value={header.entryDate} onChange={handleHeaderChange} />
          </div>
          <div className="field-group">
            <label><CalendarDays size={10} style={{ display: "inline", marginRight: 3 }} />Bill Date</label>
            <input className="input" type="date" name="billDate" value={header.billDate} onChange={handleHeaderChange} />
          </div>
          <div className="field-group">
            <label><CalendarDays size={10} style={{ display: "inline", marginRight: 3 }} />Rec'd Date</label>
            <input className="input" type="date" name="receivedDate" value={header.receivedDate} onChange={handleHeaderChange} />
          </div>
        </div>

        {/* Tabs */}
        <div className="purchase-tabs">
          {TABS.map((t, i) => (
            <button
              key={t}
              type="button"
              className={`purchase-tab${i === activeTab ? " active" : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {t}
            </button>
          ))}
        </div>
      </section>

      {/* ── ITEM GRID ── */}
      <section className="table-wrapper" style={{ maxHeight: "55vh", overflowY: "auto" }}>
        <table className="table purchase-table" aria-label="Purchase items">
          <thead>
            <tr>
              <th style={{ width: 32 }}>Sr</th>
              <th className="img-cell">Img</th>
              <th>Code</th>
              <th style={{ minWidth: 120 }}>Item Name</th>
              <th>Mfr.</th>
              <th>Pkg</th>
              <th>Batch</th>
              <th>Exp</th>
              <th>MRP</th>
              <th>Qty</th>
              <th>Free</th>
              <th>Bill Rate</th>
              <th>Sch%</th>
              <th>Dis%</th>
              <th>GST%</th>
              <th>Sal. Price</th>
              <th>HSN</th>
              <th>Taxable</th>
              <th>SGST</th>
              <th>CGST</th>
              <th>Amount</th>
              <th style={{ width: 32 }}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => {
              const filled = isRowFilled(row);
              return (
                <tr key={idx} className={filled ? "" : "row-empty"}>
                  <td className="sr-cell">{idx + 1}</td>
                  <td className="img-cell">
                    {row.imagePreview ? (
                      <div className="img-upload-item" style={{ width: 28, height: 28, margin: "0 auto" }}>
                        <img src={row.imagePreview} alt="item" className="img-mini-thumb" style={{ border: "none", margin: 0 }} />
                        <button type="button" className="img-remove-btn" style={{ opacity: 1, width: 12, height: 12, fontSize: 8 }} onClick={() => handleImageClear(idx)}>✕</button>
                      </div>
                    ) : (
                      <>
                        <button type="button" className="img-cam-btn" title="Add image" style={{ width: 26, height: 26, fontSize: 13 }} onClick={() => fileInputRefs.current[idx]?.click()}>📷</button>
                        <input ref={(el) => (fileInputRefs.current[idx] = el)} type="file" accept="image/*" hidden onChange={(e) => handleImageSelect(idx, e)} />
                      </>
                    )}
                  </td>
                  <td><input className="input" value={row.code} onChange={(e) => handleRowChange(idx, "code", e.target.value)} style={{ minWidth: 55 }} /></td>
                  <td><input className="input" value={row.itemName} onChange={(e) => handleRowChange(idx, "itemName", e.target.value)} style={{ minWidth: 120, textAlign: "left" }} /></td>
                  <td><input className="input" value={row.mfr} onChange={(e) => handleRowChange(idx, "mfr", e.target.value)} style={{ minWidth: 60, textAlign: "left" }} /></td>
                  <td><input className="input" value={row.pkg} onChange={(e) => handleRowChange(idx, "pkg", e.target.value)} style={{ minWidth: 45 }} /></td>
                  <td><input className="input" value={row.batch} onChange={(e) => handleRowChange(idx, "batch", e.target.value)} style={{ minWidth: 65 }} /></td>
                  <td><input className="input" type="month" value={row.exp} onChange={(e) => handleRowChange(idx, "exp", e.target.value)} style={{ minWidth: 95 }} /></td>
                  <td><input className="input" type="number" min="0" value={row.mrp} onChange={(e) => handleRowChange(idx, "mrp", e.target.value)} /></td>
                  <td><input className="input" type="number" min="0" value={row.qty} onChange={(e) => handleRowChange(idx, "qty", e.target.value)} style={{ minWidth: 50 }} /></td>
                  <td><input className="input" type="number" min="0" value={row.free} onChange={(e) => handleRowChange(idx, "free", e.target.value)} style={{ minWidth: 45 }} /></td>
                  <td><input className="input" type="number" min="0" value={row.billRate} onChange={(e) => handleRowChange(idx, "billRate", e.target.value)} /></td>
                  <td><input className="input" type="number" min="0" value={row.schemePercent} onChange={(e) => handleRowChange(idx, "schemePercent", e.target.value)} style={{ minWidth: 45 }} /></td>
                  <td><input className="input" type="number" min="0" value={row.discountPercent} onChange={(e) => handleRowChange(idx, "discountPercent", e.target.value)} style={{ minWidth: 45 }} /></td>
                  <td><input className="input" type="number" min="0" value={row.gstPercent} onChange={(e) => handleRowChange(idx, "gstPercent", e.target.value)} style={{ minWidth: 45 }} /></td>
                  <td><input className="input" type="number" min="0" value={row.salePrice} onChange={(e) => handleRowChange(idx, "salePrice", e.target.value)} /></td>
                  <td><input className="input" value={row.hsnCode} onChange={(e) => handleRowChange(idx, "hsnCode", e.target.value)} style={{ minWidth: 60 }} /></td>
                  <td className="amt-cell">₹{Number(row.taxableAmount || 0).toFixed(2)}</td>
                  <td className="amt-cell">₹{Number(row.sgst || 0).toFixed(2)}</td>
                  <td className="amt-cell">₹{Number(row.cgst || 0).toFixed(2)}</td>
                  <td className="amt-cell" style={{ fontWeight: 600 }}>₹{Number(row.amount || 0).toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="row-delete-btn"
                      title="Remove row"
                      onClick={() => handleDeleteRow(idx)}
                      disabled={rows.length <= 1}
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Add row button */}
      <button type="button" className="add-row-btn" onClick={handleAddRow}>
        <Plus size={15} /> Add Row
      </button>

      {/* ── SUMMARY ── */}
      <div className="purchase-summary">
        <div className="summary-left">
          <div className="summary-stat">
            <div className="stat-icon" style={{ background: "rgba(37, 99, 235, 0.1)", color: "#2563eb" }}>
              <ShoppingCart size={18} />
            </div>
            <div>
              <div className="stat-label">Items Entered</div>
              <div className="stat-value">{filledRows.length}</div>
            </div>
          </div>
          <div className="summary-stat">
            <div className="stat-icon" style={{ background: "rgba(22, 163, 74, 0.1)", color: "#16a34a" }}>
              <Package size={18} />
            </div>
            <div>
              <div className="stat-label">Total Qty / Free</div>
              <div className="stat-value">
                {totalQty} <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 400 }}>+ {totalFree} free</span>
              </div>
            </div>
          </div>
        </div>

        <div className="summary-right">
          <div className="summary-row">
            <span>Taxable Total</span>
            <strong>₹{totalTaxable.toFixed(2)}</strong>
          </div>
          <div className="summary-row">
            <span>SGST</span>
            <strong>₹{totalSgst.toFixed(2)}</strong>
          </div>
          <div className="summary-row">
            <span>CGST</span>
            <strong>₹{totalCgst.toFixed(2)}</strong>
          </div>
          <div className="summary-row summary-total">
            <span>Bill Amount</span>
            <strong>₹{totalAmount.toFixed(2)}</strong>
          </div>
          {Number(header.headerDiscount) > 0 && (
            <div className="summary-row">
              <span>Discount ({header.headerDiscount}%)</span>
              <strong style={{ color: "#dc2626" }}>− ₹{discountAmt.toFixed(2)}</strong>
            </div>
          )}
          <div className="summary-row summary-net">
            <span><Calculator size={14} style={{ display: "inline", marginRight: 4 }} />Net Payable</span>
            <strong>₹{netAmount.toFixed(2)}</strong>
          </div>
        </div>
      </div>

      {/* ── STICKY ACTION BAR ── */}
      <div className="purchase-action-bar">
        <div className="action-left">
          <FileText size={14} style={{ display: "inline", marginRight: 4, verticalAlign: "text-bottom" }} />
          {filledRows.length} item(s) • ₹{netAmount.toFixed(2)}
        </div>
        <div className="action-right">
          <button
            type="button"
            className="button button-danger button-sm button-icon"
            onClick={handleClearAll}
          >
            <RotateCcw size={13} /> Clear All
          </button>
          <button
            type="button"
            className="button button-outline button-sm button-icon"
            onClick={handleSaveAndNew}
            disabled={saving}
          >
            <Save size={13} /> Save &amp; New
          </button>
          <button
            type="button"
            className="button button-success button-sm button-icon"
            onClick={handleSave}
            disabled={saving}
          >
            <Save size={14} />
            {saving ? "Saving…" : "Save Purchase"}
          </button>
        </div>
      </div>

      {/* ── TOAST ── */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>
          {toast.text}
        </div>
      )}
    </motion.main>
  );
}

export default PurchaseEntry;

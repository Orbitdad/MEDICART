import React, { useState } from "react";
import { Upload, FileText, CheckCircle, AlertTriangle, Loader2 } from "lucide-react";

const base = (import.meta.env.VITE_API_URL || "https://medicart-d2ju.onrender.com/api").replace(/\/$/, "");

export default function InvoiceScan() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setScanResult(null);
      setError("");
    }
  };

  const handleScan = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    try {
      const formData = new FormData();
      formData.append("invoice", file);

      const token = localStorage.getItem("medicart_token");
      const res = await fetch(`${base}/admin/ocr/scan-invoice`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to scan invoice");
      }

      const data = await res.json();
      setScanResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSavePurchase = async () => {
    if (!scanResult) return;
    setSaving(true);
    setError("");

    try {
      const formData = new FormData();
      // Required fields for createPurchase
      formData.append("purchaseNo", scanResult.header.billNo || `INV-${Date.now()}`);
      formData.append("billNo", scanResult.header.billNo || "");
      formData.append("partyName", scanResult.header.partyName || "");
      if (scanResult.header.billDate) {
        formData.append("billDate", scanResult.header.billDate);
      }

      // Convert items
      const itemsToSave = scanResult.items.map(i => ({
        medicineId: i.medicineId,
        itemName: i.itemName,
        mfr: i.mfr,
        pkg: i.pkg,
        hsnCode: i.hsnCode,
        batch: i.batch,
        exp: i.exp,
        mrp: i.mrp,
        qty: i.qty,
        free: i.free,
        billRate: i.billRate,
        amount: i.amount,
        discountPercent: i.discountPercent,
        gstPercent: i.gstPercent,
        ocrRawName: i.ocrRawName,
        matchConfidence: i.matchConfidence,
        isNewMedicine: i.isNewMedicine,
      }));

      formData.append("items", JSON.stringify(itemsToSave));
      formData.append("invoicePhoto", file);

      const token = localStorage.getItem("medicart_token");
      const res = await fetch(`${base}/admin/purchases`, {
        method: "POST",
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Failed to save purchase");
      }

      alert("Purchase saved successfully!");
      setFile(null);
      setPreview(null);
      setScanResult(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* UPLOAD SECTION */}
      {!scanResult && (
        <div className="card text-center p-8 border-2 border-dashed border-gray-300">
          <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">Upload Supplier Invoice</h3>
          <p className="text-gray-400 mb-4">Take a photo of the paper bill. Claude AI will extract the rows.</p>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="invoice-upload"
          />
          <label
            htmlFor="invoice-upload"
            className="button button-primary cursor-pointer inline-block"
          >
            Select Image
          </label>

          {preview && (
            <div className="mt-6">
              <img src={preview} alt="Invoice preview" className="max-h-64 mx-auto rounded shadow-lg mb-4" />
              <button
                onClick={handleScan}
                disabled={loading}
                className="button button-primary w-full max-w-xs mx-auto flex justify-center items-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : <FileText />}
                {loading ? "Scanning with AI..." : "Extract Data"}
              </button>
            </div>
          )}

          {error && <div className="text-red-500 mt-4">{error}</div>}
        </div>
      )}

      {/* REVIEW SECTION */}
      {scanResult && (
        <div className="space-y-4">
          <div className="card">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-white">Review Extracted Data</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => setScanResult(null)} 
                  className="button button-outline"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSavePurchase} 
                  disabled={saving}
                  className="button button-primary flex items-center gap-2"
                >
                  {saving ? <Loader2 className="animate-spin h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                  {saving ? "Saving..." : "Save to Inventory"}
                </button>
              </div>
            </div>

            {error && <div className="text-red-500 mb-4 p-2 bg-red-500/10 rounded">{error}</div>}

            <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/5 rounded">
              <div>
                <span className="text-gray-400 text-sm">Supplier:</span>
                <div className="font-medium text-white">{scanResult.header.partyName || "Unknown"}</div>
              </div>
              <div>
                <span className="text-gray-400 text-sm">Invoice No:</span>
                <div className="font-medium text-white">{scanResult.header.billNo || "Unknown"}</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-300">
                <thead className="bg-white/5 text-gray-200">
                  <tr>
                    <th className="p-3 rounded-tl">Match</th>
                    <th className="p-3">Raw Name</th>
                    <th className="p-3">Qty</th>
                    <th className="p-3">Batch</th>
                    <th className="p-3">Exp</th>
                    <th className="p-3">MRP</th>
                    <th className="p-3">Rate</th>
                    <th className="p-3 rounded-tr">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {scanResult.items.map((item, idx) => {
                    const isLowConf = item.matchConfidence < 0.75 && !item.isNewMedicine;
                    return (
                      <tr key={idx} className="border-b border-white/5 hover:bg-white/5">
                        <td className="p-3">
                          {item.isNewMedicine ? (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs flex items-center gap-1 w-fit">
                              <CheckCircle className="h-3 w-3" /> New
                            </span>
                          ) : isLowConf ? (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs flex items-center gap-1 w-fit">
                              <AlertTriangle className="h-3 w-3" /> Review
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs flex items-center gap-1 w-fit">
                              <CheckCircle className="h-3 w-3" /> Matched
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-medium text-white">
                          <div>{item.ocrRawName}</div>
                          {item.medicineId && !item.isNewMedicine && (
                            <div className="text-xs text-gray-500 mt-1">Matched to: {item.suggestedName}</div>
                          )}
                        </td>
                        <td className="p-3">{item.qty} {item.free > 0 && <span className="text-green-400 text-xs">(+{item.free})</span>}</td>
                        <td className="p-3">{item.batch}</td>
                        <td className="p-3">{item.exp}</td>
                        <td className="p-3">₹{item.mrp}</td>
                        <td className="p-3">₹{item.billRate}</td>
                        <td className="p-3 font-medium">₹{item.amount}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

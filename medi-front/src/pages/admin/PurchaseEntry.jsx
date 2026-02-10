import React, { useState } from "react";

function PurchaseEntry() {
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
  const [rows, setRows] = useState(
    Array.from({ length: 10 }, () => ({
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
    }))
  );

  const handleHeaderChange = (e) => {
    const { name, value } = e.target;
    setHeader((prev) => ({ ...prev, [name]: value }));
  };

  const recalcRow = (row) => {
    const qty = Number(row.qty || 0);
    // Use Bill Rate if present, otherwise fall back to MRP
    const rate =
      row.billRate !== "" && row.billRate != null
        ? Number(row.billRate)
        : Number(row.mrp || 0);
    const gstPercent = Number(row.gstPercent || 0);
    const taxableAmount = qty * rate;
    const gstAmount = (taxableAmount * gstPercent) / 100;
    const halfGst = gstAmount / 2;

    return {
      ...row,
      taxableAmount,
      sgst: halfGst,
      cgst: halfGst,
      amount: taxableAmount + gstAmount,
    };
  };

  const handleRowChange = (index, field, value) => {
    setRows((prev) => {
      const next = [...prev];
      const updated = { ...next[index], [field]: value };
      next[index] = recalcRow(updated);
      return next;
    });
  };

  const totalQty = rows.reduce((sum, r) => sum + Number(r.qty || 0), 0);
  const totalTaxable = rows.reduce((sum, r) => sum + Number(r.taxableAmount || 0), 0);
  const totalSgst = rows.reduce((sum, r) => sum + Number(r.sgst || 0), 0);
  const totalCgst = rows.reduce((sum, r) => sum + Number(r.cgst || 0), 0);
  const totalAmount = rows.reduce((sum, r) => sum + Number(r.amount || 0), 0);

  return (
    <main className="card" aria-label="Purchase entry">
      <div className="card-header">
        <h2 className="card-title">Purchase Entry</h2>
        <p className="card-subtitle">Enter supplier purchase bill details to update stock.</p>
      </div>

      {/* HEADER BAR – DESKTOP-STYLE LAYOUT */}
      <section className="space-y-2 mb-3 border rounded-md px-3 py-2 bg-slate-50">
        {/* Row 1: Purchase / Party / Bill */}
        <div className="grid grid-cols-12 gap-2 items-center text-xs">
          <div className="col-span-3 flex items-center gap-2">
            <span className="whitespace-nowrap font-medium">Purchase</span>
            <input
              className="input input-sm max-w-[64px]"
              name="purchaseNo"
              value={header.purchaseNo}
              onChange={handleHeaderChange}
            />
            <select
              className="input input-sm flex-1"
              name="purchaseType"
              value={header.purchaseType}
              onChange={handleHeaderChange}
            >
              <option value="CREDIT PURCHASE">CREDIT PURCHASE</option>
              <option value="CASH PURCHASE">CASH PURCHASE</option>
            </select>
          </div>

          <div className="col-span-4 flex items-center gap-2">
            <span className="whitespace-nowrap font-medium">Party Name</span>
            <input
              className="input input-sm max-w-[72px]"
              name="partyCode"
              value={header.partyCode}
              onChange={handleHeaderChange}
            />
            <input
              className="input input-sm flex-1"
              name="partyName"
              placeholder="Supplier name"
              value={header.partyName}
              onChange={handleHeaderChange}
            />
          </div>

          <div className="col-span-3 flex items-center gap-2">
            <span className="whitespace-nowrap font-medium">Bill No.</span>
            <input
              className="input input-sm flex-1"
              name="billNo"
              value={header.billNo}
              onChange={handleHeaderChange}
            />
            <span className="text-red-600 font-semibold text-xs">
              ₹{totalAmount.toFixed(2)}
            </span>
          </div>

          <div className="col-span-2 flex items-center gap-2 justify-end">
            <button
              type="button"
              className="button button-outline button-sm"
            >
              Import
            </button>
          </div>
        </div>

        {/* Row 2: Entry No / Loca / Cr Days / Disc / Dates */}
        <div className="grid grid-cols-12 gap-2 items-center text-xs">
          <div className="col-span-3 flex items-center gap-2">
            <span className="whitespace-nowrap font-medium">Entry No.</span>
            <input
              className="input input-sm flex-1"
              name="entryNo"
              value={header.entryNo}
              onChange={handleHeaderChange}
            />
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <span className="whitespace-nowrap font-medium">Loca.</span>
            <input
              className="input input-sm max-w-[56px]"
              name="location"
              value={header.location}
              onChange={handleHeaderChange}
            />
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <span className="whitespace-nowrap font-medium">Cr. Days</span>
            <input
              className="input input-sm max-w-[56px]"
              type="number"
              name="creditDays"
              value={header.creditDays}
              onChange={handleHeaderChange}
            />
          </div>

          <div className="col-span-2 flex items-center gap-2">
            <span className="whitespace-nowrap font-medium">Disc. %</span>
            <input
              className="input input-sm max-w-[64px]"
              type="number"
              name="headerDiscount"
              value={header.headerDiscount}
              onChange={handleHeaderChange}
            />
          </div>

          <div className="col-span-3 flex items-center gap-2 justify-end">
            <span className="whitespace-nowrap font-medium">Entry Dt.</span>
            <input
              className="input input-sm"
              type="date"
              name="entryDate"
              value={header.entryDate}
              onChange={handleHeaderChange}
            />
            <span className="whitespace-nowrap font-medium">Bill Dt.</span>
            <input
              className="input input-sm"
              type="date"
              name="billDate"
              value={header.billDate}
              onChange={handleHeaderChange}
            />
            <span className="whitespace-nowrap font-medium">Rec'd Dt.</span>
            <input
              className="input input-sm"
              type="date"
              name="receivedDate"
              value={header.receivedDate}
              onChange={handleHeaderChange}
            />
          </div>
        </div>

        {/* Row 3: Tabs */}
        <div className="border-t pt-1 mt-1 text-xs flex gap-4">
          <button type="button" className="font-semibold text-primary">
            Item Details
          </button>
          <button type="button" className="text-muted">
            GST Details
          </button>
          <button type="button" className="text-muted">
            Item Pur.
          </button>
          <button type="button" className="text-muted">
            In Stock
          </button>
          <button type="button" className="text-muted">
            Last Pur.
          </button>
          <button type="button" className="text-muted">
            Attachments
          </button>
        </div>
      </section>

      {/* ITEM GRID */}
      <section className="table-wrapper">
        <table className="table purchase-table" aria-label="Purchase items">
          <thead>
            <tr>
              <th>Sr</th>
              <th>Code</th>
              <th>Item Name</th>
              <th>Mfr. Co.</th>
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
              <th>Taxable Amt</th>
              <th>SGST</th>
              <th>CGST</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx}>
                <td>{idx + 1}</td>
                <td>
                  <input
                    className="input"
                    value={row.code}
                    onChange={(e) => handleRowChange(idx, "code", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    value={row.itemName}
                    onChange={(e) => handleRowChange(idx, "itemName", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    value={row.mfr}
                    onChange={(e) => handleRowChange(idx, "mfr", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    value={row.pkg}
                    onChange={(e) => handleRowChange(idx, "pkg", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    value={row.batch}
                    onChange={(e) => handleRowChange(idx, "batch", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="month"
                    value={row.exp}
                    onChange={(e) => handleRowChange(idx, "exp", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={row.mrp}
                    onChange={(e) => handleRowChange(idx, "mrp", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={row.qty}
                    onChange={(e) => handleRowChange(idx, "qty", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={row.free}
                    onChange={(e) => handleRowChange(idx, "free", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={row.billRate}
                    onChange={(e) => handleRowChange(idx, "billRate", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={row.schemePercent}
                    onChange={(e) =>
                      handleRowChange(idx, "schemePercent", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={row.discountPercent}
                    onChange={(e) =>
                      handleRowChange(idx, "discountPercent", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={row.gstPercent}
                    onChange={(e) =>
                      handleRowChange(idx, "gstPercent", e.target.value)
                    }
                  />
                </td>
                <td>
                  <input
                    className="input"
                    type="number"
                    value={row.salePrice}
                    onChange={(e) => handleRowChange(idx, "salePrice", e.target.value)}
                  />
                </td>
                <td>
                  <input
                    className="input"
                    value={row.hsnCode}
                    onChange={(e) => handleRowChange(idx, "hsnCode", e.target.value)}
                  />
                </td>
                <td>₹{Number(row.taxableAmount || 0).toFixed(2)}</td>
                <td>₹{Number(row.sgst || 0).toFixed(2)}</td>
                <td>₹{Number(row.cgst || 0).toFixed(2)}</td>
                <td>₹{Number(row.amount || 0).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* FOOTER TOTALS */}
      <section className="mt-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-muted">
          Tot.Qty: <strong>{totalQty}</strong>
        </div>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span>Taxable Total</span>
            <strong>₹{totalTaxable.toFixed(2)}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>SGST Total</span>
            <strong>₹{totalSgst.toFixed(2)}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>CGST Total</span>
            <strong>₹{totalCgst.toFixed(2)}</strong>
          </div>
          <div className="flex justify-between gap-4">
            <span>Bill Amount</span>
            <strong>₹{totalAmount.toFixed(2)}</strong>
          </div>
        </div>
      </section>
    </main>
  );
}

export default PurchaseEntry;


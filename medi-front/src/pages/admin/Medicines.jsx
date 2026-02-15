import React, { useState, useEffect } from "react";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import {
  adminGetMedicines,
  adminUpdateMedicine,
  adminDeleteMedicine,
} from "../../api/medicines.js";

function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      setLoading(true);
      const data = await adminGetMedicines();
      setMedicines(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load medicines");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingScreen />;

  /* ================= EDIT ================= */

  const startEdit = (m) => {
    setEditingId(m._id);
    setEditForm({
      name: m.name || "",
      brand: m.brand || "",
      description: m.description || "",
      packaging: m.packaging || "",
      mrp: m.mrp || "",
      price: m.price || "",
      stock: m.stock || "",
      expiryDate: m.expiryDate?.slice(0, 10) || "",
      category: m.category || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async (id) => {
    setLoadingId(id);
    try {
      await adminUpdateMedicine(id, editForm);
      cancelEdit();
      loadMedicines();
    } catch {
      setError("Failed to update medicine");
    } finally {
      setLoadingId(null);
    }
  };

  /* ================= DELETE ================= */

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this medicine permanently?")) return;

    setLoadingId(id);
    try {
      await adminDeleteMedicine(id);
      setMedicines((prev) => prev.filter((m) => m._id !== id));
    } catch {
      alert("Delete failed");
    } finally {
      setLoadingId(null);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredMedicines = normalizedSearch
    ? medicines.filter((m) => {
      const name = (m.name || "").toLowerCase();
      const brand = (m.brand || "").toLowerCase();
      const category = (m.category || "").toLowerCase();
      return (
        name.includes(normalizedSearch) ||
        brand.includes(normalizedSearch) ||
        category.includes(normalizedSearch)
      );
    })
    : medicines;

  return (
    <main className="admin-medicines" aria-label="Admin medicine management">
      <div className="admin-header">
        <h1>Medicine Management</h1>
        <p className="text-muted">
          View and edit existing medicines. To add new stock, use Purchase Entry.
        </p>
      </div>

      {/* ================= INVENTORY ================= */}

      <div className="card">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <h3 className="card-title m-0">Inventory</h3>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <input
              className="input input-sm w-full sm:w-64"
              type="text"
              placeholder="Search by name, brand, category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search medicines"
            />
          </div>
        </div>

        <div className="table-wrapper">
          <table
            className="table admin-orders-table"
            aria-label="Medicines inventory table"
          >
            <thead>
              <tr>
                <th>Name</th>
                <th>Brand</th>
                <th>MRP</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Expiry</th>
                <th>Category</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredMedicines.map((m) => (
                <tr key={m._id}>
                  {editingId === m._id ? (
                    <>
                      <td><input className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></td>
                      <td><input className="input" value={editForm.brand} onChange={(e) => setEditForm({ ...editForm, brand: e.target.value })} /></td>
                      <td><input className="input" type="number" value={editForm.mrp} onChange={(e) => setEditForm({ ...editForm, mrp: e.target.value })} /></td>
                      <td><input className="input" type="number" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} /></td>
                      <td><input className="input" type="number" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} /></td>
                      <td><input className="input" type="date" value={editForm.expiryDate} onChange={(e) => setEditForm({ ...editForm, expiryDate: e.target.value })} /></td>
                      <td>
                        <select className="input" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}>
                          <option value="TAB">TAB</option>
                          <option value="CAP">CAP</option>
                          <option value="SYP">SYP</option>
                          <option value="EE">EE</option>
                          <option value="INJ">INJ</option>
                          <option value="INSTR">INSTR</option>
                        </select>
                      </td>
                      <td className="actions">
                        <button
                          type="button"
                          className="button button-primary"
                          onClick={() => saveEdit(m._id)}
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          className="button button-outline"
                          onClick={cancelEdit}
                        >
                          Cancel
                        </button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{m.name}</td>
                      <td>{m.brand || "-"}</td>
                      <td>₹{m.mrp}</td>
                      <td>₹{m.price}</td>
                      <td>{m.stock}</td>
                      <td>{m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : "-"}</td>
                      <td>{m.category}</td>
                      <td className="actions">
                        <button
                          type="button"
                          className="button button-outline"
                          onClick={() => startEdit(m)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="button button-danger"
                          disabled={loadingId === m._id}
                          onClick={() => handleDelete(m._id)}
                        >
                          {loadingId === m._id ? "Deleting…" : "Delete"}
                        </button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}

export default Medicines;

import React, { useEffect, useState } from "react";
import {
  adminAddMedicine,
  adminGetMedicines,
  adminUpdateMedicine,
  adminDeleteMedicine,
} from "../../api/medicines.js";

function Medicines() {
  const [form, setForm] = useState({
    name: "",
    brand: "",
    description: "",
    packaging: "",
    mrp: "",
    price: "",
    stock: "",
    expiryDate: "",
    category: "",
  });

  const [images, setImages] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [deletingId, setDeletingId] = useState(null);
  const [loadingId, setLoadingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadMedicines();
  }, []);

  const loadMedicines = async () => {
    try {
      const data = await adminGetMedicines();
      setMedicines(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load medicines");
    }
  };

  /* ================= CREATE ================= */

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      images.forEach((img) => fd.append("images", img));

      await adminAddMedicine(fd);

      setForm({
        name: "",
        brand: "",
        description: "",
        packaging: "",
        mrp: "",
        price: "",
        stock: "",
        expiryDate: "",
        category: "",
      });

      setImages([]);
      loadMedicines();
    } catch {
      setError("Failed to add medicine");
    } finally {
      setLoading(false);
    }
  };

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
      expiryDate: m.expiryDate
        ? m.expiryDate.slice(0, 10)
        : "",
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

  const confirmDelete = async (id) => {
    setLoadingId(id);
    try {
      await adminDeleteMedicine(id);
      setMedicines((prev) => prev.filter((m) => m._id !== id));
    } catch {
      setError("Failed to delete medicine");
    } finally {
      setDeletingId(null);
      setLoadingId(null);
    }
  };

  return (
    <div className="admin-medicines">
      <div className="admin-header">
        <h1>Medicine Management</h1>
        <p className="text-muted">Add, edit and manage live inventory.</p>
      </div>

      {/* ================= ADD MEDICINE ================= */}

      <div className="card">
        <h3 className="card-title">Add Medicine</h3>

        <form onSubmit={handleSubmit} className="add-form-grid">
          <input className="input" name="name" placeholder="Medicine Name" value={form.name} onChange={handleChange} required />

          <input className="input" name="brand" placeholder="Company / Brand" value={form.brand} onChange={handleChange} />

          <input className="input" name="description" placeholder="Description" value={form.description} onChange={handleChange} />

          <input className="input" name="packaging" placeholder="Packaging (Strip of 10 tablets)" value={form.packaging} onChange={handleChange} />

          <input className="input" name="mrp" type="number" placeholder="MRP" value={form.mrp} onChange={handleChange} required />

          <input className="input" name="price" type="number" placeholder="Selling Price" value={form.price} onChange={handleChange} required />

          <input className="input" name="stock" type="number" placeholder="Stock" value={form.stock} onChange={handleChange} required />

          <input className="input" name="expiryDate" type="date" value={form.expiryDate} onChange={handleChange} required />

          <select name="category" className="input" value={form.category} onChange={handleChange} required>
            <option value="">Select category</option>
            <option value="TAB">Tablet</option>
            <option value="CAP">Capsule</option>
            <option value="SYP">Syrup</option>
            <option value="EE">Eye / Ear</option>
            <option value="INJ">Injection</option>
            <option value="INSTR">Instrument</option>
          </select>

          <input type="file" multiple accept="image/*" className="input" onChange={(e) => setImages([...e.target.files])} />

          <button className="button button-primary" disabled={loading}>
            {loading ? "Adding…" : "Add Medicine"}
          </button>
        </form>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </div>

      {/* ================= INVENTORY ================= */}

      <div className="card">
        <h3 className="card-title">Inventory</h3>

        <div className="table-wrapper">
          <table className="table">
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
              {medicines.map((m) => (
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
                        <button className="button button-primary" onClick={() => saveEdit(m._id)}>Save</button>
                        <button className="button button-outline" onClick={cancelEdit}>Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{m.name}</td>
                      <td>{m.brand || "-"}</td>
                      <td>₹{m.mrp}</td>
                      <td>₹{m.price}</td>
                      <td className={m.stock <= 5 ? "text-red-600 font-medium" : ""}>{m.stock}</td>
                      <td>{m.expiryDate ? new Date(m.expiryDate).toLocaleDateString() : "-"}</td>
                      <td>{m.category}</td>
                      <td className="actions">
                        <button className="button button-outline" onClick={() => startEdit(m)}>Edit</button>
                        <button className="button button-danger" onClick={() => setDeletingId(m._id)}>Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Medicines;

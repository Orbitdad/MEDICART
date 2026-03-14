import React, { useState, useEffect, useRef } from "react";
import LoadingScreen from "../../components/LoadingScreen.jsx";
import ImageViewer from "../../components/ImageViewer.jsx";
import {
  adminGetMedicines,
  adminUpdateMedicine,
  adminDeleteMedicine,
  adminDeleteOutOfStock,
} from "../../api/medicines.js";
import "../../components/MedicineImageUpload.css";

function Medicines() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [newImages, setNewImages] = useState([]);         // File objects to upload
  const [removedImages, setRemovedImages] = useState([]); // URLs to remove
  const [loadingId, setLoadingId] = useState(null);
  const [deletingOOS, setDeletingOOS] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef(null);

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
      company: m.company || m.brand || "",
      description: m.description || "",
      packing: m.packing || m.packaging || "",
      mrp: m.mrp || "",
      price: m.price || "",
      gstPercent: m.gstPercent ?? 5,
      stock: m.stock || "",
      expiryDate: m.expiryDate?.slice(0, 10) || "",
      category: m.category || "",
      existingImages: [...(m.images || [])],
    });
    setNewImages([]);
    setRemovedImages([]);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
    setNewImages([]);
    setRemovedImages([]);
  };

  const handleAddImages = (e) => {
    const files = Array.from(e.target.files);
    setNewImages((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const handleRemoveExisting = (url) => {
    setRemovedImages((prev) => [...prev, url]);
    setEditForm((prev) => ({
      ...prev,
      existingImages: prev.existingImages.filter((u) => u !== url),
    }));
  };

  const handleRemoveNew = (idx) => {
    setNewImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const saveEdit = async (id) => {
    setLoadingId(id);
    try {
      const fd = new FormData();

      // Append text fields
      const textFields = [
        "name", "company", "description", "packing",
        "mrp", "price", "gstPercent", "stock", "expiryDate", "category",
      ];
      for (const key of textFields) {
        if (editForm[key] !== undefined && editForm[key] !== "") {
          fd.append(key, editForm[key]);
        }
      }

      // Append removed images
      if (removedImages.length > 0) {
        fd.append("removedImages", JSON.stringify(removedImages));
      }

      // Append new image files
      for (const file of newImages) {
        fd.append("images", file);
      }

      await adminUpdateMedicine(id, fd);
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

  /* ================= DELETE OUT-OF-STOCK ================= */

  const handleDeleteOutOfStock = async () => {
    const oosCount = medicines.filter((m) => m.stock === 0).length;
    if (oosCount === 0) {
      alert("No out-of-stock medicines found.");
      return;
    }
    if (
      !window.confirm(
        `Delete ${oosCount} out-of-stock medicine(s) permanently? This cannot be undone.`
      )
    )
      return;

    setDeletingOOS(true);
    try {
      const result = await adminDeleteOutOfStock();
      alert(result.message || "Out-of-stock medicines deleted.");
      loadMedicines();
    } catch {
      alert("Failed to delete out-of-stock medicines.");
    } finally {
      setDeletingOOS(false);
    }
  };

  const normalizedSearch = search.trim().toLowerCase();
  const filteredMedicines = normalizedSearch
    ? medicines.filter((m) => {
      const name = (m.name || "").toLowerCase();
      const company = (m.company || m.brand || "").toLowerCase();
      const category = (m.category || "").toLowerCase();
      const packing = (m.packing || m.packaging || "").toLowerCase();
      return (
        name.includes(normalizedSearch) ||
        company.includes(normalizedSearch) ||
        category.includes(normalizedSearch) ||
        packing.includes(normalizedSearch)
      );
    })
    : medicines;

  return (
    <>
      <main className="admin-medicines" aria-label="Admin medicine management">
        <div className="admin-header">
          <h1>Medicine Management</h1>
          <p className="text-muted">
            View and edit existing medicines. To add new stock, use Purchase Entry.
          </p>
        </div>

        {error && (
          <p className="text-sm" style={{ color: "#dc2626" }} role="alert">
            {error}
          </p>
        )}

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
              <button
                type="button"
                className="button button-sm button-danger"
                disabled={deletingOOS}
                onClick={handleDeleteOutOfStock}
                title="Delete all medicines with 0 stock"
              >
                {deletingOOS ? "Deleting…" : "Delete Out-of-Stock"}
              </button>
            </div>
          </div>

          <div className="table-wrapper">
            <table
              className="table admin-orders-table"
              aria-label="Medicines inventory table"
            >
              <thead>
                <tr>
                  <th className="img-cell">Image</th>
                  <th>Name</th>
                  <th>Company</th>
                  <th>Info</th>
                  <th>Packing</th>
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
                        {/* IMAGE UPLOAD CELL */}
                        <td className="img-cell">
                          <div className="img-upload-zone">
                            {/* Existing images */}
                            {editForm.existingImages?.map((url, i) => (
                              <div className="img-upload-item" key={`ex-${i}`}>
                                <img
                                  src={url}
                                  alt={`medicine ${i + 1}`}
                                  onClick={() => setPreviewImage(url)}
                                />
                                <button
                                  type="button"
                                  className="img-remove-btn"
                                  title="Remove image"
                                  onClick={() => handleRemoveExisting(url)}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}

                            {/* New images (preview) */}
                            {newImages.map((file, i) => (
                              <div className="img-upload-item" key={`new-${i}`}>
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`new ${i + 1}`}
                                />
                                <button
                                  type="button"
                                  className="img-remove-btn"
                                  title="Remove image"
                                  onClick={() => handleRemoveNew(i)}
                                >
                                  ✕
                                </button>
                              </div>
                            ))}

                            {/* Add button */}
                            <button
                              type="button"
                              className="img-add-btn"
                              title="Add images"
                              onClick={() => fileInputRef.current?.click()}
                            >
                              +
                            </button>
                            <input
                              ref={fileInputRef}
                              type="file"
                              accept="image/*"
                              multiple
                              hidden
                              onChange={handleAddImages}
                            />
                          </div>
                        </td>
                        <td><input className="input" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} /></td>
                        <td><input className="input" value={editForm.company} onChange={(e) => setEditForm({ ...editForm, company: e.target.value })} /></td>
                        <td><input className="input" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} placeholder="Product info" /></td>
                        <td><input className="input" value={editForm.packing} onChange={(e) => setEditForm({ ...editForm, packing: e.target.value })} /></td>
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
                            disabled={loadingId === m._id}
                            onClick={() => saveEdit(m._id)}
                          >
                            {loadingId === m._id ? "Saving…" : "Save"}
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
                        {/* IMAGE THUMBNAIL */}
                        <td className="img-cell">
                          {m.images?.length > 0 ? (
                            <img
                              className="img-thumb"
                              src={m.images[0]}
                              alt={m.name}
                              onClick={() => setPreviewImage(m.images[0])}
                            />
                          ) : (
                            <div className="img-placeholder" title="No image">
                              📷
                            </div>
                          )}
                        </td>
                        <td>{m.name}</td>
                        <td>{m.company || m.brand || "-"}</td>
                        <td>{m.description || "-"}</td>
                        <td>{m.packing || m.packaging || "-"}</td>
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

      {/* IMAGE PREVIEW MODAL */}
      {previewImage && (
        <ImageViewer
          src={previewImage}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </>
  );
}

export default Medicines;

const BASE = import.meta.env.VITE_API_URL;

/* =========================
   AUTH HEADER
========================= */
const authHeader = () => ({
    Authorization: `Bearer ${localStorage.getItem("medicart_token")}`,
});

/* =========================
   CREATE PURCHASE
   POST /api/admin/purchases
   multipart/form-data
========================= */
export const savePurchase = async (header, items) => {
    const formData = new FormData();

    /* ── header fields ── */
    Object.entries(header).forEach(([key, value]) => {
        formData.append(key, value);
    });

    /* ── items as JSON (without imageFile/imagePreview) ── */
    const cleanItems = items.map(({ imageFile, imagePreview, ...rest }) => rest);
    formData.append("items", JSON.stringify(cleanItems));

    /* ── images (one per item row that has a file) ── */
    items.forEach((item, idx) => {
        if (item.imageFile) {
            formData.append(`image_${idx}`, item.imageFile);
        }
    });

    const res = await fetch(`${BASE}/admin/purchases`, {
        method: "POST",
        headers: authHeader(),
        body: formData,
    });

    if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || "Failed to save purchase");
    }

    return res.json();
};

/* =========================
   GET ALL PURCHASES
========================= */
export const getPurchases = async () => {
    const res = await fetch(`${BASE}/admin/purchases`, {
        headers: authHeader(),
    });

    if (!res.ok) throw new Error("Failed to fetch purchases");
    return res.json();
};

/* =========================
   GET SINGLE PURCHASE
========================= */
export const getPurchaseById = async (id) => {
    const res = await fetch(`${BASE}/admin/purchases/${id}`, {
        headers: authHeader(),
    });

    if (!res.ok) throw new Error("Failed to fetch purchase");
    return res.json();
};

/* =========================
   DELETE PURCHASE
========================= */
export const deletePurchase = async (id) => {
    const res = await fetch(`${BASE}/admin/purchases/${id}`, {
        method: "DELETE",
        headers: authHeader(),
    });

    if (!res.ok) throw new Error("Failed to delete purchase");
    return res.json();
};

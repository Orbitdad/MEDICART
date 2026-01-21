const BASE =
  import.meta.env.VITE_API_URL ||
  "https://medicart-backend.onrender.com/api";

/* =========================
   DOCTOR
========================= */
export const getMedicines = async (search = "") => {
  const res = await fetch(
    `${BASE}/medicines?search=${encodeURIComponent(search)}`
  );

  if (!res.ok) {
    throw new Error("Failed to fetch medicines");
  }

  return res.json();
};

/* =========================
   ADMIN
========================= */
const authHeader = () => ({
  Authorization: `Bearer ${localStorage.getItem("medicart_token")}`,
});

/* READ */
export const adminGetMedicines = async () => {
  const res = await fetch(`${base}/admin/medicines`, {
    headers: authHeader(),
  });

  if (!res.ok) {
    throw new Error("Failed to load medicines");
  }

  return res.json();
};

/* CREATE */
export const adminAddMedicine = async (formData) => {
  const res = await fetch(`${base}/admin/medicines`, {
    method: "POST",
    headers: authHeader(),
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to add medicine");
  }

  return res.json();
};

/* UPDATE */
export const adminUpdateMedicine = async (id, payload) => {
  const res = await fetch(`${base}/admin/medicines/${id}`, {
    method: "PUT",
    headers: {
      ...authHeader(),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Failed to update medicine");
  }

  return res.json();
};

/* DELETE */
export const adminDeleteMedicine = async (id) => {
  const res = await fetch(`${base}/admin/medicines/${id}`, {
    method: "DELETE",
    headers: authHeader(),
  });

  if (!res.ok) {
    throw new Error("Failed to delete medicine");
  }

  return res.json();
};

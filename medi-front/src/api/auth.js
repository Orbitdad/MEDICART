import * as client from "./client";

/* =========================
   DOCTOR AUTH
========================= */
export const doctorLogin = async (email, password) => {
  const data = await client.post("/auth/doctor/login", {
    email,
    password,
  });

  return data;
};

export const doctorSignup = async (name, email, password) => {
  const data = await client.post("/auth/doctor/register", {
    name,
    email,
    password,
  });

  return data;
};

/* =========================
   ADMIN AUTH
========================= */
export const adminLogin = async (email, password) => {
  const data = await client.post("/auth/admin/login", {
    email,
    password,
  });

  return data;
};

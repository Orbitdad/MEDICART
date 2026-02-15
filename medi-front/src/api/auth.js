import * as client from "./client";

/* =========================
   DOCTOR AUTH
========================= */
export const doctorLogin = async (email, password) => {
  const res = await client.post("/auth/doctor/login", {
    email,
    password,
  });

  if (!res || !res.token) {
    throw new Error("Invalid login response");
  }

  return {
    token: res.token,
    role: res.role,
    user: res.user,
  };
};

export const doctorSignup = async (name, email, password) => {
  const res = await client.post("/auth/doctor/register", {
    name,
    email,
    password,
  });

  if (!res || !res.token) {
    throw new Error("Invalid signup response");
  }

  return {
    token: res.token,
    role: res.role,
    user: res.user,
  };
};

export const updateProfile = async (data) => {
  const res = await client.put("/auth/doctor/profile", data);
  return res.user;
};

/* =========================
   ADMIN AUTH
========================= */
export const adminLogin = async (email, password) => {
  const res = await client.post("/auth/admin/login", {
    email,
    password,
  });

  if (!res || !res.token) {
    throw new Error("Invalid admin login response");
  }

  return {
    token: res.token,
    role: res.role,
    user: res.user,
  };
};

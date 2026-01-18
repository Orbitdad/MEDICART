import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext.jsx";

function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await adminLogin(form.email, form.password);
      login({ token: res.token, role: res.role, user: res.user });
      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.message || "Admin login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md card">
        <div className="mb-6">
          <div className="badge mb-2">Admin Access</div>
          <h2 className="card-title">Admin Login</h2>
          <p className="card-subtitle">
            Authorized MediCart administrators only.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <label className="label">Password</label>
            <input
              className="input"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-400">{error}</p>
          )}

          <button
            className="button button-primary w-full"
            type="submit"
            disabled={loading}
          >
            {loading ? "Logging in…" : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;

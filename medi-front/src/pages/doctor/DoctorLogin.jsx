import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { doctorLogin } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Mail, Lock } from "lucide-react";

export default function DoctorLogin() {
  const navigate = useNavigate();
  const { login, token } = useAuth(); // 🔥 read token

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    form: "",
  });

  // ✅ MOBILE SAFE NAVIGATION
  useEffect(() => {
    if (token) {
      navigate("/doctor/home", { replace: true });
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  const validate = () => {
    const nextErrors = { email: "", password: "", form: "" };

    if (!form.email.trim()) nextErrors.email = "Email is required";
    if (!form.password) nextErrors.password = "Password is required";

    return nextErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.values(validationErrors).some(Boolean)) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({ email: "", password: "", form: "" });

    try {
      const res = await doctorLogin(form.email, form.password);

      login({
        token: res.token,
        role: res.role,
        user: res.user,
      });
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err?.message || "Invalid email or password",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md card">
        <div className="mb-6">
          <div className="badge mb-2">Doctor Access</div>
          <h2 className="card-title">Doctor Login</h2>
          <p className="card-subtitle">
            Secure access to manage medicine orders
          </p>
        </div>

        <form onSubmit={handleSubmit} className="form-grid">
          <div>
            <label className="label">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className="input pl-9"
                placeholder="doctor@hospital.com"
                disabled={loading}
              />
            </div>
            {errors.email && (
              <p className="text-red-400 text-xs mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="label">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className="input pl-9"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {errors.form && (
            <p className="text-red-400 text-sm">{errors.form}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="button button-primary w-full"
          >
            {loading ? "Signing in…" : "Login"}
          </button>
        </form>

        <p className="text-xs text-muted mt-5 text-center">
          New Doctor?{" "}
          <Link to="/doctor/signup" className="text-link font-medium">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}

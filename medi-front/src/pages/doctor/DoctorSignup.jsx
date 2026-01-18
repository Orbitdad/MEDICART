import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { doctorSignup } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { User, Mail, Lock } from "lucide-react";

export default function DoctorSignup() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    form: "",
  });

  /* -----------------------------
     INPUT HANDLING
  ------------------------------ */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });

    if (errors[e.target.name]) {
      setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    }
  };

  /* -----------------------------
     VALIDATION
  ------------------------------ */
  const validate = () => {
    const nextErrors = {
      name: "",
      email: "",
      password: "",
      form: "",
    };

    if (!form.name.trim()) {
      nextErrors.name = "Full name is required";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    }

    if (form.password.length < 6) {
      nextErrors.password = "Password must be at least 6 characters";
    }

    return nextErrors;
  };

  /* -----------------------------
     SUBMIT
  ------------------------------ */
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    const hasErrors = Object.values(validationErrors).some(Boolean);

    if (hasErrors) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({
      name: "",
      email: "",
      password: "",
      form: "",
    });

    try {
      const res = await doctorSignup(
        form.name,
        form.email,
        form.password
      );

      login({
        token: res.token,
        role: res.role,
        user: res.user,
      });

      navigate("/doctor/home");
    } catch {
      setErrors((prev) => ({
        ...prev,
        form: "Unable to create account. Try a different email.",
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="w-full max-w-md card">
        {/* HEADER */}
        <div className="mb-6">
          <div className="badge mb-2">Doctor Registration</div>
          <h2 className="card-title">Create Doctor Account</h2>
          <p className="card-subtitle">
            Register to order medicines securely
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="form-grid">
          {/* NAME */}
          <div>
            <label className="label">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="input pl-9"
                placeholder="Dr. Rahul Sharma"
                disabled={loading}
              />
            </div>
            {errors.name && (
              <p className="text-red-400 text-xs mt-1">
                {errors.name}
              </p>
            )}
          </div>

          {/* EMAIL */}
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
              <p className="text-red-400 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* PASSWORD */}
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
                placeholder="Minimum 6 characters"
                disabled={loading}
              />
            </div>
            {errors.password && (
              <p className="text-red-400 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* FORM ERROR */}
          {errors.form && (
            <p className="text-red-400 text-sm">
              {errors.form}
            </p>
          )}

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading}
            className="button button-primary w-full flex items-center justify-center gap-2"
          >
            {loading && (
              <svg
                className="animate-spin"
                width="16"
                height="16"
                viewBox="0 0 24 24"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="white"
                  strokeWidth="3"
                  fill="none"
                  opacity="0.3"
                />
                <path
                  d="M22 12a10 10 0 0 1-10 10"
                  stroke="white"
                  strokeWidth="3"
                  fill="none"
                />
              </svg>
            )}
            {loading ? "Creating account…" : "Sign Up"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-xs text-muted mt-5 text-center">
          Already have an account?{" "}
          <Link
            to="/doctor/login"
            className="text-link font-medium"
          >
            Login here
          </Link>
        </p>
      </div>
    </div>
  );
}

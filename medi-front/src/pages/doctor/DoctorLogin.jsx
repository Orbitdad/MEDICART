import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { doctorLogin } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Mail, Lock, Eye, EyeOff, Loader2, KeyRound, ArrowRight } from "lucide-react";
import AuthLayout from "../../components/AuthLayout";
import { motion } from "framer-motion";

const baseInput = {
  width: '100%',
  padding: '0.65rem 0.8rem 0.65rem 2.5rem',
  borderRadius: '10px',
  border: '1px solid rgba(15,23,42,0.12)',
  background: '#ffffff',
  color: '#0f172a',
  fontSize: '0.9rem',
  outline: 'none',
  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
  fontFamily: 'inherit',
  boxSizing: 'border-box',
};

const focusedInput = {
  ...baseInput,
  borderColor: '#2563eb',
  boxShadow: '0 0 0 2px rgba(37,99,235,0.15)',
};

const errorInput = {
  ...baseInput,
  borderColor: '#dc2626',
  boxShadow: '0 0 0 2px rgba(220,38,38,0.1)',
};

const labelStyle = {
  display: 'block', fontSize: '0.78rem', fontWeight: 600,
  color: '#64748b', marginBottom: '6px',
};

const iconStyle = {
  position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
  color: '#94a3b8', pointerEvents: 'none',
};

export default function DoctorLogin() {
  const navigate = useNavigate();
  const { login, token } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", form: "" });
  const [focus, setFocus] = useState(null);

  useEffect(() => {
    if (token) navigate("/doctor/home", { replace: true });
  }, [token, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const n = { email: "", password: "", form: "" };
    if (!form.email.trim()) n.email = "Email is required";
    if (!form.password) n.password = "Password is required";
    return n;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.values(v).some(Boolean)) { setErrors(v); return; }
    setLoading(true);
    setErrors({ email: "", password: "", form: "" });
    try {
      const res = await doctorLogin(form.email, form.password);
      login({ token: res.token, role: res.role, user: res.user });
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: err?.message || "Invalid email or password" }));
    } finally { setLoading(false); }
  };

  const getStyle = (field) => errors[field] ? errorInput : focus === field ? focusedInput : baseInput;

  return (
    <AuthLayout title="Sign in" subtitle="Welcome back! Enter your credentials to continue." badge="Doctor">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          {/* Email */}
          <div>
            <label style={labelStyle}>Email address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ ...iconStyle, color: focus === 'email' ? '#2563eb' : '#94a3b8' }} />
              <input type="email" name="email" value={form.email} onChange={handleChange}
                onFocus={() => setFocus('email')} onBlur={() => setFocus(null)}
                placeholder="you@example.com" style={getStyle('email')} disabled={loading} />
            </div>
            {errors.email && <p style={{ color: '#dc2626', fontSize: '0.75rem', margin: '4px 0 0', fontWeight: 500 }}>{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ ...iconStyle, color: focus === 'password' ? '#2563eb' : '#94a3b8' }} />
              <input type={showPassword ? "text" : "password"} name="password" value={form.password}
                onChange={handleChange} onFocus={() => setFocus('password')} onBlur={() => setFocus(null)}
                placeholder="Enter your password" style={{ ...getStyle('password'), paddingRight: '2.5rem' }} disabled={loading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, lineHeight: 0,
              }}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p style={{ color: '#dc2626', fontSize: '0.75rem', margin: '4px 0 0', fontWeight: 500 }}>{errors.password}</p>}
          </div>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <Link to="/forgot-password?role=doctor" style={{
            color: '#2563eb', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none',
            display: 'flex', alignItems: 'center', gap: '4px',
          }}>
            <KeyRound size={13} /> Forgot password?
          </Link>
        </div>

        {/* Error */}
        {errors.form && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} style={{
            padding: '10px 14px', borderRadius: '10px', marginBottom: '14px',
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)',
            color: '#dc2626', fontSize: '0.82rem', fontWeight: 500,
          }}>{errors.form}</motion.div>
        )}

        {/* Submit */}
        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '0.65rem', borderRadius: '999px',
          background: '#2563eb', color: '#fff', fontSize: '0.9rem', fontWeight: 600,
          border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 8px rgba(37,99,235,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          opacity: loading ? 0.7 : 1, transition: 'all 0.2s ease', fontFamily: 'inherit',
        }}>
          {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
          {loading ? "Signing in..." : "Sign in"}
        </button>

        {/* Signup link */}
        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#64748b' }}>
          Don't have an account?{" "}
          <Link to="/doctor/signup" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
            Sign up <ArrowRight size={12} style={{ verticalAlign: 'middle' }} />
          </Link>
        </p>
      </form>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #94a3b8; }
        button:hover:not(:disabled) { transform: translateY(-1px); }
        @media (max-width: 480px) {
          form { font-size: 0.85rem; }
        }
      `}</style>
    </AuthLayout>
  );
}

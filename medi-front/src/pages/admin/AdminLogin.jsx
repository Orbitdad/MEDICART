import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { adminLogin } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { Mail, Lock, Eye, EyeOff, Loader2, KeyRound, Shield } from "lucide-react";
import AuthLayout from "../../components/AuthLayout";
import { motion } from "framer-motion";

const baseInput = {
  width: '100%', padding: '0.65rem 0.8rem 0.65rem 2.5rem', borderRadius: '10px',
  border: '1px solid rgba(15,23,42,0.12)', background: '#ffffff', color: '#0f172a',
  fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  fontFamily: 'inherit', boxSizing: 'border-box',
};
const focusedInput = { ...baseInput, borderColor: '#2563eb', boxShadow: '0 0 0 2px rgba(37,99,235,0.15)' };
const iconStyle = { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' };
const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' };

export default function AdminLogin() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focus, setFocus] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); if (error) setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(""); setLoading(true);
    try {
      const res = await adminLogin(form.email, form.password);
      login({ token: res.token, role: res.role, user: res.user });
      navigate("/admin/dashboard");
    } catch (err) { setError(err?.response?.data?.message || err?.message || "Authentication failed"); }
    finally { setLoading(false); }
  };

  const getStyle = (field) => focus === field ? focusedInput : baseInput;

  return (
    <AuthLayout title="Admin access" subtitle="Restricted to authorized administrators." badge="Admin">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>Admin email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ ...iconStyle, color: focus === 'email' ? '#2563eb' : '#94a3b8' }} />
              <input type="email" name="email" value={form.email} onChange={handleChange}
                onFocus={() => setFocus('email')} onBlur={() => setFocus(null)}
                placeholder="admin@medicart.com" style={getStyle('email')} required disabled={loading} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ ...iconStyle, color: focus === 'password' ? '#2563eb' : '#94a3b8' }} />
              <input type={showPassword ? "text" : "password"} name="password" value={form.password}
                onChange={handleChange} onFocus={() => setFocus('password')} onBlur={() => setFocus(null)}
                placeholder="Enter password" style={{ ...getStyle('password'), paddingRight: '2.5rem' }} required disabled={loading} />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, lineHeight: 0,
              }}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
          <Link to="/forgot-password?role=admin" style={{ color: '#2563eb', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <KeyRound size={13} /> Recover access
          </Link>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
            padding: '10px 14px', borderRadius: '10px', marginBottom: '14px',
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)',
            color: '#dc2626', fontSize: '0.82rem', fontWeight: 500,
          }}>{error}</motion.div>
        )}

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '0.65rem', borderRadius: '999px',
          background: '#2563eb', color: '#fff', fontSize: '0.9rem', fontWeight: 600,
          border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 8px rgba(37,99,235,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          opacity: loading ? 0.7 : 1, transition: 'all 0.2s', fontFamily: 'inherit',
        }}>
          <Shield size={16} />
          {loading ? "Authenticating..." : "Sign in to admin"}
        </button>
      </form>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #94a3b8; }
        button:hover:not(:disabled) { transform: translateY(-1px); }
      `}</style>
    </AuthLayout>
  );
}

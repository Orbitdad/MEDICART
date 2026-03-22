import React, { useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { doctorForgotPassword, adminForgotPassword } from "../../api/auth.js";
import { Mail, Phone, Loader2, ArrowLeft, Fingerprint } from "lucide-react";
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

export default function ForgotPassword() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "doctor";
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [focus, setFocus] = useState(null);

  const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); if (error) setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.phone) { setError("Both fields are required."); return; }
    setLoading(true); setError("");
    try {
      if (role === "admin") await adminForgotPassword(form.email, form.phone);
      else await doctorForgotPassword(form.email, form.phone);
      navigate(`/reset-password?role=${role}&email=${encodeURIComponent(form.email)}&phone=${encodeURIComponent(form.phone)}`);
    } catch (err) { setError(err?.response?.data?.message || err?.message || "Verification failed."); }
    finally { setLoading(false); }
  };

  const getStyle = (field) => focus === field ? focusedInput : baseInput;

  return (
    <AuthLayout title="Forgot password" subtitle="Verify your identity to reset your password." badge="Recovery">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>Registered email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ ...iconStyle, color: focus === 'email' ? '#2563eb' : '#94a3b8' }} />
              <input type="email" name="email" value={form.email} onChange={handleChange}
                onFocus={() => setFocus('email')} onBlur={() => setFocus(null)}
                placeholder="you@example.com" style={getStyle('email')} required disabled={loading} />
            </div>
          </div>
          <div>
            <label style={labelStyle}>Registered phone number</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} style={{ ...iconStyle, color: focus === 'phone' ? '#2563eb' : '#94a3b8' }} />
              <input type="text" name="phone" value={form.phone} onChange={handleChange}
                onFocus={() => setFocus('phone')} onBlur={() => setFocus(null)}
                placeholder="+91 XXXXXXXXXX" style={getStyle('phone')} required disabled={loading} />
            </div>
          </div>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
            padding: '10px 14px', borderRadius: '10px', marginBottom: '14px',
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)',
            color: '#dc2626', fontSize: '0.82rem', fontWeight: 500,
          }}>{error}</motion.div>
        )}

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to={role === 'admin' ? '/admin/login' : '/doctor/login'} style={{
            flex: 1, padding: '0.65rem', borderRadius: '999px',
            border: '1px solid rgba(15,23,42,0.12)', background: '#fff', color: '#64748b',
            fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            transition: 'all 0.2s', fontFamily: 'inherit',
          }}>
            <ArrowLeft size={16} /> Back
          </Link>
          <button type="submit" disabled={loading} style={{
            flex: 2, padding: '0.65rem', borderRadius: '999px',
            background: '#2563eb', color: '#fff', fontSize: '0.9rem', fontWeight: 600,
            border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            boxShadow: '0 2px 8px rgba(37,99,235,0.2)',
            opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
          }}>
            {loading ? <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> : <Fingerprint size={16} />}
            {loading ? "Verifying..." : "Verify identity"}
          </button>
        </div>
      </form>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } input::placeholder { color: #94a3b8; }`}</style>
    </AuthLayout>
  );
}

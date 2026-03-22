import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { doctorResetPassword, adminResetPassword } from "../../api/auth.js";
import { Lock, Loader2, CheckCircle2, Eye, EyeOff, KeyRound } from "lucide-react";
import AuthLayout from "../../components/AuthLayout";
import { motion } from "framer-motion";

const baseInput = {
  width: '100%', padding: '0.65rem 2.5rem', borderRadius: '10px',
  border: '1px solid rgba(15,23,42,0.12)', background: '#ffffff', color: '#0f172a',
  fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  fontFamily: 'inherit', boxSizing: 'border-box',
};
const focusedInput = { ...baseInput, borderColor: '#2563eb', boxShadow: '0 0 0 2px rgba(37,99,235,0.15)' };
const iconStyle = { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' };
const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' };

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const role = searchParams.get("role") || "doctor";
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const navigate = useNavigate();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [focus, setFocus] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) { setError("Min 6 characters required."); return; }
    if (newPassword !== confirmPassword) { setError("Passwords don't match."); return; }
    setLoading(true); setError("");
    try {
      if (role === "admin") await adminResetPassword(email, phone, newPassword);
      else await doctorResetPassword(email, phone, newPassword);
      setSuccess(true);
      setTimeout(() => navigate(role === "admin" ? "/admin/login" : "/doctor/login"), 3000);
    } catch (err) { setError(err?.response?.data?.message || err?.message || "Reset failed."); }
    finally { setLoading(false); }
  };

  if (success) {
    return (
      <AuthLayout title="Password updated" subtitle="Your new password is now active." badge="Done">
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
          style={{ textAlign: 'center', padding: '32px 16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%', margin: '0 auto 16px',
            background: 'rgba(22,163,74,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><CheckCircle2 size={28} color="#16a34a" /></div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f172a', margin: '0 0 6px' }}>All set!</h2>
          <p style={{ color: '#64748b', fontSize: '0.85rem', margin: '0 0 20px' }}>Redirecting to login...</p>
          <button onClick={() => navigate(role === 'admin' ? '/admin/login' : '/doctor/login')} style={{
            padding: '0.5rem 1.5rem', borderRadius: '999px', background: '#16a34a',
            color: '#fff', fontWeight: 600, border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontFamily: 'inherit',
          }}>Go to login</button>
        </motion.div>
      </AuthLayout>
    );
  }

  const getStyle = (field) => focus === field ? focusedInput : baseInput;

  return (
    <AuthLayout title="Reset password" subtitle="Create a new secure password." badge="Step 2/2">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
          <div>
            <label style={labelStyle}>New password</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} style={{ ...iconStyle, color: focus === 'new' ? '#2563eb' : '#94a3b8' }} />
              <input type={showPassword ? "text" : "password"} value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                onFocus={() => setFocus('new')} onBlur={() => setFocus(null)}
                placeholder="Min 6 characters" style={getStyle('new')} required />
              <button type="button" onClick={() => setShowPassword(!showPassword)} style={{
                position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: 0, lineHeight: 0,
              }}>{showPassword ? <EyeOff size={16} /> : <Eye size={16} />}</button>
            </div>
          </div>
          <div>
            <label style={labelStyle}>Confirm password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ ...iconStyle, color: focus === 'confirm' ? '#2563eb' : '#94a3b8' }} />
              <input type={showPassword ? "text" : "password"} value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                onFocus={() => setFocus('confirm')} onBlur={() => setFocus(null)}
                placeholder="Re-enter password" style={getStyle('confirm')} required />
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

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '0.65rem', borderRadius: '999px',
          background: '#2563eb', color: '#fff', fontSize: '0.9rem', fontWeight: 600,
          border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 8px rgba(37,99,235,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          opacity: loading ? 0.7 : 1, fontFamily: 'inherit',
        }}>
          {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
          {loading ? "Updating..." : "Update password"}
        </button>
      </form>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } } input::placeholder { color: #94a3b8; }`}</style>
    </AuthLayout>
  );
}

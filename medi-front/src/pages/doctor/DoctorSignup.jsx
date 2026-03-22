import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { doctorSignup } from "../../api/auth.js";
import { useAuth } from "../../context/AuthContext.jsx";
import { User, Mail, Lock, Phone, Loader2, ArrowRight } from "lucide-react";
import AuthLayout from "../../components/AuthLayout";
import { motion } from "framer-motion";

const baseInput = {
  width: '100%', padding: '0.65rem 0.8rem 0.65rem 2.5rem', borderRadius: '10px',
  border: '1px solid rgba(15,23,42,0.12)', background: '#ffffff', color: '#0f172a',
  fontSize: '0.9rem', outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s',
  fontFamily: 'inherit', boxSizing: 'border-box',
};
const focusedInput = { ...baseInput, borderColor: '#2563eb', boxShadow: '0 0 0 2px rgba(37,99,235,0.15)' };
const errorInput = { ...baseInput, borderColor: '#dc2626', boxShadow: '0 0 0 2px rgba(220,38,38,0.1)' };
const iconStyle = { position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8', pointerEvents: 'none' };
const labelStyle = { display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#64748b', marginBottom: '6px' };

export default function DoctorSignup() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ name: "", email: "", password: "", phone: "", form: "" });
  const [focus, setFocus] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
  };

  const validate = () => {
    const n = { name: "", email: "", password: "", phone: "", form: "" };
    if (!form.name.trim()) n.name = "Required";
    if (!form.email.trim()) n.email = "Required";
    if (!form.phone.trim()) n.phone = "Required";
    if (form.password.length < 6) n.password = "Min 6 characters";
    return n;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const v = validate();
    if (Object.values(v).some(Boolean)) { setErrors(v); return; }
    setLoading(true);
    setErrors({ name: "", email: "", password: "", phone: "", form: "" });
    try {
      const res = await doctorSignup(form.name, form.email, form.password, form.phone);
      login({ token: res.token, role: res.role, user: res.user });
      navigate("/doctor/home");
    } catch (err) {
      setErrors((prev) => ({ ...prev, form: err?.response?.data?.message || err?.message || "Registration failed" }));
    } finally { setLoading(false); }
  };

  const getStyle = (field) => errors[field] ? errorInput : focus === field ? focusedInput : baseInput;

  const renderField = (name, label, icon, type = "text", placeholder = "") => (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={{ position: 'relative' }}>
        <div style={{ ...iconStyle, color: focus === name ? '#2563eb' : '#94a3b8' }}>{icon}</div>
        <input type={type} name={name} value={form[name]} onChange={handleChange}
          onFocus={() => setFocus(name)} onBlur={() => setFocus(null)}
          placeholder={placeholder} style={getStyle(name)} disabled={loading} />
      </div>
      {errors[name] && <p style={{ color: '#dc2626', fontSize: '0.75rem', margin: '4px 0 0', fontWeight: 500 }}>{errors[name]}</p>}
    </div>
  );

  return (
    <AuthLayout title="Create account" subtitle="Register as a healthcare practitioner to get started." badge="Doctor">
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '16px' }}>
          {/* 2-col grid for name and phone on desktop */}
          <div className="signup-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {renderField("name", "Full name", <User size={16} />, "text", "Dr. John Doe")}
            {renderField("phone", "Phone number", <Phone size={16} />, "text", "+91 XXXXXXXXXX")}
          </div>
          {renderField("email", "Email address", <Mail size={16} />, "email", "you@example.com")}
          {renderField("password", "Password", <Lock size={16} />, "password", "Min 6 characters")}
        </div>

        {errors.form && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
            padding: '10px 14px', borderRadius: '10px', marginBottom: '14px',
            background: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.15)',
            color: '#dc2626', fontSize: '0.82rem', fontWeight: 500,
          }}>{errors.form}</motion.div>
        )}

        <button type="submit" disabled={loading} style={{
          width: '100%', padding: '0.65rem', borderRadius: '999px',
          background: '#2563eb', color: '#fff', fontSize: '0.9rem', fontWeight: 600,
          border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
          boxShadow: '0 2px 8px rgba(37,99,235,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
          opacity: loading ? 0.7 : 1, transition: 'all 0.2s', fontFamily: 'inherit',
        }}>
          {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : null}
          {loading ? "Creating account..." : "Create account"}
        </button>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '0.85rem', color: '#64748b' }}>
          Already have an account?{" "}
          <Link to="/doctor/login" style={{ color: '#2563eb', fontWeight: 600, textDecoration: 'none' }}>
            Sign in <ArrowRight size={12} style={{ verticalAlign: 'middle' }} />
          </Link>
        </p>
      </form>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input::placeholder { color: #94a3b8; }
        button:hover:not(:disabled) { transform: translateY(-1px); }
        @media (max-width: 480px) {
          .signup-row { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </AuthLayout>
  );
}

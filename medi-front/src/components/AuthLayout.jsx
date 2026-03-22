import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { ShieldCheck, HeartPulse } from "lucide-react";

export default function AuthLayout({ children, title, subtitle, badge }) {
  return (
    <div style={{
      minHeight: 'calc(100vh - 64px)',
      background: 'var(--bg-main, #f8fafc)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: "'Outfit', 'Inter', system-ui, sans-serif",
      position: 'relative',
    }}>
      {/* Subtle decorative circles */}
      <div style={{
        position: 'absolute', top: '-120px', right: '-80px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(37,99,235,0.06) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', left: '-60px',
        width: '350px', height: '350px',
        background: 'radial-gradient(circle, rgba(22,163,74,0.04) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div style={{ position: 'relative', width: '100%', maxWidth: '440px', zIndex: 1 }}>
        {/* Branding */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ textAlign: 'center', marginBottom: '2rem' }}
        >
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '1.15rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
              <span style={{ color: 'var(--text-main, #0f172a)' }}>Medi</span>
              <span style={{ color: 'var(--primary, #2563eb)' }}>Cart</span>
            </span>
          </Link>
        </motion.div>

        {/* Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 120 }}
          style={{
            background: 'var(--bg-card, #ffffff)',
            borderRadius: 'var(--radius-xl, 24px)',
            border: '1px solid var(--border-soft, rgba(15,23,42,0.12))',
            boxShadow: 'var(--shadow-soft, 0 18px 40px rgba(0,0,0,0.08))',
            padding: '36px 32px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, var(--primary, #2563eb), #7c3aed, #06b6d4)',
            borderRadius: '24px 24px 0 0',
          }} />

          {badge && (
            <motion.div
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              style={{ position: 'absolute', top: '16px', right: '16px' }}
            >
              <span style={{
                padding: '4px 10px', borderRadius: '999px',
                background: 'var(--primary-soft, rgba(37,99,235,0.12))',
                color: 'var(--primary, #2563eb)',
                fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>{badge}</span>
            </motion.div>
          )}

          <div style={{ marginBottom: '24px', paddingTop: badge ? '8px' : 0 }}>
            <h1 style={{
              fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main, #0f172a)',
              margin: '0 0 6px 0', lineHeight: 1.2,
            }}>{title}</h1>
            <p style={{
              fontSize: '0.85rem', color: 'var(--text-muted, #64748b)',
              margin: 0, lineHeight: 1.5,
            }}>{subtitle}</p>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Footer trust badges */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>
            <ShieldCheck size={14} style={{ color: 'var(--accent, #16a34a)' }} /> Encrypted
          </span>
          <span style={{ width: '1px', height: '14px', background: 'var(--border-soft)' }}></span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted, #64748b)' }}>
            <HeartPulse size={14} style={{ color: 'var(--primary, #2563eb)' }} /> Healthcare
          </span>
        </motion.div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  Layers,
  Lock,
  Mail,
  Loader2,
  Eye,
  EyeOff,
  ArrowRight,
  Zap,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickFill = (fillEmail: string, fillPass: string) => {
    setEmail(fillEmail);
    setPassword(fillPass);
    setError(null);
  };

  const demoAccounts = [
    { label: 'Rafiq Hossain', sublabel: 'Owner',  emoji: '👑', email: 'owner@example.com',  pass: 'Password123!' },
    { label: 'Nusrat Jahan',  sublabel: 'Editor', emoji: '✏️', email: 'editor@example.com', pass: 'Password123!' },
    { label: 'Tanvir Ahmed',  sublabel: 'Viewer', emoji: '👁️', email: 'viewer@example.com', pass: 'Password123!' },
  ];

  return (
    <div className="auth-page">
      {/* Soft decorative blobs */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', top: '-8%', left: '-5%',
          width: '480px', height: '480px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', right: '-8%',
          width: '400px', height: '400px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)',
        }} />
      </div>

      <div style={{ width: '100%', maxWidth: '440px', position: 'relative', zIndex: 1 }}>

        {/* ── Logo ── */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
          <div
            className="animate-float"
            style={{
              width: '56px', height: '56px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 8px 24px rgba(99,102,241,0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <Layers style={{ width: '26px', height: '26px', color: '#fff' }} strokeWidth={2} />
          </div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Welcome back
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Sign in to your Kanban Pro workspace
          </p>
        </div>

        {/* ── Card ── */}
        <div className="auth-card">

          {/* Error message */}
          {error && (
            <div
              className="animate-fade-in"
              style={{
                marginBottom: '20px',
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'var(--danger-50)',
                border: '1.5px solid rgba(220,38,38,0.22)',
                color: 'var(--danger-600)',
                fontSize: '0.85rem',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <span style={{ flexShrink: 0 }}>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* ── Email field ── */}
            <div className="form-group">
              <label htmlFor="login-email" className="form-label">
                Email Address
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: '50%', left: '14px',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none',
                  display: 'flex', alignItems: 'center',
                }}>
                  <Mail style={{ width: '16px', height: '16px' }} />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rafiq@example.com"
                  className="input input-icon-left"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* ── Password field ── */}
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label htmlFor="login-password" className="form-label">
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: '50%', left: '14px',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none',
                  display: 'flex', alignItems: 'center',
                }}>
                  <Lock style={{ width: '16px', height: '16px' }} />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input input-icon-left"
                  style={{ paddingRight: '44px' }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn-icon"
                  aria-label="Toggle password visibility"
                  style={{
                    position: 'absolute', top: '50%', right: '10px',
                    transform: 'translateY(-50%)', padding: '6px',
                  }}
                >
                  {showPassword
                    ? <EyeOff style={{ width: '16px', height: '16px' }} />
                    : <Eye    style={{ width: '16px', height: '16px' }} />
                  }
                </button>
              </div>
            </div>

            {/* ── Submit ── */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '28px', padding: '13px 20px', fontSize: '0.9rem' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />
                  <span>Signing in…</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight style={{ width: '16px', height: '16px' }} />
                </>
              )}
            </button>
          </form>

          {/* ── Demo accounts ── */}
          <div style={{ marginTop: '28px', paddingTop: '24px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase',
              color: 'var(--text-muted)', marginBottom: '14px',
            }}>
              <Zap style={{ width: '12px', height: '12px', color: 'var(--brand-500)' }} />
              <span>Quick Test Login</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
              {demoAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  id={`demo-${acc.sublabel.toLowerCase()}`}
                  onClick={() => handleQuickFill(acc.email, acc.pass)}
                  title={`${acc.email} / Password123!`}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '5px', padding: '14px 8px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'var(--bg-elevated)',
                    border: '1.5px solid var(--border-default)',
                    cursor: 'pointer', transition: 'all 0.18s',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--brand-500)';
                    e.currentTarget.style.background   = 'var(--brand-50)';
                    e.currentTarget.style.boxShadow    = '0 2px 12px rgba(99,102,241,0.14)';
                    e.currentTarget.style.transform    = 'translateY(-1px)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.background   = 'var(--bg-elevated)';
                    e.currentTarget.style.boxShadow    = 'none';
                    e.currentTarget.style.transform    = 'translateY(0)';
                  }}
                >
                  <span style={{ fontSize: '1.15rem' }}>{acc.emoji}</span>
                  <span style={{
                    fontSize: '0.72rem', fontWeight: 700,
                    color: 'var(--text-primary)', textAlign: 'center', lineHeight: 1.3,
                  }}>
                    {acc.label}
                  </span>
                  <span style={{
                    fontSize: '0.64rem', fontWeight: 500,
                    color: 'var(--text-muted)', textAlign: 'center',
                  }}>
                    {acc.sublabel}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer link */}
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '20px' }}>
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            style={{ color: 'var(--brand-500)', fontWeight: 600 }}
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Layers, Lock, Mail, User, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name,          setName]          = useState('');
  const [email,         setEmail]         = useState('');
  const [password,      setPassword]      = useState('');
  const [showPassword,  setShowPassword]  = useState(false);
  const [error,         setError]         = useState<string | null>(null);
  const [isSubmitting,  setIsSubmitting]  = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await register(name, email, password);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Soft decorative blobs */}
      <div aria-hidden="true" style={{
        position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0,
      }}>
        <div style={{
          position: 'absolute', top: '-8%', right: '-5%',
          width: '420px', height: '420px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', bottom: '-10%', left: '-8%',
          width: '360px', height: '360px', borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(16,185,129,0.07) 0%, transparent 70%)',
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
            Create your account
          </h1>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            Join Kanban Pro and start organizing your work
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

            {/* ── Full Name ── */}
            <div className="form-group">
              <label htmlFor="register-name" className="form-label">
                Full Name
              </label>
              <div style={{ position: 'relative' }}>
                <div style={{
                  position: 'absolute', top: '50%', left: '14px',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)', pointerEvents: 'none',
                  display: 'flex', alignItems: 'center',
                }}>
                  <User style={{ width: '16px', height: '16px' }} />
                </div>
                <input
                  id="register-name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahim Uddin"
                  className="input input-icon-left"
                  autoComplete="name"
                />
              </div>
            </div>

            {/* ── Email ── */}
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label htmlFor="register-email" className="form-label">
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
                  id="register-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nusrat@example.com"
                  className="input input-icon-left"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* ── Password ── */}
            <div className="form-group" style={{ marginTop: '20px' }}>
              <label htmlFor="register-password" className="form-label">
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
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 8 characters"
                  className="input input-icon-left"
                  style={{ paddingRight: '44px' }}
                  autoComplete="new-password"
                  minLength={8}
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
              {/* Password hint */}
              <p style={{ marginTop: '6px', fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                Use at least 8 characters with a number and symbol (e.g. Password123!)
              </p>
            </div>

            {/* ── Submit ── */}
            <button
              id="register-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '28px', padding: '13px 20px', fontSize: '0.9rem' }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 style={{ width: '16px', height: '16px' }} className="animate-spin" />
                  <span>Creating account…</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight style={{ width: '16px', height: '16px' }} />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer link */}
        <p style={{ textAlign: 'center', fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '20px' }}>
          Already have an account?{' '}
          <Link
            href="/login"
            style={{ color: 'var(--brand-500)', fontWeight: 600 }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

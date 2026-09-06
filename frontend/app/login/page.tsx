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
  Sparkles,
  ArrowRight,
  Zap,
} from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please check your credentials.');
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
    {
      label: 'Owner',
      emoji: '👑',
      email: 'owner@example.com',
      pass: 'Password123!',
      color: 'warning',
    },
    {
      label: 'Editor',
      emoji: '✏️',
      email: 'editor@example.com',
      pass: 'Password123!',
      color: 'accent',
    },
    {
      label: 'Viewer',
      emoji: '👁️',
      email: 'viewer@example.com',
      pass: 'Password123!',
      color: 'muted',
    },
  ];

  return (
    <div
      className="flex-1 flex items-center justify-center px-4 py-12"
      style={{ minHeight: 'calc(100vh - 3.5rem)' }}
    >
      {/* Background glow effects */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '600px',
          height: '400px',
          background:
            'radial-gradient(ellipse, rgba(99,102,241,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="w-full max-w-[420px] relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              boxShadow: '0 0 24px rgba(99,102,241,0.5)',
            }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 animate-pulse-brand"
          >
            <Layers className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>
            Sign in to your Kanban Pro workspace
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-2xl p-7 shadow-2xl"
          style={{
            background: 'rgba(22,27,34,0.75)',
            border: '1px solid var(--border-default)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
          }}
        >
          {error && (
            <div
              className="mb-5 p-3.5 rounded-xl flex items-start gap-2.5 text-sm animate-fade-in"
              style={{
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.3)',
                color: 'var(--danger-400)',
              }}
            >
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label
                htmlFor="login-email"
                className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)' }}
              >
                Email Address
              </label>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-3 flex items-center pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="input input-icon-left"
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="login-password"
                className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)' }}
              >
                Password
              </label>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-3 flex items-center pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input input-icon-left pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 flex items-center btn-icon"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-3 text-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-6 pt-5" style={{ borderTop: '1px solid var(--border-subtle)' }}>
            <div
              className="flex items-center justify-center gap-1.5 text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-muted)' }}
            >
              <Zap className="w-3.5 h-3.5" style={{ color: 'var(--brand-400)' }} />
              <span>Quick Test Login</span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.label}
                  type="button"
                  id={`demo-${acc.label.toLowerCase()}`}
                  onClick={() => handleQuickFill(acc.email, acc.pass)}
                  className="flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-xs font-semibold transition-all"
                  style={{
                    background: 'var(--bg-overlay)',
                    border: '1px solid var(--border-default)',
                    color: 'var(--text-secondary)',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = 'var(--brand-500)';
                    e.currentTarget.style.background = 'rgba(99,102,241,0.1)';
                    e.currentTarget.style.color = 'var(--text-primary)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-default)';
                    e.currentTarget.style.background = 'var(--bg-overlay)';
                    e.currentTarget.style.color = 'var(--text-secondary)';
                  }}
                >
                  <span className="text-lg">{acc.emoji}</span>
                  <span>{acc.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-semibold transition-colors"
            style={{ color: 'var(--brand-400)' }}
            onMouseOver={(e) => (e.currentTarget.style.color = 'var(--brand-500)')}
            onMouseOut={(e) => (e.currentTarget.style.color = 'var(--brand-400)')}
          >
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}

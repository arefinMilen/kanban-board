'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { Layers, Lock, Mail, User, Loader2, Eye, EyeOff, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const [name, setName] = useState('');
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
      await register(email, password, name);
    } catch (err: any) {
      setError(err.message || 'Failed to create account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="flex-1 flex items-center justify-center px-4 py-12"
      style={{ minHeight: 'calc(100vh - 3.5rem)' }}
    >
      {/* Background glow */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          top: '-20%',
          right: '10%',
          width: '500px',
          height: '400px',
          background:
            'radial-gradient(ellipse, rgba(16,185,129,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div className="w-full max-w-[420px] relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            style={{
              background: 'linear-gradient(135deg, #6366f1, #10b981)',
              boxShadow: '0 0 24px rgba(16,185,129,0.4)',
            }}
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
          >
            <Layers className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
          <p className="text-sm mt-1.5" style={{ color: 'var(--text-secondary)' }}>
            Get started with Kanban Pro for free
          </p>
        </div>

        {/* Card */}
        <div
        className="rounded-2xl shadow-2xl"
          style={{
            background: 'rgba(22,27,34,0.80)',
            border: '1px solid var(--border-default)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            padding: '36px 32px',
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
            {/* Name */}
            <div>
              <label
                htmlFor="register-name"
                className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                style={{ color: 'var(--text-secondary)' }}
              >
                Full Name
              </label>
              <div className="relative">
                <div
                  className="absolute inset-y-0 left-3 flex items-center pointer-events-none"
                  style={{ color: 'var(--text-muted)' }}
                >
                  <User className="w-4 h-4" />
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

            {/* Email */}
            <div>
              <label
                htmlFor="register-email"
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

            {/* Password */}
            <div>
              <label
                htmlFor="register-password"
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
                  id="register-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="input input-icon-left pr-11"
                  autoComplete="new-password"
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
              <p className="mt-1.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                Must be at least 6 characters with a number & special character.
              </p>
            </div>

            <button
              id="register-submit-btn"
              type="submit"
              disabled={isSubmitting}
              className="btn btn-primary w-full py-3 text-sm"
              style={{
                background: 'linear-gradient(135deg, #6366f1, #10b981)',
              }}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm mt-5" style={{ color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-semibold transition-colors"
            style={{ color: 'var(--brand-400)' }}
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

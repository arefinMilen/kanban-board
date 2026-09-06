'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Layers,
  LogOut,
  LayoutDashboard,
  ChevronDown,
  X,
  Menu,
} from 'lucide-react';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropOpen, setUserDropOpen] = useState(false);

  if (!isAuthenticated || !user) return null;

  const navLinks = [
    { href: '/boards', label: 'My Boards', icon: LayoutDashboard },
  ];

  const getInitials = (name?: string, email?: string) => {
    if (name && name.trim()) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      return parts[0][0].toUpperCase();
    }
    if (email && email.trim()) {
      return email.charAt(0).toUpperCase();
    }
    return 'U';
  };

  return (
    <>
      <header
        style={{
          background: 'rgba(255, 255, 255, 0.88)',
          borderBottom: '1px solid var(--border-default)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.03)',
        }}
        className="sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/boards"
            className="flex items-center gap-2.5 flex-shrink-0 group"
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                boxShadow: '0 2px 10px rgba(99, 102, 241, 0.3)',
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all group-hover:shadow-[0_4px_14px_rgba(99,102,241,0.45)] group-hover:scale-105"
            >
              <Layers className="w-4.5 h-4.5 text-white" strokeWidth={2.2} />
            </div>
            <span className="font-bold text-base tracking-tight text-gradient hidden sm:block">
              Kanban Pro
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, label, icon: Icon }) => {
              const active = pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all"
                  style={{
                    color: active ? 'var(--brand-600)' : 'var(--text-secondary)',
                    background: active
                      ? 'rgba(99, 102, 241, 0.08)'
                      : 'transparent',
                  }}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* User Dropdown (Desktop) */}
            <div className="relative hidden sm:block">
              <button
                onClick={() => setUserDropOpen((v) => !v)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                style={{
                  background: userDropOpen
                    ? 'var(--bg-hover)'
                    : '#ffffff',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-xs)',
                }}
                aria-label="User menu"
                id="user-menu-btn"
              >
                {/* Avatar */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, var(--brand-500), var(--accent-500))',
                  }}
                  className="w-6.5 h-6.5 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
                >
                  {getInitials(user.name, user.email)}
                </div>
                <span className="text-sm font-semibold max-w-[130px] truncate">
                  {user.name || user.email.split('@')[0]}
                </span>
                <ChevronDown
                  className="w-3.5 h-3.5 transition-transform"
                  style={{
                    color: 'var(--text-muted)',
                    transform: userDropOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                />
              </button>

              {userDropOpen && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setUserDropOpen(false)}
                  />
                  <div
                    className="absolute right-0 top-full mt-2 z-40 w-56 rounded-xl overflow-hidden animate-fade-in-scale"
                    style={{
                      background: '#ffffff',
                      border: '1px solid var(--border-default)',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  >
                    <div
                      className="px-4 py-3"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>
                        {user.name}
                      </p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                        {user.email}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { setUserDropOpen(false); logout(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer"
                        style={{ color: 'var(--danger-400)' }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)')
                        }
                        onMouseOut={(e) =>
                          (e.currentTarget.style.background = 'transparent')
                        }
                      >
                        <LogOut className="w-4 h-4" />
                        Sign out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="sm:hidden btn-icon"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open mobile menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(15, 23, 42, 0.40)', backdropFilter: 'blur(6px)' }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="absolute left-0 top-0 bottom-0 w-72 animate-slide-up flex flex-col justify-between"
            style={{
              background: '#ffffff',
              borderRight: '1px solid var(--border-default)',
              boxShadow: 'var(--shadow-xl)',
            }}
          >
            <div>
              <div
                className="flex items-center justify-between px-4 h-14"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <span className="font-bold text-base text-gradient">Kanban Pro</span>
                <button className="btn-icon" onClick={() => setMobileMenuOpen(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* User info */}
              <div
                className="flex items-center gap-3 px-4 py-4"
                style={{ borderBottom: '1px solid var(--border-subtle)' }}
              >
                <div
                  style={{
                    background: 'linear-gradient(135deg, var(--brand-500), var(--accent-500))',
                  }}
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                >
                  {getInitials(user.name, user.email)}
                </div>
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate" style={{ color: 'var(--text-primary)' }}>
                    {user.name || user.email.split('@')[0]}
                  </p>
                  <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Nav links */}
              <nav className="p-3 flex flex-col gap-1">
                {navLinks.map(({ href, label, icon: Icon }) => {
                  const active = pathname.startsWith(href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all"
                      style={{
                        color: active ? 'var(--brand-600)' : 'var(--text-secondary)',
                        background: active ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Logout */}
            <div className="p-4" style={{ borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => { setMobileMenuOpen(false); logout(); }}
                className="btn btn-danger w-full"
              >
                <LogOut className="w-4 h-4" />
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

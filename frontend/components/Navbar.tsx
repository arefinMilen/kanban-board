'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Layers,
  LogOut,
  User as UserIcon,
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

  return (
    <>
      <header
        style={{
          background: 'rgba(13,17,23,0.90)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
        }}
        className="sticky top-0 z-40"
      >
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link
            href="/boards"
            className="flex items-center gap-2.5 flex-shrink-0 group"
          >
            <div
              style={{
                background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                boxShadow: '0 0 12px rgba(99,102,241,0.45)',
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center transition-shadow group-hover:shadow-[0_0_18px_rgba(99,102,241,0.65)]"
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
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                  style={{
                    color: active ? 'var(--brand-400)' : 'var(--text-secondary)',
                    background: active
                      ? 'rgba(99,102,241,0.1)'
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
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all"
                style={{
                  background: userDropOpen
                    ? 'var(--bg-hover)'
                    : 'var(--bg-elevated)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                }}
                aria-label="User menu"
                id="user-menu-btn"
              >
                {/* Avatar */}
                <div
                  style={{
                    background: 'linear-gradient(135deg, var(--brand-500), var(--accent-500))',
                  }}
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                >
                  {user.name?.charAt(0).toUpperCase() ?? 'U'}
                </div>
                <span className="text-sm font-medium max-w-[120px] truncate">
                  {user.name}
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
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-strong)',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  >
                    <div
                      className="px-4 py-3"
                      style={{ borderBottom: '1px solid var(--border-subtle)' }}
                    >
                      <p className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {user.name}
                      </p>
                      <p className="text-xs mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
                        {user.email}
                      </p>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={() => { setUserDropOpen(false); logout(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{ color: 'var(--danger-400)' }}
                        onMouseOver={(e) =>
                          (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')
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
            style={{ background: 'rgba(6,9,16,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={() => setMobileMenuOpen(false)}
          />
          <div
            className="absolute left-0 top-0 bottom-0 w-72 animate-slide-up"
            style={{
              background: 'var(--bg-surface)',
              borderRight: '1px solid var(--border-default)',
            }}
          >
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
                {user.name?.charAt(0).toUpperCase() ?? 'U'}
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm truncate">{user.name}</p>
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
                    className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                    style={{
                      color: active ? 'var(--brand-400)' : 'var(--text-secondary)',
                      background: active ? 'rgba(99,102,241,0.1)' : 'transparent',
                    }}
                  >
                    <Icon className="w-4 h-4" />
                    {label}
                  </Link>
                );
              })}
            </nav>

            {/* Logout */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
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

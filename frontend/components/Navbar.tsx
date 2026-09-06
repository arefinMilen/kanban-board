'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { LayoutDashboard, LogOut, User as UserIcon } from 'lucide-react';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return null;

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/boards"
          className="flex items-center gap-2 font-bold text-xl text-indigo-400 hover:text-indigo-300 transition"
        >
          <LayoutDashboard className="w-6 h-6 text-indigo-500" />
          <span>Mini Kanban</span>
        </Link>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-sm">
            <UserIcon className="w-4 h-4 text-indigo-400" />
            <span className="font-medium text-slate-200">{user.name}</span>
            <span className="text-xs text-slate-400">({user.email})</span>
          </div>

          <button
            onClick={logout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}

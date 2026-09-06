'use client';

import React, { useState } from 'react';
import { fetchApi } from '@/lib/api';
import { X, UserPlus, Trash2, Shield, Loader2, AlertCircle } from 'lucide-react';

interface Member {
  id: string;
  role: 'OWNER' | 'EDITOR' | 'VIEWER';
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface ShareBoardModalProps {
  boardId: string;
  members: Member[];
  isOwner: boolean;
  onClose: () => void;
  onMembersUpdated: () => void;
}

export function ShareBoardModal({
  boardId,
  members,
  isOwner,
  onClose,
  onMembersUpdated,
}: ShareBoardModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'EDITOR' | 'VIEWER' | 'OWNER'>('EDITOR');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAddMember(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setError(null);
    setIsSubmitting(true);
    try {
      await fetchApi(`/boards/${boardId}/members`, {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), role }),
      });
      setEmail('');
      onMembersUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to add member');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRemoveMember(userId: string) {
    if (!confirm('Are you sure you want to remove this member?')) return;

    setError(null);
    try {
      await fetchApi(`/boards/${boardId}/members/${userId}`, {
        method: 'DELETE',
      });
      onMembersUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to remove member');
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">Share Board</h2>
        <p className="text-slate-400 text-sm mb-6">
          Invite teammates or manage board member permissions.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-2 text-rose-400 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {isOwner && (
          <form onSubmit={handleAddMember} className="mb-6 p-4 bg-slate-800/60 border border-slate-700/60 rounded-xl">
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Invite Member by Email
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as any)}
                className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="EDITOR">EDITOR</option>
                <option value="VIEWER">VIEWER</option>
                <option value="OWNER">OWNER</option>
              </select>
              <button
                type="submit"
                disabled={isSubmitting || !email.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition disabled:opacity-50 flex items-center gap-1.5 justify-center"
              >
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                <span>Add</span>
              </button>
            </div>
          </form>
        )}

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
            Current Members ({members.length})
          </h3>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {members.map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-800 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-white">{m.user.name}</p>
                  <p className="text-xs text-slate-400">{m.user.email}</p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                      m.role === 'OWNER'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : m.role === 'EDITOR'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-slate-700 text-slate-300'
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    {m.role}
                  </span>

                  {isOwner && (
                    <button
                      onClick={() => handleRemoveMember(m.user.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-800 transition"
                      title="Remove Member"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { fetchApi } from '@/lib/api';
import { X, UserPlus, Trash2, Shield, Loader2, AlertCircle, Users } from 'lucide-react';

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

const roleConfig = {
  OWNER:  { class: 'badge-owner',  icon: '👑' },
  EDITOR: { class: 'badge-editor', icon: '✏️' },
  VIEWER: { class: 'badge-viewer', icon: '👁️' },
} as const;

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
    if (!confirm('Remove this member from the board?')) return;
    setError(null);
    try {
      await fetchApi(`/boards/${boardId}/members/${userId}`, { method: 'DELETE' });
      onMembersUpdated();
    } catch (err: any) {
      setError(err.message || 'Failed to remove member');
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    >
      <div
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          padding: '32px 32px',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          gap: '24px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            paddingBottom: '18px',
            borderBottom: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '14px',
                background: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <Users className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight" style={{ margin: 0 }}>
                Share Board
              </h2>
              <p className="text-xs font-medium text-slate-500" style={{ marginTop: '2px', margin: 0 }}>
                Manage board access &amp; permissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all cursor-pointer flex-shrink-0"
            aria-label="Close modal"
            id="close-share-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div
          className="flex-1 overflow-y-auto hide-scrollbar"
          style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingRight: '4px' }}
        >
          {/* Error */}
          {error && (
            <div
              className="p-3.5 rounded-2xl flex items-start gap-2.5 text-sm font-semibold animate-fade-in"
              style={{
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1.5px solid rgba(239, 68, 68, 0.22)',
                color: '#dc2626',
              }}
            >
              <AlertCircle className="w-4.5 h-4.5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Add member form — owner only */}
          {isOwner && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label
                className="block text-xs font-extrabold uppercase tracking-wider text-slate-600"
                style={{ margin: 0 }}
              >
                Invite Member
              </label>
              <form onSubmit={handleAddMember} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input
                    id="share-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tanvir@example.com"
                    style={{
                      flex: 1,
                      minWidth: '200px',
                      height: '44px',
                      padding: '0 16px',
                      fontSize: '14px',
                      borderRadius: '14px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      background: '#ffffff',
                      color: '#0f172a',
                    }}
                  />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    style={{
                      height: '44px',
                      padding: '0 14px',
                      fontSize: '14px',
                      fontWeight: 700,
                      borderRadius: '14px',
                      border: '1.5px solid #cbd5e1',
                      outline: 'none',
                      background: '#f8fafc',
                      color: '#334155',
                      cursor: 'pointer',
                    }}
                    id="share-role-select"
                  >
                    <option value="EDITOR">Editor</option>
                    <option value="VIEWER">Viewer</option>
                    <option value="OWNER">Owner</option>
                  </select>
                </div>
                <button
                  id="invite-member-btn"
                  type="submit"
                  disabled={isSubmitting || !email.trim()}
                  className="transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  style={{
                    width: '100%',
                    height: '44px',
                    fontSize: '14px',
                    fontWeight: 800,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
                    color: '#ffffff',
                    boxShadow: '0 4px 14px rgba(99, 102, 241, 0.35)',
                    border: 'none',
                  }}
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <UserPlus className="w-4 h-4" />
                  )}
                  {isSubmitting ? 'Sending invite...' : 'Send Invite'}
                </button>
              </form>
            </div>
          )}

          {/* Current members */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h3
              className="text-xs font-extrabold uppercase tracking-wider text-slate-600"
              style={{ margin: 0 }}
            >
              Members · {members.length}
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {members.map((m) => {
                const rc = roleConfig[m.role] ?? roleConfig['VIEWER'];
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3.5 rounded-2xl transition-all"
                    style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}
                  >
                    {/* Avatar + info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-xs"
                        style={{
                          background: 'linear-gradient(135deg, #6366f1, #10b981)',
                        }}
                      >
                        {m.user.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-900 truncate" style={{ margin: 0 }}>
                          {m.user.name}
                        </p>
                        <p className="text-xs text-slate-500 font-medium truncate" style={{ margin: 0, marginTop: '2px' }}>
                          {m.user.email}
                        </p>
                      </div>
                    </div>

                    {/* Role + actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className={`badge ${rc.class} px-2.5 py-1 text-[11px] font-extrabold`}>
                        {rc.icon} {m.role}
                      </span>
                      {isOwner && m.role !== 'OWNER' && (
                        <button
                          onClick={() => handleRemoveMember(m.user.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                          title="Remove member"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            paddingTop: '16px',
            borderTop: '1px solid #f1f5f9',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <button
            onClick={onClose}
            className="transition-all cursor-pointer"
            style={{
              width: '100%',
              height: '44px',
              fontSize: '14px',
              fontWeight: 700,
              borderRadius: '14px',
              border: '1px solid #cbd5e1',
              background: '#f8fafc',
              color: '#334155',
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

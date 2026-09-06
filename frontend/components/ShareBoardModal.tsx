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
      className="modal-overlay"
      onClick={onClose}
    >
      <div
        className="modal-card w-full max-w-lg"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-5 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--border-subtle)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'rgba(99,102,241,0.1)',
                border: '1px solid rgba(99,102,241,0.2)',
              }}
            >
              <Users className="w-4.5 h-4.5" style={{ color: 'var(--brand-400)' }} />
            </div>
            <div>
              <h2 className="text-base font-bold">Share Board</h2>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                Manage board access &amp; permissions
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="btn-icon rounded-lg"
            aria-label="Close modal"
            id="close-share-modal-btn"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Error */}
          {error && (
            <div
              className="p-3.5 rounded-xl flex items-start gap-2.5 text-sm animate-fade-in"
              style={{
                background: 'rgba(239,68,68,0.08)',
                border: '1px solid rgba(239,68,68,0.25)',
                color: 'var(--danger-400)',
              }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Add member form — owner only */}
          {isOwner && (
            <div>
              <label
                className="block text-xs font-bold uppercase tracking-wider mb-3"
                style={{ color: 'var(--text-secondary)' }}
              >
                Invite Member
              </label>
              <form onSubmit={handleAddMember} className="space-y-3">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    id="share-email-input"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tanvir@example.com"
                    className="input text-sm flex-1"
                  />
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as any)}
                    className="input text-sm"
                    style={{ width: 'auto', flexShrink: 0 }}
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
                  className="btn btn-primary w-full text-sm"
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
          <div>
            <h3
              className="text-xs font-bold uppercase tracking-wider mb-3"
              style={{ color: 'var(--text-secondary)' }}
            >
              Members · {members.length}
            </h3>
            <div className="space-y-2">
              {members.map((m) => {
                const rc = roleConfig[m.role] ?? roleConfig['VIEWER'];
                return (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 rounded-xl transition-colors"
                    style={{ background: 'var(--bg-overlay)', border: '1px solid var(--border-subtle)' }}
                  >
                    {/* Avatar + info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                        style={{
                          background: 'linear-gradient(135deg, var(--brand-500), var(--accent-500))',
                        }}
                      >
                        {m.user.name?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: 'var(--text-primary)' }}>
                          {m.user.name}
                        </p>
                        <p className="text-xs truncate" style={{ color: 'var(--text-muted)' }}>
                          {m.user.email}
                        </p>
                      </div>
                    </div>

                    {/* Role + actions */}
                    <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                      <span className={`badge ${rc.class}`}>
                        {rc.icon} {m.role}
                      </span>
                      {isOwner && m.role !== 'OWNER' && (
                        <button
                          onClick={() => handleRemoveMember(m.user.id)}
                          className="btn-icon rounded-md"
                          title="Remove member"
                          onMouseOver={(e) => (e.currentTarget.style.color = 'var(--danger-400)')}
                          onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
          className="px-6 py-4 flex-shrink-0"
          style={{ borderTop: '1px solid var(--border-subtle)' }}
        >
          <button onClick={onClose} className="btn btn-ghost w-full text-sm">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import { KanbanBoard } from '@/components/KanbanBoard';
import { ShareBoardModal } from '@/components/ShareBoardModal';
import { Column } from '@/components/KanbanColumn';
import {
  Plus,
  Users,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  AlertCircle,
  ArrowLeft,
  Layers,
  Shield,
  MoreVertical,
} from 'lucide-react';
import Link from 'next/link';

interface BoardDetail {
  id: string;
  name: string;
  ownerId: string;
  owner: { id: string; name: string; email: string };
  members: Array<{
    id: string;
    role: 'OWNER' | 'EDITOR' | 'VIEWER';
    user: { id: string; name: string; email: string };
  }>;
  columns: Column[];
}

const roleConfig = {
  OWNER: 'badge-owner',
  EDITOR: 'badge-editor',
  VIEWER: 'badge-viewer',
} as const;

export default function BoardDetailPage() {
  const { id } = useParams() as { id: string };
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState('');

  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isSubmittingColumn, setIsSubmittingColumn] = useState(false);

  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (isAuthenticated && id) loadBoard();
  }, [id, isAuthenticated, isAuthLoading, router]);

  async function loadBoard() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchApi<BoardDetail>(`/boards/${id}`);
      setBoard(data);
      setName(data.name);
    } catch (err: any) {
      setError(err.message || 'Failed to load board');
    } finally {
      setIsLoading(false);
    }
  }

  const currentMember = board?.members.find((m) => m.user.id === user?.id);
  const myRole = currentMember?.role || (board?.ownerId === user?.id ? 'OWNER' : 'VIEWER');
  const isOwner = myRole === 'OWNER';
  const canEdit = myRole === 'OWNER' || myRole === 'EDITOR';

  async function handleSaveBoardName() {
    if (!name.trim() || !board) return;
    try {
      await fetchApi(`/boards/${board.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ name: name.trim() }),
      });
      setIsEditingName(false);
      loadBoard();
    } catch (err: any) {
      alert(err.message || 'Failed to rename board');
    }
  }

  async function handleDeleteBoard() {
    if (!board) return;
    if (!confirm(`Permanently delete board "${board.name}"? This cannot be undone.`)) return;
    try {
      await fetchApi(`/boards/${board.id}`, { method: 'DELETE' });
      router.push('/boards');
    } catch (err: any) {
      alert(err.message || 'Failed to delete board');
    }
  }

  async function handleAddColumn(e: React.FormEvent) {
    e.preventDefault();
    if (!newColumnTitle.trim() || !board) return;
    setIsSubmittingColumn(true);
    try {
      await fetchApi(`/boards/${board.id}/columns`, {
        method: 'POST',
        body: JSON.stringify({ title: newColumnTitle.trim() }),
      });
      setNewColumnTitle('');
      setIsAddingColumn(false);
      loadBoard();
    } catch (err: any) {
      alert(err.message || 'Failed to create column');
    } finally {
      setIsSubmittingColumn(false);
    }
  }

  /* ── Loading state ─────────────────────────────────── */
  if (isAuthLoading || (isLoading && !board)) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse-brand"
          >
            <Layers className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Loading board...</p>
        </div>
      </div>
    );
  }

  /* ── Error state ───────────────────────────────────── */
  if (error || !board) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <div
          className="rounded-2xl p-8 max-w-sm w-full text-center animate-fade-in"
          style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-default)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <AlertCircle className="w-7 h-7" style={{ color: 'var(--danger-400)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
            {error || 'This board does not exist or you do not have permission to view it.'}
          </p>
          <Link href="/boards" className="btn btn-primary">
            <ArrowLeft className="w-4 h-4" />
            Back to Boards
          </Link>
        </div>
      </div>
    );
  }

  /* ── Main board view ───────────────────────────────── */
  return (
    <div
      className="flex-1 flex flex-col overflow-hidden"
      style={{ height: 'calc(100vh - 3.5rem)' }}
    >
      {/* Board Top Bar */}
      <div
        className="flex-shrink-0 flex flex-col sm:flex-row sm:items-center gap-3 px-4 sm:px-6 py-3"
        style={{
          background: 'rgba(13,17,23,0.80)',
          borderBottom: '1px solid var(--border-subtle)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}
      >
        {/* Left: Back + Title */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <Link
            href="/boards"
            className="btn-icon flex-shrink-0 rounded-lg"
            title="Back to boards"
            style={{ color: 'var(--text-secondary)' }}
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </Link>

          {isEditingName ? (
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveBoardName();
                  if (e.key === 'Escape') setIsEditingName(false);
                }}
                className="input font-bold text-base py-1.5 flex-1"
                autoFocus
              />
              <button
                onClick={() => setIsEditingName(false)}
                className="btn-icon flex-shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                onClick={handleSaveBoardName}
                className="btn-icon flex-shrink-0"
                style={{ color: 'var(--accent-400)' }}
              >
                <Check className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 min-w-0">
              <h1 className="text-base font-bold truncate">{board.name}</h1>
              {canEdit && (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="btn-icon rounded-md flex-shrink-0 opacity-0 hover:opacity-100 group-hover:opacity-100"
                  title="Rename board"
                  id="rename-board-btn"
                  style={{ opacity: 0.6 }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.color = 'var(--brand-400)';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.opacity = '0.6';
                    e.currentTarget.style.color = 'var(--text-muted)';
                  }}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              <span className={`badge ${roleConfig[myRole]} flex-shrink-0`}>
                <Shield className="w-2.5 h-2.5" />
                {myRole}
              </span>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Share button */}
          <button
            id="share-board-btn"
            onClick={() => setIsShareModalOpen(true)}
            className="btn btn-ghost text-sm"
          >
            <Users className="w-4 h-4" style={{ color: 'var(--brand-400)' }} />
            <span className="hidden sm:inline">Share</span>
            <span
              className="px-1.5 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'var(--bg-overlay)', color: 'var(--text-muted)' }}
            >
              {board.members.length}
            </span>
          </button>

          {/* Add Column */}
          {canEdit && (
            <>
              {isAddingColumn ? (
                <form
                  onSubmit={handleAddColumn}
                  className="flex items-center gap-1.5 animate-fade-in"
                >
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Escape') setIsAddingColumn(false); }}
                    placeholder="Column name..."
                    className="input text-sm py-1.5 w-36"
                  />
                  <button
                    type="button"
                    onClick={() => setIsAddingColumn(false)}
                    className="btn-icon"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingColumn || !newColumnTitle.trim()}
                    className="btn btn-primary text-xs py-1.5"
                  >
                    {isSubmittingColumn && <Loader2 className="w-3 h-3 animate-spin" />}
                    Add
                  </button>
                </form>
              ) : (
                <button
                  id="add-column-btn"
                  onClick={() => setIsAddingColumn(true)}
                  className="btn btn-primary text-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Add Column</span>
                </button>
              )}
            </>
          )}

          {/* More menu (delete) — owner only */}
          {isOwner && (
            <div className="relative">
              <button
                onClick={() => setMoreMenuOpen((v) => !v)}
                className="btn-icon rounded-lg"
                title="Board options"
                id="board-more-btn"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {moreMenuOpen && (
                <>
                  <div className="fixed inset-0 z-30" onClick={() => setMoreMenuOpen(false)} />
                  <div
                    className="absolute right-0 top-full mt-2 z-40 w-44 rounded-xl overflow-hidden animate-fade-in-scale"
                    style={{
                      background: 'var(--bg-elevated)',
                      border: '1px solid var(--border-strong)',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  >
                    <div className="p-2">
                      <button
                        onClick={() => { setMoreMenuOpen(false); handleDeleteBoard(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                        style={{ color: 'var(--danger-400)' }}
                        onMouseOver={(e) => (e.currentTarget.style.background = 'rgba(239,68,68,0.08)')}
                        onMouseOut={(e) => (e.currentTarget.style.background = 'transparent')}
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Board
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Kanban Board Canvas */}
      <KanbanBoard
        initialColumns={board.columns}
        canEdit={canEdit}
        onRefresh={loadBoard}
      />

      {/* Share Modal */}
      {isShareModalOpen && (
        <ShareBoardModal
          boardId={board.id}
          members={board.members}
          isOwner={isOwner}
          onClose={() => setIsShareModalOpen(false)}
          onMembersUpdated={loadBoard}
        />
      )}
    </div>
  );
}

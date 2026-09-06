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
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse-brand shadow-md"
          >
            <Layers className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>Loading board...</p>
        </div>
      </div>
    );
  }

  /* ── Error state ───────────────────────────────────── */
  if (error || !board) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 min-h-[60vh]">
        <div
          className="rounded-2xl p-8 max-w-sm w-full text-center animate-fade-in"
          style={{
            background: '#ffffff',
            border: '1px solid var(--border-default)',
            boxShadow: 'var(--shadow-md)',
          }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
            style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            <AlertCircle className="w-7 h-7" style={{ color: 'var(--danger-400)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-sm mb-6 font-medium" style={{ color: 'var(--text-secondary)' }}>
            {error || 'This board does not exist or you do not have permission to view it.'}
          </p>
          <Link href="/boards" className="btn btn-primary shadow-sm">
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
        className="flex-shrink-0 bg-white/90 border-b border-slate-200/80 backdrop-blur-md shadow-xs py-4 sm:py-5"
      >
        <div className="workspace-container flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Left: Back Arrow + Board Title + Edit Icon + Role Badge */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <Link
              href="/boards"
              className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all flex-shrink-0"
              title="Back to boards"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>

            {isEditingName ? (
              <div className="flex items-center gap-2 flex-1 max-w-md">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveBoardName();
                    if (e.key === 'Escape') setIsEditingName(false);
                  }}
                  className="input font-extrabold text-lg py-2 px-4 rounded-xl border border-indigo-400 focus:ring-4 focus:ring-indigo-100 flex-1"
                  autoFocus
                />
                <button
                  onClick={() => setIsEditingName(false)}
                  className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex-shrink-0"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={handleSaveBoardName}
                  className="p-2.5 rounded-xl text-emerald-600 hover:bg-emerald-50 transition-all flex-shrink-0"
                >
                  <Check className="w-4.5 h-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 min-w-0 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
                  {board.name}
                </h1>
                {canEdit && (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all flex-shrink-0 cursor-pointer"
                    title="Rename board"
                    id="rename-board-btn"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
                <span className={`badge ${roleConfig[myRole]} px-3 py-1 text-xs font-bold flex items-center gap-1.5 flex-shrink-0`}>
                  <Shield className="w-3 h-3" />
                  {myRole}
                </span>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Share button */}
            <button
              id="share-board-btn"
              onClick={() => setIsShareModalOpen(true)}
              className="btn btn-ghost py-2.5 px-4.5 rounded-2xl text-xs sm:text-sm font-bold border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shadow-xs flex items-center gap-2"
            >
              <Users className="w-4 h-4 text-indigo-600" />
              <span className="hidden sm:inline">Share</span>
              <span className="px-2 py-0.5 rounded-full text-xs font-extrabold bg-indigo-50 text-indigo-600 border border-indigo-100">
                {board.members.length}
              </span>
            </button>

            {/* Add Column */}
            {canEdit && (
              <>
                {isAddingColumn ? (
                  <form
                    onSubmit={handleAddColumn}
                    className="flex items-center gap-2 animate-fade-in"
                  >
                    <input
                      type="text"
                      required
                      autoFocus
                      value={newColumnTitle}
                      onChange={(e) => setNewColumnTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Escape') setIsAddingColumn(false); }}
                      placeholder="Column title..."
                      className="input text-xs sm:text-sm py-2 px-3 w-40 rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setIsAddingColumn(false)}
                      className="p-2 rounded-xl text-slate-400 hover:text-slate-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingColumn || !newColumnTitle.trim()}
                      className="btn btn-primary text-xs py-2 px-4 rounded-xl"
                    >
                      {isSubmittingColumn && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      Add
                    </button>
                  </form>
                ) : (
                  <button
                    id="add-column-btn"
                    onClick={() => setIsAddingColumn(true)}
                    className="btn btn-primary shadow-md py-2.5 px-5 text-xs sm:text-sm font-extrabold flex items-center gap-2 rounded-2xl"
                  >
                    <Plus className="w-4 h-4 stroke-[2.5]" />
                    <span className="hidden sm:inline">Add Column</span>
                  </button>
                )}
              </>
            )}

            {/* More menu (delete) */}
            {isOwner && (
              <div className="relative">
                <button
                  onClick={() => setMoreMenuOpen((v) => !v)}
                  className="w-10 h-10 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:bg-slate-50 text-slate-600 hover:text-slate-900 flex items-center justify-center transition-all cursor-pointer"
                  title="Board options"
                  id="board-more-btn"
                >
                  <MoreVertical className="w-4.5 h-4.5" />
                </button>
                {moreMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setMoreMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 z-40 w-48 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 animate-fade-in-scale">
                      <button
                        onClick={() => { setMoreMenuOpen(false); handleDeleteBoard(); }}
                        className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete Board
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
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

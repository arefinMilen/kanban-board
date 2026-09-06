'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { fetchApi } from '@/lib/api';
import {
  Plus,
  Layout,
  Users,
  Loader2,
  AlertCircle,
  ChevronRight,
  Clock,
  Layers,
  Star,
  Sparkles,
  X,
} from 'lucide-react';

interface BoardSummary {
  id: string;
  name: string;
  myRole: 'OWNER' | 'EDITOR' | 'VIEWER';
  createdAt: string;
  owner: { id: string; name: string; email: string };
  members: Array<{ id: string; role: string; user: { name: string } }>;
  _count?: { columns: number };
}

const roleConfig = {
  OWNER: { label: 'Owner', class: 'badge-owner', icon: '👑' },
  EDITOR: { label: 'Editor', class: 'badge-editor', icon: '✏️' },
  VIEWER: { label: 'Viewer', class: 'badge-viewer', icon: '👁️' },
};

export default function BoardsPage() {
  const { isAuthenticated, isLoading: isAuthLoading, user } = useAuth();
  const router = useRouter();

  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }
    if (isAuthenticated) loadBoards();
  }, [isAuthenticated, isAuthLoading, router]);

  async function loadBoards() {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchApi<BoardSummary[]>('/boards');
      setBoards(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load boards');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateBoard(e: React.FormEvent) {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    setIsCreating(true);
    try {
      const newBoard = await fetchApi<BoardSummary>('/boards', {
        method: 'POST',
        body: JSON.stringify({ name: newBoardName.trim() }),
      });
      setIsModalOpen(false);
      setNewBoardName('');
      router.push(`/boards/${newBoard.id}`);
    } catch (err: any) {
      alert(err.message || 'Failed to create board');
    } finally {
      setIsCreating(false);
    }
  }

  if (isAuthLoading || (isLoading && boards.length === 0)) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg animate-pulse-brand"
          >
            <Layers className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <p className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
            Loading your boards...
          </p>
        </div>
      </div>
    );
  }

  const ownedBoards = boards.filter((b) => b.myRole === 'OWNER');
  const sharedBoards = boards.filter((b) => b.myRole !== 'OWNER');

  return (
    <div className="flex-1 max-w-screen-xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Good to see you,{' '}
            <span className="text-gradient">{user?.name?.split(' ')[0] ?? 'there'}</span> 👋
          </h1>
          <p className="text-sm mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
            {boards.length === 0
              ? 'Create your first board to get started.'
              : `You have ${boards.length} board${boards.length !== 1 ? 's' : ''} in your workspace.`}
          </p>
        </div>

        <button
          id="create-board-btn"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex-shrink-0 shadow-md"
        >
          <Plus className="w-4.5 h-4.5" />
          New Board
        </button>
      </div>

      {/* Error notification */}
      {error && (
        <div
          className="mb-8 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold animate-fade-in"
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px solid rgba(239, 68, 68, 0.25)',
            color: 'var(--danger-400)',
          }}
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Empty state */}
      {boards.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-2xl animate-fade-in"
          style={{
            border: '2px dashed var(--border-default)',
            background: '#ffffff',
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <div
            style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.2)' }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          >
            <Sparkles className="w-8 h-8" style={{ color: 'var(--brand-600)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2">No boards created yet</h2>
          <p className="text-sm mb-8 max-w-md font-medium" style={{ color: 'var(--text-secondary)' }}>
            Create your first Kanban board to start organizing tasks, managing projects, and collaborating with your team.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary shadow-md"
          >
            <Plus className="w-4 h-4" />
            Create your first board
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Owned boards */}
          {ownedBoards.length > 0 && (
            <section className="animate-fade-in">
              <h2 className="text-xs font-extrabold uppercase tracking-widest mb-5 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <Star className="w-4 h-4" style={{ color: '#d97706' }} />
                My Boards ({ownedBoards.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
                {ownedBoards.map((board) => (
                  <BoardCard key={board.id} board={board} />
                ))}
              </div>
            </section>
          )}

          {/* Shared boards */}
          {sharedBoards.length > 0 && (
            <section className="animate-fade-in">
              <h2 className="text-xs font-extrabold uppercase tracking-widest mb-5 flex items-center gap-2" style={{ color: 'var(--text-secondary)' }}>
                <Users className="w-4 h-4" style={{ color: 'var(--accent-500)' }} />
                Shared with me ({sharedBoards.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
                {sharedBoards.map((board) => (
                  <BoardCard key={board.id} board={board} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Create Board Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div
            className="modal-card p-6 sm:p-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">Create New Board</h2>
                <p className="text-xs mt-1 font-medium" style={{ color: 'var(--text-secondary)' }}>
                  Name your board to start organizing tasks.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="btn-icon rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBoard} className="space-y-6">
              <div className="form-field">
                <label
                  htmlFor="new-board-name"
                  className="form-label"
                >
                  Board Name
                </label>
                <input
                  id="new-board-name"
                  type="text"
                  required
                  autoFocus
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="e.g. Engineering Sprint Q3"
                  className="input"
                  maxLength={60}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setNewBoardName(''); }}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  id="confirm-create-board-btn"
                  type="submit"
                  disabled={isCreating || !newBoardName.trim()}
                  className="btn btn-primary flex-1"
                >
                  {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCreating ? 'Creating...' : 'Create Board'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function BoardCard({ board }: { board: BoardSummary }) {
  const role = roleConfig[board.myRole] ?? roleConfig['VIEWER'];
  const createdDate = new Date(board.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Link
      href={`/boards/${board.id}`}
      className="group block rounded-2xl transition-all duration-200 relative overflow-hidden animate-fade-in"
      style={{
        background: '#ffffff',
        border: '1px solid var(--border-default)',
        boxShadow: 'var(--shadow-sm)',
        padding: '22px 22px 18px',
        minHeight: '165px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.45)';
        e.currentTarget.style.boxShadow = '0 10px 30px -5px rgba(99, 102, 241, 0.12)';
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top accent border strip */}
      <div
        className="absolute top-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'linear-gradient(90deg, var(--brand-500), var(--accent-500))' }}
      />

      <div>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
          <h3
            className="text-base font-bold truncate transition-colors group-hover:text-indigo-600"
            style={{ color: 'var(--text-primary)' }}
          >
            {board.name}
          </h3>
          <span className={`badge ${role.class} flex-shrink-0`}>
            {role.icon} {role.label}
          </span>
        </div>

        <p className="text-xs font-medium truncate" style={{ color: 'var(--text-muted)' }}>
          Owner: <span style={{ color: 'var(--text-secondary)' }}>{board.owner?.name}</span>
        </p>
      </div>

      <div className="mt-5 pt-3.5 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <Layout className="w-3.5 h-3.5 text-indigo-500" />
            {board._count?.columns ?? 0} columns
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-emerald-500" />
            {board.members?.length ?? 1} {board.members?.length === 1 ? 'member' : 'members'}
          </span>
        </div>
        <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity font-semibold" style={{ color: 'var(--brand-600)' }}>
          View <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );
}

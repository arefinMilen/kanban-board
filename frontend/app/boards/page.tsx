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
  Shield,
  Loader2,
  AlertCircle,
  ChevronRight,
  Clock,
  Layers,
  Star,
  Sparkles,
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
      <div className="flex-1 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div
            style={{ background: 'linear-gradient(135deg, #6366f1, #4f46e5)' }}
            className="w-12 h-12 rounded-2xl flex items-center justify-center animate-pulse-brand"
          >
            <Layers className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            Loading your boards...
          </p>
        </div>
      </div>
    );
  }

  const ownedBoards = boards.filter((b) => b.myRole === 'OWNER');
  const sharedBoards = boards.filter((b) => b.myRole !== 'OWNER');

  return (
    <div className="flex-1 max-w-screen-xl w-full mx-auto px-4 sm:px-6 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">
            Good to see you,{' '}
            <span className="text-gradient">{user?.name?.split(' ')[0] ?? 'there'}</span> 👋
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
            {boards.length === 0
              ? 'Create your first board to get started.'
              : `You have ${boards.length} board${boards.length !== 1 ? 's' : ''} in your workspace.`}
          </p>
        </div>

        <button
          id="create-board-btn"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          New Board
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          className="mb-6 p-4 rounded-xl flex items-center gap-3 text-sm animate-fade-in"
          style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.25)',
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
          className="flex flex-col items-center justify-center text-center py-20 rounded-2xl animate-fade-in"
          style={{
            border: '2px dashed var(--border-default)',
            background: 'var(--bg-surface)',
          }}
        >
          <div
            style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
          >
            <Sparkles className="w-8 h-8" style={{ color: 'var(--brand-400)' }} />
          </div>
          <h2 className="text-xl font-bold mb-2">No boards yet</h2>
          <p className="text-sm mb-8 max-w-sm" style={{ color: 'var(--text-secondary)' }}>
            Create your first Kanban board to start organizing tasks, projects, and workflows with your team.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="btn btn-primary"
          >
            <Plus className="w-4 h-4" />
            Create your first board
          </button>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Owned boards */}
          {ownedBoards.length > 0 && (
            <section className="animate-fade-in">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Star className="w-3.5 h-3.5" style={{ color: 'var(--warning-400)' }} />
                My Boards
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
                {ownedBoards.map((board) => (
                  <BoardCard key={board.id} board={board} />
                ))}
              </div>
            </section>
          )}

          {/* Shared boards */}
          {sharedBoards.length > 0 && (
            <section className="animate-fade-in">
              <h2 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                <Users className="w-3.5 h-3.5" style={{ color: 'var(--accent-400)' }} />
                Shared with me
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 stagger">
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
            <div className="mb-6">
              <h2 className="text-xl font-bold">Create New Board</h2>
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                Name your board and start organizing your work.
              </p>
            </div>

            <form onSubmit={handleCreateBoard} className="space-y-5">
              <div>
                <label
                  htmlFor="new-board-name"
                  className="block text-xs font-semibold uppercase tracking-wider mb-2"
                  style={{ color: 'var(--text-secondary)' }}
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
      className="group block rounded-xl p-5 transition-all duration-200 relative overflow-hidden animate-fade-in"
      style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-default)',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)';
        e.currentTarget.style.boxShadow = '0 4px 24px rgba(99,102,241,0.12)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Gradient top strip */}
      <div
        className="absolute top-0 left-0 right-0 h-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'linear-gradient(90deg, var(--brand-500), var(--accent-500))' }}
      />

      <div className="flex items-start justify-between mb-4">
        <h3
          className="text-base font-bold truncate pr-2 transition-colors"
          style={{ color: 'var(--text-primary)' }}
        >
          {board.name}
        </h3>
        <span className={`badge ${role.class} flex-shrink-0`}>
          {role.icon} {role.label}
        </span>
      </div>

      <p className="text-xs mb-5 truncate" style={{ color: 'var(--text-muted)' }}>
        by {board.owner?.name}
      </p>

      <div
        className="flex items-center justify-between pt-3 text-xs"
        style={{
          borderTop: '1px solid var(--border-subtle)',
          color: 'var(--text-muted)',
        }}
      >
        <span className="flex items-center gap-1.5">
          <Layout className="w-3.5 h-3.5" />
          {board._count?.columns ?? 0} columns
        </span>
        <span className="flex items-center gap-1.5">
          <Users className="w-3.5 h-3.5" />
          {board.members?.length ?? 1} members
        </span>
        <span className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          {createdDate}
        </span>
      </div>

      <div
        className="mt-3 flex items-center gap-1 text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ color: 'var(--brand-400)' }}
      >
        <span>Open board</span>
        <ChevronRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
}

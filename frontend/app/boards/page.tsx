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
  Layers,
  Star,
  Sparkles,
  X,
  UserCheck,
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
          <p className="text-sm font-semibold text-slate-500">
            Loading your boards...
          </p>
        </div>
      </div>
    );
  }

  const ownedBoards = boards.filter((b) => b.myRole === 'OWNER');
  const sharedBoards = boards.filter((b) => b.myRole !== 'OWNER');
  const userName = user?.name ? user.name.split(' ')[0] : 'there';

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      {/* Page Header Area */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-8 border-b border-slate-200/80 mb-10 animate-fade-in">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 leading-tight">
            Good to see you, <span className="text-gradient">{userName}</span> 👋
          </h1>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            {boards.length === 0
              ? 'Create your first board to get started.'
              : `You have ${boards.length} active board${boards.length !== 1 ? 's' : ''} in your workspace.`}
          </p>
        </div>

        <button
          id="create-board-btn"
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary flex-shrink-0 shadow-md py-2.5 px-5 self-start sm:self-auto"
        >
          <Plus className="w-4.5 h-4.5" />
          New Board
        </button>
      </div>

      {/* Error Notification */}
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

      {/* Empty State */}
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
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          >
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold mb-3 text-slate-900">No boards created yet</h2>
          <p className="text-sm mb-8 max-w-md font-medium text-slate-500 leading-relaxed">
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
        <div className="space-y-14">
          {/* Owned Boards Section */}
          {ownedBoards.length > 0 && (
            <section className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-600 shadow-xs">
                  <Star className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-700">
                  My Boards <span className="text-slate-400 font-semibold ml-2">({ownedBoards.length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
                {ownedBoards.map((board) => (
                  <BoardCard key={board.id} board={board} />
                ))}
              </div>
            </section>
          )}

          {/* Shared Boards Section */}
          {sharedBoards.length > 0 && (
            <section className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-200/70 text-indigo-600 shadow-xs">
                  <Users className="w-4 h-4" />
                </div>
                <h2 className="text-sm font-extrabold uppercase tracking-widest text-slate-700">
                  Shared with me <span className="text-slate-400 font-semibold ml-2">({sharedBoards.length})</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
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
            className="modal-card p-6 sm:p-8 max-w-lg w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Create New Board</h2>
                <p className="text-xs mt-1.5 font-medium text-slate-500">
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
                  className="btn btn-primary flex-1 shadow-md"
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

  return (
    <Link
      href={`/boards/${board.id}`}
      className="group block rounded-2xl transition-all duration-200 relative overflow-hidden animate-fade-in"
      style={{
        background: '#ffffff',
        border: '1px solid var(--border-default)',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        padding: '24px',
        minHeight: '180px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.45)';
        e.currentTarget.style.boxShadow = '0 12px 32px -4px rgba(99, 102, 241, 0.14)';
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top Accent Gradient Border */}
      <div
        className="absolute top-0 left-0 right-0 h-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: 'linear-gradient(90deg, var(--brand-500), var(--accent-500))' }}
      />

      {/* Card Header & Owner */}
      <div>
        <div className="flex items-start justify-between gap-3 mb-3">
          <h3
            className="text-lg font-bold tracking-tight leading-snug truncate transition-colors group-hover:text-indigo-600"
            style={{ color: 'var(--text-primary)' }}
          >
            {board.name}
          </h3>
          <span className={`badge ${role.class} flex-shrink-0 px-2.5 py-1 text-[11px]`}>
            {role.icon} {role.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-2 mb-6">
          <UserCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>Owner:</span>
          <span className="text-slate-800 font-bold ml-0.5">{board.owner?.name ?? 'Unknown'}</span>
        </div>
      </div>

      {/* Card Footer Divider & Stats */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 mt-auto">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Layout className="w-4 h-4 text-indigo-500 flex-shrink-0" />
            {board._count?.columns ?? 0} {board._count?.columns === 1 ? 'column' : 'columns'}
          </span>
          <span className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-emerald-500 flex-shrink-0" />
            {board.members?.length ?? 1} {board.members?.length === 1 ? 'member' : 'members'}
          </span>
        </div>

        <span className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity font-bold text-indigo-600">
          Open <ChevronRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}

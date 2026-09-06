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
  Search,
  FolderPlus,
  ArrowUpRight,
  Shield,
} from 'lucide-react';

interface BoardSummary {
  id: string;
  name: string;
  myRole: 'OWNER' | 'EDITOR' | 'VIEWER';
  createdAt: string;
  owner: { id: string; name: string; email: string };
  members: Array<{ id: string; role: string; user: { id: string; name: string; email: string } }>;
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
  const [searchQuery, setSearchQuery] = useState('');
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
            Loading your workspace boards...
          </p>
        </div>
      </div>
    );
  }

  const filteredBoards = boards.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const ownedBoards = filteredBoards.filter((b) => b.myRole === 'OWNER');
  const sharedBoards = filteredBoards.filter((b) => b.myRole !== 'OWNER');

  const firstName = user?.name
    ? user.name.trim().split(' ')[0]
    : user?.email
      ? user.email.split('@')[0]
      : 'there';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const totalColumns = boards.reduce((acc, b) => acc + (b._count?.columns ?? 0), 0);
  const totalMembers = new Set(
    boards.flatMap((b) => b.members?.map((m) => m.user?.id || m.id) ?? [])
  ).size;

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      
      {/* ── Hero Welcome Banner ── */}
      <div
        className="relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-10 transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
          border: '1px solid var(--border-default)',
          boxShadow: '0 4px 20px -2px rgba(99, 102, 241, 0.08), 0 2px 6px rgba(0, 0, 0, 0.03)',
        }}
      >
        {/* Soft Background Accent Glow */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, transparent 70%)',
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Kanban Pro Workspace</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
              {getGreeting()}, <span className="text-gradient">{firstName}</span> 👋
            </h1>

            <p className="text-sm sm:text-base font-medium text-slate-600 leading-relaxed">
              Manage your project boards, track task progress with fractional ordering, and collaborate with your team seamlessly.
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 pt-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100/80 px-3.5 py-1.5 rounded-xl border border-slate-200/60">
                <FolderPlus className="w-4 h-4 text-indigo-600" />
                <span>{boards.length} Active {boards.length === 1 ? 'Board' : 'Boards'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100/80 px-3.5 py-1.5 rounded-xl border border-slate-200/60">
                <Layout className="w-4 h-4 text-emerald-600" />
                <span>{totalColumns} Workflow {totalColumns === 1 ? 'Column' : 'Columns'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 bg-slate-100/80 px-3.5 py-1.5 rounded-xl border border-slate-200/60">
                <Users className="w-4 h-4 text-amber-600" />
                <span>{totalMembers > 0 ? totalMembers : 1} Team {totalMembers === 1 ? 'Member' : 'Members'}</span>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-shrink-0">
            <button
              id="create-board-btn"
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary shadow-lg py-3 px-6 text-sm font-bold flex items-center justify-center gap-2 rounded-xl"
            >
              <Plus className="w-5 h-5" />
              <span>Create New Board</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Search Bar & Section Controls ── */}
      {boards.length > 0 && (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-8">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4.5 h-4.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search boards by name..."
              className="input pl-10 pr-9 py-2.5 text-sm rounded-xl w-full bg-white border-slate-200 shadow-xs focus:bg-white"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs font-semibold text-slate-500 self-end sm:self-auto">
            Showing {filteredBoards.length} of {boards.length} total boards
          </div>
        </div>
      )}

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

      {/* ── Empty State ── */}
      {boards.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-3xl animate-fade-in"
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
            <Plus className="w-4.5 h-4.5" />
            Create your first board
          </button>
        </div>
      ) : filteredBoards.length === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
          <Search className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800 mb-1">No boards found</h3>
          <p className="text-xs text-slate-500 mb-4">No boards matched your search query &quot;{searchQuery}&quot;.</p>
          <button
            onClick={() => setSearchQuery('')}
            className="btn btn-ghost text-xs font-semibold text-indigo-600"
          >
            Clear search filter
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          
          {/* ── Owned Boards Section ── */}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
                {ownedBoards.map((board) => (
                  <BoardCard key={board.id} board={board} />
                ))}

                {/* Quick Add Card Slot inside Grid */}
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="group flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-200/90 hover:border-indigo-400/80 bg-slate-50/50 hover:bg-indigo-50/30 transition-all duration-200 min-h-[220px] text-center cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-200 group-hover:scale-110 shadow-xs transition-all mb-3">
                    <Plus className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-600">
                    Create New Board
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Add a new project board to your workspace
                  </span>
                </button>
              </div>
            </section>
          )}

          {/* ── Shared Boards Section ── */}
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

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 stagger">
                {sharedBoards.map((board) => (
                  <BoardCard key={board.id} board={board} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* ── Create Board Modal ── */}
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

  // Generate initial bubbles for members
  const memberList = board.members || [];
  const displayMembers = memberList.slice(0, 3);
  const extraCount = memberList.length - displayMembers.length;

  return (
    <Link
      href={`/boards/${board.id}`}
      className="group block rounded-2xl transition-all duration-200 relative overflow-hidden animate-fade-in"
      style={{
        background: '#ffffff',
        border: '1px solid var(--border-default)',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.03)',
        padding: '24px',
        minHeight: '220px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = 'rgba(99, 102, 241, 0.45)';
        e.currentTarget.style.boxShadow = '0 16px 36px -4px rgba(99, 102, 241, 0.12)';
        e.currentTarget.style.transform = 'translateY(-3px)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-default)';
        e.currentTarget.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.03)';
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
            className="text-lg font-extrabold tracking-tight leading-snug truncate transition-colors group-hover:text-indigo-600"
            style={{ color: 'var(--text-primary)' }}
          >
            {board.name}
          </h3>
          <span className={`badge ${role.class} flex-shrink-0 px-2.5 py-1 text-[11px]`}>
            {role.icon} {role.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mt-2 mb-4">
          <UserCheck className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
          <span>Owner:</span>
          <span className="text-slate-800 font-bold ml-0.5">{board.owner?.name ?? 'Unknown'}</span>
        </div>
      </div>

      {/* Card Footer: Members Stack + Stats */}
      <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 mt-auto">
        {/* Left: Overlapping Avatars */}
        <div className="flex items-center gap-3">
          <div className="flex -space-x-2 overflow-hidden">
            {displayMembers.map((m, idx) => {
              const name = m.user?.name || 'User';
              const initial = name.charAt(0).toUpperCase();
              return (
                <div
                  key={m.id || idx}
                  title={name}
                  className="w-6.5 h-6.5 rounded-full ring-2 ring-white flex items-center justify-center text-[10px] font-bold text-white shadow-xs"
                  style={{
                    background:
                      idx === 0
                        ? 'linear-gradient(135deg, #6366f1, #4f46e5)'
                        : idx === 1
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : 'linear-gradient(135deg, #f59e0b, #d97706)',
                  }}
                >
                  {initial}
                </div>
              );
            })}
            {extraCount > 0 && (
              <div className="w-6.5 h-6.5 rounded-full ring-2 ring-white bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-extrabold shadow-xs">
                +{extraCount}
              </div>
            )}
          </div>

          <span className="flex items-center gap-1 text-slate-500">
            <Layout className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
            {board._count?.columns ?? 0} {board._count?.columns === 1 ? 'col' : 'cols'}
          </span>
        </div>

        {/* Right: Open Arrow */}
        <span className="flex items-center gap-0.5 opacity-80 group-hover:opacity-100 transition-all font-bold text-indigo-600 group-hover:translate-x-0.5">
          <span>Open</span>
          <ArrowUpRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
}


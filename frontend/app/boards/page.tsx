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
  FolderPlus,
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

export default function BoardsPage() {
  const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [boards, setBoards] = useState<BoardSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create board modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated) {
      loadBoards();
    }
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
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-slate-400 text-sm">Loading your boards...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Your Boards</h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your Kanban projects and workspace collaborations
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-md hover:shadow-indigo-500/25 transition"
        >
          <Plus className="w-4 h-4" />
          <span>New Board</span>
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/30 rounded-lg flex items-center gap-3 text-rose-400 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {boards.length === 0 ? (
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-xl p-12 text-center bg-slate-900/50">
          <div className="p-4 bg-indigo-500/10 rounded-full text-indigo-400 mb-4">
            <FolderPlus className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-1">No boards found</h3>
          <p className="text-slate-400 text-sm max-w-sm mb-6">
            Get started by creating your first Kanban board to organize tasks and workflows.
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition"
          >
            Create Board
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {boards.map((board) => (
            <Link
              key={board.id}
              href={`/boards/${board.id}`}
              className="group bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 transition duration-200 shadow-md hover:shadow-indigo-500/10 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition truncate pr-2">
                    {board.name}
                  </h3>
                  <span
                    className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                      board.myRole === 'OWNER'
                        ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        : board.myRole === 'EDITOR'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    <Shield className="w-3 h-3" />
                    {board.myRole}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4">
                  Owner: <span className="text-slate-300">{board.owner?.name}</span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Layout className="w-4 h-4 text-slate-500" />
                  <span>{board._count?.columns ?? 0} columns</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{board.members?.length ?? 1} members</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Modal for Creating New Board */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Create New Board</h2>
            <p className="text-slate-400 text-sm mb-6">
              Enter a title for your new project board.
            </p>

            <form onSubmit={handleCreateBoard} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  Board Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="e.g. Engineering Roadmap"
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setNewBoardName('');
                  }}
                  className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreating || !newBoardName.trim()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-md transition disabled:opacity-50 flex items-center gap-2"
                >
                  {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                  <span>Create Board</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

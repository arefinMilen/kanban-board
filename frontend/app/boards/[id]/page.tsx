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
  Shield,
  Trash2,
  Edit2,
  Check,
  X,
  Loader2,
  AlertCircle,
  ArrowLeft,
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

export default function BoardDetailPage() {
  const { id } = useParams() as { id: string };
  const { user, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();

  const [board, setBoard] = useState<BoardDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit board title state
  const [isEditingName, setIsEditingName] = useState(false);
  const [name, setName] = useState('');

  // Add column state
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isSubmittingColumn, setIsSubmittingColumn] = useState(false);

  // Share board modal state
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    if (isAuthenticated && id) {
      loadBoard();
    }
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

  // Determine current user's role on this board
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
    if (
      !confirm(
        `Are you sure you want to permanently delete board "${board.name}"?`,
      )
    )
      return;

    try {
      await fetchApi(`/boards/${board.id}`, {
        method: 'DELETE',
      });
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

  if (isAuthLoading || (isLoading && !board)) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
          <span className="text-slate-400 text-sm">Loading board details...</span>
        </div>
      </div>
    );
  }

  if (error || !board) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied / Not Found</h2>
          <p className="text-slate-400 text-sm mb-6">
            {error || 'This board does not exist or you do not have permission to view it.'}
          </p>
          <Link
            href="/boards"
            className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Boards</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Board Top Header */}
      <div className="bg-slate-900/80 border-b border-slate-800 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/boards"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title="Back to all boards"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>

          {isEditingName ? (
            <div className="flex items-center gap-1.5">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="px-3 py-1 bg-slate-800 border border-slate-700 rounded-lg text-white font-bold text-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button
                onClick={() => setIsEditingName(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <button
                onClick={handleSaveBoardName}
                className="p-1.5 text-emerald-400 hover:text-emerald-300"
              >
                <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white truncate">{board.name}</h1>
              {canEdit && (
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1 text-slate-500 hover:text-indigo-400 rounded hover:bg-slate-800 transition"
                  title="Rename board"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
              myRole === 'OWNER'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : myRole === 'EDITOR'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Shield className="w-3 h-3" />
            {myRole}
          </span>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsShareModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition"
          >
            <Users className="w-4 h-4 text-indigo-400" />
            <span>Share ({board.members.length})</span>
          </button>

          {canEdit && (
            <div>
              {isAddingColumn ? (
                <form onSubmit={handleAddColumn} className="flex items-center gap-1.5">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={newColumnTitle}
                    onChange={(e) => setNewColumnTitle(e.target.value)}
                    placeholder="Column title..."
                    className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setIsAddingColumn(false)}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmittingColumn || !newColumnTitle.trim()}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded-lg transition flex items-center gap-1 disabled:opacity-50"
                  >
                    {isSubmittingColumn && <Loader2 className="w-3 h-3 animate-spin" />}
                    <span>Add</span>
                  </button>
                </form>
              ) : (
                <button
                  onClick={() => setIsAddingColumn(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded-lg shadow-sm transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Column</span>
                </button>
              )}
            </div>
          )}

          {isOwner && (
            <button
              onClick={handleDeleteBoard}
              className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition"
              title="Delete board"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Interactive Kanban Board */}
      <KanbanBoard
        initialColumns={board.columns}
        canEdit={canEdit}
        onRefresh={loadBoard}
      />

      {/* Share Board Modal */}
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

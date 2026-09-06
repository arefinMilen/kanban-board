'use client';

import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { Plus, Trash2, Edit2, Check, X, Loader2 } from 'lucide-react';
import { TaskCard, Task } from './TaskCard';
import { fetchApi } from '@/lib/api';

export interface Column {
  id: string;
  boardId: string;
  title: string;
  order: number;
  tasks: Task[];
}

interface KanbanColumnProps {
  column: Column;
  canEdit: boolean;
  onColumnUpdated: () => void;
  onColumnDeleted: (columnId: string) => void;
  onTaskCreated: () => void;
  onTaskUpdated: () => void;
  onTaskDeleted: (taskId: string) => void;
}

export function KanbanColumn({
  column,
  canEdit,
  onColumnUpdated,
  onColumnDeleted,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [isSubmittingTask, setIsSubmittingTask] = useState(false);

  async function handleSaveTitle() {
    if (!title.trim()) return;
    try {
      await fetchApi(`/columns/${column.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: title.trim() }),
      });
      setIsEditingTitle(false);
      onColumnUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to rename column');
    }
  }

  async function handleDeleteColumn() {
    if (!confirm(`Delete column "${column.title}" and all its tasks?`)) return;
    try {
      await fetchApi(`/columns/${column.id}`, { method: 'DELETE' });
      onColumnDeleted(column.id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete column');
    }
  }

  async function handleCreateTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setIsSubmittingTask(true);
    try {
      await fetchApi(`/columns/${column.id}/tasks`, {
        method: 'POST',
        body: JSON.stringify({
          title: newTaskTitle.trim(),
          description: newTaskDesc.trim() || undefined,
        }),
      });
      setNewTaskTitle('');
      setNewTaskDesc('');
      setIsAddingTask(false);
      onTaskCreated();
    } catch (err: any) {
      alert(err.message || 'Failed to create task');
    } finally {
      setIsSubmittingTask(false);
    }
  // Dynamic glassy theme mapping based on column title
  const normalizedTitle = column.title.toLowerCase().trim();

  let colTheme = {
    background: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid var(--border-default)',
    headerBorder: '#f1f5f9',
    badgeBg: '#f1f5f9',
    badgeText: '#475569',
    badgeBorder: '#e2e8f0',
    titleColor: '#0f172a',
    addBtnText: '#4f46e5',
    addBtnBg: 'rgba(99, 102, 241, 0.04)',
    addBtnBorder: 'rgba(99, 102, 241, 0.3)',
    addBtnHoverBg: 'rgba(99, 102, 241, 0.09)',
  };

  if (normalizedTitle.includes('todo') || normalizedTitle.includes('to do') || normalizedTitle.includes('backlog')) {
    colTheme = {
      background: 'linear-gradient(180deg, rgba(254, 242, 242, 0.82) 0%, rgba(255, 255, 255, 0.92) 100%)',
      border: '1.5px solid rgba(248, 113, 113, 0.28)',
      headerBorder: 'rgba(248, 113, 113, 0.16)',
      badgeBg: 'rgba(254, 226, 226, 0.85)',
      badgeText: '#991b1b',
      badgeBorder: 'rgba(248, 113, 113, 0.32)',
      titleColor: '#881337',
      addBtnText: '#e11d48',
      addBtnBg: 'rgba(244, 63, 94, 0.05)',
      addBtnBorder: 'rgba(244, 63, 94, 0.28)',
      addBtnHoverBg: 'rgba(244, 63, 94, 0.10)',
    };
  } else if (normalizedTitle.includes('progress') || normalizedTitle.includes('doing') || normalizedTitle.includes('in-progress')) {
    colTheme = {
      background: 'linear-gradient(180deg, rgba(254, 252, 232, 0.82) 0%, rgba(255, 255, 255, 0.92) 100%)',
      border: '1.5px solid rgba(251, 191, 36, 0.32)',
      headerBorder: 'rgba(251, 191, 36, 0.18)',
      badgeBg: 'rgba(254, 243, 199, 0.85)',
      badgeText: '#92400e',
      badgeBorder: 'rgba(251, 191, 36, 0.35)',
      titleColor: '#78350f',
      addBtnText: '#d97706',
      addBtnBg: 'rgba(245, 158, 11, 0.05)',
      addBtnBorder: 'rgba(245, 158, 11, 0.30)',
      addBtnHoverBg: 'rgba(245, 158, 11, 0.10)',
    };
  } else if (normalizedTitle.includes('done') || normalizedTitle.includes('complete') || normalizedTitle.includes('finished')) {
    colTheme = {
      background: 'linear-gradient(180deg, rgba(236, 253, 245, 0.82) 0%, rgba(255, 255, 255, 0.92) 100%)',
      border: '1.5px solid rgba(52, 211, 153, 0.32)',
      headerBorder: 'rgba(52, 211, 153, 0.18)',
      badgeBg: 'rgba(209, 250, 229, 0.85)',
      badgeText: '#065f46',
      badgeBorder: 'rgba(52, 211, 153, 0.35)',
      titleColor: '#064e3b',
      addBtnText: '#059669',
      addBtnBg: 'rgba(16, 185, 129, 0.05)',
      addBtnBorder: 'rgba(16, 185, 129, 0.30)',
      addBtnHoverBg: 'rgba(16, 185, 129, 0.10)',
    };
  }

  return (
    <div
      ref={setNodeRef}
      className="flex-shrink-0 flex flex-col scroll-snap-start backdrop-blur-md"
      style={{
        width: '330px',
        maxHeight: '100%',
        background: isOver ? 'rgba(99, 102, 241, 0.08)' : colTheme.background,
        border: isOver
          ? '1.5px solid rgba(99, 102, 241, 0.6)'
          : colTheme.border,
        borderRadius: '24px',
        boxShadow: isOver
          ? '0 0 0 4px rgba(99, 102, 241, 0.14), 0 8px 24px rgba(15, 23, 42, 0.08)'
          : '0 4px 20px -2px rgba(15, 23, 42, 0.04), 0 2px 6px rgba(0, 0, 0, 0.02)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        transition: 'all 0.18s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      {/* ── Column Header ─────────────────────────────── */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: '18px 20px 14px',
          borderBottom: `1px solid ${colTheme.headerBorder}`,
        }}
      >
        {isEditingTitle ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              className="input text-sm font-bold flex-1"
              style={{ padding: '6px 10px', borderRadius: '10px' }}
              autoFocus
            />
            <button onClick={() => setIsEditingTitle(false)} className="btn-icon flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSaveTitle}
              className="btn-icon flex-shrink-0"
              style={{ color: 'var(--accent-500)' }}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <h3
              className="text-base font-extrabold truncate"
              style={{ color: colTheme.titleColor, letterSpacing: '-0.01em' }}
            >
              {column.title}
            </h3>
            <span
              className="flex-shrink-0 px-2.5 py-0.5 text-xs font-extrabold rounded-full"
              style={{
                background: colTheme.badgeBg,
                border: `1px solid ${colTheme.badgeBorder}`,
                color: colTheme.badgeText,
                minWidth: '24px',
                textAlign: 'center',
              }}
            >
              {column.tasks.length}
            </span>
          </div>
        )}

        {canEdit && !isEditingTitle && (
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <button
              onClick={() => setIsEditingTitle(true)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-slate-100 transition-all cursor-pointer"
              title="Rename column"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteColumn}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-all cursor-pointer"
              title="Delete column"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Task List ──────────────────────────────────── */}
      <div
        className="flex-1 overflow-y-auto"
        style={{
          padding: '16px 16px 12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          minHeight: '120px',
        }}
      >
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            canEdit={canEdit}
            onTaskUpdated={onTaskUpdated}
            onTaskDeleted={onTaskDeleted}
          />
        ))}

        {column.tasks.length === 0 && !isAddingTask && (
          <div
            className="flex flex-col items-center justify-center text-center rounded-2xl"
            style={{
              border: '1.5px dashed #cbd5e1',
              color: '#94a3b8',
              padding: '32px 16px',
              flex: 1,
              background: '#f8fafc',
            }}
          >
            <div style={{ fontSize: '1.6rem', marginBottom: '6px' }}>📋</div>
            <p style={{ fontSize: '0.85rem', fontWeight: 700, color: '#475569' }}>No tasks yet</p>
            <p style={{ fontSize: '0.75rem', marginTop: '2px', color: '#94a3b8' }}>Drop tasks here or click below</p>
          </div>
        )}
      </div>

      {/* ── Add Task Section ───────────────────────────── */}
      {canEdit && (
        <div
          className="flex-shrink-0"
          style={{
            padding: '12px 16px 16px',
            borderTop: '1px solid #f1f5f9',
          }}
        >
          {isAddingTask ? (
            <form onSubmit={handleCreateTask} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input
                type="text"
                required
                autoFocus
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsAddingTask(false);
                    setNewTaskTitle('');
                    setNewTaskDesc('');
                  }
                }}
                placeholder="Task title..."
                className="input"
                style={{ fontSize: '0.875rem', padding: '10px 14px', borderRadius: '12px' }}
              />
              <textarea
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="input"
                style={{ fontSize: '0.8rem', padding: '10px 14px', borderRadius: '12px', resize: 'none' }}
              />
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingTask(false);
                    setNewTaskTitle('');
                    setNewTaskDesc('');
                  }}
                  className="btn btn-ghost"
                  style={{ flex: 1, fontSize: '0.8rem', padding: '9px 12px', borderRadius: '12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTask || !newTaskTitle.trim()}
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: '0.8rem', padding: '9px 12px', borderRadius: '12px', fontWeight: 800 }}
                >
                  {isSubmittingTask && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {isSubmittingTask ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingTask(true)}
              className="kanban-add-task-btn"
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '10px 16px',
                borderRadius: '14px',
                fontSize: '0.825rem',
                fontWeight: 700,
                color: colTheme.addBtnText,
                border: `1.5px dashed ${colTheme.addBtnBorder}`,
                background: colTheme.addBtnBg,
                cursor: 'pointer',
                transition: 'all 0.18s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = colTheme.addBtnHoverBg;
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = colTheme.addBtnBg;
              }}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Add task
            </button>
          )}
        </div>
      )}
    </div>
  );
}

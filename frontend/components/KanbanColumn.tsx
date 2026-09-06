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
  }

  return (
    <div
      ref={setNodeRef}
      className="flex-shrink-0 flex flex-col scroll-snap-start"
      style={{
        /* Wider columns with a comfortable minimum */
        width: '320px',
        maxHeight: '100%',
        background: isOver ? 'rgba(99,102,241,0.06)' : 'var(--bg-surface)',
        border: isOver
          ? '1.5px solid rgba(99,102,241,0.55)'
          : '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: isOver
          ? '0 0 0 4px rgba(99,102,241,0.14), var(--shadow-md)'
          : 'var(--shadow-sm)',
        transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
      }}
    >
      {/* ── Column Header ─────────────────────────────── */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          padding: '16px 18px',
          borderBottom: '1px solid var(--border-subtle)',
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
              style={{ padding: '6px 10px' }}
              autoFocus
            />
            <button onClick={() => setIsEditingTitle(false)} className="btn-icon flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSaveTitle}
              className="btn-icon flex-shrink-0"
              style={{ color: 'var(--accent-400)' }}
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <h3
              className="text-sm font-bold truncate"
              style={{ color: 'var(--text-primary)', letterSpacing: '-0.01em' }}
            >
              {column.title}
            </h3>
            <span
              className="flex-shrink-0 px-2 py-0.5 text-xs font-bold rounded-full"
              style={{
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-muted)',
                minWidth: '22px',
                textAlign: 'center',
              }}
            >
              {column.tasks.length}
            </span>
          </div>
        )}

        {canEdit && !isEditingTitle && (
          <div className="flex items-center gap-0.5 ml-2 flex-shrink-0">
            <button
              onClick={() => setIsEditingTitle(true)}
              className="btn-icon rounded-lg"
              title="Rename column"
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--brand-400)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteColumn}
              className="btn-icon rounded-lg"
              title="Delete column"
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--danger-400)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
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
          padding: '14px 14px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
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
            className="flex flex-col items-center justify-center text-center rounded-xl"
            style={{
              border: '1.5px dashed var(--border-default)',
              color: 'var(--text-muted)',
              padding: '28px 16px',
              flex: 1,
            }}
          >
            <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>📋</div>
            <p style={{ fontSize: '0.78rem', fontWeight: 600 }}>No tasks yet</p>
            <p style={{ fontSize: '0.72rem', marginTop: '2px' }}>Drop tasks here or add one below</p>
          </div>
        )}
      </div>

      {/* ── Add Task Section ───────────────────────────── */}
      {canEdit && (
        <div
          className="flex-shrink-0"
          style={{
            padding: '10px 14px 14px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          {isAddingTask ? (
            <form onSubmit={handleCreateTask} className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
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
                style={{ fontSize: '0.875rem', padding: '9px 12px' }}
              />
              <textarea
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="input"
                style={{ fontSize: '0.8rem', padding: '8px 12px', resize: 'none' }}
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
                  style={{ flex: 1, fontSize: '0.8rem', padding: '8px 12px' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTask || !newTaskTitle.trim()}
                  className="btn btn-primary"
                  style={{ flex: 1, fontSize: '0.8rem', padding: '8px 12px' }}
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
                gap: '6px',
                padding: '9px 14px',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'var(--text-muted)',
                border: '1.5px dashed var(--border-default)',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'var(--brand-400)';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.45)';
                e.currentTarget.style.background = 'rgba(99,102,241,0.07)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border-default)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Plus className="w-4 h-4" />
              Add task
            </button>
          )}
        </div>
      )}
    </div>
  );
}

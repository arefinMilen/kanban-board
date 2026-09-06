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
        width: '300px',
        maxHeight: '100%',
        background: isOver ? 'rgba(99,102,241,0.05)' : 'var(--bg-surface)',
        border: isOver
          ? '1px solid rgba(99,102,241,0.5)'
          : '1px solid var(--border-default)',
        borderRadius: 'var(--radius-xl)',
        boxShadow: isOver ? '0 0 0 3px rgba(99,102,241,0.12)' : 'none',
        transition: 'border-color 0.15s, background 0.15s, box-shadow 0.15s',
      }}
    >
      {/* Column Header */}
      <div
        className="flex items-center justify-between px-4 py-3.5 flex-shrink-0"
        style={{ borderBottom: '1px solid var(--border-subtle)' }}
      >
        {isEditingTitle ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') setIsEditingTitle(false);
              }}
              className="input text-sm py-1.5 font-bold flex-1"
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
              style={{ color: 'var(--text-primary)' }}
            >
              {column.title}
            </h3>
            <span
              className="px-2 py-0.5 text-xs font-bold rounded-full flex-shrink-0"
              style={{
                background: 'var(--bg-overlay)',
                border: '1px solid var(--border-default)',
                color: 'var(--text-muted)',
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
              className="btn-icon rounded-md"
              title="Rename column"
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--brand-400)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteColumn}
              className="btn-icon rounded-md"
              title="Delete column"
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--danger-400)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-2.5" style={{ minHeight: '100px' }}>
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
            className="flex flex-col items-center justify-center text-center py-6 rounded-xl"
            style={{
              border: '1.5px dashed var(--border-subtle)',
              color: 'var(--text-muted)',
            }}
          >
            <p className="text-xs">Drop tasks here</p>
          </div>
        )}
      </div>

      {/* Add Task Section */}
      {canEdit && (
        <div className="p-3 flex-shrink-0" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          {isAddingTask ? (
            <form onSubmit={handleCreateTask} className="space-y-2 animate-fade-in">
              <input
                type="text"
                required
                autoFocus
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Escape') setIsAddingTask(false); }}
                placeholder="Task title..."
                className="input text-sm py-2"
              />
              <textarea
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Description (optional)"
                rows={2}
                className="input text-xs py-2 resize-none"
              />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => { setIsAddingTask(false); setNewTaskTitle(''); setNewTaskDesc(''); }}
                  className="btn btn-ghost text-xs py-1.5 flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTask || !newTaskTitle.trim()}
                  className="btn btn-primary text-xs py-1.5 flex-1"
                >
                  {isSubmittingTask && <Loader2 className="w-3 h-3 animate-spin" />}
                  {isSubmittingTask ? 'Adding...' : 'Add Task'}
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingTask(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold transition-all"
              style={{ color: 'var(--text-muted)', border: '1.5px dashed var(--border-subtle)' }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = 'var(--brand-400)';
                e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
                e.currentTarget.style.background = 'rgba(99,102,241,0.06)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = 'var(--text-muted)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.background = 'transparent';
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              Add task
            </button>
          )}
        </div>
      )}
    </div>
  );
}

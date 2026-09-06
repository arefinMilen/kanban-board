'use client';

import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Trash2, Edit2, Check, X, FileText } from 'lucide-react';
import { fetchApi } from '@/lib/api';

export interface Task {
  id: string;
  columnId: string;
  title: string;
  description?: string | null;
  order: number;
}

interface TaskCardProps {
  task: Task;
  canEdit: boolean;
  onTaskUpdated: () => void;
  onTaskDeleted: (taskId: string) => void;
}

export function TaskCard({ task, canEdit, onTaskUpdated, onTaskDeleted }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    disabled: !canEdit,
  });

  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        zIndex: isDragging ? 999 : 1,
      }
    : undefined;

  async function handleSaveEdit() {
    if (!title.trim()) return;
    try {
      await fetchApi(`/tasks/${task.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || null,
        }),
      });
      setIsEditing(false);
      onTaskUpdated();
    } catch (err: any) {
      alert(err.message || 'Failed to update task');
    }
  }

  async function handleDelete() {
    if (!confirm('Delete this task?')) return;
    try {
      await fetchApi(`/tasks/${task.id}`, { method: 'DELETE' });
      onTaskDeleted(task.id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete task');
    }
  }

  /* ── Edit mode ───────────────────────────────────────── */
  if (isEditing) {
    return (
      <div
        className="rounded-xl p-3.5 space-y-3 animate-fade-in-scale"
        style={{
          background: 'var(--bg-overlay)',
          border: '1px solid var(--brand-500)',
          boxShadow: '0 0 0 3px rgba(99,102,241,0.18)',
        }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="input text-sm py-2"
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveEdit();
            if (e.key === 'Escape') setIsEditing(false);
          }}
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Description (optional)"
          rows={2}
          className="input text-xs py-2 resize-none"
        />
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => setIsEditing(false)}
            className="btn btn-ghost text-xs py-1 px-3"
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
          <button
            onClick={handleSaveEdit}
            className="btn btn-primary text-xs py-1 px-3"
          >
            <Check className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      </div>
    );
  }

  /* ── Display mode ────────────────────────────────────── */
  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        background: isDragging ? 'var(--bg-overlay)' : 'var(--bg-elevated)',
        border: isDragging
          ? '1px solid var(--brand-500)'
          : '1px solid var(--border-default)',
        boxShadow: isDragging ? 'var(--shadow-brand)' : 'var(--shadow-sm)',
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging
          ? `${style?.transform ?? ''} rotate(1.5deg)`
          : style?.transform,
      }}
      className="group rounded-xl p-3.5 transition-all duration-150 relative"
      onMouseOver={(e) => {
        if (!isDragging) {
          e.currentTarget.style.borderColor = 'rgba(99,102,241,0.35)';
          e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.35)';
        }
      }}
      onMouseOut={(e) => {
        if (!isDragging) {
          e.currentTarget.style.borderColor = 'var(--border-default)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
    >
      <div className="flex items-start gap-2.5">
        {/* Drag Handle */}
        {canEdit && (
          <button
            {...attributes}
            {...listeners}
            className="mt-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing rounded p-0.5"
            style={{ color: 'var(--text-muted)' }}
            title="Drag to move"
            tabIndex={-1}
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p
            className="text-sm font-semibold leading-snug break-words"
            style={{ color: 'var(--text-primary)' }}
          >
            {task.title}
          </p>
          {task.description && (
            <p
              className="text-xs mt-1.5 line-clamp-2 leading-relaxed flex items-start gap-1"
              style={{ color: 'var(--text-muted)' }}
            >
              <FileText className="w-3 h-3 mt-0.5 flex-shrink-0" />
              <span>{task.description}</span>
            </p>
          )}
        </div>

        {/* Action buttons */}
        {canEdit && (
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 ml-auto">
            <button
              onClick={() => setIsEditing(true)}
              className="btn-icon rounded-md"
              title="Edit task"
              style={{ color: 'var(--text-muted)' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--brand-400)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="btn-icon rounded-md"
              title="Delete task"
              style={{ color: 'var(--text-muted)' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--danger-400)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

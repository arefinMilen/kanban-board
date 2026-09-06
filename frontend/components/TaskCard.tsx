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

  /* ── Edit mode ─────────────────────────────────────── */
  if (isEditing) {
    return (
      <div
        className="rounded-xl animate-fade-in-scale"
        style={{
          background: 'var(--bg-overlay)',
          border: '1.5px solid var(--brand-500)',
          boxShadow: '0 0 0 3px rgba(99,102,241,0.18)',
          padding: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="input"
          style={{ fontSize: '0.875rem', padding: '9px 12px' }}
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
          className="input"
          style={{ fontSize: '0.8rem', padding: '8px 12px', resize: 'none' }}
        />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            onClick={() => setIsEditing(false)}
            className="btn btn-ghost"
            style={{ fontSize: '0.8rem', padding: '7px 14px' }}
          >
            <X className="w-3.5 h-3.5" />
            Cancel
          </button>
          <button
            onClick={handleSaveEdit}
            className="btn btn-primary"
            style={{ fontSize: '0.8rem', padding: '7px 14px' }}
          >
            <Check className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      </div>
    );
  }

  /* ── Display mode ──────────────────────────────────── */
  return (
    <div
      ref={setNodeRef}
      className="group"
      style={{
        ...style,
        background: isDragging ? 'var(--bg-overlay)' : 'var(--bg-elevated)',
        border: isDragging
          ? '1.5px solid var(--brand-500)'
          : '1px solid var(--border-default)',
        boxShadow: isDragging
          ? 'var(--shadow-brand), var(--shadow-lg)'
          : 'var(--shadow-sm)',
        opacity: isDragging ? 0.55 : 1,
        borderRadius: 'var(--radius-lg)',
        padding: '14px 14px 12px',
        transition: isDragging ? 'none' : 'border-color 0.15s, box-shadow 0.15s',
        transform: isDragging
          ? `${style?.transform ?? ''} rotate(1.8deg)`
          : style?.transform,
        cursor: isDragging ? 'grabbing' : 'default',
        position: 'relative',
      }}
      onMouseOver={(e) => {
        if (!isDragging) {
          e.currentTarget.style.borderColor = 'rgba(99,102,241,0.4)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.4)';
        }
      }}
      onMouseOut={(e) => {
        if (!isDragging) {
          e.currentTarget.style.borderColor = 'var(--border-default)';
          e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
        {/* Drag Handle */}
        {canEdit && (
          <button
            {...attributes}
            {...listeners}
            style={{
              marginTop: '2px',
              flexShrink: 0,
              color: 'var(--text-muted)',
              background: 'none',
              border: 'none',
              padding: '2px',
              borderRadius: '4px',
              cursor: 'grab',
              opacity: 0,
              transition: 'opacity 0.15s, color 0.15s',
            }}
            className="task-drag-handle"
            title="Drag to move"
            tabIndex={-1}
          >
            <GripVertical className="w-4 h-4" />
          </button>
        )}

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: '0.875rem',
              fontWeight: 600,
              lineHeight: 1.45,
              color: 'var(--text-primary)',
              wordBreak: 'break-word',
              letterSpacing: '-0.01em',
            }}
          >
            {task.title}
          </p>
          {task.description && (
            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '5px',
                marginTop: '7px',
              }}
            >
              <FileText
                style={{
                  width: '12px',
                  height: '12px',
                  flexShrink: 0,
                  marginTop: '1px',
                  color: 'var(--text-muted)',
                }}
              />
              <p
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical' as const,
                }}
              >
                {task.description}
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {canEdit && (
          <div
            className="task-actions"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '2px',
              flexShrink: 0,
              opacity: 0,
              transition: 'opacity 0.15s',
            }}
          >
            <button
              onClick={() => setIsEditing(true)}
              className="btn-icon rounded-md"
              title="Edit task"
              style={{ padding: '5px' }}
              onMouseOver={(e) => (e.currentTarget.style.color = 'var(--brand-400)')}
              onMouseOut={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="btn-icon rounded-md"
              title="Delete task"
              style={{ padding: '5px' }}
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

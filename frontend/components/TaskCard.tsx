'use client';

import React, { useState } from 'react';
import { useDraggable } from '@dnd-kit/core';
import { GripVertical, Trash2, Edit2, Check, X } from 'lucide-react';
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

export function TaskCard({
  task,
  canEdit,
  onTaskUpdated,
  onTaskDeleted,
}: TaskCardProps) {
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
        zIndex: isDragging ? 50 : 1,
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
    if (!confirm('Are you sure you want to delete this task?')) return;
    try {
      await fetchApi(`/tasks/${task.id}`, {
        method: 'DELETE',
      });
      onTaskDeleted(task.id);
    } catch (err: any) {
      alert(err.message || 'Failed to delete task');
    }
  }

  if (isEditing) {
    return (
      <div className="bg-slate-800 border border-indigo-500/50 rounded-lg p-3 shadow-md space-y-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Task description (optional)"
          rows={2}
          className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
        />
        <div className="flex items-center justify-end gap-1.5">
          <button
            onClick={() => setIsEditing(false)}
            className="p-1 text-slate-400 hover:text-white rounded"
            title="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
          <button
            onClick={handleSaveEdit}
            className="p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded"
            title="Save"
          >
            <Check className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group bg-slate-800/90 border border-slate-700/80 hover:border-indigo-500/40 rounded-lg p-3.5 shadow-sm transition duration-150 relative ${
        isDragging ? 'opacity-40 ring-2 ring-indigo-500 shadow-xl' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-2 flex-1 min-w-0">
          {canEdit && (
            <button
              {...attributes}
              {...listeners}
              className="mt-0.5 text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing p-0.5 rounded hover:bg-slate-700/50 transition flex-shrink-0"
              title="Drag to reorder"
            >
              <GripVertical className="w-4 h-4" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-semibold text-slate-100 break-words">
              {task.title}
            </h4>
            {task.description && (
              <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {task.description}
              </p>
            )}
          </div>
        </div>

        {canEdit && (
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition flex-shrink-0">
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-slate-400 hover:text-indigo-300 rounded hover:bg-slate-700/50 transition"
              title="Edit task"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-700/50 transition"
              title="Delete task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

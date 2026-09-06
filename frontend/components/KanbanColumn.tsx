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
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [title, setTitle] = useState(column.title);

  // Add task state
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
    if (
      !confirm(
        `Are you sure you want to delete column "${column.title}" and all its tasks?`,
      )
    )
      return;
    try {
      await fetchApi(`/columns/${column.id}`, {
        method: 'DELETE',
      });
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
      className={`w-80 flex-shrink-0 bg-slate-900/90 border rounded-xl flex flex-col max-h-full transition-colors duration-150 ${
        isOver
          ? 'border-indigo-500 bg-indigo-500/5 ring-2 ring-indigo-500/20'
          : 'border-slate-800/80'
      }`}
    >
      {/* Column Header */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        {isEditingTitle ? (
          <div className="flex items-center gap-1 flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              autoFocus
            />
            <button
              onClick={() => setIsEditingTitle(false)}
              className="p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={handleSaveTitle}
              className="p-1 text-emerald-400 hover:text-emerald-300"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <h3 className="text-sm font-bold text-white truncate">
              {column.title}
            </h3>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-slate-800 text-slate-400 border border-slate-700">
              {column.tasks.length}
            </span>
          </div>
        )}

        {canEdit && !isEditingTitle && (
          <div className="flex items-center gap-1 opacity-80 hover:opacity-100">
            <button
              onClick={() => setIsEditingTitle(true)}
              className="p-1 text-slate-400 hover:text-indigo-400 rounded hover:bg-slate-800 transition"
              title="Rename column"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleDeleteColumn}
              className="p-1 text-slate-400 hover:text-rose-400 rounded hover:bg-slate-800 transition"
              title="Delete column"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Task List */}
      <div className="flex-1 p-3 overflow-y-auto space-y-3 min-h-[150px]">
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
          <div className="h-24 border border-dashed border-slate-800 rounded-lg flex items-center justify-center text-xs text-slate-500">
            Drop tasks here
          </div>
        )}
      </div>

      {/* Add Task Form / Button */}
      {canEdit && (
        <div className="p-3 border-t border-slate-800/80">
          {isAddingTask ? (
            <form onSubmit={handleCreateTask} className="space-y-2">
              <input
                type="text"
                required
                autoFocus
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="Task title..."
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-white text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <textarea
                value={newTaskDesc}
                onChange={(e) => setNewTaskDesc(e.target.value)}
                placeholder="Description (optional)..."
                rows={2}
                className="w-full px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-md text-white text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1 text-xs text-slate-400 hover:text-white rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingTask || !newTaskTitle.trim()}
                  className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition flex items-center gap-1 disabled:opacity-50"
                >
                  {isSubmittingTask && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                  <span>Add Task</span>
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingTask(true)}
              className="w-full py-2 px-3 flex items-center justify-center gap-1.5 text-xs font-medium text-slate-400 hover:text-indigo-300 hover:bg-slate-800/80 rounded-lg transition border border-transparent hover:border-slate-700"
            >
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

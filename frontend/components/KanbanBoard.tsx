'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { KanbanColumn, Column } from './KanbanColumn';
import { TaskCard, Task } from './TaskCard';
import { fetchApi } from '@/lib/api';
import { AlertCircle, X } from 'lucide-react';

interface KanbanBoardProps {
  initialColumns: Column[];
  canEdit: boolean;
  onRefresh: () => void;
}

export function KanbanBoard({ initialColumns, canEdit, onRefresh }: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 220, tolerance: 6 },
    }),
  );

  React.useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  function handleDragStart(event: DragStartEvent) {
    const taskId = event.active.id as string;
    for (const col of columns) {
      const task = col.tasks.find((t) => t.id === taskId);
      if (task) { setActiveTask(task); break; }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);
    if (!over || !canEdit) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    let sourceCol: Column | undefined;
    let taskToMove: Task | undefined;
    for (const col of columns) {
      const t = col.tasks.find((item) => item.id === taskId);
      if (t) { sourceCol = col; taskToMove = t; break; }
    }
    if (!sourceCol || !taskToMove) return;

    let targetCol: Column | undefined = columns.find((c) => c.id === overId);
    let targetIndex = 0;
    if (targetCol) {
      targetIndex = targetCol.tasks.length;
    } else {
      for (const col of columns) {
        const index = col.tasks.findIndex((t) => t.id === overId);
        if (index !== -1) { targetCol = col; targetIndex = index; break; }
      }
    }
    if (!targetCol) return;

    const previousColumnsState = JSON.parse(JSON.stringify(columns)) as Column[];
    const nextColumns = columns.map((col) => ({ ...col, tasks: [...col.tasks] }));
    const srcColIndex = nextColumns.findIndex((c) => c.id === sourceCol!.id);
    const destColIndex = nextColumns.findIndex((c) => c.id === targetCol!.id);
    const srcTasks = nextColumns[srcColIndex].tasks;
    const movedTaskIndex = srcTasks.findIndex((t) => t.id === taskId);
    if (movedTaskIndex !== -1) srcTasks.splice(movedTaskIndex, 1);

    const destTasks = nextColumns[destColIndex].tasks;
    const updatedTask = { ...taskToMove, columnId: targetCol.id };
    const clampedIdx = Math.max(0, Math.min(targetIndex, destTasks.length));
    destTasks.splice(clampedIdx, 0, updatedTask);

    setColumns(nextColumns);

    try {
      await fetchApi(`/tasks/${taskId}/move`, {
        method: 'PATCH',
        body: JSON.stringify({ targetColumnId: targetCol.id, targetIndex: clampedIdx }),
      });
      onRefresh();
    } catch (err: any) {
      console.error('Task move failed:', err);
      setColumns(previousColumnsState);
      setErrorToast(err.message || 'Failed to move task. Reverting...');
      setTimeout(() => setErrorToast(null), 4000);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {/* Error Toast */}
      {errorToast && (
        <div className="toast toast-error">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorToast}</span>
          <button className="btn-icon ml-2" onClick={() => setErrorToast(null)}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Board Canvas — horizontally scrollable */}
        <div
          className="flex-1 flex gap-4 overflow-x-auto p-4 sm:p-6 min-h-0 items-start scroll-snap-x hide-scrollbar"
          style={{ paddingBottom: '1.5rem' }}
        >
          {columns.map((col) => (
            <KanbanColumn
              key={col.id}
              column={col}
              canEdit={canEdit}
              onColumnUpdated={onRefresh}
              onColumnDeleted={onRefresh}
              onTaskCreated={onRefresh}
              onTaskUpdated={onRefresh}
              onTaskDeleted={onRefresh}
            />
          ))}
          {columns.length === 0 && (
            <div
              className="flex-1 flex items-center justify-center"
              style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}
            >
              No columns yet. Add your first column above.
            </div>
          )}
        </div>

        {/* Drag Overlay */}
        <DragOverlay dropAnimation={{ duration: 200, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
          {activeTask ? (
            <div
              className="w-72 rotate-[2deg]"
              style={{ boxShadow: 'var(--shadow-lg)', opacity: 0.92 }}
            >
              <TaskCard
                task={activeTask}
                canEdit={canEdit}
                onTaskUpdated={() => {}}
                onTaskDeleted={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}

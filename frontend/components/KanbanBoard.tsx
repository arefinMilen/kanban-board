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
import { AlertCircle } from 'lucide-react';

interface KanbanBoardProps {
  initialColumns: Column[];
  canEdit: boolean;
  onRefresh: () => void;
}

export function KanbanBoard({
  initialColumns,
  canEdit,
  onRefresh,
}: KanbanBoardProps) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

  // Configure drag sensors with activation distance threshold
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
  );

  // Synchronize props updates when board re-fetches
  React.useEffect(() => {
    setColumns(initialColumns);
  }, [initialColumns]);

  function handleDragStart(event: DragStartEvent) {
    const taskId = event.active.id as string;
    for (const col of columns) {
      const task = col.tasks.find((t) => t.id === taskId);
      if (task) {
        setActiveTask(task);
        break;
      }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || !canEdit) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    // Find source column and task
    let sourceCol: Column | undefined;
    let taskToMove: Task | undefined;

    for (const col of columns) {
      const t = col.tasks.find((item) => item.id === taskId);
      if (t) {
        sourceCol = col;
        taskToMove = t;
        break;
      }
    }

    if (!sourceCol || !taskToMove) return;

    // Determine target column & target index
    let targetCol: Column | undefined = columns.find((c) => c.id === overId);
    let targetIndex = 0;

    if (targetCol) {
      // Dropped directly onto empty column container -> append to end
      targetIndex = targetCol.tasks.length;
    } else {
      // Dropped onto another task -> find that task's column and index
      for (const col of columns) {
        const index = col.tasks.findIndex((t) => t.id === overId);
        if (index !== -1) {
          targetCol = col;
          targetIndex = index;
          break;
        }
      }
    }

    if (!targetCol) return;

    // Backup state for rollback on error
    const previousColumnsState = JSON.parse(JSON.stringify(columns)) as Column[];

    // Compute optimistic columns state
    const nextColumns = columns.map((col) => ({
      ...col,
      tasks: [...col.tasks],
    }));

    const srcColIndex = nextColumns.findIndex((c) => c.id === sourceCol!.id);
    const destColIndex = nextColumns.findIndex((c) => c.id === targetCol!.id);

    // Remove task from source column
    const srcTasks = nextColumns[srcColIndex].tasks;
    const movedTaskIndex = srcTasks.findIndex((t) => t.id === taskId);
    if (movedTaskIndex !== -1) {
      srcTasks.splice(movedTaskIndex, 1);
    }

    // Insert task into target column at targetIndex
    const destTasks = nextColumns[destColIndex].tasks;
    const updatedTask = {
      ...taskToMove,
      columnId: targetCol.id,
    };

    const clampedTargetIndex = Math.max(0, Math.min(targetIndex, destTasks.length));
    destTasks.splice(clampedTargetIndex, 0, updatedTask);

    // 1. Immediate Optimistic UI Update
    setColumns(nextColumns);

    // 2. Invoke Move API Endpoint
    try {
      await fetchApi(`/tasks/${taskId}/move`, {
        method: 'PATCH',
        body: JSON.stringify({
          targetColumnId: targetCol.id,
          targetIndex: clampedTargetIndex,
        }),
      });
      // Optionally sync with backend response
      onRefresh();
    } catch (err: any) {
      // 3. Rollback State on Error
      console.error('Task move failed:', err);
      setColumns(previousColumnsState);
      setErrorToast(err.message || 'Failed to move task. Reverting changes.');
      setTimeout(() => setErrorToast(null), 4000);
    }
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 relative">
      {errorToast && (
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 bg-rose-900/90 border border-rose-500 text-rose-100 px-4 py-2 rounded-lg shadow-xl flex items-center gap-2 text-sm animate-bounce">
          <AlertCircle className="w-4 h-4" />
          <span>{errorToast}</span>
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-6 overflow-x-auto p-4 sm:p-6 min-h-0 items-start">
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
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="w-80 shadow-2xl opacity-90 rotate-2">
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

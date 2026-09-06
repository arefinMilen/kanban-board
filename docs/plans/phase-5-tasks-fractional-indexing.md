# Phase 5 Implementation Plan: Tasks CRUD + Move Endpoint (Fractional Indexing)

## Objective
Implement Task management and the core task move endpoint with fractional indexing in `/backend`:
1. `POST /columns/:columnId/tasks` — Create task (`EDITOR` or `OWNER`), body `{ title, description? }`. Appends task to end of column (`maxOrder + 1000.0` or `1000.0`).
2. `PATCH /tasks/:id` — Update title/description (`EDITOR` or `OWNER`).
3. `DELETE /tasks/:id` — Delete task (`EDITOR` or `OWNER`).
4. `PATCH /tasks/:id/move` — **Core fractional indexing move endpoint** (`EDITOR` or `OWNER`).
   - Body: `{ targetColumnId: string, targetIndex: number }`
   - Algorithm:
     1. Wrap in Prisma `$transaction`.
     2. Verify board membership and `EDITOR+` permissions for source and target column.
     3. Fetch existing tasks in `targetColumnId` ordered by `order` float (excluding the moved task if within same column).
     4. Calculate midpoint fractional index for `targetIndex`:
        - Empty column: `1000.0`
        - At head (`targetIndex == 0`): `firstTask.order / 2.0`
        - At tail (`targetIndex >= targetTasks.length`): `lastTask.order + 1000.0`
        - In middle (`0 < targetIndex < targetTasks.length`): `(prevTask.order + nextTask.order) / 2.0`
     5. Gap check: if `Math.abs(nextTask.order - prevTask.order) < 1e-6`, renormalize all tasks in column (`1000.0, 2000.0, 3000.0, ...`).
     6. Update task's `columnId` and `order`.
     7. Return updated task.

## Files to Create / Modify
- `src/tasks/fractional-indexing.util.ts` (pure midpoint & renormalization logic)
- `src/tasks/fractional-indexing.util.spec.ts` (unit tests for order calculation)
- `src/tasks/tasks.module.ts`
- `src/tasks/tasks.controller.ts`
- `src/tasks/tasks.service.ts`
- `src/tasks/tasks.service.spec.ts`
- `src/tasks/dto/create-task.dto.ts`
- `src/tasks/dto/update-task.dto.ts`
- `src/tasks/dto/move-task.dto.ts`
- `src/app.module.ts`

# Mini Kanban Board — Full Project Specification

> This is the authoritative spec for this project. Follow it exactly. Do not invent
> requirements, endpoints, or schema fields beyond what's listed here — ask/flag instead
> of guessing. Build incrementally, module by module, in the phase order below. After each
> phase, stop and summarize what was built before moving to the next phase.

## 0. Context

This is a take-home technical assessment for a Full-Stack Engineer role. It will be
reviewed by senior engineers who will read the code, the git history, and the README.
Code quality, correct authorization logic, and a well-reasoned task-ordering algorithm
matter more than feature quantity. Do not over-engineer, but do not cut corners on the
two things being explicitly tested: **access control** and **order consistency**.

## 1. Tech Stack (fixed — do not substitute)

- **Frontend:** Next.js (App Router), React, TypeScript, Tailwind CSS
- **Backend:** NestJS, TypeScript
- **Database/ORM:** PostgreSQL + Prisma
- **Auth:** JWT (access token + refresh token), bcrypt for password hashing
- **Drag-and-drop:** `@dnd-kit/core` on the frontend
- **DevOps:** Docker + docker-compose (Postgres, backend, frontend)
- **Testing:** Jest for backend unit/e2e tests
- **Monorepo layout:**
  ```
  /backend      -> NestJS app
  /frontend     -> Next.js app
  /docker-compose.yml
  /README.md
  ```

## 2. Data Model (Prisma schema — implement exactly this shape)

Entities:
- **User**: id, email (unique), passwordHash, name, createdAt
- **Board**: id, name, ownerId (FK -> User), createdAt
- **BoardMember**: id, boardId (FK -> Board), userId (FK -> User), role (enum: OWNER, EDITOR, VIEWER), unique constraint on (boardId, userId)
- **Column**: id, boardId (FK -> Board), title, order (float, for fractional indexing), createdAt
- **Task**: id, columnId (FK -> Column), title, description (nullable), order (float, for fractional indexing), createdAt, updatedAt

Notes:
- `order` fields use **fractional indexing** (float), not sequential integers. When
  inserting a task/column between two existing items, compute a value between their
  `order` values (e.g. midpoint). Only renormalize (reassign clean spaced-out integers
  to all siblings) when float precision gets too tight (define a minimum gap threshold,
  e.g. 1e-6, and renormalize the whole column when hit).
- Every Board/Column/Task query must be scoped through `BoardMember` — never trust a
  raw `boardId`/`columnId`/`taskId` in a request without verifying the requesting user
  has a `BoardMember` row for that board first.
- Add indexes: `@@index([columnId, order])` on Task, `@@index([boardId, order])` on Column, `@@unique([boardId, userId])` on BoardMember.

## 3. Auth Requirements

- `POST /auth/register` — email, password, name → creates user, returns access + refresh token
- `POST /auth/login` — email, password → returns access + refresh token
- `POST /auth/refresh` — refresh token → new access token
- Passwords hashed with bcrypt (cost factor 10+), never returned in any response.
- JWT access token short-lived (e.g. 15 min), refresh token longer-lived (e.g. 7 days).
- Implement a global `AuthGuard` (Passport JWT strategy) applied to all board/column/task routes.
- Implement a custom `BoardAccessGuard` (or interceptor) that, given a `boardId` in the
  route params (directly or resolved via columnId/taskId), checks the current user has
  a `BoardMember` row. Return 403 if not, 404 if the board doesn't exist (don't leak
  existence info to non-members — return 404 for both "doesn't exist" and "exists but
  no access").
- Role rules: VIEWER can read only. EDITOR and OWNER can create/update/move/delete
  columns and tasks. Only OWNER can delete the board or manage membership
  (add/remove/change role of BoardMembers).

## 4. API Endpoints (implement all of these, no more, no fewer unless noted)

### Boards
- `POST /boards` — create board (creator becomes OWNER)
- `GET /boards` — list boards the current user is a member of
- `GET /boards/:id` — board detail with columns + tasks (requires membership)
- `PATCH /boards/:id` — update board name (EDITOR+)
- `DELETE /boards/:id` — delete board (OWNER only)
- `POST /boards/:id/members` — share board: body `{ email, role }` (OWNER only)
- `DELETE /boards/:id/members/:userId` — remove member (OWNER only)

### Columns
- `POST /boards/:boardId/columns` — create column (EDITOR+), body `{ title }`, append to end
- `PATCH /columns/:id` — rename or reorder column (EDITOR+)
- `DELETE /columns/:id` — delete column and its tasks (EDITOR+)

### Tasks
- `POST /columns/:columnId/tasks` — create task (EDITOR+), appended to end of column
- `PATCH /tasks/:id` — update title/description (EDITOR+)
- `DELETE /tasks/:id` — delete task (EDITOR+)
- `PATCH /tasks/:id/move` — **the core endpoint.** Body:
  ```json
  { "targetColumnId": "uuid", "targetIndex": 2 }
  ```
  Behavior:
  1. Wrap in a Prisma `$transaction`.
  2. Verify user has EDITOR+ access to the board owning both source and target column.
  3. Look up the tasks currently in `targetColumnId` ordered by `order`.
  4. Compute new `order` value for the moved task based on `targetIndex` (midpoint of
     neighbors at that index, or above/below the single neighbor at the boundary).
  5. If gap too small, renormalize all tasks in that column.
  6. Update the task's `columnId` and `order` in the same transaction.
  7. Return the updated task (and optionally the full updated column task list).

## 5. Frontend Requirements

- Pages: `/login`, `/register`, `/boards` (list), `/boards/[id]` (board view).
- Auth: store access token in memory/context + refresh flow; redirect unauthenticated
  users to `/login`.
- Board view: columns rendered side by side, tasks as cards, drag-and-drop via
  `@dnd-kit/core` both within a column and across columns.
- On drop: optimistically update local state immediately, call `PATCH /tasks/:id/move`,
  roll back to previous state on error (with a toast/error message).
- Basic board-sharing UI: an "Share" button/modal on the board view that calls the
  members endpoint.
- Keep styling clean and minimal with Tailwind — no need for a design system, just
  legible spacing, clear column boundaries, and obvious drag affordance.

## 6. Testing Requirements

- Backend unit tests for the move-endpoint order-calculation logic in isolation
  (pure function if possible, e.g. `computeNewOrder(prevOrder, nextOrder)`).
- Backend e2e tests (Jest + supertest or Nest's testing module) covering:
  - Register + login flow
  - Creating a board and confirming the creator is OWNER
  - A non-member attempting to access a board gets 403/404
  - Moving a task within a column and across columns updates order correctly
- Aim for meaningful coverage on auth guards and the move endpoint specifically —
  don't chase 100% coverage on trivial CRUD.

## 7. DevOps & Docs

- `docker-compose.yml` with services: `postgres`, `backend`, `frontend`. Backend runs
  Prisma migrations on startup (or document a manual `npx prisma migrate deploy` step).
- `.env.example` in both `/backend` and `/frontend` with all required variables
  (DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, NEXT_PUBLIC_API_URL, etc).
- `README.md` at repo root must include:
  1. Project overview (2-3 sentences)
  2. Architecture summary (mention fractional indexing decision and why)
  3. Setup instructions (local + Docker)
  4. Sample `.env` values
  5. How to run tests
  6. A short "Design Decisions" section explaining: ordering strategy, access-control
     model, and any trade-offs made given the 4-day timeframe.
- Add a basic Prisma `seed.ts` that creates 1-2 demo users and a demo board with
  columns/tasks so reviewers can explore immediately.
- Optional but valuable: Swagger/OpenAPI setup on NestJS (`@nestjs/swagger`), and a
  simple GitHub Actions workflow that runs lint + tests on push.

## 8. Build Order (do not skip ahead)

1. Monorepo scaffold + Prisma schema + migrations + seed script
2. Auth module (register/login/refresh, guards)
3. Boards + BoardMember CRUD with access control
4. Columns CRUD
5. Tasks CRUD + the move endpoint with fractional indexing (write the unit test for
   order calculation alongside this, not after)
6. Frontend: auth pages → board list → board view (static) → drag-and-drop wiring
7. Docker Compose + README + seed data polish
8. e2e tests + (optional) CI workflow

## 9. Explicit Non-Goals

Do not add: real-time websocket sync, notifications, file attachments, comments,
activity logs, or any feature not listed above. Scope discipline matters more than
feature count for this assessment.

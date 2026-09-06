# Phase 6 Implementation Plan: Frontend Application

## Objective
Implement Next.js App Router frontend with complete authentication flow, board management, and `@dnd-kit/core` drag-and-drop task movement:

1. **Auth Integration**:
   - `AuthContext`: In-memory access token storage, refresh token handling, auto-login check (`/auth/me`), protected route redirects to `/login`.
   - Pages: `/login` (Email & Password), `/register` (Name, Email, Password).

2. **Board List Page (`/boards`)**:
   - Board card grid displaying user's member boards and roles.
   - Create Board modal / inline form calling `POST /boards`.

3. **Board View Page (`/boards/[id]`)**:
   - Board detail view rendering columns side-by-side with task cards.
   - Add Column button/form (`POST /boards/:boardId/columns`).
   - Add Task button/form per column (`POST /columns/:columnId/tasks`).
   - Share Board Modal (`POST /boards/:id/members`) allowing owner to invite/remove members.

4. **Drag-and-Drop Task Ordering (`@dnd-kit/core`)**:
   - `@dnd-kit/core` `DndContext`, `useDraggable`, `useDroppable` setup for cross-column & intra-column task dragging.
   - **Optimistic UI Updates**: Local state updates instantly on drop.
   - API Call: Triggers `PATCH /tasks/:id/move` with `{ targetColumnId, targetIndex }`.
   - Rollback: Reverts local state and displays error toast if API fails.

## Dependencies to Install in `/frontend`
- `@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`
- `lucide-react` (icons)

## Files to Create in `/frontend`
- `lib/api.ts` (Fetch wrapper with Bearer token header and token refresh interceptor)
- `context/AuthContext.tsx`
- `app/login/page.tsx`
- `app/register/page.tsx`
- `app/boards/page.tsx`
- `app/boards/[id]/page.tsx`
- `components/Navbar.tsx`
- `components/ShareBoardModal.tsx`
- `components/KanbanBoard.tsx`
- `components/KanbanColumn.tsx`
- `components/TaskCard.tsx`

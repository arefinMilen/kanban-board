# Phase 3 Implementation Plan: Boards + BoardMember CRUD

## Objective
Implement Board and BoardMember CRUD endpoints in `/backend` with fine-grained access control:
1. `POST /boards` — Create board (creator automatically added as `OWNER` in `BoardMember`).
2. `GET /boards` — List all boards where current user is a member (returns board info, user's role, member count).
3. `GET /boards/:id` — Detailed board view with nested `columns` (ordered by `order` float) and `tasks` (ordered by `order` float). Guarded by `BoardAccessGuard`.
4. `PATCH /boards/:id` — Rename board (Guarded by `BoardAccessGuard`, requires `EDITOR` or `OWNER` role).
5. `DELETE /boards/:id` — Delete board and cascade (Guarded by `BoardAccessGuard`, requires `OWNER` role).
6. `POST /boards/:id/members` — Share board with user by email and role (`OWNER` only).
7. `DELETE /boards/:id/members/:userId` — Remove board member (`OWNER` only).

## Files to Create / Modify
- `src/boards/boards.module.ts`
- `src/boards/boards.controller.ts`
- `src/boards/boards.service.ts`
- `src/boards/dto/create-board.dto.ts`
- `src/boards/dto/update-board.dto.ts`
- `src/boards/dto/add-member.dto.ts`
- `src/app.module.ts`

# Phase 4 Implementation Plan: Columns CRUD

## Objective
Implement Column management endpoints in `/backend` with fractional order calculation:
1. `POST /boards/:boardId/columns` — Create column (`EDITOR` or `OWNER`), body `{ title }`. Calculates new float `order` (appends to end of board columns, e.g. `lastOrder + 1000.0` or `1000.0` if first column).
2. `PATCH /columns/:id` — Rename or reorder column (`EDITOR` or `OWNER`), body `{ title?, order? }`.
3. `DELETE /columns/:id` — Delete column and its associated tasks (`EDITOR` or `OWNER`).

## Files to Create / Modify
- `src/columns/columns.module.ts`
- `src/columns/columns.controller.ts`
- `src/columns/columns.service.ts`
- `src/columns/dto/create-column.dto.ts`
- `src/columns/dto/update-column.dto.ts`
- `src/app.module.ts`

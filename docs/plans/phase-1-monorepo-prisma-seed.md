# Phase 1 Implementation Plan: Monorepo Scaffold + Prisma Schema + Seed Script

## 1. Scope & Objective
Establish the project scaffold according to the fixed tech stack:
- **Backend:** NestJS, TypeScript, Prisma, PostgreSQL
- **Frontend:** Next.js (App Router), TypeScript, Tailwind CSS
- **Root:** `.gitignore`, `README.md`, `docs/plans/`

## 2. Entities & Schema Specification
- `User`: id, email (unique), passwordHash, name, createdAt
- `Board`: id, name, ownerId (FK -> User), createdAt
- `BoardMember`: id, boardId (FK -> Board), userId (FK -> User), role (OWNER, EDITOR, VIEWER), unique constraint on (boardId, userId)
- `Column`: id, boardId (FK -> Board), title, order (float, for fractional indexing), createdAt
- `Task`: id, columnId (FK -> Column), title, description (nullable), order (float, for fractional indexing), createdAt, updatedAt

Indexes:
- `Task`: `@@index([columnId, order])`
- `Column`: `@@index([boardId, order])`
- `BoardMember`: `@@unique([boardId, userId])`

## 3. Seed Script Requirements
Seed file `backend/prisma/seed.ts` creating:
- Demo Users (Owner, Editor, Viewer) with hashed passwords
- Demo Board with BoardMember assignments
- Standard Kanban columns (To Do, In Progress, Done) with fractional order values
- Sample tasks with fractional order values

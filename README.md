# Mini Kanban Board

A full-stack collaborative Kanban board application built with Next.js, NestJS, Prisma, and PostgreSQL.

## Overview
This application features real-time interactive drag-and-drop task ordering using **fractional indexing**, fine-grained role-based access control (OWNER, EDITOR, VIEWER), and secure JWT authentication.

## Architecture & Design Decisions

### Ordering Strategy (Fractional Indexing)
Tasks and Columns utilize float-based `order` values rather than sequential integer positions. When a task is moved between two siblings, its new position is computed as the midpoint between their `order` values ($order_{new} = \frac{order_{prev} + order_{next}}{2}$).
- **Why Fractional Indexing?** Reordering an item is an $O(1)$ database update on a single row without modifying or shifting $N$ adjacent rows.
- **Renormalization:** When the delta between adjacent floats drops below a minimum threshold ($10^{-6}$), all sibling items in the column are automatically renormalized to evenly spaced floats ($1000, 2000, 3000, ...$).

### Access Control Model
- Access is strictly evaluated via `BoardMember` relationships. Direct IDs in requests (`boardId`, `columnId`, `taskId`) are verified against the user's membership.
- Non-members attempting to access non-existent or restricted boards receive `404 Not Found` to avoid leaking board existence.
- **Roles:**
  - `OWNER`: Full management (board deletion, inviting/removing members, role changes, CRUD on columns/tasks).
  - `EDITOR`: Full CRUD on columns and tasks, and moving tasks.
  - `VIEWER`: Read-only access to board detail, columns, and tasks.

## Setup Instructions

### Prerequisites
- Node.js v18+
- Docker & Docker Compose (or local PostgreSQL instance)

### Environment Variables
Copy `.env.example` to `.env` in both `/backend` and `/frontend` directories.

### Local Development
```bash
# Install backend dependencies
cd backend
npm install
npx prisma migrate dev
npm run seed
npm run start:dev

# Install frontend dependencies (in another terminal)
cd ../frontend
npm install
npm run dev
```

## Running Tests
```bash
cd backend
npm run test        # Unit tests
npm run test:e2e    # E2E tests
```

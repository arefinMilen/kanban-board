# Mini Kanban Board

A full-stack collaborative Kanban board application built with Next.js (App Router), NestJS, PostgreSQL, Prisma ORM, and `@dnd-kit/core`.

## 1. Project Overview
This application enables users to manage projects, columns, and tasks with real-time interactive drag-and-drop task reordering. Tasks and columns are ordered using a **fractional indexing algorithm** to achieve $O(1)$ database updates. Access control is enforced across all resources (`OWNER`, `EDITOR`, `VIEWER`), ensuring strict data boundaries and security.

---

## 2. Architecture & Design Decisions

### Ordering Strategy (Fractional Indexing)
- **Concept:** Rather than using sequential integer ranks ($1, 2, 3, \dots, N$) which require updating $N$ sibling rows on every move, tasks and columns use floating-point `order` values ($1000.0, 2000.0, 3000.0$).
- **Midpoint Calculation:** When a task is moved to position $i$ between neighbors with orders $prev$ and $next$, the new order is computed as $order_{new} = \frac{prev + next}{2}$.
  - Inserting at head ($i = 0$): $order_{new} = \frac{order_{first}}{2}$.
  - Inserting at tail ($i \ge N$): $order_{new} = order_{last} + 1000.0$.
- **Renormalization Threshold:** When the gap between adjacent floating-point numbers drops below $10^{-6}$, a column-wide renormalization automatically resets all items in that column to clean, evenly spaced float increments ($1000.0, 2000.0, 3000.0, \dots$) within the same database transaction.

### Access Control Model
- **Membership Scoping:** Every request targeting a board, column, or task is verified through the `BoardMember` table. Direct IDs are never trusted without active membership validation.
- **Security & Non-Leakage:** Unauthenticated or unauthorized users accessing non-existent or restricted boards receive `404 Not Found` rather than `403 Forbidden` to prevent leaking the existence of private boards.
- **Roles & Permissions:**
  - `OWNER`: Full management including board deletion, member invitations/removals, role updates, and full column/task CRUD.
  - `EDITOR`: Full CRUD on columns and tasks, and moving tasks between columns.
  - `VIEWER`: Read-only access to board details, columns, and tasks. Drag-and-drop handles and editing UI controls are automatically hidden.

### Trade-offs Made
- **Fractional Indexing vs. Integer Shift:** Fractional indexing optimizes for read/write performance by reducing database locks to a single row during drag-and-drop operations, trading off occasional renormalization queries.
- **JWT Storage:** Short-lived JWT access tokens are stored in-memory in React context (`AuthContext`), while longer-lived refresh tokens are stored in `localStorage` with automated silent refresh interceptors.

---

## 3. Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS, `@dnd-kit/core`, Lucide Icons
- **Backend:** NestJS, TypeScript, Passport.js, JWT, bcrypt
- **Database / ORM:** PostgreSQL, Prisma ORM
- **Testing:** Vitest for backend unit tests
- **DevOps:** Docker, Docker Compose

---

## 4. Setup Instructions

### Environment Variables

Copy `.env.example` to `.env` in both `/backend` and `/frontend` directories.

#### Backend (`backend/.env`)
```env
PORT=3001
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/kanban_db?schema=public"
JWT_SECRET="super-secret-access-token-key-change-in-prod"
JWT_REFRESH_SECRET="super-secret-refresh-token-key-change-in-prod"
JWT_ACCESS_EXPIRATION="15m"
JWT_REFRESH_EXPIRATION="7d"
CORS_ORIGIN="http://localhost:3000"
```

#### Frontend (`frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL="http://localhost:3001"
```

---

### Option A: Local Development

#### 1. Start PostgreSQL
Ensure PostgreSQL is running locally on port `5432`.

#### 2. Run Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
npm run seed
npm run start:dev
```
Backend API will start at: `http://localhost:3001`

#### 3. Run Frontend (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend App will start at: `http://localhost:3000`

---

### Option B: Running with Docker Compose

Run the entire application stack (PostgreSQL, NestJS Backend, Next.js Frontend) with a single command:
```bash
docker-compose up --build
```
Docker Compose automatically runs database migrations and seeds initial demo data on startup.

---

## 5. Demo Credentials

After seeding, you can log in with any of the pre-configured demo users (Password for all: `Password123!`):

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Owner** | `owner@example.com` | `Password123!` | Full control, invite members, delete board |
| **Editor** | `editor@example.com` | `Password123!` | Create/edit/move tasks & columns |
| **Viewer** | `viewer@example.com` | `Password123!` | Read-only access |

---

## 6. Running Tests

Run backend unit tests (covers fractional indexing midpoint math, auth service, boards, columns, and task services):
```bash
cd backend
npm test
```

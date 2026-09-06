# Phase 8 Implementation Plan: E2E Tests & GitHub Actions CI Workflow

## Objective
Implement backend End-to-End (E2E) integration tests and GitHub Actions CI workflow:

1. **Backend E2E Integration Suite (`backend/test/app.e2e-spec.ts`)**:
   - Test 1: User Registration & Authentication flow (`POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`).
   - Test 2: Board creation and verifying creator is assigned `OWNER` role (`POST /boards`).
   - Test 3: Security & Access Control: non-member attempting to access private board gets `404 Not Found`.
   - Test 4: Task creation & movement: moving a task within a column and across columns calculates float `order` correctly.

2. **GitHub Actions CI Workflow (`.github/workflows/ci.yml`)**:
   - Triggers on `push` and `pull_request` to `main`.
   - Runs PostgreSQL service container.
   - Executes backend lint & unit tests (`npm test` in `/backend`).
   - Executes backend E2E tests (`npm run test:e2e` in `/backend`).
   - Executes frontend build check (`npm run build` in `/frontend`).

## Files to Create / Modify
- `backend/test/app.e2e-spec.ts`
- `.github/workflows/ci.yml`

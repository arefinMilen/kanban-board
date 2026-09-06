# Phase 2 Implementation Plan: Auth Module

## Objective
Implement authentication & access guard infrastructure in `/backend`:
1. `POST /auth/register` - Email, password, name -> creates user, returns access + refresh tokens.
2. `POST /auth/login` - Email, password -> returns access + refresh tokens.
3. `POST /auth/refresh` - Body `{ refreshToken }` -> returns new access token.
4. Passwords hashed using bcrypt (cost factor 10). Passwords are never returned in responses.
5. Short-lived JWT access token (15m) + long-lived JWT refresh token (7d).
6. Global `AuthGuard` (Passport JWT Strategy) with `@Public()` decorator bypass for auth endpoints.
7. Custom `BoardAccessGuard` verifying `BoardMember` rows for requested board IDs.

## Files to Create / Modify in Backend
- `src/auth/auth.module.ts`
- `src/auth/auth.controller.ts`
- `src/auth/auth.service.ts`
- `src/auth/dto/register.dto.ts`
- `src/auth/dto/login.dto.ts`
- `src/auth/dto/refresh.dto.ts`
- `src/auth/strategies/jwt.strategy.ts`
- `src/auth/guards/jwt-auth.guard.ts`
- `src/auth/guards/board-access.guard.ts`
- `src/auth/decorators/public.decorator.ts`
- `src/auth/decorators/current-user.decorator.ts`
- `src/auth/decorators/roles.decorator.ts`

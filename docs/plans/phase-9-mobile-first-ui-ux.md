# Phase 9: UI/UX Mobile-First & Modern Design Overhaul

## Objective
Transform the Mini Kanban Board UI/UX into a world-class, **Linear-inspired mobile-first web application** that looks stunning and operates flawlessly on phones, tablets, and desktops.

## Benchmark Design
- **Inspiration**: Linear.app
- **Aesthetic**: Deep dark mode (`#0b0f19`), glassmorphism cards (`backdrop-blur-md bg-slate-900/80 border-white/10`), vibrant indigo & emerald accents.
- **Mobile Experience**:
  - Top sticky **Column Tab Bar** (`To Do`, `In Progress`, `Done`) for 1-tap column switching on mobile.
  - Horizontal swipe-snap scrolling (`snap-x snap-mandatory`).
  - `@dnd-kit` touch sensor optimization (`delay: 250ms`, `tolerance: 5px`).
  - Slide-up bottom sheet modals for task creation & editing on mobile.

## Key Changes
1. `frontend/app/globals.css`: Modern design system tokens & mobile snap utilities.
2. `frontend/app/boards/[id]/page.tsx`: Responsive board grid & mobile column tabs.
3. `frontend/components/TaskCard.tsx`: Linear-style card UI, priority badges, drag handle.
4. `frontend/components/TaskModal.tsx`: Responsive bottom-sheet / modal dialog.

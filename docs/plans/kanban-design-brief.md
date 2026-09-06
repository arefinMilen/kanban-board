# Design Brief — Kanban Board (Light, Professional Theme)

> Feed this to the agent alongside the project spec. Follow it exactly — do not
> substitute glassmorphism, gradients, dark mode, or generic SaaS-card styling for
> any of the values below.

## Concept

A Kanban board is, at its root, a set of physical cards signaling work-in-progress
on a rail. The UI should feel like a clean, tactile card system — flat surfaces,
hairline dividers, one deliberate accent color — not a glowing dashboard. Think
"well-run engineering tool," not "marketing landing page."

## Color

```css
--bg-canvas: #EEEFEB;        /* app background, soft stone paper, not pure white */
--bg-surface: #FFFFFF;       /* cards, panels — flat white, no transparency/blur */
--bg-surface-muted: #F6F6F3; /* column headers, subtle recessed areas */
--ink-primary: #20242A;      /* body text, headings */
--ink-secondary: #676D76;    /* metadata, timestamps, secondary labels */
--rule: #DEDFDA;             /* hairline borders and dividers everywhere */
--accent: #1F6F63;           /* single brand accent — deep teal, used sparingly */
--accent-hover: #185A50;
--accent-tint: #E4EFEC;      /* accent at low opacity for subtle backgrounds */
--danger: #B3261E;
--warning: #9A6700;
```

Rules:
- The accent color appears in exactly these places: primary button fill, active nav
  item, focus ring, drop-target outline, and the "dragging" card border. Nowhere else.
- No gradients anywhere. No `backdrop-filter` / blur. No glassmorphism.
- Shadows are used sparingly and mean something: only the actively-dragged card and
  open modals get a real shadow. Static cards get a 1px border, not a shadow.

## Typography

- **Headings / board & column titles:** a serif with character — Fraunces or Source
  Serif 4 — weight 500–600. This is the one place personality shows.
- **UI / body text:** IBM Plex Sans, weights 400–600, 14px base, normal letter-spacing
  (no negative tracking, no uppercase labels).
- **Task IDs / timestamps only:** IBM Plex Mono, 12px — this is the one legitimate use
  of monospace, don't apply it to buttons or general labels.
- Sentence case everywhere in UI copy and badges — no ALL CAPS labels.

## Buttons

- **Primary:** solid `--accent` fill, white text, no gradient. On hover: `--accent-hover`,
  no lift/glow — just the color shift.
- **Secondary / ghost:** transparent background, `1px solid var(--rule)` border,
  `--ink-primary` text. On hover: border becomes `--ink-secondary`, background
  `--bg-surface-muted`.
- **Destructive:** same shape as secondary but text/border in `--danger`, filled only
  on confirm step (e.g. inside a delete confirmation).
- **Icon buttons:** 32px hit target, no background at rest, `--bg-surface-muted`
  background on hover, appear only on card hover (via a wrapper hover state) rather
  than being visible at all times — keeps cards uncluttered.

## Motion

- One entrance animation on initial board load only: columns fade + slide up 8px,
  staggered 40ms per column. Nothing re-triggers this on every render.
- Card drag: no rotation, no scale-bounce. Just a lift (small real shadow) while
  held, and a smooth settle into place on drop (150–200ms ease-out).
- Hover states are instant color/border transitions (120ms), not animated transforms.
- Respect `prefers-reduced-motion`: disable the load stagger and drop-settle easing
  for users who request it.

## Role badges (Owner / Editor / Viewer)

Skip the multi-color badge-kit look. Use one shape, sentence case, differentiated
by a small solid dot rather than three different background colors:

```
● Owner    (dot: --accent)
● Editor   (dot: --ink-secondary)
● Viewer   (dot: --rule, filled)
```

Badge style: `--bg-surface-muted` background, `1px solid var(--rule)`, `12px`
border-radius, `4px 10px` padding, dot + label inline.

## Kanban canvas

- Horizontal scroll with scroll-snap on columns.
- Columns: 300px wide, no card/box styling on the column itself — just a
  `--bg-surface-muted` header row and a `1px solid var(--rule)` divider between
  columns (not individual boxed panels with shadows).
- Column header: title (serif, 15px) + a plain count in `--ink-secondary`, e.g.
  "Backlog · 6" — no colored count pill.
- Canvas padding: 24px. Gap between columns: 20px.
- **Drop target state:** when dragging a card over a column, show a dashed
  `2px dashed var(--accent)` outline around the drop area — no glow, no ring.

## Task cards

- `--bg-surface` background, `1px solid var(--rule)` border, `10px` border-radius
  (moderate, not the 20px pill-everything look).
- `12px` padding. Title in ink-primary, 14px, medium weight. Optional description
  preview in `--ink-secondary`, 13px, 2-line clamp.
- Priority/label indicator: a 3px colored bar on the card's left edge only — not a
  tinted card background.
- On hover: border shifts from `--rule` to `--ink-secondary` (not accent — accent is
  reserved for active/dragging states specifically). Edit/delete icon buttons fade in.
- While dragging: border becomes `--accent`, add a real but modest shadow
  (`0 4px 12px rgba(0,0,0,0.12)`), no rotation.

## Modals

- Overlay: `rgba(32,36,42,0.4)`, no blur.
- Modal surface: `--bg-surface`, `1px solid var(--rule)`, `12px` border-radius,
  `0 8px 24px rgba(0,0,0,0.12)` shadow.
- Entrance: fade + 8px slide up, 150ms — no scale-bounce.

## Empty & error states

- Written in the interface's voice: plain, direct, tells the user what to do next.
  Example: an empty column says "No tasks yet" with a small "Add task" action, not
  a mascot illustration or a joke.
- Errors state what happened and how to fix it — no apologies, no vague "Something
  went wrong" without a next step.

## Global CSS variables (Tailwind v4 + pure CSS custom properties, no dark mode for v1)

```css
:root {
  --bg-canvas: #EEEFEB;
  --bg-surface: #FFFFFF;
  --bg-surface-muted: #F6F6F3;
  --ink-primary: #20242A;
  --ink-secondary: #676D76;
  --rule: #DEDFDA;
  --accent: #1F6F63;
  --accent-hover: #185A50;
  --accent-tint: #E4EFEC;
  --danger: #B3261E;
  --warning: #9A6700;
  --radius-sm: 8px;
  --radius-md: 10px;
  --radius-lg: 12px;
  --shadow-card-dragging: 0 4px 12px rgba(0,0,0,0.12);
  --shadow-modal: 0 8px 24px rgba(0,0,0,0.12);
}
```

## Accessibility floor (non-negotiable, don't skip for time)

- All interactive elements have a visible keyboard focus ring using `--accent`.
- Text/background contrast meets WCAG AA (verify `--ink-secondary` on `--bg-surface`).
- Drag-and-drop has a keyboard-accessible fallback (dnd-kit supports this — enable it,
  don't ship mouse-only reordering).
- Respect `prefers-reduced-motion` as noted above.

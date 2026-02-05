# Phase 3 — UI Layout (Two Panes)

## Goal (from `project.md`)

Deliver the `/` page UI skeleton:

- Title heading: **"To Do"**
- Two equal-width panes side-by-side:
  - **Left: Tasks**
  - **Right: Meetings**
- Each pane includes:
  - A heading
  - A button (`New Task` / `New Meeting`)
  - A simple sheet-like placeholder table/list area (no data wiring yet)

**Explicitly not in Phase 3:** fetching data, Pinia stores, creating rows, inline editing, autosave, optimistic updates.

---

## Current State (repo reality)

- Backend CRUD endpoints already exist under `server/api/tasks/*` and `server/api/meetings/*`.
- Prisma + SQLite schema exists (`prisma/schema.prisma`).
- The UI entry currently renders `NuxtWelcome` via `app/app.vue`.
- There is no `app/pages/` route file yet for `/`.

Phase 3 replaces the default welcome screen with the MVP layout skeleton.

---

## Web Research Summary (why this approach)

- Nuxt 4 file-based routing uses `app/pages/`, where `app/pages/index.vue` maps to `/`.
  - Docs: `https://nuxt.com/docs/4.x/guide/directory-structure/app/pages`
- When using pages, `app/app.vue` should render the current route via `<NuxtPage />` (optionally wrapped in `<NuxtLayout>`).
  - Docs: `https://nuxt.com/docs/4.x/api/components/nuxt-page`
  - Docs: `https://nuxt.com/docs/guide/directory-structure/app`
- For two equal-width panes, CSS Grid with `repeat(2, minmax(0, 1fr))` is a reliable pattern that prevents one column from growing due to content.
  - Background: `https://developer.mozilla.org/en-US/docs/Web/CSS/minmax`

---

## Deliverables

- `/` renders the layout from `project.md`:
  - `To Do` heading at the top
  - Two equal panes with headings and buttons
  - Placeholder sheet-like areas (table header + empty body is fine)
- `NuxtWelcome` is removed from the UI (replaced by the app page).

---

## File / Folder Plan

Create:

```
app/
  pages/
    index.vue
```

Update:

```
app/app.vue
```

(No new dependencies needed.)

---

## Implementation Notes (keep it minimal)

- Use `app/pages/index.vue` to implement the single-page UI.
- Use a simple CSS Grid wrapper for the two panes:
  - Desktop: 2 columns (`repeat(2, minmax(0, 1fr))`)
  - Small screens: stack to 1 column via a media query
- Keep the “sheet-like” look lightweight:
  - Use a `<table>` with a header row and an empty `<tbody>` (placeholder)
  - Or a div-based grid that visually resembles rows/columns (still placeholder)

---

## Demo / Verification (Phase 3 Acceptance)

Run:

```bash
npm run dev
```

Verify:

- [ ] Visiting `http://localhost:3000/` shows **"To Do"**
- [ ] Two equal-width panes are visible side-by-side on desktop widths
- [ ] Each pane has the correct heading and button text
- [ ] Each pane has a placeholder table/list area
- [ ] On narrow screens, panes stack vertically (still readable)


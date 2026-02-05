# Phase 6 — UX Polish & Ordering

## Goal (from `project.md`)

Polish the Excel-like UX and ensure ordering stays stable:

- Subtle **priority highlighting** for Tasks where `priority === 'High'`
- Better **completed row styling** (not just the text)
- Optional: **search box** to filter items quickly
- Ensure **stable ordering** using `orderIndex`

---

## Current State (repo reality)

- **Phase 5 is already implemented in code**:
  - Inline editing (save on blur / Enter)
  - Done toggle (optimistic via stores)
  - Delete with confirm (optimistic via stores)
  - Implemented in `app/pages/index.vue` + Pinia stores `app/stores/*`
- **Ordering infrastructure already exists**:
  - API list endpoints return ordered by `orderIndex ASC, createdAt ASC`:
    - `server/api/tasks/index.get.ts`
    - `server/api/meetings/index.get.ts`
  - Create endpoints assign `orderIndex = max + 1`:
    - `server/api/tasks/index.post.ts`
    - `server/api/meetings/index.post.ts`
  - `PATCH` validators already allow `orderIndex` updates:
    - `server/validators/tasks.ts`
    - `server/validators/meetings.ts`
- **What is still missing for Phase 6**:
  - No “High priority” row highlight in the UI.
  - Completed styling is currently applied to the title input only (`.doneText`), not the full row.
  - No search/filter UI.
  - Stores do not explicitly re-sort items after mutations (fine today because we don’t change `orderIndex` in the UI, but Phase 6 should make ordering rules explicit and stable).

---

## Web Research Summary (best-practice approach)

- **Client-side filtering**: For a single-screen MVP that already fetches all rows, the simplest and fastest search is a local filter using a `ref` for the query and a `computed` for the filtered list (no server round-trip).
  - Nuxt `useState` can be used if you want the search query to be SSR-safe and persisted across navigation (optional here).
  - Docs: `https://nuxt.com/docs/4.x/api/composables/use-state`
- **Debouncing**: Debounce is primarily needed when the search triggers side effects (e.g., API calls). For purely local filtering, debouncing is usually unnecessary; if the list grows large and typing feels sluggish, a debounced `watch` can be added.
  - VueUse provides `watchDebounced`, but adding a new dependency is not required for this MVP.
  - Ref: `https://vueuse.org/shared/watchdebounced/`

---

## Deliverables

### 1) Completed row styling (Tasks + Meetings)

- Apply a row-level style when `isDone === true` (e.g., reduced opacity / muted background).
- Keep existing strikethrough on title, but ensure the “completed” state is visible across the whole row.

### 2) High priority highlight (Tasks)

- If `priority === 'High'`, add a subtle highlight (e.g., slightly different background + left border).
- Keep it subtle and readable in the current dark theme.

### 3) Optional quick search (Tasks + Meetings)

- Add a small search input for each pane that filters rows instantly:
  - Tasks search should match against: `title`, `feedback`, `panelState`, `priority` (as text).
  - Meetings search should match against: `title`, `meetingType` (as text).
- Filtering should preserve the existing order (don’t re-sort based on match).
- If search is empty, show all items.

### 4) Stable ordering rules using `orderIndex`

- Ensure the UI consistently renders items in:
  - `orderIndex ASC`, then `createdAt ASC`
- Keep this rule stable even after:
  - create
  - update
  - delete
- (Optional, not required): if you later add manual reordering, the existing `PATCH` already supports updating `orderIndex`.

---

## File / Folder Plan

Update only what is needed:

```
app/pages/index.vue              # row classes, search inputs, filtered+sorted computed lists
app/stores/useTasksStore.ts      # ensure stable sort after fetch/create/update/remove
app/stores/useMeetingsStore.ts   # ensure stable sort after fetch/create/update/remove
```

(No server changes required for Phase 6.)

---

## Implementation Notes (minimal + robust)

### A) Sorting helper (store-level)

Add a single internal sort rule in each store:

- Sort by `orderIndex` ascending
- Tie-breaker by `createdAt` ascending

Run it after:

- `fetchAll()`
- `create()`
- `update()` (especially if later using `orderIndex` updates)
- `remove()` (optional; remove maintains order but re-sorting is harmless)

### B) UI filtering (page-level)

Add:

- `taskQuery = ref('')`
- `meetingQuery = ref('')`

Then compute:

- `visibleTasks = computed(() => filtered(sorted(tasksStore.items)))`
- `visibleMeetings = computed(() => filtered(sorted(meetingsStore.items)))`

Use these computed lists for `v-for` rendering.

### C) Row-level styling

Add row classes based on data:

- `.rowDone` for `isDone`
- `.rowHighPriority` for `priority === 'High'`

Keep styling subtle:

- done: muted row background + text color
- high priority: a faint highlight and/or border

---

## Demo / Verification (Phase 6 Acceptance)

Run:

```bash
npm run dev
```

Verify in the browser:

- [ ] Tasks with `priority = High` have a subtle highlight.
- [ ] Completed Tasks + Meetings show a row-level “done” style (not just the title).
- [ ] Typing in the Tasks search filters immediately and preserves ordering.
- [ ] Typing in the Meetings search filters immediately and preserves ordering.
- [ ] Create/edit/toggle/delete still behave correctly and ordering remains stable after refresh.


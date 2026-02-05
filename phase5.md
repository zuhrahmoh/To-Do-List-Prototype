# Phase 5 — Inline Editing + Done Toggle + Delete

## Goal (from `project.md`)

Deliver all remaining core actions on `/` for **Tasks** and **Meetings**:

- **Inline edit** all editable fields
- **Save on blur and/or Enter** (Excel-like)
- **Done circle toggle** (optimistic UI)
- **Delete** with confirm (and persistence)

## Current State (repo reality)

- **Database + Prisma**: `Task` and `Meeting` exist in `prisma/schema.prisma`.
- **APIs** (complete CRUD):
  - Tasks: `GET/POST/PATCH/DELETE /api/tasks` in `server/api/tasks/*`
  - Meetings: `GET/POST/PATCH/DELETE /api/meetings` in `server/api/meetings/*`
  - `PATCH` returns the updated record.
  - `DELETE` returns `204` and `null`.
- **Validation** (server-side Zod):
  - Tasks: `title` min 1, `panelState` enum, `priority` enum or `null`, `feedback` string or `null`
  - Meetings: `title` min 1, `meetingType` enum
- **Frontend**:
  - `/` renders the two-pane table layout in `app/pages/index.vue`
  - Draft “New …” rows exist and focus title, then create on Enter
  - Pinia stores (`app/stores/*`) currently implement **fetch + create only**
  - Existing rows render as plain text (no editing/toggles/delete yet)

---

## Web Research Summary (best-practice approach)

- **Nuxt 4 user-triggered mutations**: use `$fetch` from stores for `PATCH`/`DELETE` actions, and let the UI remain thin.
  - `$fetch` docs: `https://nuxt.com/docs/4.x/api/utils`
- **Nuxt error handling**: server routes throw `createError(...)`; client `$fetch` rejects on non-2xx, so store actions can rollback.
  - `createError` docs: `https://nuxt.com/docs/4.x/api/utils/create-error`
- **Vue 3 “save on blur + Enter” without double-submit**: treat **blur as the single commit** point; on Enter, call `.blur()` to trigger the blur handler once.
  - Vue `nextTick` (already used for draft focus): `https://vuejs.org/api/general.html#nexttick`
  - MDN blur event notes: `https://developer.mozilla.org/en-US/docs/Web/API/Element/blur_event`

---

## Deliverables

### 1) Tasks — Inline editing (all cells)

For each Task row:

- Done toggle (circle) updates `isDone`
- Inline edit:
  - `title` (text input)
  - `panelState` (select)
  - `priority` (select with blank → `null`)
  - `feedback` (text input)
- Save:
  - **On blur**
  - **On Enter** (by triggering blur)
- Delete button (row action) with confirm

### 2) Meetings — Inline editing (all cells)

For each Meeting row:

- Done toggle updates `isDone`
- Inline edit:
  - `title` (text input)
  - `meetingType` (select Online/In person)
- Save on blur/Enter
- Delete with confirm

### 3) Optimistic UI + rollback

- Toggling done or committing an edit should update UI immediately.
- If the API request fails, revert to the previous value(s) (rollback).

---

## File / Folder Plan

Update only what is needed (no new libraries):

```
app/
  pages/
    index.vue                  # render inputs/selects + wire events
  stores/
    useTasksStore.ts           # add update + delete actions (optimistic)
    useMeetingsStore.ts        # add update + delete actions (optimistic)
```

(No server route changes required; Phase 2 already implemented the needed endpoints.)

---

## Implementation Notes (minimal + robust)

### A) Store actions (preferred place for optimistic logic)

Add to **each store**:

- `update(id, patch)` → `PATCH /api/<resource>/:id`
  - Save previous record snapshot
  - Apply patch locally (optimistic)
  - Call `$fetch` and replace local record with the server response
  - On error: revert snapshot and rethrow

- `remove(id)` → `DELETE /api/<resource>/:id`
  - Remove item locally (optimistic)
  - Call `$fetch`
  - On error: reinsert at the original index and rethrow

Keep patch types strict and aligned to server validators:

- Task patch: `{ title?, isDone?, panelState?, priority?, feedback? }`
- Meeting patch: `{ title?, isDone?, meetingType? }`

### B) UI: inline editors + commit rules

#### 1) Commit on blur; Enter triggers blur

Recommended input pattern per editable cell:

- `@blur="commit..."`
- `@keydown.enter.prevent="(e) => (e.currentTarget as HTMLInputElement).blur()"`

This prevents “Enter + blur” from firing two separate commits.

#### 2) Title required (min 1)

Because the API enforces `min(1)`:

- If user clears a title and blurs:
  - Revert to the previous title (do not send PATCH)

#### 3) Null handling (Priority / Feedback)

Match the DB + validators:

- Priority blank option should PATCH `priority: null`
- Feedback:
  - If empty string feels acceptable to keep, allow it (valid string)
  - If you want “cleared” to behave like Excel empty, PATCH `feedback: null` when trimmed is empty

(Choose one behavior and be consistent across create + update.)

#### 4) Selects

For `panelState`, `priority`, and `meetingType`:

- Use `<select>` with options matching:
  - `TaskPanelStates`: `Open | Waiting | Delegated | Scheduled | Someday`
  - `TaskPriorities`: blank, High, Medium, Low
  - `MeetingTypes`: Online (`ONLINE`), In person (`IN_PERSON`)
- Commit on `@change` (and/or blur) via store `update(...)`

#### 5) Done toggle

Use a real button for accessibility:

- Clicking the circle calls `store.update(id, { isDone: !isDone })`
- UI updates immediately; rollback if request fails

#### 6) Delete

Row action button (rightmost cell recommended):

- `if (confirm(...)) await store.remove(id)`

---

## Demo / Verification (Phase 5 Acceptance)

Run:

```bash
npm run dev
```

In the browser, verify:

### Tasks

- [ ] Click into title → edit → blur saves (refresh persists)
- [ ] Press Enter while editing title → saves once (no duplicate requests)
- [ ] Change Panel State → persists (refresh persists)
- [ ] Change Priority (including blank) → persists
- [ ] Edit Feedback → persists
- [ ] Click done circle → toggles immediately; refresh persists
- [ ] Delete prompts confirm and removes; refresh stays removed

### Meetings

- [ ] Inline edit meeting title (blur/Enter)
- [ ] Change meeting type Online/In person
- [ ] Done toggle works (optimistic)
- [ ] Delete works with confirm

If any API call fails (stop the server temporarily), verify:

- [ ] UI rolls back to the previous value after the failure


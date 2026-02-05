# Phase 4 — Frontend Data Wiring (read + create)

## Goal (from `project.md`)

Deliver frontend wiring so the `/` page can:

- Load **Tasks** and **Meetings** from the existing Nitro APIs.
- Create a new **Task** and **Meeting** from the existing Nitro APIs.
- Use **Pinia** stores as the single source of truth for lists.

**Explicitly not in Phase 4:** inline editing for existing rows, autosave-on-blur for all cells, done toggle, delete, optimistic revert/toasts (those are Phase 5).

---

## Current State (repo reality)

- Phase 2 APIs already exist:
  - `GET/POST/PATCH/DELETE /api/tasks` (`server/api/tasks/*`)
  - `GET/POST/PATCH/DELETE /api/meetings` (`server/api/meetings/*`)
- Validation rules are enforced server-side:
  - Task create requires `{ title: string(min 1), panelState: enum(...) }` (`server/validators/tasks.ts`)
  - Meeting create requires `{ title: string(min 1), meetingType: 'ONLINE' | 'IN_PERSON' }` (`server/validators/meetings.ts`)
- Phase 3 UI skeleton exists at `app/pages/index.vue` with placeholder `<tbody />` and buttons (no handlers).
- Pinia module is enabled in `nuxt.config.ts` (`@pinia/nuxt`).

---

## Web Research Summary (best-practice approach)

- **Nuxt data fetching (SSR + hydration)**:
  - Use `useFetch` / `useAsyncData` for initial page loads so server-fetched data is serialized into the Nuxt payload and not refetched during client hydration.
  - Nuxt docs: `https://nuxt.com/docs/4.x/getting-started/data-fetching`
  - `useFetch` docs: `https://nuxt.com/docs/4.x/api/composables/use-fetch`
  - `useAsyncData` docs: `https://nuxt.com/docs/4.x/api/composables/use-async-data`
- **Event-based requests** (button click “New …”):
  - Use `$fetch` for user-triggered actions (POST on click).
  - `$fetch` docs: `https://nuxt.com/docs/4.x/api/utils/dollarfetch`
- **Pinia + Nuxt**:
  - Use Pinia stores for lists and actions (`fetchAll`, `create…`) and keep the page thin.
  - Pinia Nuxt module: `https://nuxt.com/modules/pinia`
  - Pinia SSR Nuxt guide: `https://pinia.vuejs.org/ssr/nuxt.html`
- **Focusing a newly-added row input**:
  - Use Vue `nextTick()` after adding the draft row so the input exists in the DOM before calling `.focus()`.
  - Vue pattern reference: `https://vuejs.org/api/general.html#nexttick`

---

## Deliverables

- **Stores**
  - `app/stores/useTasksStore.ts`
    - State: `items: Task[]`, `status`, `error` (minimal)
    - Actions:
      - `fetchAll(): Promise<Task[]>` → `GET /api/tasks` then set `items`
      - `create(input): Promise<Task>` → `POST /api/tasks` then append to `items`
  - `app/stores/useMeetingsStore.ts`
    - State: `items: Meeting[]`, `status`, `error` (minimal)
    - Actions:
      - `fetchAll(): Promise<Meeting[]>` → `GET /api/meetings` then set `items`
      - `create(input): Promise<Meeting>` → `POST /api/meetings` then append to `items`

- **UI wiring on `/`**
  - Render rows in both panes from store state.
  - Wire:
    - “+ New Task” → create a new Task (persisted) and show it in the list
    - “+ New Meeting” → create a new Meeting (persisted) and show it in the list

---

## Implementation Notes (keep it minimal + compatible with Phase 5)

### 1) Types (frontend)

Define minimal frontend types that match the API JSON shape (don’t import Prisma types into the client bundle).

- Task fields used in Phase 4:
  - `id`, `title`, `panelState`, `priority`, `feedback`, `isDone`, `orderIndex`, `createdAt`, `updatedAt`
- Meeting fields used in Phase 4:
  - `id`, `title`, `meetingType`, `isDone`, `orderIndex`, `createdAt`, `updatedAt`

### 2) Initial load (best practice)

In `app/pages/index.vue`, load both lists using `useAsyncData` (or `useFetch`) and call store actions inside it.

- Rationale:
  - Avoids duplicate fetches during SSR + hydration
  - Keeps data fetching consistent with Nuxt 4 recommendations

Example pattern (conceptual):

```ts
const tasksStore = useTasksStore()
const meetingsStore = useMeetingsStore()

await useAsyncData('tasks', () => tasksStore.fetchAll())
await useAsyncData('meetings', () => meetingsStore.fetchAll())
```

### 3) Create flow without “placeholder titles” (recommended)

Because the API requires `title` min length 1, the cleanest UX is:

- Click “+ New …” adds a **local draft row** (not yet persisted) and focuses its title input.
- When the user commits (Enter), call store `create(...)` which POSTs to the API.
- Replace the draft row with the created record.

This preserves the locked “focus title immediately” behavior without creating server records like “New Task”.

Minimal commit rules for Phase 4:
- Enter on the draft title persists (POST).
- Empty title cancels the draft row (no request).

(Full save-on-blur + editing for all cells remains Phase 5.)

### 4) Defaults to match backend validation

- Tasks create:
  - `panelState`: send `"Open"` by default (required by the API schema)
  - `priority`: `null`
  - `feedback`: `null`
- Meetings create:
  - `meetingType`: send `"ONLINE"` by default (required by API schema)

---

## File / Folder Plan

Create:

```
app/
  stores/
    useTasksStore.ts
    useMeetingsStore.ts
```

Update:

```
app/pages/index.vue
```

---

## Demo / Verification (Phase 4 Acceptance)

Run:

```bash
npm run dev
```

Verify in the browser:

- [ ] `/` loads and shows existing Tasks + Meetings (refresh persists because data is from SQLite).
- [ ] Clicking “+ New Task” creates a new task (after title commit) and it appears in the Tasks list.
- [ ] Clicking “+ New Meeting” creates a new meeting (after title commit) and it appears in the Meetings list.
- [ ] Refresh the page; newly created rows still exist.

Optional API sanity check (no UI):

```bash
curl http://localhost:3000/api/tasks
curl http://localhost:3000/api/meetings
```


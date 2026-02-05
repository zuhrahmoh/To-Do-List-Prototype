# Phase 2 — Backend CRUD APIs

## Goal (from `project.md`)

Deliver a complete backend API (Nuxt 4 Nitro server routes) that supports CRUD for **Tasks** and **Meetings**, with **input validation** and **basic error handling**, and demonstrates **true persistence** via Prisma + SQLite.

**Explicitly not in Phase 2:** UI layout, Pinia stores wiring, inline editing UX, auth, Microsoft 365 integration.

---

## Current State (what already exists)

- Nuxt 4 app scaffolded
- Pinia installed and enabled (`nuxt.config.ts`)
- Prisma + SQLite configured
- Prisma schema already includes `Task`, `Meeting`, `MeetingType` (`prisma/schema.prisma`)
- Initial migration applied and `prisma/dev.db` exists
- Prisma client singleton exists at `server/db/prisma.ts`

Phase 2 will add the missing API routes under `server/api/`.

---

## Web Research Summary (why this approach)

- **Nuxt 4 / Nitro** supports file-based server routing under `server/api`, with **HTTP method suffixes** like `index.get.ts`, `index.post.ts`, `[id].patch.ts`, `[id].delete.ts`.
- Recommended server route patterns use:
  - `defineEventHandler()` for handlers
  - `readBody()` (or h3 validated helpers) for request bodies
  - `getRouterParam()` for dynamic params
  - `createError({ status, statusText })` for consistent HTTP errors
- Validation is commonly done with **Zod**, often paired with h3 helpers like `readValidatedBody()` to keep routes thin and reliable.

References:
- Nuxt server directory: `https://nuxt.com/docs/4.x/directory-structure/server`
- Nitro routing: `https://nitro.unjs.io/guide/routing`
- Nuxt `createError`: `https://nuxt.com/docs/4.x/api/utils/create-error`

---

## Deliverables

- Tasks API:
  - `GET /api/tasks`
  - `POST /api/tasks`
  - `PATCH /api/tasks/:id`
  - `DELETE /api/tasks/:id`
- Meetings API:
  - `GET /api/meetings`
  - `POST /api/meetings`
  - `PATCH /api/meetings/:id`
  - `DELETE /api/meetings/:id`
- Input validation for create/update payloads
- Consistent error handling (400/404)
- Ordering in responses matches Excel-like expectations

---

## Folder / File Plan

Create:

```
server/
  api/
    tasks/
      index.get.ts
      index.post.ts
      [id].patch.ts
      [id].delete.ts
    meetings/
      index.get.ts
      index.post.ts
      [id].patch.ts
      [id].delete.ts
```

Optional but recommended for shared validation/constants:

```
server/
  validators/
    tasks.ts
    meetings.ts
```

---

## Dependency Plan

Install Zod for server-side validation:

```bash
npm install zod
```

(No other new libraries are required for Phase 2.)

---

## Validation Rules (Locked to `project.md`)

### Shared rules

- `id`:
  - route param, required for `PATCH`/`DELETE`
  - if record not found: return **404**

### Tasks

- `title`: required for create, `min(1)`
- `panelState`: string, required for create; should be one of:
  - `Open`, `Waiting`, `Delegated`, `Scheduled`, `Someday`
- `priority`: optional, either `null` or one of:
  - `High`, `Medium`, `Low`
- `feedback`: optional string or `null`
- `isDone`: boolean (PATCH only)
- `orderIndex`: integer (PATCH optional; mainly for future ordering work)

### Meetings

- `title`: required for create, `min(1)`
- `meetingType`: required for create and PATCH; must be `ONLINE` or `IN_PERSON`
- `isDone`: boolean (PATCH only)
- `orderIndex`: integer (PATCH optional)

---

## Ordering (Excel-like stability)

For list endpoints, return items ordered as:

- `orderIndex ASC`
- then `createdAt ASC`

On create, set a stable, increasing `orderIndex`:

- Compute `max(orderIndex)` for the table
- New row gets `max + 1`

This avoids all-new rows defaulting to `0` and returning in an unstable order.

---

## Endpoint Behaviors (Implementation Notes)

### 1) GET `/api/tasks`

- Returns an array of tasks ordered by `orderIndex ASC, createdAt ASC`.
- Response code: `200`.

### 2) POST `/api/tasks`

- Validates body:
  - `title` required (min 1)
  - `panelState` required (default to `"Open"` if omitted only if you explicitly choose to allow omission)
  - `priority` optional (`null` or allowed values)
  - `feedback` optional
- Sets `orderIndex` to next value (see Ordering section).
- Response code: `201`.

### 3) PATCH `/api/tasks/:id`

- Validates `id` param and body (partial update).
- Allows any subset of:
  - `title`, `isDone`, `panelState`, `priority`, `feedback`, `orderIndex`
- If task doesn’t exist: `404`.
- Response code: `200`.

### 4) DELETE `/api/tasks/:id`

- Deletes task by id.
- If task doesn’t exist: `404` (preferred for clarity).
- Response code: `204` (no body) or `200` (with body). Choose one and be consistent.

---

### 5) GET `/api/meetings`

- Returns an array of meetings ordered by `orderIndex ASC, createdAt ASC`.
- Response code: `200`.

### 6) POST `/api/meetings`

- Validates body:
  - `title` required (min 1)
  - `meetingType` required; defaulting to `ONLINE` is allowed by schema, but API should still validate and accept explicit values.
- Sets `orderIndex` to next value (see Ordering section).
- Response code: `201`.

### 7) PATCH `/api/meetings/:id`

- Validates `id` param and body (partial update).
- Allows any subset of:
  - `title`, `isDone`, `meetingType`, `orderIndex`
- If meeting doesn’t exist: `404`.
- Response code: `200`.

### 8) DELETE `/api/meetings/:id`

- Deletes meeting by id.
- If meeting doesn’t exist: `404` (preferred).
- Response code: `204` (no body) or `200` (with body). Choose one and be consistent.

---

## Error Handling (recommended pattern)

- Use `createError({ status, statusText })` and `throw` it from routes.
- Use:
  - `400` for validation failures
  - `404` when `:id` does not exist
  - `500` for unexpected errors (let Nuxt handle, or wrap only if needed)

---

## Minimal Demo / Verification (Phase 2 Acceptance)

Start the dev server:

```bash
npm run dev
```

Then verify persistence and CRUD using curl (PowerShell supports `curl` via `Invoke-WebRequest` alias, but use real curl if available).

### Tasks

Create:

```bash
curl -X POST http://localhost:3000/api/tasks ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"Draft agenda\",\"panelState\":\"Open\",\"priority\":\"High\",\"feedback\":\"\"}"
```

List:

```bash
curl http://localhost:3000/api/tasks
```

Update (toggle done):

```bash
curl -X PATCH http://localhost:3000/api/tasks/<TASK_ID> ^
  -H "Content-Type: application/json" ^
  -d "{\"isDone\":true}"
```

Delete:

```bash
curl -X DELETE http://localhost:3000/api/tasks/<TASK_ID>
```

### Meetings

Create:

```bash
curl -X POST http://localhost:3000/api/meetings ^
  -H "Content-Type: application/json" ^
  -d "{\"title\":\"1:1 with VP HR\",\"meetingType\":\"ONLINE\"}"
```

List:

```bash
curl http://localhost:3000/api/meetings
```

Update (change type):

```bash
curl -X PATCH http://localhost:3000/api/meetings/<MEETING_ID> ^
  -H "Content-Type: application/json" ^
  -d "{\"meetingType\":\"IN_PERSON\"}"
```

Delete:

```bash
curl -X DELETE http://localhost:3000/api/meetings/<MEETING_ID>
```

Acceptance checklist:

- [ ] All 8 endpoints exist and respond with expected status codes
- [ ] Validation rejects invalid payloads with `400`
- [ ] Updating/deleting a missing id returns `404`
- [ ] Data persists after refresh and after restarting `npm run dev`
- [ ] List endpoints return stable ordering (`orderIndex`, then `createdAt`)


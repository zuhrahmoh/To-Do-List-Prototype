# Phase 1 — Skeleton + Database Foundation

## Goal (from `project.md`)

Deliver a working foundation where:

- Nuxt 4 app runs
- Pinia is installed and enabled
- Prisma + SQLite are configured
- Prisma schema contains `Task` + `Meeting` (with `MeetingType` enum)
- Initial migration runs successfully and creates the SQLite DB + tables

**Explicitly not in Phase 1:** backend CRUD routes, UI layout, stores, or any auth.

---

## Prerequisites

- Node.js LTS installed (recommended)
- A package manager (choose **one**): `npm` (default) or `pnpm`

---

## Implementation Steps

### 1) Scaffold a Nuxt 4 app

From the repo root:

**npm**

```bash
npx nuxi init .
npm install
```

**pnpm**

```bash
pnpm dlx nuxi init .
pnpm install
```

Verify it runs:

```bash
npm run dev
```

---

### 2) Install and enable Pinia

Install:

```bash
npm install pinia @pinia/nuxt
```

Enable the Nuxt module in `nuxt.config.ts`:

```ts
export default defineNuxtConfig({
  modules: ['@pinia/nuxt'],
})
```

Acceptance check:

- `npm run dev` starts without module/config errors.

---

### 3) Add Prisma + SQLite

Install Prisma:

```bash
npm install -D prisma
npm install @prisma/client
```

Initialize Prisma:

```bash
npx prisma init
```

Set SQLite DB location in `.env` (recommended: keep the DB file under `prisma/`):

```env
DATABASE_URL="file:./prisma/dev.db"
```

Acceptance check:

- `.env` exists and includes `DATABASE_URL`.
- `prisma/schema.prisma` exists.

---

### 4) Define the Prisma schema (Task + Meeting)

Edit `prisma/schema.prisma` to include:

- `Task`
  - `id` (UUID string)
  - `title` (string)
  - `isDone` (boolean)
  - `panelState` (string)
  - `priority` (nullable string)
  - `feedback` (nullable string)
  - `orderIndex` (int)
  - `createdAt`, `updatedAt`
- `Meeting`
  - `id` (UUID string)
  - `title` (string)
  - `isDone` (boolean)
  - `meetingType` (`ONLINE` | `IN_PERSON`)
  - `orderIndex` (int)
  - `createdAt`, `updatedAt`
- `MeetingType` enum

Defaults (per spec):

- Task `panelState` default: `"Open"`
- Task `priority` default: `null`
- Task `feedback` default: `null`
- Meeting `meetingType` default: `ONLINE` (or require selection later; Phase 1 can set default)
- New rows can append by increasing `orderIndex`

---

### 5) Run the initial migration

Generate + migrate:

```bash
npx prisma migrate dev --name init
```

Optional: open Prisma Studio to inspect tables:

```bash
npx prisma studio
```

Acceptance check:

- `prisma/dev.db` is created
- A migration folder exists under `prisma/migrations/`
- Tables exist for `Task` and `Meeting` (view in Prisma Studio or by inspecting the SQLite file)

---

### 6) Add a Prisma client singleton (foundation for Phase 2)

Create `server/db/prisma.ts` with a singleton Prisma client (prevents multiple instances during dev hot-reload).

Acceptance check:

- The file exists and can be imported by future Nitro routes (Phase 2).

---

## Deliverables Checklist (Phase 1 complete when…)

- [ ] Nuxt 4 dev server starts (`npm run dev`)
- [ ] Pinia installed and enabled in `nuxt.config.ts`
- [ ] Prisma initialized (`prisma/schema.prisma` exists)
- [ ] `.env` has `DATABASE_URL` pointing to SQLite
- [ ] `Task` + `Meeting` + `MeetingType` defined in Prisma schema (matches `project.md`)
- [ ] `npx prisma migrate dev --name init` succeeds
- [ ] SQLite DB file is created and contains the two tables

---

## References (official docs)

- Nuxt: `https://nuxt.com/docs`
- Pinia + Nuxt module: `https://pinia.vuejs.org/ssr/nuxt.html`
- Prisma: `https://www.prisma.io/docs`


# Project.md — Shared To-Do + Meetings (Excel-like) MVP (Nuxt 4)

## 0) Executive Summary

We are building a lightweight, **Excel-like single-page web app** for a supervisor (Executive Assistant) and the VP of HR to manage:
- **Tasks** (left pane)
- **Meetings** (right pane)

The current workflow is an Excel sheet with two main areas. Existing task apps were abandoned because they were slower, more complex, or not “one screen.” This MVP must feel as quick and familiar as Excel but provide structured persistence and a better UX.

**IMPORTANT: Requirements are locked.** No authentication/login in the MVP. We will design the codebase so authentication and Microsoft 365 integration can be added later without major refactors.

---

## 1) Locked Requirements (MVP Scope)

### 1.1 Single Page UI
- Single page (route `/`) with title heading: **"To Do"**
- Two equal-width panes side-by-side:
  - **Left: Tasks**
  - **Right: Meetings**
- Each pane:
  - Has a heading
  - Has a button:
    - Tasks pane: **New Task**
    - Meetings pane: **New Meeting**
  - Has a simple sheet-like list/table of rows

### 1.2 Tasks Pane: Columns / Fields
Each task row must include (in this order):
1) **Done circle toggle** (circular checkbox) to mark task completed/uncompleted
2) **Task text** (title)
3) **Panel State** (a column; user can set it)
4) **Priority** (optional; user can set it or leave blank)
5) **Feedback** (free text)

**No additional “status workflow”** beyond the done toggle. (Panel State is a field, but not a multi-stage workflow like kanban.)

Core actions:
- Add new task
- Inline edit the fields
- Toggle done
- Delete task

### 1.3 Meetings Pane: Columns / Fields
Each meeting row must include:
1) **Done circle toggle** (circular checkbox) to mark meeting completed/uncompleted
2) **Meeting description** (title)
3) **Meeting type**: `Online` or `In person` (dropdown)

Core actions:
- Add new meeting
- Inline edit the fields
- Toggle done
- Delete meeting

### 1.4 Excel-like UX Expectations (Very Important)
This app must be faster than Excel for the daily workflow. Key UX behaviors:
- **Inline editing**: click a cell → edit immediately
- **Autosave**: save on blur and/or Enter
- **Minimal navigation**: no multi-page flows, no heavy modals for simple edits
- **Quick add**:
  - Clicking “New Task” creates a new row and focuses the task title field.
  - Clicking “New Meeting” creates a new row and focuses the meeting title field.
- **Persistence**: data must persist via a database (not local-only)

### 1.5 Non-Goals (Explicitly Out of Scope for MVP)
- No login/authentication
- No role permissions
- No Microsoft 365 / email/calendar integration
- No notifications
- No complex statuses, assignments, or multi-user management

We WILL keep architecture ready for these later.

---

## 2) Technology & Architecture (Locked Approach)

### 2.1 Framework
- **Nuxt 4** (frontend + backend in same codebase)
- Use **Nuxt server routes (Nitro)** for backend API endpoints

### 2.2 State Management
- **Pinia** for client state (tasks + meetings lists)
- Stores handle:
  - Fetching data from API
  - Optimistic UI updates for fast interactions
  - Error handling and potential revert

### 2.3 Database
- **SQLite** as the simple database for MVP
- **Prisma ORM** for:
  - Schema definition
  - Migrations
  - Querying
- SQLite ensures this can be implemented quickly and demonstrates true persistence.
- Prisma makes future migration to Postgres straightforward.

### 2.4 Separation of Concerns (Future-proofing)
Even though this is a small app, code should be structured so we can add:
- authentication (workspaces/users)
- Microsoft 365 sync fields
- auditing/activity

To achieve this:
- Keep business logic in small reusable functions (e.g., server services)
- Keep UI components “dumb” where possible (data comes from stores)
- Keep API routes thin and consistent

---

## 3) Data Model (Database Schema)

We need two primary tables: `Task` and `Meeting`.

### 3.1 Task Model (Fields)
- `id` (string UUID)
- `title` (string) — task text
- `isDone` (boolean) — toggled by the done circle
- `panelState` (string) — user-controlled categorical field
- `priority` (string | null) — optional
- `feedback` (string | null) — free text notes/feedback
- `orderIndex` (int) — for predictable ordering (Excel-like)
- `createdAt` (datetime)
- `updatedAt` (datetime)

**Concept notes:**
- `orderIndex` lets us keep stable ordering even if createdAt changes.
  - MVP ordering can be: `orderIndex ASC, createdAt ASC`.
  - New rows can be inserted at top by using decreasing index or by shifting indices.
  - For MVP, we can simply append and increment orderIndex.
- `panelState` is NOT a complex workflow state; it’s just a label field.
- `priority` is optional, can be null/empty.

### 3.2 Meeting Model (Fields)
- `id` (string UUID)
- `title` (string) — meeting description
- `isDone` (boolean)
- `meetingType` (enum/string) — `ONLINE` or `IN_PERSON`
- `orderIndex` (int)
- `createdAt` (datetime)
- `updatedAt` (datetime)

### 3.3 Enumerations (Recommended)
For consistency, meetingType should be a constrained enum in Prisma.

For tasks, panelState and priority can be simple strings for MVP, but UI should provide dropdown options.

**MVP Default Options**
- Panel State (dropdown):
  - `Open`
  - `Waiting`
  - `Delegated`
  - `Scheduled`
  - `Someday`
- Priority (dropdown):
  - empty (default)
  - `High`
  - `Medium`
  - `Low`
- Meeting Type (dropdown):
  - `Online`
  - `In person`

These can be stored as strings and validated server-side.

---

## 4) API Design (Backend)

Backend is provided via Nitro server routes under `server/api`.

### 4.1 General API Principles
- Use RESTful endpoints for tasks and meetings.
- Support CRUD with minimal payload.
- Prefer partial updates with PATCH.
- Validate inputs in server routes (Zod recommended).
- Return JSON.

### 4.2 Tasks Endpoints
#### GET /api/tasks
Returns all tasks ordered for display.

Response:
- `200 OK`
- Body: array of tasks

#### POST /api/tasks
Create a new task.

Request body:
- `title` (string, required)
- `panelState` (string, required; default to "Open")
- `priority` (string|null, optional)
- `feedback` (string|null, optional)

Response:
- `201 Created`
- Body: created task

#### PATCH /api/tasks/:id
Partial update. Used for:
- toggle done
- inline edits of title/panelState/priority/feedback

Request body: any subset of:
- `title`
- `isDone`
- `panelState`
- `priority`
- `feedback`
- `orderIndex` (optional, for future ordering improvements)

Response:
- `200 OK`
- Body: updated task

#### DELETE /api/tasks/:id
Deletes a task.
Response:
- `204 No Content` or `200 OK`

### 4.3 Meetings Endpoints
#### GET /api/meetings
Returns all meetings ordered for display.

#### POST /api/meetings
Create meeting.

Request body:
- `title` (string, required)
- `meetingType` (ONLINE|IN_PERSON, required; default maybe ONLINE)

#### PATCH /api/meetings/:id
Partial update:
- `title`
- `isDone`
- `meetingType`
- `orderIndex` (optional)

#### DELETE /api/meetings/:id
Delete meeting.

---

## 5) Frontend UX / UI Specification

### 5.1 Page Layout (Single Page)
Route: `/`

Top:
- Title: **To Do**

Main body:
- Two equal panels in a responsive grid:
  - Left: Tasks
  - Right: Meetings

Each panel should be visually similar (sheet-like).

### 5.2 Tasks Panel UI
Header:
- "Tasks"
- Button: "New Task"

Table columns:
- Done (circle)
- Task
- Panel State
- Priority
- Feedback
- (Optional) Delete icon at far right (not a “column” label, but a row action)

Row behaviors:
- Done circle toggles `isDone` immediately (optimistic update).
- Task title is editable inline (input).
- Panel State is a dropdown select.
- Priority is a dropdown select with blank option.
- Feedback is editable inline (text input).
- Delete icon removes row with confirm.

Visual behaviors:
- Completed tasks should appear subtly different (e.g., strikethrough + muted).
- Priority "High" may lightly highlight the row (replaces Excel yellow highlight).
- Keep it subtle and readable.

### 5.3 Meetings Panel UI
Header:
- "Meetings"
- Button: "New Meeting"

Table columns:
- Done (circle)
- Meeting
- Type (dropdown Online/In person)
- Delete icon row action

Row behaviors:
- Inline edit meeting title
- Dropdown for meeting type
- Done toggles isDone
- Delete removes row with confirm

### 5.4 Editing Rules (Excel-like)
- When a user edits a cell:
  - Save on blur
  - Save on Enter
- Optional:
  - Esc cancels local edits (nice-to-have)
- New row:
  - Insert row and focus title immediately
  - If user leaves it blank, either:
    - allow blank temporarily but validate on save, OR
    - require at least 1 character (recommended)

### 5.5 Performance & Feel
- Lists should be responsive and immediate.
- Use optimistic updates for toggles/edits:
  - Update UI first
  - Persist via API second
  - On failure, revert and show an error toast

---

## 6) App Structure (Suggested File/Folder Layout)

/pages
index.vue

/components
AppHeader.vue
PaneContainer.vue

tasks/
TaskPane.vue
TaskRow.vue

meetings/
MeetingPane.vue
MeetingRow.vue

/stores
useTasksStore.ts
useMeetingsStore.ts

/server
/api
/tasks
index.get.ts
index.post.ts
[id].patch.ts
[id].delete.ts
/meetings
index.get.ts
index.post.ts
[id].patch.ts
[id].delete.ts

/db
prisma.ts (Prisma client singleton)

/prisma
schema.prisma


---

## 7) Concepts Explained (for implementation clarity)

### 7.1 Why Nitro Server Routes?
Nuxt’s Nitro routes allow building backend endpoints in the same repository:
- Faster MVP development
- Unified deployment
- Easy to evolve into a more complex API later

### 7.2 Why SQLite + Prisma?
- SQLite is the simplest persistent DB: a single file, minimal setup.
- Prisma:
  - Provides a typed schema
  - Ensures consistent migrations
  - Makes it easy to upgrade to Postgres later

### 7.3 Why Pinia?
Pinia gives predictable state management:
- Central place to store tasks/meetings arrays
- Clean pattern for calling APIs and updating UI
- Supports optimistic updates easily

### 7.4 Optimistic Updates
Optimistic updates make the UI feel instant.
Example: user toggles done:
1) Immediately flip `isDone` in UI
2) Send PATCH request
3) If the request fails, flip it back and show error

This is crucial for the “faster than Excel” requirement.

---

## 8) Detailed Implementation Plan (Phases for regular demos)

### Phase 1 — Skeleton + Database Foundation
Deliverables:
- Nuxt 4 app runs
- Pinia installed
- Prisma + SQLite configured
- Prisma schema contains Task + Meeting
- Initial migration runs successfully

Demo:
- Show schema and DB setup working (migrations succeed)

Acceptance:
- Running locally creates DB and tables

---

### Phase 2 — Backend CRUD APIs
Deliverables:
- Implement all endpoints for tasks and meetings
- Input validation
- Basic error handling

Demo:
- Use API calls to create/edit/delete/toggle tasks + meetings

Acceptance:
- Data persists across reload/server restart

---

### Phase 3 — UI Layout (two panes)
Deliverables:
- `/` page with To Do heading
- Two equal panels with buttons and placeholder tables

Demo:
- Show Excel-like layout

Acceptance:
- Layout matches spec: equal pane widths, clear headings, buttons exist

---

### Phase 4 — Frontend Data Wiring (read + create)
Deliverables:
- Pinia stores created
- Load tasks & meetings on mount
- “New Task” and “New Meeting” create rows and persist

Demo:
- Add a task + meeting and refresh page to see persistence

Acceptance:
- New items are saved and reloaded correctly

---

### Phase 5 — Inline Editing + Done Toggle + Delete
Deliverables:
- Inline edit for all editable fields
- Save on blur/Enter
- Done toggles with optimistic UI
- Delete with confirm

Demo:
- Rapid edits, toggles, deletion; refresh to prove persistence

Acceptance:
- All core actions behave reliably

---

### Phase 6 — UX Polish & Ordering
Deliverables:
- Subtle priority highlighting (High)
- Completed row styling
- Optional: search box to filter items quickly
- Stable ordering using orderIndex

Demo:
- Show scanning improvements and speed

Acceptance:
- Stakeholders confirm it feels quicker than Excel

---

### Phase 7 — Deployment Ready MVP
Deliverables:
- Environment configuration
- Production build works
- Deployed to internal environment or staging

Demo:
- Use deployed link, not local dev

Acceptance:
- Stakeholders can use it independently

---

## 9) Quality Checklist (MVP Completion Criteria)

MVP is complete when:
- Single-page layout exists with two equal panes
- Tasks support:
  - create
  - inline edit title/panel state/priority/feedback
  - done toggle
  - delete
- Meetings support:
  - create
  - inline edit title/type
  - done toggle
  - delete
- Data persists via SQLite database
- UI is fast and Excel-like (minimal friction)

---

## 10) Future Extensions (Not Implemented Now, But Must Remain Feasible)

### 10.1 Authentication / Login
Planned later:
- Add Users
- Add Workspaces
- Scope tasks/meetings by workspaceId
- Restrict API by session identity

Architectural readiness:
- Keep models and APIs easy to extend:
  - add `workspaceId`, `createdByUserId`
- Avoid hardcoding “two people” assumptions in code structure

### 10.2 Microsoft 365 Integration
Planned later:
- Sync meetings to Outlook calendar
- Sync tasks to Microsoft To Do

Architectural readiness:
- Add optional fields later:
  - `externalProvider` (e.g., "microsoft")
  - `externalId` (Outlook event ID / To Do task ID)
  - `lastSyncedAt`
- Keep Meeting fields aligned to eventual calendar mapping

---

## 11) Implementation Notes / Defaults

### Default values
- Task panelState default: `Open`
- Task priority default: blank (null)
- Task feedback default: blank (null)
- Meeting type default: `Online` (or require user selection; MVP can default)

### Input validation
- Task title: required, minimum 1 character
- Meeting title: required, minimum 1 character
- panelState: must be one of allowed options (or allow free text in DB but enforce in UI)
- priority: must be one of allowed options or null
- meetingType: must be ONLINE or IN_PERSON

### Error handling
- Show lightweight toast on failure
- Revert optimistic changes on errors

---

## 12) Project Expectations

What should be implemented:
- Nuxt 4 app with the folder structure described
- Prisma schema + migrations
- Nitro API routes
- Pinia stores
- Single page UI with two panes and required columns
- Inline edit and optimistic updates

No authentication. No M365.

END OF SPEC.

<template>
  <main ref="rootRef" class="page">
    <h1 class="title">To Do</h1>

    <p v-if="apiError" class="errorBanner" role="status">
      {{ apiError }}
    </p>

    <section class="panes" aria-label="To Do panes">
      <section class="pane" aria-label="Tasks pane">
        <header class="paneHeader">
          <h2 class="paneTitle">Tasks</h2>
          <button type="button" class="paneButton" @click="startNewTask">+ New Task</button>
        </header>

        <div class="sheet" aria-label="Tasks sheet placeholder">
          <table class="table">
            <thead>
              <tr>
                <th class="colDone">Done</th>
                <th>Task</th>
                <th>Priority</th>
                <th>Javed's Feedback</th>
                <th class="colActions" />
              </tr>
            </thead>
            <tbody>
              <tr v-if="draftTask" class="row">
                <td class="cellDone">
                  <span class="dot" aria-hidden="true">○</span>
                </td>
                <td>
                  <textarea
                    ref="newTaskTitleRef"
                    v-model="draftTask.title"
                    class="cellInput"
                    data-autogrow="true"
                    rows="1"
                    aria-label="New task title"
                    @input="autoGrowFromEvent"
                    @keydown.enter.exact.prevent="commitNewTask"
                    @blur="cancelEmptyTaskDraft"
                  />
                </td>
                <td />
                <td />
                <td />
              </tr>

              <tr
                v-for="{ t, edit } in activeTasksWithEdits"
                :key="t.id"
                class="row"
                :class="{ rowDone: t.isDone, rowHighPriority: t.priority === 'High' }"
              >
                  <td class="cellDone">
                    <button
                      type="button"
                      class="dotButton"
                      :class="{ dotButtonDone: t.isDone }"
                      :aria-label="t.isDone ? 'Mark task not done' : 'Mark task done'"
                      @click="toggleTaskDone(t)"
                    >
                      <span class="dot" aria-hidden="true">{{ t.isDone ? '●' : '○' }}</span>
                    </button>
                  </td>
                  <td>
                    <textarea
                      :value="edit.title"
                      class="cellInput"
                      data-autogrow="true"
                      rows="1"
                      :class="{ doneText: t.isDone }"
                      aria-label="Task title"
                      @focus="beginTaskEdit(t.id)"
                      @input="onTaskTitleInput(t.id, $event), autoGrowFromEvent($event)"
                      @keydown.enter.exact.prevent="blurCurrentTarget($event)"
                      @blur="commitTaskTitle(t)"
                    />
                  </td>
                  <td>
                    <select
                      v-model="edit.priority"
                      class="badgeSelect"
                      :class="priorityBadgeClass(edit.priority)"
                      aria-label="Task priority"
                      @focus="beginTaskEdit(t.id)"
                      @change="commitTaskPriority(t)"
                      @blur="endTaskEdit(t.id)"
                    >
                      <option value="">None</option>
                      <option v-for="p in taskPriorityOptions" :key="p" :value="p">{{ p }}</option>
                    </select>
                  </td>
                  <td>
                    <textarea
                      :value="edit.feedback"
                      class="cellInput"
                      data-autogrow="true"
                      rows="1"
                      aria-label="Task feedback"
                      @focus="beginTaskEdit(t.id)"
                      @input="onTaskFeedbackInput(t.id, $event), autoGrowFromEvent($event)"
                      @keydown.enter.exact.prevent="blurCurrentTarget($event)"
                      @blur="commitTaskFeedback(t)"
                    />
                  </td>
                  <td class="cellActions">
                    <button
                      type="button"
                      class="deleteButton"
                      aria-label="Delete task"
                      @click="deleteTask(t)"
                    >
                      <svg class="deleteIcon" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M9 3h6a1 1 0 0 1 1 1v2h4a1 1 0 1 1 0 2h-1v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8H4a1 1 0 1 1 0-2h4V4a1 1 0 0 1 1-1Zm1 3h4V5h-4v1Zm-3 2v12h10V8H7Zm3 3a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm5 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z"
                        />
                      </svg>
                    </button>
                  </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section class="pane" aria-label="Meetings pane">
        <header class="paneHeader">
          <h2 class="paneTitle">Meetings</h2>
          <button type="button" class="paneButton" @click="startNewMeeting">+ New Meeting</button>
        </header>

        <div class="sheet" aria-label="Meetings sheet placeholder">
          <table class="table">
            <thead>
              <tr>
                <th class="colDone">Done</th>
                <th>Meeting</th>
                <th>Type</th>
                <th class="colActions" />
              </tr>
            </thead>
            <tbody>
              <tr v-if="draftMeeting" class="row">
                <td class="cellDone">
                  <span class="dot" aria-hidden="true">○</span>
                </td>
                <td>
                  <textarea
                    ref="newMeetingTitleRef"
                    v-model="draftMeeting.title"
                    class="cellInput"
                    data-autogrow="true"
                    rows="1"
                    aria-label="New meeting title"
                    @input="autoGrowFromEvent"
                    @keydown.enter.exact.prevent="commitNewMeeting"
                    @blur="cancelEmptyMeetingDraft"
                  />
                </td>
                <td>Online</td>
                <td />
              </tr>

              <tr v-for="{ m, edit } in activeMeetingsWithEdits" :key="m.id" class="row" :class="{ rowDone: m.isDone }">
                  <td class="cellDone">
                    <button
                      type="button"
                      class="dotButton"
                      :class="{ dotButtonDone: m.isDone }"
                      :aria-label="m.isDone ? 'Mark meeting not done' : 'Mark meeting done'"
                      @click="toggleMeetingDone(m)"
                    >
                      <span class="dot" aria-hidden="true">{{ m.isDone ? '●' : '○' }}</span>
                    </button>
                  </td>
                  <td>
                    <textarea
                      :value="edit.title"
                      class="cellInput"
                      data-autogrow="true"
                      rows="1"
                      :class="{ doneText: m.isDone }"
                      aria-label="Meeting title"
                      @focus="beginMeetingEdit(m.id)"
                      @input="onMeetingTitleInput(m.id, $event), autoGrowFromEvent($event)"
                      @keydown.enter.exact.prevent="blurCurrentTarget($event)"
                      @blur="commitMeetingTitle(m)"
                    />
                  </td>
                  <td>
                    <select
                      v-model="edit.meetingType"
                      class="badgeSelect"
                      :class="meetingTypeBadgeClass(edit.meetingType)"
                      aria-label="Meeting type"
                      @focus="beginMeetingEdit(m.id)"
                      @change="commitMeetingType(m)"
                      @blur="endMeetingEdit(m.id)"
                    >
                      <option value="ONLINE">Online</option>
                      <option value="IN_PERSON">In person</option>
                    </select>
                  </td>
                  <td class="cellActions">
                    <button
                      type="button"
                      class="deleteButton"
                      aria-label="Delete meeting"
                      @click="deleteMeeting(m)"
                    >
                      <svg class="deleteIcon" viewBox="0 0 24 24" aria-hidden="true">
                        <path
                          fill="currentColor"
                          d="M9 3h6a1 1 0 0 1 1 1v2h4a1 1 0 1 1 0 2h-1v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8H4a1 1 0 1 1 0-2h4V4a1 1 0 0 1 1-1Zm1 3h4V5h-4v1Zm-3 2v12h10V8H7Zm3 3a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm5 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z"
                        />
                      </svg>
                    </button>
                  </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </section>

    <section class="completedWrap" aria-label="Completed tasks and meetings">
      <details class="completedDetails">
        <summary class="completedSummary">Completed (Tasks &amp; Meetings)</summary>
        <div class="completedContent">
          <div class="completedGroup">
            <h3 class="completedTitle">Tasks</h3>
            <p v-if="completedTasksWithEdits.length === 0" class="completedEmpty">No completed tasks.</p>
            <div v-else class="sheet">
              <table class="table">
                <thead>
                  <tr>
                    <th class="colDone">Done</th>
                    <th>Task</th>
                    <th>Priority</th>
                    <th>Javed's Feedback</th>
                    <th class="colActions" />
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="{ t, edit } in completedTasksWithEdits"
                    :key="t.id"
                    class="row rowDone"
                    :class="{ rowHighPriority: t.priority === 'High' }"
                  >
                    <td class="cellDone">
                      <button
                        type="button"
                        class="dotButton dotButtonDone"
                        aria-label="Mark task not done"
                        @click="toggleTaskDone(t)"
                      >
                        <span class="dot" aria-hidden="true">●</span>
                      </button>
                    </td>
                    <td>
                      <textarea
                        :value="edit.title"
                        class="cellInput doneText"
                        data-autogrow="true"
                        rows="1"
                        aria-label="Task title"
                        @focus="beginTaskEdit(t.id)"
                        @input="onTaskTitleInput(t.id, $event), autoGrowFromEvent($event)"
                        @keydown.enter.exact.prevent="blurCurrentTarget($event)"
                        @blur="commitTaskTitle(t)"
                      />
                    </td>
                    <td>
                      <select
                        v-model="edit.priority"
                        class="badgeSelect"
                        :class="priorityBadgeClass(edit.priority)"
                        aria-label="Task priority"
                        @focus="beginTaskEdit(t.id)"
                        @change="commitTaskPriority(t)"
                        @blur="endTaskEdit(t.id)"
                      >
                        <option value="">None</option>
                        <option v-for="p in taskPriorityOptions" :key="p" :value="p">{{ p }}</option>
                      </select>
                    </td>
                    <td>
                      <textarea
                        :value="edit.feedback"
                        class="cellInput"
                        data-autogrow="true"
                        rows="1"
                        aria-label="Task feedback"
                        @focus="beginTaskEdit(t.id)"
                        @input="onTaskFeedbackInput(t.id, $event), autoGrowFromEvent($event)"
                        @keydown.enter.exact.prevent="blurCurrentTarget($event)"
                        @blur="commitTaskFeedback(t)"
                      />
                    </td>
                    <td class="cellActions">
                      <button
                        type="button"
                        class="deleteButton"
                        aria-label="Delete task"
                        @click="deleteTask(t)"
                      >
                        <svg class="deleteIcon" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M9 3h6a1 1 0 0 1 1 1v2h4a1 1 0 1 1 0 2h-1v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8H4a1 1 0 1 1 0-2h4V4a1 1 0 0 1 1-1Zm1 3h4V5h-4v1Zm-3 2v12h10V8H7Zm3 3a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm5 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div class="completedGroup">
            <h3 class="completedTitle">Meetings</h3>
            <p v-if="completedMeetingsWithEdits.length === 0" class="completedEmpty">No completed meetings.</p>
            <div v-else class="sheet">
              <table class="table">
                <thead>
                  <tr>
                    <th class="colDone">Done</th>
                    <th>Meeting</th>
                    <th>Type</th>
                    <th class="colActions" />
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="{ m, edit } in completedMeetingsWithEdits" :key="m.id" class="row rowDone">
                    <td class="cellDone">
                      <button
                        type="button"
                        class="dotButton dotButtonDone"
                        aria-label="Mark meeting not done"
                        @click="toggleMeetingDone(m)"
                      >
                        <span class="dot" aria-hidden="true">●</span>
                      </button>
                    </td>
                    <td>
                      <textarea
                        :value="edit.title"
                        class="cellInput doneText"
                        data-autogrow="true"
                        rows="1"
                        aria-label="Meeting title"
                        @focus="beginMeetingEdit(m.id)"
                        @input="onMeetingTitleInput(m.id, $event), autoGrowFromEvent($event)"
                        @keydown.enter.exact.prevent="blurCurrentTarget($event)"
                        @blur="commitMeetingTitle(m)"
                      />
                    </td>
                    <td>
                      <select
                        v-model="edit.meetingType"
                        class="badgeSelect"
                        :class="meetingTypeBadgeClass(edit.meetingType)"
                        aria-label="Meeting type"
                        @focus="beginMeetingEdit(m.id)"
                        @change="commitMeetingType(m)"
                        @blur="endMeetingEdit(m.id)"
                      >
                        <option value="ONLINE">Online</option>
                        <option value="IN_PERSON">In person</option>
                      </select>
                    </td>
                    <td class="cellActions">
                      <button
                        type="button"
                        class="deleteButton"
                        aria-label="Delete meeting"
                        @click="deleteMeeting(m)"
                      >
                        <svg class="deleteIcon" viewBox="0 0 24 24" aria-hidden="true">
                          <path
                            fill="currentColor"
                            d="M9 3h6a1 1 0 0 1 1 1v2h4a1 1 0 1 1 0 2h-1v12a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V8H4a1 1 0 1 1 0-2h4V4a1 1 0 0 1 1-1Zm1 3h4V5h-4v1Zm-3 2v12h10V8H7Zm3 3a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Zm5 0a1 1 0 0 1 1 1v6a1 1 0 1 1-2 0v-6a1 1 0 0 1 1-1Z"
                          />
                        </svg>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </details>
    </section>

    <Teleport to="body">
      <div
        v-if="confirmState.open"
        class="confirmOverlay"
        role="presentation"
        @click.self="cancelConfirm"
      >
        <div
          class="confirmDialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirmTitle"
          aria-describedby="confirmMessage"
          @keydown.esc.prevent="cancelConfirm"
        >
          <h3 id="confirmTitle" class="confirmTitle">Confirm deletion</h3>
          <p id="confirmMessage" class="confirmMessage">{{ confirmState.message }}</p>
          <div class="confirmActions">
            <button type="button" class="confirmCancel" @click="cancelConfirm">Cancel</button>
            <button ref="confirmDeleteRef" type="button" class="confirmDelete" @click="acceptConfirm">
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </main>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue'
import { useMeetingsStore } from '../stores/useMeetingsStore'
import { useTasksStore } from '../stores/useTasksStore'

const rootRef = ref<HTMLElement | null>(null)

const tasksStore = useTasksStore()
const meetingsStore = useMeetingsStore()

const apiError = ref<string | null>(null)

await Promise.all([
  useAsyncData('tasks', async () => {
    try {
      apiError.value = null
      return await tasksStore.fetchAll()
    } catch {
      apiError.value =
        'Could not load/save data. The database is unavailable (make sure Postgres is running and migrations are applied).'
      return []
    }
  }),
  useAsyncData('meetings', async () => {
    try {
      apiError.value = null
      return await meetingsStore.fetchAll()
    } catch {
      apiError.value =
        'Could not load/save data. The database is unavailable (make sure Postgres is running and migrations are applied).'
      return []
    }
  }),
])

const newTaskTitleRef = ref<HTMLTextAreaElement | null>(null)
const newMeetingTitleRef = ref<HTMLTextAreaElement | null>(null)
const confirmDeleteRef = ref<HTMLButtonElement | null>(null)

const draftTask = ref<{ title: string } | null>(null)
const draftMeeting = ref<{ title: string } | null>(null)

const taskPriorityOptions = ['High', 'Medium', 'Low'] as const

const taskEditing = reactive<Record<string, boolean>>({})
const meetingEditing = reactive<Record<string, boolean>>({})

const confirmState = reactive<{
  open: boolean
  message: string
  resolve: ((value: boolean) => void) | null
}>({
  open: false,
  message: '',
  resolve: null,
})

async function confirmDelete(message: string) {
  if (confirmState.open) return false

  const result = await new Promise<boolean>((resolve) => {
    confirmState.open = true
    confirmState.message = message
    confirmState.resolve = resolve
  })

  return result
}

function acceptConfirm() {
  const resolve = confirmState.resolve
  confirmState.open = false
  confirmState.message = ''
  confirmState.resolve = null
  resolve?.(true)
}

function cancelConfirm() {
  const resolve = confirmState.resolve
  confirmState.open = false
  confirmState.message = ''
  confirmState.resolve = null
  resolve?.(false)
}

watch(
  () => confirmState.open,
  async (open) => {
    if (!open) return
    await nextTick()
    confirmDeleteRef.value?.focus()
  },
)

type TaskEdit = {
  title: string
  priority: '' | (typeof taskPriorityOptions)[number]
  feedback: string
}

type MeetingEdit = {
  title: string
  meetingType: 'ONLINE' | 'IN_PERSON'
}

const taskEdits = reactive<Record<string, TaskEdit>>({})

const meetingEdits = reactive<Record<string, MeetingEdit>>({})

function hasTaskEdit(x: { t: (typeof tasksStore.items)[number]; edit?: TaskEdit }): x is {
  t: (typeof tasksStore.items)[number]
  edit: TaskEdit
} {
  return Boolean(x.edit)
}

function hasMeetingEdit(x: { m: (typeof meetingsStore.items)[number]; edit?: MeetingEdit }): x is {
  m: (typeof meetingsStore.items)[number]
  edit: MeetingEdit
} {
  return Boolean(x.edit)
}

const tasksWithEdits = computed(() =>
  tasksStore.items.map((t) => ({ t, edit: taskEdits[t.id] })).filter(hasTaskEdit),
)

const meetingsWithEdits = computed(() =>
  meetingsStore.items.map((m) => ({ m, edit: meetingEdits[m.id] })).filter(hasMeetingEdit),
)

const activeTasksWithEdits = computed(() => tasksWithEdits.value.filter(({ t }) => !t.isDone))
const completedTasksWithEdits = computed(() => tasksWithEdits.value.filter(({ t }) => t.isDone))

const activeMeetingsWithEdits = computed(() => meetingsWithEdits.value.filter(({ m }) => !m.isDone))
const completedMeetingsWithEdits = computed(() => meetingsWithEdits.value.filter(({ m }) => m.isDone))

function priorityBadgeClass(value: '' | (typeof taskPriorityOptions)[number]) {
  if (value === 'High') return 'badgeHigh'
  if (value === 'Medium') return 'badgeMedium'
  if (value === 'Low') return 'badgeLow'
  return 'badgeNone'
}

function meetingTypeBadgeClass(value: 'ONLINE' | 'IN_PERSON') {
  return value === 'ONLINE' ? 'badgeOnline' : 'badgeInPerson'
}

function autoGrow(el: HTMLTextAreaElement | null) {
  if (!el) return
  el.style.overflowY = 'hidden'
  el.style.height = '0px'
  el.style.height = `${el.scrollHeight}px`
}

function autoGrowFromEvent(evt: Event) {
  autoGrow(evt.target as HTMLTextAreaElement | null)
}

async function syncAllAutoGrow() {
  await nextTick()
  const root = rootRef.value
  if (!root) return
  for (const el of root.querySelectorAll<HTMLTextAreaElement>('textarea[data-autogrow="true"]')) autoGrow(el)
}

function ensureTaskEdit(t: (typeof tasksStore.items)[number]) {
  const existing = taskEdits[t.id]
  if (!existing) {
    taskEdits[t.id] = {
      title: t.title,
      priority: (t.priority ?? '') as '' | (typeof taskPriorityOptions)[number],
      feedback: t.feedback ?? '',
    }
    return
  }

  if (taskEditing[t.id]) return

  existing.title = t.title
  existing.priority = (t.priority ?? '') as '' | (typeof taskPriorityOptions)[number]
  existing.feedback = t.feedback ?? ''
}

function ensureMeetingEdit(m: (typeof meetingsStore.items)[number]) {
  const existing = meetingEdits[m.id]
  if (!existing) {
    meetingEdits[m.id] = {
      title: m.title,
      meetingType: m.meetingType,
    }
    return
  }

  if (meetingEditing[m.id]) return

  existing.title = m.title
  existing.meetingType = m.meetingType
}

watch(
  () => tasksStore.items,
  (items) => {
    for (const t of items) ensureTaskEdit(t)
  },
  { immediate: true, deep: true },
)

watch(
  () => meetingsStore.items,
  (items) => {
    for (const m of items) ensureMeetingEdit(m)
  },
  { immediate: true, deep: true },
)

watch(
  () => [tasksStore.items, meetingsStore.items, draftTask.value, draftMeeting.value],
  () => {
    void syncAllAutoGrow()
  },
  { deep: true, immediate: true },
)

onMounted(() => {
  void syncAllAutoGrow()
})

function blurCurrentTarget(evt: Event) {
  ;(evt.currentTarget as HTMLInputElement | HTMLTextAreaElement | null)?.blur()
}

async function startNewTask() {
  if (!draftTask.value) draftTask.value = { title: '' }
  await nextTick()
  autoGrow(newTaskTitleRef.value)
  newTaskTitleRef.value?.focus()
}

async function startNewMeeting() {
  if (!draftMeeting.value) draftMeeting.value = { title: '' }
  await nextTick()
  autoGrow(newMeetingTitleRef.value)
  newMeetingTitleRef.value?.focus()
}

function cancelEmptyTaskDraft() {
  if (!draftTask.value) return
  if (draftTask.value.title.trim().length === 0) draftTask.value = null
}

function cancelEmptyMeetingDraft() {
  if (!draftMeeting.value) return
  if (draftMeeting.value.title.trim().length === 0) draftMeeting.value = null
}

async function commitNewTask() {
  if (!draftTask.value) return
  const title = draftTask.value.title.trim()
  if (title.length === 0) {
    draftTask.value = null
    return
  }

  try {
    apiError.value = null
    await tasksStore.create({
      title,
      panelState: 'Open',
      priority: null,
      feedback: null,
    })
    draftTask.value = null
  } catch {
    apiError.value =
      'Could not save the new task. The database is unavailable (make sure Postgres is running and migrations are applied).'
    draftTask.value = { title }
    await nextTick()
    newTaskTitleRef.value?.focus()
  }
}

async function commitNewMeeting() {
  if (!draftMeeting.value) return
  const title = draftMeeting.value.title.trim()
  if (title.length === 0) {
    draftMeeting.value = null
    return
  }

  try {
    apiError.value = null
    await meetingsStore.create({
      title,
      meetingType: 'ONLINE',
    })
    draftMeeting.value = null
  } catch {
    apiError.value =
      'Could not save the new meeting. The database is unavailable (make sure Postgres is running and migrations are applied).'
    draftMeeting.value = { title }
    await nextTick()
    newMeetingTitleRef.value?.focus()
  }
}

function beginTaskEdit(id: string) {
  taskEditing[id] = true
}

function endTaskEdit(id: string) {
  taskEditing[id] = false
}

function beginMeetingEdit(id: string) {
  meetingEditing[id] = true
}

function endMeetingEdit(id: string) {
  meetingEditing[id] = false
}

function onTaskTitleInput(id: string, evt: Event) {
  const value = (evt.target as HTMLTextAreaElement).value
  if (!taskEdits[id]) return
  taskEdits[id].title = value
}

function onTaskFeedbackInput(id: string, evt: Event) {
  const value = (evt.target as HTMLTextAreaElement).value
  if (!taskEdits[id]) return
  taskEdits[id].feedback = value
}

function onMeetingTitleInput(id: string, evt: Event) {
  const value = (evt.target as HTMLTextAreaElement).value
  if (!meetingEdits[id]) return
  meetingEdits[id].title = value
}

async function commitTaskTitle(t: (typeof tasksStore.items)[number]) {
  const edit = taskEdits[t.id]
  endTaskEdit(t.id)
  if (!edit) return

  const title = edit.title.trim()
  if (title.length === 0) {
    edit.title = t.title
    return
  }
  if (title === t.title) return

  try {
    await tasksStore.update(t.id, { title })
  } catch {
    edit.title = t.title
  }
}

async function commitTaskPriority(t: (typeof tasksStore.items)[number]) {
  const edit = taskEdits[t.id]
  if (!edit) return

  const desired = edit.priority === '' ? null : edit.priority
  if (desired === (t.priority ?? null)) return

  try {
    await tasksStore.update(t.id, { priority: desired })
  } catch {
    edit.priority = (t.priority ?? '') as '' | (typeof taskPriorityOptions)[number]
  }
}

async function commitTaskFeedback(t: (typeof tasksStore.items)[number]) {
  const edit = taskEdits[t.id]
  endTaskEdit(t.id)
  if (!edit) return

  const desired = edit.feedback.trim().length === 0 ? null : edit.feedback
  if (desired === (t.feedback ?? null)) return

  try {
    await tasksStore.update(t.id, { feedback: desired })
  } catch {
    edit.feedback = t.feedback ?? ''
  }
}

async function toggleTaskDone(t: (typeof tasksStore.items)[number]) {
  try {
    await tasksStore.update(t.id, { isDone: !t.isDone })
  } catch {
    // rollback handled in store
  }
}

async function deleteTask(t: (typeof tasksStore.items)[number]) {
  const ok = await confirmDelete('Delete this task?')
  if (!ok) return
  try {
    await tasksStore.remove(t.id)
    delete taskEdits[t.id]
    delete taskEditing[t.id]
  } catch {
    // rollback handled in store
  }
}

async function commitMeetingTitle(m: (typeof meetingsStore.items)[number]) {
  const edit = meetingEdits[m.id]
  endMeetingEdit(m.id)
  if (!edit) return

  const title = edit.title.trim()
  if (title.length === 0) {
    edit.title = m.title
    return
  }
  if (title === m.title) return

  try {
    await meetingsStore.update(m.id, { title })
  } catch {
    edit.title = m.title
  }
}

async function commitMeetingType(m: (typeof meetingsStore.items)[number]) {
  const edit = meetingEdits[m.id]
  if (!edit) return
  if (edit.meetingType === m.meetingType) return

  try {
    await meetingsStore.update(m.id, { meetingType: edit.meetingType })
  } catch {
    edit.meetingType = m.meetingType
  }
}

async function toggleMeetingDone(m: (typeof meetingsStore.items)[number]) {
  try {
    await meetingsStore.update(m.id, { isDone: !m.isDone })
  } catch {
    // rollback handled in store
  }
}

async function deleteMeeting(m: (typeof meetingsStore.items)[number]) {
  const ok = await confirmDelete('Delete this meeting?')
  if (!ok) return
  try {
    await meetingsStore.remove(m.id)
    delete meetingEdits[m.id]
    delete meetingEditing[m.id]
  } catch {
    // rollback handled in store
  }
}
</script>

<style scoped>
.page {
  min-height: 100vh;
  padding: 24px;
  color: #0f172a;
  background: linear-gradient(180deg, #f8fafc 0%, #eef2ff 60%, #f8fafc 100%);
  font-family: system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, sans-serif;
}

.title {
  margin: 0 0 16px;
  font-size: 28px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.errorBanner {
  margin: 0 0 14px;
  padding: 10px 12px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 10px;
  background: rgba(239, 68, 68, 0.08);
  color: #7f1d1d;
  font-size: 13px;
  font-weight: 700;
  line-height: 1.35;
}

.panes {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 900px) {
  .panes {
    grid-template-columns: 1fr;
  }
}

.pane {
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  background: #ffffff;
  overflow: hidden;
  min-width: 0;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 10px 30px rgba(15, 23, 42, 0.05);
}

.completedWrap {
  margin-top: 16px;
}

.completedDetails {
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  box-shadow:
    0 1px 2px rgba(15, 23, 42, 0.06),
    0 10px 30px rgba(15, 23, 42, 0.05);
  overflow: hidden;
}

.completedSummary {
  list-style: none;
  cursor: pointer;
  user-select: none;
  padding: 12px 12px;
  font-weight: 650;
  color: #0f172a;
  background: linear-gradient(90deg, rgba(236, 72, 153, 0.1), rgba(99, 102, 241, 0.08));
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.completedSummary::-webkit-details-marker {
  display: none;
}

.completedSummary::after {
  content: '▾';
  font-size: 14px;
  line-height: 1;
  color: #475569;
  transform: rotate(0deg);
  transition: transform 140ms ease, color 140ms ease;
}

.completedDetails[open] .completedSummary::after {
  transform: rotate(-180deg);
  color: #0f172a;
}

.completedContent {
  padding: 12px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

@media (max-width: 900px) {
  .completedContent {
    grid-template-columns: 1fr;
  }
}

.completedTitle {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 650;
  color: #334155;
}

.completedEmpty {
  margin: 0;
  color: #64748b;
  font-size: 13px;
  font-weight: 600;
}

.paneHeader {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 12px;
  border-bottom: 1px solid #e2e8f0;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.08), rgba(34, 211, 238, 0.08));
}

.paneTitle {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
}

.paneButton {
  border: 1px solid rgba(99, 102, 241, 0.45);
  border-radius: 8px;
  padding: 6px 10px;
  background: rgba(99, 102, 241, 0.1);
  color: #1e1b4b;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.paneButton:hover {
  background: rgba(99, 102, 241, 0.16);
}

.sheet {
  padding: 12px;
}

.table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.table th {
  text-align: left;
  font-weight: 700;
  padding: 10px 8px;
  border-bottom: 1px solid #e2e8f0;
  color: #475569;
  white-space: nowrap;
}

.colDone {
  width: 56px;
}

.colActions {
  width: 92px;
}

.row td {
  padding: 10px 8px;
  border-bottom: 1px solid #e2e8f0;
  vertical-align: top;
}

.rowDone td {
  background: rgba(34, 197, 94, 0.1);
  box-shadow:
    inset 0 1px 0 rgba(34, 197, 94, 0.18),
    inset 0 -1px 0 rgba(34, 197, 94, 0.16);
}

.rowHighPriority:not(.rowDone) td {
  background: rgba(251, 191, 36, 0.18);
}

.cellDone {
  text-align: center;
  vertical-align: middle;
}

.dot {
  display: inline-block;
  width: 20px;
  font-size: 20px;
  line-height: 1;
  text-align: center;
  color: #64748b;
  user-select: none;
}

.dotButton {
  width: 30px;
  height: 30px;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  padding: 0;
  background: #ffffff;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.dotButton:hover {
  border-color: #94a3b8;
}

.dotButtonDone {
  border-color: #16a34a;
  background: rgba(34, 197, 94, 0.12);
}

.dotButtonDone .dot {
  color: #16a34a;
}

.cellInput {
  width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 6px 8px;
  background: #ffffff;
  color: #0f172a;
  font: inherit;
  outline: none;
  resize: none;
  overflow-y: hidden;
  overflow-x: hidden;
  overflow-wrap: anywhere;
  word-break: break-word;
}

.cellInput:focus {
  border-color: rgba(99, 102, 241, 0.9);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.16);
}

.badgeSelect {
  width: auto;
  max-width: 100%;
  box-sizing: border-box;
  border: 1px solid #cbd5e1;
  border-radius: 999px;
  padding: 4px 24px 4px 10px;
  background: #ffffff;
  color: #0f172a;
  font-size: 13px;
  font: inherit;
  font-weight: 700;
  outline: none;
}

.badgeSelect:focus {
  border-color: rgba(99, 102, 241, 0.9);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.16);
}

.badgeNone {
  color: #475569;
  border-color: rgba(148, 163, 184, 0.55);
}

.badgeHigh {
  color: #92400e;
  border-color: rgba(251, 191, 36, 0.65);
  background: rgba(251, 191, 36, 0.16);
}

.badgeMedium {
  color: #1d4ed8;
  border-color: rgba(37, 99, 235, 0.45);
  background: rgba(37, 99, 235, 0.1);
}

.badgeLow {
  color: #0f172a;
  border-color: rgba(148, 163, 184, 0.55);
  background: rgba(148, 163, 184, 0.12);
}

.badgeOnline {
  color: #166534;
  border-color: rgba(22, 163, 74, 0.35);
  background: rgba(22, 163, 74, 0.1);
}

.badgeInPerson {
  color: #9d174d;
  border-color: rgba(236, 72, 153, 0.45);
  background: rgba(236, 72, 153, 0.1);
}

.doneText {
  color: #64748b;
  text-decoration: line-through;
}

.cellActions {
  text-align: right;
  vertical-align: middle;
}

.deleteButton {
  width: 32px;
  height: 32px;
  border: 1px solid rgba(239, 68, 68, 0.35);
  border-radius: 8px;
  padding: 0;
  background: rgba(239, 68, 68, 0.06);
  color: #7f1d1d;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.deleteButton:hover {
  background: rgba(239, 68, 68, 0.1);
}

.deleteIcon {
  width: 18px;
  height: 18px;
}

.confirmOverlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  z-index: 50;
}

.confirmDialog {
  width: 360px;
  max-width: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  color: #0f172a;
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.18);
  padding: 14px;
}

.confirmTitle {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.confirmMessage {
  margin: 0 0 12px;
  color: #475569;
  font-size: 13px;
  line-height: 1.35;
}

.confirmActions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.confirmCancel {
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  padding: 8px 10px;
  background: #ffffff;
  color: #0f172a;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.confirmCancel:hover {
  background: #f1f5f9;
}

.confirmDelete {
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 10px;
  padding: 8px 10px;
  background: rgba(239, 68, 68, 0.08);
  color: #7f1d1d;
  font-size: 13px;
  font-weight: 800;
  cursor: pointer;
}

.confirmDelete:hover {
  background: rgba(239, 68, 68, 0.12);
}
</style>


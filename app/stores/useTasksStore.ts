import { defineStore } from 'pinia'

export type TaskPanelState = 'Open' | 'Waiting' | 'Delegated' | 'Scheduled' | 'Someday'
export type TaskPriority = 'High' | 'Medium' | 'Low'

export type Task = {
  id: string
  title: string
  isDone: boolean
  panelState: TaskPanelState
  priority: TaskPriority | null
  feedback: string | null
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export type TaskCreateInput = {
  title: string
  panelState: TaskPanelState
  priority?: TaskPriority | null
  feedback?: string | null
}

export type TaskUpdateInput = {
  title?: string
  isDone?: boolean
  panelState?: TaskPanelState
  priority?: TaskPriority | null
  feedback?: string | null
}

function sortTasks(items: Task[]) {
  items.sort((a, b) => {
    const byOrder = a.orderIndex - b.orderIndex
    if (byOrder !== 0) return byOrder
    if (a.createdAt < b.createdAt) return -1
    if (a.createdAt > b.createdAt) return 1
    return 0
  })
}

export const useTasksStore = defineStore('tasks', {
  state: () => ({
    items: [] as Task[],
  }),
  actions: {
    async fetchAll() {
      const tasks = await $fetch<Task[]>('/api/tasks')
      this.items = tasks
      sortTasks(this.items)
      return tasks
    },
    async create(input: TaskCreateInput) {
      const created = await $fetch<Task>('/api/tasks', {
        method: 'POST',
        body: {
          title: input.title,
          panelState: input.panelState,
          priority: input.priority ?? null,
          feedback: input.feedback ?? null,
        },
      })
      this.items.push(created)
      sortTasks(this.items)
      return created
    },
    async update(id: string, patch: TaskUpdateInput) {
      const index = this.items.findIndex((t) => t.id === id)
      if (index === -1) throw new Error('Task not found')

      const prev = this.items[index]
      this.items[index] = { ...prev, ...patch }

      try {
        const updated = await $fetch<Task>(`/api/tasks/${id}`, {
          method: 'PATCH',
          body: patch,
        })
        const currentIndex = this.items.findIndex((t) => t.id === id)
        if (currentIndex !== -1) this.items[currentIndex] = updated
        sortTasks(this.items)
        return updated
      } catch (err) {
        const currentIndex = this.items.findIndex((t) => t.id === id)
        if (currentIndex !== -1) this.items[currentIndex] = prev
        sortTasks(this.items)
        throw err
      }
    },
    async remove(id: string) {
      const index = this.items.findIndex((t) => t.id === id)
      if (index === -1) return

      const [removed] = this.items.splice(index, 1)
      sortTasks(this.items)
      try {
        await $fetch(`/api/tasks/${id}`, { method: 'DELETE' })
      } catch (err) {
        this.items.splice(index, 0, removed)
        sortTasks(this.items)
        throw err
      }
    },
  },
})


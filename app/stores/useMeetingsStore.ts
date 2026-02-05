import { defineStore } from 'pinia'

export type MeetingType = 'ONLINE' | 'IN_PERSON'

export type Meeting = {
  id: string
  title: string
  isDone: boolean
  meetingType: MeetingType
  orderIndex: number
  createdAt: string
  updatedAt: string
}

export type MeetingCreateInput = {
  title: string
  meetingType: MeetingType
}

export type MeetingUpdateInput = {
  title?: string
  isDone?: boolean
  meetingType?: MeetingType
}

function sortMeetings(items: Meeting[]) {
  items.sort((a, b) => {
    const byOrder = a.orderIndex - b.orderIndex
    if (byOrder !== 0) return byOrder
    if (a.createdAt < b.createdAt) return -1
    if (a.createdAt > b.createdAt) return 1
    return 0
  })
}

export const useMeetingsStore = defineStore('meetings', {
  state: () => ({
    items: [] as Meeting[],
  }),
  actions: {
    async fetchAll() {
      const meetings = await $fetch<Meeting[]>('/api/meetings')
      this.items = meetings
      sortMeetings(this.items)
      return meetings
    },
    async create(input: MeetingCreateInput) {
      const created = await $fetch<Meeting>('/api/meetings', {
        method: 'POST',
        body: {
          title: input.title,
          meetingType: input.meetingType,
        },
      })
      this.items.push(created)
      sortMeetings(this.items)
      return created
    },
    async update(id: string, patch: MeetingUpdateInput) {
      const index = this.items.findIndex((m) => m.id === id)
      if (index === -1) throw new Error('Meeting not found')

      const prev = this.items[index]
      this.items[index] = { ...prev, ...patch }

      try {
        const updated = await $fetch<Meeting>(`/api/meetings/${id}`, {
          method: 'PATCH',
          body: patch,
        })
        const currentIndex = this.items.findIndex((m) => m.id === id)
        if (currentIndex !== -1) this.items[currentIndex] = updated
        sortMeetings(this.items)
        return updated
      } catch (err) {
        const currentIndex = this.items.findIndex((m) => m.id === id)
        if (currentIndex !== -1) this.items[currentIndex] = prev
        sortMeetings(this.items)
        throw err
      }
    },
    async remove(id: string) {
      const index = this.items.findIndex((m) => m.id === id)
      if (index === -1) return

      const [removed] = this.items.splice(index, 1)
      sortMeetings(this.items)
      try {
        await $fetch(`/api/meetings/${id}`, { method: 'DELETE' })
      } catch (err) {
        this.items.splice(index, 0, removed)
        sortMeetings(this.items)
        throw err
      }
    },
  },
})


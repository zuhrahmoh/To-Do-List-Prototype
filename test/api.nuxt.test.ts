// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'
import { $fetch, setup, startServer, stopServer } from '@nuxt/test-utils/e2e'

process.env.DATABASE_URL = 'file:./prisma/test.db'

describe('API (phase 2)', async () => {
  await setup({ rootDir: process.cwd() })

  it('tasks: CRUD + validation + ordering + persistence', async () => {
    await expect(
      $fetch('/api/tasks', {
        method: 'POST',
        body: { title: '', panelState: 'Open' },
      }),
    ).rejects.toBeTruthy()

    const t1 = await $fetch('/api/tasks', {
      method: 'POST',
      body: { title: 'A', panelState: 'Open' },
    })
    const t2 = await $fetch('/api/tasks', {
      method: 'POST',
      body: { title: 'B', panelState: 'Open' },
    })

    const tasks1 = await $fetch('/api/tasks')
    expect(tasks1.map((t: any) => t.id)).toEqual([t1.id, t2.id])

    const updated = await $fetch(`/api/tasks/${t1.id}`, {
      method: 'PATCH',
      body: { isDone: true, priority: 'High' },
    })
    expect(updated.isDone).toBe(true)
    expect(updated.priority).toBe('High')

    await expect(
      $fetch('/api/tasks/does-not-exist', { method: 'PATCH', body: { isDone: true } }),
    ).rejects.toBeTruthy()

    const del = await $fetch(`/api/tasks/${t2.id}`, { method: 'DELETE' })
    expect(del).toBeUndefined()

    const tasks2 = await $fetch('/api/tasks')
    expect(tasks2.map((t: any) => t.id)).toEqual([t1.id])

    await stopServer()
    await startServer()

    const tasksAfterRestart = await $fetch('/api/tasks')
    expect(tasksAfterRestart.map((t: any) => t.id)).toEqual([t1.id])
  })

  it('meetings: CRUD + validation + ordering + persistence', async () => {
    await expect(
      $fetch('/api/meetings', {
        method: 'POST',
        body: { title: '', meetingType: 'ONLINE' },
      }),
    ).rejects.toBeTruthy()

    await expect(
      $fetch('/api/meetings', {
        method: 'POST',
        body: { title: 'X', meetingType: 'In person' },
      }),
    ).rejects.toBeTruthy()

    const m1 = await $fetch('/api/meetings', {
      method: 'POST',
      body: { title: 'M1', meetingType: 'ONLINE' },
    })
    const m2 = await $fetch('/api/meetings', {
      method: 'POST',
      body: { title: 'M2', meetingType: 'IN_PERSON' },
    })

    const meetings1 = await $fetch('/api/meetings')
    expect(meetings1.map((m: any) => m.id)).toEqual([m1.id, m2.id])

    const updated = await $fetch(`/api/meetings/${m1.id}`, {
      method: 'PATCH',
      body: { isDone: true, meetingType: 'IN_PERSON' },
    })
    expect(updated.isDone).toBe(true)
    expect(updated.meetingType).toBe('IN_PERSON')

    await expect(
      $fetch('/api/meetings/does-not-exist', { method: 'DELETE' }),
    ).rejects.toBeTruthy()

    const del = await $fetch(`/api/meetings/${m2.id}`, { method: 'DELETE' })
    expect(del).toBeUndefined()

    const meetings2 = await $fetch('/api/meetings')
    expect(meetings2.map((m: any) => m.id)).toEqual([m1.id])

    await stopServer()
    await startServer()

    const meetingsAfterRestart = await $fetch('/api/meetings')
    expect(meetingsAfterRestart.map((m: any) => m.id)).toEqual([m1.id])
  })
})


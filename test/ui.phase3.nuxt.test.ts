// @vitest-environment nuxt
import { describe, expect, it } from 'vitest'
import { $fetch, setup } from '@nuxt/test-utils/e2e'

describe('UI (phase 3)', async () => {
  await setup({ rootDir: process.cwd() })

  it('renders the To Do layout with two panes and buttons', async () => {
    const html = await $fetch('/', { responseType: 'text' })

    expect(html).toContain('To Do')
    expect(html).toContain('Tasks')
    expect(html).toContain('New Task')
    expect(html).toContain('Meetings')
    expect(html).toContain('New Meeting')
  })
})


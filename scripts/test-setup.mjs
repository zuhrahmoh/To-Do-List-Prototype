import { existsSync } from 'node:fs'
import { rm } from 'node:fs/promises'
import { spawnSync } from 'node:child_process'

process.env.DATABASE_URL =
  process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@127.0.0.1:5432/todo_app_test?schema=public'

// SQLite-only cleanup removed; Postgres test DB should be created externally.

const env = { ...process.env, DATABASE_URL: process.env.DATABASE_URL }

const generate = spawnSync('npx', ['prisma', 'generate'], {
  stdio: 'inherit',
  shell: true,
  env,
})
if (generate.status !== 0) process.exit(generate.status ?? 1)

const migrate = spawnSync('npx', ['prisma', 'migrate', 'deploy'], {
  stdio: 'inherit',
  shell: true,
  env,
})
if (migrate.status !== 0) process.exit(migrate.status ?? 1)


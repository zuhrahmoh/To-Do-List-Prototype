import { PrismaClient } from '@prisma/client'
import type { PrismaClient as PrismaClientType } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

type GlobalPrisma = {
  prisma?: PrismaClientType
  pool?: pg.Pool
  prismaShutdownHookRegistered?: boolean
}

const globalForPrisma = globalThis as unknown as GlobalPrisma

function createPrismaClient(): { client: PrismaClientType; pool: pg.Pool } {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }

  const { Pool } = pg
  const sslMode = process.env.PGSSLMODE?.toLowerCase()
  const sslRequired =
    sslMode === 'require' ||
    sslMode === 'verify-ca' ||
    sslMode === 'verify-full' ||
    url.includes('.render.com')

  const maxFromEnv = Number.parseInt(process.env.DATABASE_POOL_MAX ?? '10', 10)
  const max = Number.isFinite(maxFromEnv) ? maxFromEnv : 10

  const pool = new Pool({
    connectionString: url,
    max,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
    ...(sslRequired ? { ssl: { rejectUnauthorized: false } } : {}),
  })
  pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err)
  })
  const adapter = new PrismaPg(pool)

  return { client: new PrismaClient({ adapter }), pool }
}

if (!globalForPrisma.prisma) {
  const { client, pool } = createPrismaClient()
  globalForPrisma.prisma = client
  globalForPrisma.pool = pool
}

export const prisma = globalForPrisma.prisma!

function registerShutdownHooks() {
  if (globalForPrisma.prismaShutdownHookRegistered) return
  globalForPrisma.prismaShutdownHookRegistered = true

  if (typeof process === 'undefined') return

  const shutdown = () => {
    void globalForPrisma.prisma?.$disconnect().catch(() => undefined)
    void globalForPrisma.pool?.end().catch(() => undefined)
  }

  process.once('SIGINT', shutdown)
  process.once('SIGTERM', shutdown)
  process.once('beforeExit', shutdown)
}

registerShutdownHooks()

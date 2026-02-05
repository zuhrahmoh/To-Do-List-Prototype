import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient }

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL
  if (!url) {
    throw new Error('DATABASE_URL is not set')
  }

  const { Pool } = pg
  const sslRequired =
    process.env.PGSSLMODE === 'require' ||
    process.env.NODE_ENV === 'production' ||
    url.includes('.render.com')

  const pool = new Pool({
    connectionString: url,
    ...(sslRequired ? { ssl: { rejectUnauthorized: false } } : {}),
  })
  const adapter = new PrismaPg(pool)

  return new PrismaClient({ adapter })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


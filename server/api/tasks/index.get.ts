import { defineEventHandler } from '#imports'
import { prisma } from '../../db/prisma'

export default defineEventHandler(async () => {
  return prisma.task.findMany({
    orderBy: [{ orderIndex: 'asc' }, { createdAt: 'asc' }],
  })
})


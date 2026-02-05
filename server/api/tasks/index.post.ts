import { createError, defineEventHandler, readBody, setResponseStatus } from '#imports'
import { prisma } from '../../db/prisma'
import { taskCreateSchema } from '../../validators/tasks'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = taskCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid task payload',
    })
  }

  const max = await prisma.task.aggregate({ _max: { orderIndex: true } })
  const nextOrderIndex = (max._max.orderIndex ?? -1) + 1

  const created = await prisma.task.create({
    data: {
      title: parsed.data.title,
      panelState: parsed.data.panelState,
      priority: parsed.data.priority ?? null,
      feedback: parsed.data.feedback ?? null,
      orderIndex: nextOrderIndex,
    },
  })

  setResponseStatus(event, 201)
  return created
})


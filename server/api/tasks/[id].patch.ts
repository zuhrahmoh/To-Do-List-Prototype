import { createError, defineEventHandler, getRouterParam, readBody } from '#imports'
import { prisma } from '../../db/prisma'
import { isPrismaRecordNotFoundError } from '../../db/prismaErrors'
import { taskUpdateSchema } from '../../validators/tasks'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const body = await readBody(event)
  const parsed = taskUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid task payload' })
  }
  if (Object.keys(parsed.data).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Empty update payload' })
  }

  try {
    return await prisma.task.update({
      where: { id },
      data: parsed.data,
    })
  } catch (err) {
    if (isPrismaRecordNotFoundError(err)) {
      throw createError({ statusCode: 404, statusMessage: 'Task not found' })
    }
    throw err
  }
})


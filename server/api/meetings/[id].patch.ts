import { createError, defineEventHandler, getRouterParam, readBody } from '#imports'
import { prisma } from '../../db/prisma'
import { isPrismaRecordNotFoundError } from '../../db/prismaErrors'
import { meetingUpdateSchema } from '../../validators/meetings'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  const body = await readBody(event)
  const parsed = meetingUpdateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid meeting payload' })
  }
  if (Object.keys(parsed.data).length === 0) {
    throw createError({ statusCode: 400, statusMessage: 'Empty update payload' })
  }

  try {
    return await prisma.meeting.update({
      where: { id },
      data: parsed.data,
    })
  } catch (err) {
    if (isPrismaRecordNotFoundError(err)) {
      throw createError({ statusCode: 404, statusMessage: 'Meeting not found' })
    }
    throw err
  }
})


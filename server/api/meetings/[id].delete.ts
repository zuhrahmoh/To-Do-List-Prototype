import { createError, defineEventHandler, getRouterParam, setResponseStatus } from '#imports'
import { prisma } from '../../db/prisma'
import { isPrismaRecordNotFoundError } from '../../db/prismaErrors'

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  if (!id) {
    throw createError({ statusCode: 400, statusMessage: 'Missing id' })
  }

  try {
    await prisma.meeting.delete({ where: { id } })
  } catch (err) {
    if (isPrismaRecordNotFoundError(err)) {
      throw createError({ statusCode: 404, statusMessage: 'Meeting not found' })
    }
    throw err
  }

  setResponseStatus(event, 204)
  return null
})


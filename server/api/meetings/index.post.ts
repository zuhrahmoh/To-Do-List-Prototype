import { createError, defineEventHandler, readBody, setResponseStatus } from '#imports'
import { prisma } from '../../db/prisma'
import { meetingCreateSchema } from '../../validators/meetings'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const parsed = meetingCreateSchema.safeParse(body)
  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid meeting payload',
    })
  }

  const max = await prisma.meeting.aggregate({ _max: { orderIndex: true } })
  const nextOrderIndex = (max._max.orderIndex ?? -1) + 1

  const created = await prisma.meeting.create({
    data: {
      title: parsed.data.title,
      meetingType: parsed.data.meetingType,
      orderIndex: nextOrderIndex,
    },
  })

  setResponseStatus(event, 201)
  return created
})


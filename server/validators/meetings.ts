import { z } from 'zod'

export const MeetingTypes = ['ONLINE', 'IN_PERSON'] as const

export const meetingCreateSchema = z
  .object({
    title: z.string().min(1),
    meetingType: z.enum(MeetingTypes),
  })
  .strict()

export const meetingUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    isDone: z.boolean().optional(),
    meetingType: z.enum(MeetingTypes).optional(),
    orderIndex: z.number().int().optional(),
  })
  .strict()

export type MeetingCreateInput = z.infer<typeof meetingCreateSchema>
export type MeetingUpdateInput = z.infer<typeof meetingUpdateSchema>

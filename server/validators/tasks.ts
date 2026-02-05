import { z } from 'zod'

export const TaskPanelStates = ['Open', 'Waiting', 'Delegated', 'Scheduled', 'Someday'] as const
export const TaskPriorities = ['High', 'Medium', 'Low'] as const

export const taskCreateSchema = z
  .object({
    title: z.string().min(1),
    panelState: z.enum(TaskPanelStates),
    priority: z.enum(TaskPriorities).nullable().optional(),
    feedback: z.string().nullable().optional(),
  })
  .strict()

export const taskUpdateSchema = z
  .object({
    title: z.string().min(1).optional(),
    isDone: z.boolean().optional(),
    panelState: z.enum(TaskPanelStates).optional(),
    priority: z.enum(TaskPriorities).nullable().optional(),
    feedback: z.string().nullable().optional(),
    orderIndex: z.number().int().optional(),
  })
  .strict()

export type TaskCreateInput = z.infer<typeof taskCreateSchema>
export type TaskUpdateInput = z.infer<typeof taskUpdateSchema>

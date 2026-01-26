export const TASK_TYPE = {
  daily: 'daily',
  weekly: 'weekly',
  monthly: 'monthly',
} as const

export type TTaskType = keyof typeof TASK_TYPE
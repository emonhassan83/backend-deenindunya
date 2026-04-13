export const EVENT_TYPE = {
  islamic: 'islamic',
  user: 'user',
} as const

export type TEventType = keyof typeof EVENT_TYPE
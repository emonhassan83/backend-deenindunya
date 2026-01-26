export const List_TYPE = {
  grocery: 'grocery',
  room: 'room'
} as const

export type TListType = keyof typeof List_TYPE
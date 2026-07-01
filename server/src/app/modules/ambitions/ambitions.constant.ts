export const AmbitionsType = {
  deen: 'deen',
  dunya: 'dunya',
} as const

export type TAmbitionsType = keyof typeof AmbitionsType

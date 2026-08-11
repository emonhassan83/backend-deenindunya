export const durationType = {
  monthly: 'monthly',
  annually: 'annually',
} as const

export type TDurationType = keyof typeof durationType

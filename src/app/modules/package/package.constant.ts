export const durationType = {
  monthly: 'monthly',
  yearly: 'yearly',
} as const

export type TDurationType = keyof typeof durationType

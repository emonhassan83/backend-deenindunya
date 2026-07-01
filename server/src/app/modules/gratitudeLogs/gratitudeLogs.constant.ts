export const GratitudeType = {
  family: 'family',
  health: 'health',
  rizq: 'rizq',
  finance: 'finance',
} as const

export type TGratitudeType = keyof typeof GratitudeType

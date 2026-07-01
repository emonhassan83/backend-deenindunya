export const ExerciseCategory = {
  cardio: 'cardio',
  strength: 'strength',
  flexibility: 'flexibility',
  balance: 'balance',
  sports: 'sports',
  yoga: 'yoga',
  martial_arts: 'martial_arts',
  other: 'other',
} as const

export type TExerciseCategory = keyof typeof ExerciseCategory
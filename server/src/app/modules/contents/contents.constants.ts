export const GENERAL_KEYS = [
  'waterIntake',
] as const;

export const ALLOWED_KEYS = [
  ...GENERAL_KEYS,
  'termsAndConditions',
  'privacyPolicy',
] as const;

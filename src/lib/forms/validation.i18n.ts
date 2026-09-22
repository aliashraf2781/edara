import type { Dict } from '~/lib/i18n/locales'

/** Shared by every schema factory so one rule reads the same on every screen. */
export const validationText: Dict<{
  required: string
  email: string
  minLength: (n: number) => string
  maxLength: (n: number) => string
  digits: (n: number) => string
  notNegative: string
  atLeastOne: string
  passwordStrength: string
  passwordMismatch: string
  scoreRange: string
  fileTooLarge: (mb: number) => string
  fileType: string
}> = {
  ar: {
    required: 'هذا الحقل مطلوب',
    email: 'أدخل بريدًا إلكترونيًا صحيحًا',
    minLength: (n) => `الحد الأدنى ${n} حرفًا`,
    maxLength: (n) => `الحد الأقصى ${n} حرفًا`,
    digits: (n) => `أدخل ${n} أرقام`,
    notNegative: 'أدخل رقمًا موجبًا',
    atLeastOne: 'اختر عنصرًا واحدًا على الأقل',
    passwordStrength: 'ثمانية أحرف على الأقل، مع حرف كبير وصغير ورقم ورمز',
    passwordMismatch: 'كلمتا المرور غير متطابقتين',
    scoreRange: 'الدرجة يجب ألا تتجاوز الدرجة العظمى',
    fileTooLarge: (mb) => `الحد الأقصى لحجم الملف ${mb} ميجابايت`,
    fileType: 'صيغة الملف غير مدعومة',
  },
  en: {
    required: 'This field is required',
    email: 'Enter a valid email address',
    minLength: (n) => `Use at least ${n} characters`,
    maxLength: (n) => `Use at most ${n} characters`,
    digits: (n) => `Enter ${n} digits`,
    notNegative: 'Enter a positive number',
    atLeastOne: 'Select at least one',
    passwordStrength: 'At least 8 characters with upper and lower case, a number and a symbol',
    passwordMismatch: 'The passwords do not match',
    scoreRange: 'The score cannot exceed the maximum score',
    fileTooLarge: (mb) => `The file must be ${mb} MB or smaller`,
    fileType: 'That file type is not supported',
  },
}

export type ValidationText = (typeof validationText)['en']

/** Mirrors the server rule: 8+ chars, mixed case, a number and a symbol. */
export const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\w\s]).{8,}$/

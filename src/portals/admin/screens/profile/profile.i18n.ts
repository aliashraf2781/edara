import type { Dict } from '~/lib/i18n/locales'

export const profileText: Dict<{
  title: string
  description: string
  details: string
  name: string
  phone: string
  email: string
  emailLocked: string
  language: string
  timezone: string
  saved: string
  passwordTitle: string
  passwordBody: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  changePassword: string
  passwordChanged: string
  avatarTitle: string
  avatarBody: string
  uploadAvatar: string
  removeAvatar: string
  avatarUpdated: string
  avatarRemoved: string
  removeAvatarTitle: string
  removeAvatarConsequence: string
}> = {
  ar: {
    title: 'حسابي',
    description: 'بياناتك على المنصة وإعدادات الدخول.',
    details: 'البيانات الشخصية',
    name: 'الاسم',
    phone: 'رقم الهاتف',
    email: 'البريد الإلكتروني',
    emailLocked: 'لا يمكن تغيير البريد الإلكتروني من هنا.',
    language: 'لغة الواجهة',
    timezone: 'المنطقة الزمنية',
    saved: 'تم حفظ البيانات.',
    passwordTitle: 'كلمة المرور',
    passwordBody: 'اختر كلمة مرور جديدة قوية. ستحتاج كلمة المرور الحالية للتأكيد.',
    currentPassword: 'كلمة المرور الحالية',
    newPassword: 'كلمة المرور الجديدة',
    confirmPassword: 'تأكيد كلمة المرور الجديدة',
    changePassword: 'تغيير كلمة المرور',
    passwordChanged: 'تم تغيير كلمة المرور.',
    avatarTitle: 'الصورة الشخصية',
    avatarBody: 'JPEG أو PNG أو GIF أو WebP، بحد أقصى ٢ ميجابايت.',
    uploadAvatar: 'رفع صورة',
    removeAvatar: 'إزالة الصورة',
    avatarUpdated: 'تم تحديث الصورة.',
    avatarRemoved: 'تمت إزالة الصورة.',
    removeAvatarTitle: 'إزالة الصورة الشخصية',
    removeAvatarConsequence: 'سيظهر الحرف الأول من اسمك بدلًا من الصورة.',
  },
  en: {
    title: 'My profile',
    description: 'Your details on the platform, and how you sign in.',
    details: 'Personal details',
    name: 'Name',
    phone: 'Phone',
    email: 'Email',
    emailLocked: 'Email cannot be changed here.',
    language: 'Interface language',
    timezone: 'Time zone',
    saved: 'Details saved.',
    passwordTitle: 'Password',
    passwordBody: 'Choose a strong new password. Your current password confirms the change.',
    currentPassword: 'Current password',
    newPassword: 'New password',
    confirmPassword: 'Confirm new password',
    changePassword: 'Change password',
    passwordChanged: 'Password changed.',
    avatarTitle: 'Profile picture',
    avatarBody: 'JPEG, PNG, GIF or WebP, 2 MB maximum.',
    uploadAvatar: 'Upload a picture',
    removeAvatar: 'Remove picture',
    avatarUpdated: 'Picture updated.',
    avatarRemoved: 'Picture removed.',
    removeAvatarTitle: 'Remove your profile picture',
    removeAvatarConsequence: 'Your initial will be shown instead of a picture.',
  },
}

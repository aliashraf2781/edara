import type { Dict } from '~/lib/i18n/locales'
import type { SchoolUserStatus } from '../../api/types'

export const staffText: Dict<{
  title: string
  description: string
  searchLabel: string
  newStaff: string
  columns: { name: string; email: string; roles: string; status: string }
  statuses: Record<SchoolUserStatus, string>
  fields: {
    name: string
    email: string
    password: string
    passwordOptional: string
    phone: string
    employeeCode: string
    nationalId: string
    status: string
    roles: string
  }
  createTitle: string
  editTitle: string
  created: string
  saved: string
  rolesTitle: string
  rolesBody: string
  saveRoles: string
  rolesSaved: string
  editRoles: string
  deleteTitle: string
  deleteConsequence: (name: string) => string
  deleted: string
  cannotDeleteSelf: string
  emptyTitle: string
  emptyBody: string
  noResultsTitle: string
  noResultsBody: string
  noVerification: string
  rolesAssignedSeparately: string
}> = {
  ar: {
    title: 'حسابات الطاقم',
    description: 'أنشئ حسابات مدرستك وأسند أدوارها دون الرجوع لفريق المنصة.',
    searchLabel: 'ابحث بالاسم أو الكود الوظيفي',
    newStaff: 'حساب جديد',
    columns: { name: 'الاسم', email: 'البريد الإلكتروني', roles: 'الأدوار', status: 'الحالة' },
    statuses: { active: 'مفعّل', suspended: 'موقوف' },
    fields: {
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      passwordOptional: 'اتركها فارغة للإبقاء على كلمة المرور الحالية.',
      phone: 'رقم الهاتف',
      employeeCode: 'الكود الوظيفي',
      nationalId: 'الرقم القومي',
      status: 'الحالة',
      roles: 'الأدوار',
    },
    createTitle: 'حساب جديد',
    editTitle: 'تعديل الحساب',
    created: 'تم إنشاء الحساب وتفعيله.',
    saved: 'تم حفظ التغييرات.',
    rolesTitle: 'أدوار هذا الحساب',
    rolesBody: 'الحفظ يستبدل مجموعة الأدوار بالكامل بما هو محدّد هنا، ولا يضيف إليها.',
    saveRoles: 'حفظ الأدوار',
    rolesSaved: 'تم تحديث الأدوار.',
    editRoles: 'تعديل الأدوار',
    deleteTitle: 'حذف الحساب',
    deleteConsequence: (name) => `لن يتمكن «${name}» من تسجيل الدخول إلى بوابة المدرسة.`,
    deleted: 'تم حذف الحساب.',
    cannotDeleteSelf: 'لا يمكنك حذف حسابك أنت.',
    emptyTitle: 'لا حسابات بعد',
    emptyBody: 'أنشئ أول حساب لأحد أفراد طاقم المدرسة.',
    noResultsTitle: 'لا نتائج مطابقة',
    noResultsBody: 'جرّب اسمًا أو بريدًا آخر.',
    noVerification: 'الحسابات الجديدة تُفعَّل فورًا دون خطوة تأكيد بريد.',
    rolesAssignedSeparately: 'يُنشأ الحساب بلا أدوار. أسندها له بعد الإنشاء من زر «تعديل الأدوار».',
  },
  en: {
    title: 'Staff accounts',
    description: 'Create your school’s accounts and assign their roles without going through the platform team.',
    searchLabel: 'Search by name or employee code',
    newStaff: 'New account',
    columns: { name: 'Name', email: 'Email', roles: 'Roles', status: 'Status' },
    statuses: { active: 'Active', suspended: 'Suspended' },
    fields: {
      name: 'Name',
      email: 'Email',
      password: 'Password',
      passwordOptional: 'Leave blank to keep the current password.',
      phone: 'Phone',
      employeeCode: 'Employee code',
      nationalId: 'National ID',
      status: 'Status',
      roles: 'Roles',
    },
    createTitle: 'New account',
    editTitle: 'Edit account',
    created: 'Account created and active.',
    saved: 'Changes saved.',
    rolesTitle: 'Roles for this account',
    rolesBody: 'Saving replaces the whole role set with what is ticked here. It does not add to it.',
    saveRoles: 'Save roles',
    rolesSaved: 'Roles updated.',
    editRoles: 'Edit roles',
    deleteTitle: 'Delete this account',
    deleteConsequence: (name) => `“${name}” will no longer be able to sign in to the school portal.`,
    deleted: 'Account deleted.',
    cannotDeleteSelf: 'You cannot delete your own account.',
    emptyTitle: 'No accounts yet',
    emptyBody: 'Create the first account for a member of your school’s staff.',
    noResultsTitle: 'No matching accounts',
    noResultsBody: 'Try a different name or email.',
    noVerification: 'New accounts are active immediately, with no email verification step.',
    rolesAssignedSeparately: 'The account is created with no roles. Assign them afterward with “Edit roles”.',
  },
}

import type { Dict } from '~/lib/i18n/locales'
import type { UserStatus } from '../../api/types'

export const globalUsersText: Dict<{
  title: string
  description: string
  searchLabel: string
  newUser: string
  columns: { name: string; email: string; roles: string; status: string; actions: string }
  syncRoles: string
  syncRolesTitle: string
  syncRolesBody: string
  saveRoles: string
  rolesSaved: string
  restricted: string
  createTitle: string
  createBody: string
  fields: {
    name: string
    email: string
    password: string
    passwordConfirmation: string
    roles: string
  }
  created: string
  emptyTitle: string
  emptyBody: string
  noResultsTitle: string
  noResultsBody: string
  deleteTitle: string
  deleteConsequence: string
  delete: string
  deleted: string
  roleNames: Record<string, string>
  statuses: Record<UserStatus, string>
}> = {
  ar: {
    title: 'مستخدمين المنصة',
    description: 'حسابات فريق المنصة. حسابات المدارس تُدار داخل كل مدرسة.',
    searchLabel: 'ابحث بالاسم أو البريد',
    newUser: 'مستخدم جديد',
    columns: {
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      roles: 'الأدوار',
      status: 'الحالة',
      actions: 'إجراءات',
    },
    syncRoles: 'تعديل الأدوار',
    syncRolesTitle: 'أدوار المستخدم',
    syncRolesBody: 'الحفظ يستبدل مجموعة الأدوار بالكامل بما هو محدّد هنا، ولا يضيف إليها.',
    saveRoles: 'حفظ الأدوار',
    rolesSaved: 'تم تحديث الأدوار.',
    restricted: 'متاح لمدير المنصة العام فقط.',
    createTitle: 'مستخدم جديد على المنصة',
    createBody: 'ينشئ حسابًا لفريق المنصة، وليس لطاقم مدرسة.',
    fields: {
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      passwordConfirmation: 'تأكيد كلمة المرور',
      roles: 'الأدوار',
    },
    created: 'تم إنشاء المستخدم.',
    emptyTitle: 'لا يوجد مستخدمينن',
    emptyBody: 'أنشئ أول حساب لفريق المنصة.',
    noResultsTitle: 'لا نتائج مطابقة',
    noResultsBody: 'جرّب كلمة بحث أخرى.',
    deleteTitle: 'حذف المستخدم',
    deleteConsequence: 'لن يتمكن هذا المستخدم من الوصول إلى المنصة بعد الآن.',
    delete: 'حذف',
    deleted: 'تم حذف المستخدم.',
    roleNames: {
      'global-admin': 'مدير المنصة',
      'admin-officer': 'مسؤول إداري',
      reviewer: 'مراجع',
      'super-admin': 'مالك المنصة',
    },
    statuses: {
      pending: 'قيد الانتظار',
      active: 'مفعّل',
      rejected: 'مرفوض',
      suspended: 'موقوف',
      banned: 'محظور',
    },
  },
  en: {
    title: 'Global users',
    description: 'Accounts for platform staff. School accounts are managed inside each school.',
    searchLabel: 'Search by name or email',
    newUser: 'New user',
    columns: { name: 'Name', email: 'Email', roles: 'Roles', status: 'Status', actions: 'Actions' },
    syncRoles: 'Edit roles',
    syncRolesTitle: 'Roles for this user',
    syncRolesBody:
      'Saving replaces the whole role set with what is ticked here. It does not add to it.',
    saveRoles: 'Save roles',
    rolesSaved: 'Roles updated.',
    restricted: 'Available to global admins only.',
    createTitle: 'New platform user',
    createBody: 'Creates an account for platform staff, not for a school.',
    fields: {
      name: 'Name',
      email: 'Email',
      password: 'Password',
      passwordConfirmation: 'Confirm password',
      roles: 'Roles',
    },
    created: 'User created.',
    emptyTitle: 'No users yet',
    emptyBody: 'Create the first platform staff account.',
    noResultsTitle: 'No matching users',
    noResultsBody: 'Try a different search term.',
    deleteTitle: 'Delete this user',
    deleteConsequence: 'This user will no longer be able to reach the platform.',
    delete: 'Delete',
    deleted: 'User deleted.',
    roleNames: {
      'global-admin': 'Global admin',
      'admin-officer': 'Admin officer',
      reviewer: 'Reviewer',
      'super-admin': 'Platform owner',
    },
    statuses: {
      pending: 'Pending',
      active: 'Active',
      rejected: 'Rejected',
      suspended: 'Suspended',
      banned: 'Banned',
    },
  },
}

import type { Dict } from '~/lib/i18n/locales'
import type { UserStatus } from '../../api/types'

export const globalUsersText: Dict<{
  title: string
  description: string
  searchLabel: string
  newUser: string
  columns: { name: string; email: string; roles: string; status: string; actions: string }
  syncRolesBody: string
  edit: string
  editTitle: string
  updated: string
  passwordOptionalHint: string
  selfDemoteWarning: string
  noRolesAvailable: string
  you: string
  changeStatus: string
  statusTitle: string
  statusBody: string
  statusLabel: string
  statusSaved: string
  saveStatus: string
  sorts: Record<string, string>
  filters: {
    status: string
    anyStatus: string
    role: string
    anyRole: string
    sort: string
    remove: string
    clear: string
  }
  createTitle: string
  createBody: string
  fields: {
    name: string
    email: string
    password: string
    passwordConfirmation: string
    newPassword: string
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
    syncRolesBody: 'الحفظ يستبدل مجموعة الأدوار بالكامل بما هو محدّد هنا، ولا يضيف إليها.',
    edit: 'تعديل',
    editTitle: 'تعديل المستخدم',
    updated: 'تم تحديث المستخدم.',
    passwordOptionalHint: 'اتركها فارغة إذا لم ترد تغيير كلمة المرور.',
    selfDemoteWarning: 'أنت تزيل صلاحية الإدارة عن حسابك. قد تفقد القدرة على إدارة المستخدمين والأدوار بعد الحفظ.',
    noRolesAvailable: 'لا توجد أدوار متاحة.',
    you: 'أنت',
    changeStatus: 'تغيير الحالة',
    statusTitle: 'تغيير حالة المستخدم',
    statusBody: 'الإيقاف أو الحظر يمنع المستخدم من الدخول دون حذف حسابه، ويمكن التراجع عنه بإعادة التفعيل.',
    statusLabel: 'الحالة',
    statusSaved: 'تم تغيير الحالة.',
    saveStatus: 'حفظ الحالة',
    sorts: {
      '-created_at': 'الأحدث أولًا',
      created_at: 'الأقدم أولًا',
      name: 'الاسم (أ → ي)',
      '-name': 'الاسم (ي → أ)',
      id: 'الرقم التعريفي ↑',
      '-id': 'الرقم التعريفي ↓',
    },
    filters: {
      status: 'الحالة',
      anyStatus: 'كل الحالات',
      role: 'الدور',
      anyRole: 'كل الأدوار',
      sort: 'الترتيب',
      remove: 'إزالة الفلتر',
      clear: 'مسح الفلاتر',
    },
    createTitle: 'مستخدم جديد على المنصة',
    createBody: 'ينشئ حسابًا لفريق المنصة، وليس لطاقم مدرسة.',
    fields: {
      name: 'الاسم',
      email: 'البريد الإلكتروني',
      password: 'كلمة المرور',
      passwordConfirmation: 'تأكيد كلمة المرور',
      newPassword: 'كلمة مرور جديدة',
      roles: 'الأدوار',
    },
    created: 'تم إنشاء المستخدم.',
    emptyTitle: 'لا يوجد مستخدمين',
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
    syncRolesBody:
      'Saving replaces the whole role set with what is ticked here. It does not add to it.',
    edit: 'Edit',
    editTitle: 'Edit user',
    updated: 'User updated.',
    passwordOptionalHint: 'Leave blank to keep the current password.',
    selfDemoteWarning:
      'You are removing admin access from your own account. You may lose the ability to manage users and roles after saving.',
    noRolesAvailable: 'No roles are available.',
    you: 'You',
    changeStatus: 'Change status',
    statusTitle: 'Change user status',
    statusBody:
      'Suspending or banning blocks sign-in without deleting the account. Set it back to Active to undo.',
    statusLabel: 'Status',
    statusSaved: 'Status changed.',
    saveStatus: 'Save status',
    sorts: {
      '-created_at': 'Newest first',
      created_at: 'Oldest first',
      name: 'Name (A → Z)',
      '-name': 'Name (Z → A)',
      id: 'ID ascending',
      '-id': 'ID descending',
    },
    filters: {
      status: 'Status',
      anyStatus: 'Any status',
      role: 'Role',
      anyRole: 'Any role',
      sort: 'Sort',
      remove: 'Remove filter',
      clear: 'Clear filters',
    },
    createTitle: 'New platform user',
    createBody: 'Creates an account for platform staff, not for a school.',
    fields: {
      name: 'Name',
      email: 'Email',
      password: 'Password',
      passwordConfirmation: 'Confirm password',
      newPassword: 'New password',
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

/**
 * Global-portal (management) endpoints: schools, global users, roles — plus
 * the read-only windows into any one school's results and statistics.
 */

import { GRADES, TERMS, gradeById, subjectsForGrade, termById } from '../curriculum'
import {
  CLASSROOMS,
  createSchool,
  deleteSchool,
  fullName,
  isPass,
  listSchools,
  resultRows,
  schoolByCode,
  schoolStats,
  studentStats,
  studentsOf,
  updateSchool,
  type MockSchool,
} from '../db'
import {
  asRecord,
  asString,
  fail,
  invalid,
  noContent,
  ok,
  paginate,
  readFilter,
  route,
  type Route,
} from '../http'

const ADMIN_TOKEN = 'mock-admin-token'

const PERMISSIONS = [
  'view-tenants',
  'view-tenant',
  'create-tenant',
  'update-tenant',
  'provision-tenant',
  'change-tenant-status',
  'assign-tenant-admin',
  'view-audit-log',
  'view-global-users',
  'create-global-user',
  'update-global-user',
  'delete-global-user',
]

const adminUser = (email = 'admin@edara.gov.eg') => ({
  id: 'global-1',
  name: 'مدير عام النظام',
  email,
  phone: '01000000000',
  avatar: null,
  status: 'active' as const,
  emailVerified: true,
  lastLoginAt: new Date().toISOString(),
  locale: 'ar',
  timezone: 'Africa/Cairo',
  preferences: {},
  roles: ['global-admin'],
  createdAt: '2025-08-01T08:00:00.000Z',
  updatedAt: new Date().toISOString(),
})

const toSummary = (school: MockSchool) => ({
  id: school.id,
  code: school.code,
  name: school.name,
  status: school.status,
  provisioningStatus: school.provisioningStatus,
  governorate: school.governorate,
  createdAt: school.createdAt,
})

const toTenant = (school: MockSchool) => ({
  ...toSummary(school),
  contactEmail: school.contactEmail,
  contactPhone: school.contactPhone,
  address: school.address,
  settings: { directorate: school.directorate },
  admins: school.admins,
  updatedAt: school.updatedAt,
})

/* --------------------------------------------------------- global users */

const globalUsers = () => [
  adminUser(),
  ...listSchools().map((school, index) => ({
    ...adminUser(school.admins[0]?.email ?? school.login.email),
    id: `global-${index + 2}`,
    name: `${school.name} — المدير`,
    roles: ['admin-officer'],
  })),
]

const ROLES = [
  { id: 1, name: 'global-admin', permissions: PERMISSIONS, createdAt: '2025-08-01T08:00:00.000Z', updatedAt: '2025-08-01T08:00:00.000Z' },
  { id: 2, name: 'admin-officer', permissions: PERMISSIONS.slice(0, 6), createdAt: '2025-08-01T08:00:00.000Z', updatedAt: '2025-08-01T08:00:00.000Z' },
  { id: 3, name: 'reviewer', permissions: ['view-tenants', 'view-tenant', 'view-audit-log'], createdAt: '2025-08-01T08:00:00.000Z', updatedAt: '2025-08-01T08:00:00.000Z' },
]

/* ---------------------------------------------------------------- routes */

export const adminRoutes: Route[] = [
  route('POST', '/auth/login', (request) => {
    const email = asString(request.body, 'email')
    const password = asString(request.body, 'password')
    if (email === '' || password === '') {
      return invalid({ email: ['البريد وكلمة المرور مطلوبان.'] })
    }
    return ok(
      {
        user: adminUser(email),
        accessToken: ADMIN_TOKEN,
        tokenType: 'Bearer',
        accessExpiresIn: 3600,
        refreshToken: `${ADMIN_TOKEN}-refresh`,
        refreshExpiresIn: 86400,
      },
      'تم تسجيل الدخول.',
    )
  }),

  route('POST', '/auth/logout', () => ok(null, 'تم تسجيل الخروج.')),
  route('POST', '/auth/refresh', () =>
    ok({
      user: adminUser(),
      accessToken: ADMIN_TOKEN,
      tokenType: 'Bearer',
      accessExpiresIn: 3600,
      refreshToken: `${ADMIN_TOKEN}-refresh`,
      refreshExpiresIn: 86400,
    }),
  ),
  route('POST', '/auth/verify', () => ok(true, 'تم تأكيد البريد.')),
  route('POST', '/auth/resend-verification', () => ok({ verificationCode: 123456 })),

  route('GET', '/auth/profile', () => ok(adminUser())),
  route('POST', '/auth/profile', (request) => ok({ ...adminUser(), ...asRecord(request.body) }, 'تم حفظ الملف الشخصي.')),
  route('POST', '/auth/profile/password', () => ok(null, 'تم تغيير كلمة المرور.')),
  route('POST', '/auth/profile/avatar', () => ok(adminUser(), 'تم تحديث الصورة.')),
  route('DELETE', '/auth/profile/avatar', () => ok(adminUser(), 'تم حذف الصورة.')),

  route('GET', '/admin/me', () => ok({ user: adminUser(), permissions: PERMISSIONS })),

  /* ------------------------------------------------------------ schools */

  route('GET', '/admin/tenants', (request) => {
    const search = (request.query.get('search') ?? '').trim()
    const status = readFilter(request.query, 'status')
    const provisioning = readFilter(request.query, 'provisioning_status')

    const rows = listSchools()
      .filter((school) => status === '' || school.status === status)
      .filter((school) => provisioning === '' || school.provisioningStatus === provisioning)
      .filter(
        (school) =>
          search === '' || school.name.includes(search) || school.code.toLowerCase().includes(search.toLowerCase()),
      )
      .map(toSummary)

    return ok(paginate(rows, request.query))
  }),

  route('POST', '/admin/tenants', (request) => {
    const body = asRecord(request.body)
    const name = asString(body, 'name')
    const email = asString(body, 'admin_email')
    const password = asString(body, 'admin_password')

    const errors: Record<string, string[]> = {}
    if (name.trim() === '') errors.name = ['اسم المدرسة مطلوب.']
    if (!/^\S+@\S+\.\S+$/.test(email)) errors.admin_email = ['بريد إلكتروني غير صالح.']
    if (password.length < 8) errors.admin_password = ['كلمة المرور لا تقل عن ٨ خانات.']
    if (Object.keys(errors).length > 0) return invalid(errors)

    const school = createSchool({ name, admin_email: email, admin_password: password })
    return ok(
      { tenant: toTenant(school), superAdmin: { email: school.login.email } },
      'تم إنشاء المدرسة وتفعيلها.',
    )
  }),

  route('GET', '/admin/tenants/:code', (request) => {
    const school = schoolByCode(request.params.code)
    return school ? ok(toTenant(school)) : fail(404, 'المدرسة غير موجودة.')
  }),

  route('POST', '/admin/tenants/:code', (request) => {
    const body = asRecord(request.body)
    const school = updateSchool(request.params.code, {
      name: typeof body.name === 'string' ? body.name : undefined,
      contactEmail: typeof body.contact_email === 'string' ? body.contact_email : undefined,
      contactPhone: typeof body.contact_phone === 'string' ? body.contact_phone : undefined,
      governorate: typeof body.governorate === 'string' ? body.governorate : undefined,
      address: typeof body.address === 'string' ? body.address : undefined,
    })
    return school ? ok(toTenant(school), 'تم حفظ التعديلات.') : fail(404, 'المدرسة غير موجودة.')
  }),

  route('POST', '/admin/tenants/:code/provision', (request) => {
    const school = updateSchool(request.params.code, { provisioningStatus: 'provisioned' })
    if (!school) return fail(404, 'المدرسة غير موجودة.')
    return ok(
      { tenant: toTenant(school), superAdmin: { email: school.login.email, temporaryPassword: school.login.password } },
      'تمت التهيئة.',
    )
  }),

  ...(['activate', 'disable', 'archive'] as const).map((action) =>
    route('POST', `/admin/tenants/:code/${action}`, (request) => {
      const status = action === 'activate' ? 'active' : action === 'disable' ? 'disabled' : 'archived'
      const school = updateSchool(request.params.code, { status })
      return school ? ok(toTenant(school), 'تم تحديث الحالة.') : fail(404, 'المدرسة غير موجودة.')
    }),
  ),

  route('DELETE', '/admin/tenants/:code', (request) =>
    deleteSchool(request.params.code) ? noContent() : fail(404, 'المدرسة غير موجودة.'),
  ),

  route('POST', '/admin/tenants/:code/admins', (request) => {
    const school = schoolByCode(request.params.code)
    if (!school) return fail(404, 'المدرسة غير موجودة.')
    const body = asRecord(request.body)
    school.admins.push({
      id: `tenant-admin-${school.admins.length + 1}-${Date.now()}`,
      name: asString(body, 'name') || asString(body, 'email').split('@')[0],
      email: asString(body, 'email'),
      relationship: (asString(body, 'relationship') || 'officer') as 'owner' | 'officer' | 'reviewer',
      isPrimary: false,
    })
    updateSchool(school.code, { admins: school.admins })
    return ok(toTenant(school), 'تمت إضافة المسؤول.')
  }),

  route('DELETE', '/admin/tenants/:code/admins/:userId', (request) => {
    const school = schoolByCode(request.params.code)
    if (!school) return fail(404, 'المدرسة غير موجودة.')
    updateSchool(school.code, {
      admins: school.admins.filter((admin) => admin.id !== request.params.userId),
    })
    return noContent()
  }),

  /* ------------------------------------- management: results and figures */

  /** Headline figures for every school, for the management overview. */
  route('GET', '/admin/insights/schools', (request) => {
    const termId = request.query.get('term_id') ?? ''
    const term = termById(termId) ? termId : undefined
    return ok(listSchools().map((school) => schoolStats(school.code, term)))
  }),

  route('GET', '/admin/tenants/:code/stats', (request) => {
    const school = schoolByCode(request.params.code)
    if (!school) return fail(404, 'المدرسة غير موجودة.')
    const termId = request.query.get('term_id') ?? ''
    return ok(schoolStats(school.code, termById(termId) ? termId : undefined))
  }),

  route('GET', '/admin/tenants/:code/students', (request) => {
    const school = schoolByCode(request.params.code)
    if (!school) return fail(404, 'المدرسة غير موجودة.')

    const search = (request.query.get('search') ?? '').trim()
    const gradeId = request.query.get('grade_id') ?? ''
    const classroomId = request.query.get('classroom_id') ?? ''

    const rows = studentsOf(school.code)
      .filter((student) => gradeId === '' || student.grade_id === gradeId)
      .filter((student) => classroomId === '' || student.classroom_id === classroomId)
      .filter(
        (student) =>
          search === '' || fullName(student).includes(search) || student.student_code.includes(search),
      )
      .map((student) => ({
        id: student.id,
        student_code: student.student_code,
        seat_no: student.seat_no,
        name: fullName(student),
        gender: student.gender,
        grade_id: student.grade_id,
        grade_name: gradeById(student.grade_id)?.name ?? '',
        classroom_id: student.classroom_id,
        classroom_name: CLASSROOMS.find((room) => room.id === student.classroom_id)?.code ?? '',
      }))

    return ok(paginate(rows, request.query))
  }),

  route('GET', '/admin/tenants/:code/students/:id', (request) => {
    const school = schoolByCode(request.params.code)
    if (!school) return fail(404, 'المدرسة غير موجودة.')
    const stats = studentStats(school.code, request.params.id)
    if (!stats) return fail(404, 'الطالب غير موجود.')
    return ok({
      ...stats,
      school: {
        code: school.code,
        name: school.name,
        directorate: school.directorate,
        governorate: school.governorate,
      },
    })
  }),

  route('GET', '/admin/tenants/:code/results', (request) => {
    const school = schoolByCode(request.params.code)
    if (!school) return fail(404, 'المدرسة غير موجودة.')

    const termId = request.query.get('term_id') ?? ''
    const rows = resultRows(school.code, {
      termId: termById(termId) ? termId : undefined,
      gradeId: request.query.get('grade_id') || undefined,
      classroomId: request.query.get('classroom_id') || undefined,
      subjectId: request.query.get('subject_id') || undefined,
    })

    const search = (request.query.get('search') ?? '').trim()
    const filtered = rows.filter(
      (row) =>
        search === '' ||
        fullName(row.student).includes(search) ||
        row.student.student_code.includes(search),
    )

    return ok(
      paginate(
        filtered.map((row) => ({
          id: row.id,
          student_id: row.student.id,
          student_code: row.student.student_code,
          student_name: fullName(row.student),
          grade_id: row.student.grade_id,
          grade_name: gradeById(row.student.grade_id)?.name ?? '',
          classroom_name: CLASSROOMS.find((room) => room.id === row.student.classroom_id)?.code ?? '',
          subject_id: row.subject.id,
          subject_name: row.subject.name,
          grading_type: row.subject.grading_type,
          term_id: row.termId,
          term_name: TERMS.find((term) => term.id === row.termId)?.name ?? '',
          score: row.value.score,
          max_score: row.subject.max_score,
          pass_score: row.subject.pass_score,
          qualitative_rating: row.value.qualitative_rating,
          is_absent: row.value.is_absent,
          status: row.value.status,
          passed: isPass(row.subject, row.value),
        })),
        request.query,
      ),
    )
  }),

  /** The reference lists the management screens need, without a school login. */
  route('GET', '/admin/reference', () =>
    ok({
      grades: GRADES.map((grade) => ({ id: grade.id, code: grade.code, name: grade.name, level: grade.level })),
      terms: TERMS,
      classrooms: CLASSROOMS,
      subjects: GRADES.flatMap((grade) => subjectsForGrade(grade.id)),
    }),
  ),

  /* -------------------------------------------------------- users, roles */

  route('GET', '/users', (request) => {
    const search = (request.query.get('search') ?? '').trim()
    const rows = globalUsers().filter(
      (user) => search === '' || user.name.includes(search) || user.email.includes(search),
    )
    return ok(paginate(rows, request.query))
  }),

  route('POST', '/users', (request) => {
    const body = asRecord(request.body)
    return ok(
      {
        ...adminUser(asString(body, 'email')),
        id: `global-new-${Date.now()}`,
        name: asString(body, 'name'),
        roles: (body.roles as string[]) ?? [],
      },
      'تم إنشاء المستخدم.',
    )
  }),

  route('POST', '/users/:id', (request) =>
    ok({ ...adminUser(), id: request.params.id, ...asRecord(request.body) }, 'تم حفظ التعديلات.'),
  ),

  route('POST', '/users/:id/status', (request) =>
    ok({ ...adminUser(), id: request.params.id, status: asString(request.body, 'status') }, 'تم تحديث الحالة.'),
  ),

  route('DELETE', '/users/:id', () => noContent()),

  route('GET', '/roles', () => ok(ROLES)),

  route('GET', '/admin/audit-logs', (request) => ok(paginate([], request.query))),
]

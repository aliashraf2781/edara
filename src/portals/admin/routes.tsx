import { Navigate, type RouteObject } from 'react-router'
import { RouteErrorBoundary } from '~/app/route-error-boundary'

/**
 * Importing this module pulls in no screen code — every entry loads its own
 * chunk on navigation.
 */
export const adminRoutes: RouteObject = {
  path: '/admin',
  errorElement: <RouteErrorBoundary />,
  children: [
    { index: true, element: <Navigate to="/admin/schools" replace /> },
    {
      path: 'login',
      lazy: async () => ({ Component: (await import('./screens/auth/login-screen')).AdminLoginScreen }),
    },
    // The printed extract is an official form, so it renders without the app
    // chrome around it — it guards itself instead of sitting under the shell.
    {
      path: 'schools/:code/students/:id/print',
      lazy: async () => ({
        Component: (await import('./screens/results/student-print-screen')).StudentPrintScreen,
      }),
    },
    {
      path: 'schools/:code/students/:id/enrollment-statement',
      lazy: async () => ({
        Component: (await import('./screens/results/enrollment-statement-screen')).EnrollmentStatementScreen,
      }),
    },
    {
      lazy: async () => ({ Component: (await import('./layout/admin-shell')).AdminShell }),
      children: [
        {
          path: 'schools',
          lazy: async () => ({ Component: (await import('./screens/schools/schools-list-screen')).SchoolsListScreen }),
        },
        {
          path: 'schools/new',
          lazy: async () => ({ Component: (await import('./screens/schools/school-create-screen')).SchoolCreateScreen }),
        },
        {
          path: 'schools/:code',
          lazy: async () => ({ Component: (await import('./screens/schools/school-detail-screen')).SchoolDetailScreen }),
        },
        {
          path: 'insights',
          lazy: async () => ({
            Component: (await import('./screens/results/insights-overview-screen'))
              .InsightsOverviewScreen,
          }),
        },
        {
          path: 'documents',
          lazy: async () => ({ Component: (await import('./screens/documents/documents-screen')).DocumentsScreen }),
        },
        {
          path: 'schools/:code/results',
          lazy: async () => ({
            Component: (await import('./screens/results/school-results-screen')).SchoolResultsScreen,
          }),
        },
        {
          path: 'schools/:code/students',
          lazy: async () => ({
            Component: (await import('./screens/results/school-students-screen'))
              .SchoolStudentsScreen,
          }),
        },
        {
          path: 'schools/:code/students/:id',
          lazy: async () => ({
            Component: (await import('./screens/results/student-stats-screen')).StudentStatsScreen,
          }),
        },
        {
          path: 'users',
          lazy: async () => ({ Component: (await import('./screens/users/users-list-screen')).GlobalUsersScreen }),
        },
        {
          path: 'roles',
          lazy: async () => ({ Component: (await import('./screens/roles/roles-screen')).RolesScreen }),
        },
        {
          path: 'audit-log',
          lazy: async () => ({ Component: (await import('./screens/audit/audit-screen')).AuditLogScreen }),
        },
        {
          path: 'profile',
          lazy: async () => ({ Component: (await import('./screens/profile/profile-screen')).AdminProfileScreen }),
        },
      ],
    },
  ],
}

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
    {
      path: 'verify',
      lazy: async () => ({ Component: (await import('./screens/auth/verify-screen')).AdminVerifyScreen }),
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

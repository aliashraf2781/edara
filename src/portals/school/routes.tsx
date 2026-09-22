import { Navigate, type RouteObject } from 'react-router'
import { RouteErrorBoundary } from '~/app/route-error-boundary'

export const schoolRoutes: RouteObject = {
  path: '/school',
  errorElement: <RouteErrorBoundary />,
  children: [
    { index: true, element: <Navigate to="/school/dashboard" replace /> },
    {
      path: 'login',
      lazy: async () => ({ Component: (await import('./screens/auth/login-screen')).SchoolLoginScreen }),
    },
    {
      lazy: async () => ({ Component: (await import('./layout/school-shell')).SchoolShell }),
      children: [
        {
          path: 'dashboard',
          lazy: async () => ({ Component: (await import('./screens/dashboard/dashboard-screen')).DashboardScreen }),
        },
        {
          path: 'academics',
          lazy: async () => ({ Component: (await import('./screens/academics/academics-screen')).AcademicsScreen }),
        },
        {
          path: 'exam-periods',
          lazy: async () => ({
            Component: (await import('./screens/exam-periods/exam-periods-screen')).ExamPeriodsScreen,
          }),
        },
        {
          path: 'students',
          lazy: async () => ({ Component: (await import('./screens/students/students-list-screen')).StudentsListScreen }),
        },
        {
          path: 'students/:id',
          lazy: async () => ({ Component: (await import('./screens/students/student-detail-screen')).StudentDetailScreen }),
        },
        {
          path: 'results',
          lazy: async () => ({ Component: (await import('./screens/results/results-list-screen')).ResultsListScreen }),
        },
        {
          path: 'results/:id',
          lazy: async () => ({ Component: (await import('./screens/results/result-detail-screen')).ResultDetailScreen }),
        },
        {
          path: 'imports',
          lazy: async () => ({ Component: (await import('./screens/imports/imports-screen')).ImportsScreen }),
        },
        {
          path: 'reports',
          lazy: async () => ({ Component: (await import('./screens/reports/reports-screen')).ReportsScreen }),
        },
        {
          path: 'staff',
          lazy: async () => ({ Component: (await import('./screens/staff/staff-screen')).StaffScreen }),
        },
        {
          path: 'profile',
          lazy: async () => ({ Component: (await import('./screens/profile/profile-screen')).SchoolProfileScreen }),
        },
      ],
    },
  ],
}

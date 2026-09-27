import { createBrowserRouter, Navigate } from 'react-router'
import { adminRoutes } from '~/portals/admin/routes'
import { schoolRoutes } from '~/portals/school/routes'

/**
 * Two route trees, two products. They share no shell, no session and no
 * screens beyond login — only the primitives in ~/ui and the client in
 * ~/lib/api. Every screen loads lazily, so opening one portal never
 * downloads the other.
 */
export const router = createBrowserRouter([
  adminRoutes,
  schoolRoutes,
  // No shared landing page: an unknown path falls back to school, since
  // school staff are the far larger audience.
  { path: '*', element: <Navigate to="/school" replace /> },
])

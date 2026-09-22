import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router'
import { AppProviders } from './app/providers'
import { router } from './app/router'
import { USE_MOCK_API } from './lib/env'
import { installMockApi } from './mocks/install'
import './styles/index.css'

// Installed before the first render, so no request can escape to the network
// while the temporary in-browser backend is in use. Set VITE_MOCK_API=false
// to hand the portals back to the real API.
if (USE_MOCK_API) installMockApi()

const container = document.getElementById('root')
if (!container) throw new Error('Missing #root element')

createRoot(container).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>,
)

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { RouterProvider } from '@tanstack/react-router'
import { router } from './router'
import './index.css'

const queryClient = new QueryClient()

const params = new URLSearchParams(window.location.search)
const redirectPath = params.get('_redirect')

const root = createRoot(document.getElementById('root')!)

root.render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)

if (redirectPath) {
  router.navigate({ to: redirectPath }).catch(() => {
    window.history.replaceState(null, '', '/')
  })
}

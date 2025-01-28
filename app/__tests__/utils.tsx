import { vi } from 'vitest'
import { NextRouter } from 'next/router'
import { AppRouterContext } from 'next/dist/shared/lib/app-router-context.shared-runtime'

export function createMockRouter(router: Partial<NextRouter>) {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    ...router
  }
}

export function RouterProvider({ children, router }: { children: React.ReactNode; router?: Partial<NextRouter> }) {
  const mockRouter = createMockRouter(router || {})
  
  return (
    <AppRouterContext.Provider value={mockRouter as any}>
      {children}
    </AppRouterContext.Provider>
  )
} 
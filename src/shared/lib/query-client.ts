import { QueryClient } from '@tanstack/react-query'

/** One client for the whole prototype shell; initiatives share the cache. */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
})

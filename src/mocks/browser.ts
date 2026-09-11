import { setupWorker } from 'msw/browser'
import type { RequestHandler } from 'msw'

/**
 * Handlers are auto-collected the same way prototypes are: any initiative
 * version can add `-api/handlers.ts` exporting `handlers: RequestHandler[]`.
 */
const modules = import.meta.glob<{ handlers: RequestHandler[] }>(
  '/src/routes/p/*/*/-api/handlers.ts',
  { eager: true },
)

export const handlers = Object.values(modules).flatMap((m) => m.handlers)

export const worker = setupWorker(...handlers)

export function startMockServer() {
  return worker.start({
    quiet: true,
    // Prototype routes are the only thing we mock; let everything else through.
    onUnhandledRequest: 'bypass',
  })
}

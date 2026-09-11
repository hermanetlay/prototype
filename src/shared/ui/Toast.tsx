import { useSyncExternalStore } from 'react'
import { cn } from '@/shared/lib/cn'

type Tone = 'success' | 'critical'
type Toast = { id: number; message: string; tone: Tone }

let toasts: Toast[] = []
let seq = 0
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

/** Fire-and-forget notification. Mount <Toaster /> once at the root. */
export function toast(message: string, tone: Tone = 'success') {
  const id = ++seq
  toasts = [...toasts, { id, message, tone }]
  emit()
  setTimeout(() => {
    toasts = toasts.filter((t) => t.id !== id)
    emit()
  }, 3500)
}

export function Toaster() {
  const items = useSyncExternalStore(
    (l) => (listeners.add(l), () => listeners.delete(l)),
    () => toasts,
  )
  return (
    <div className="pointer-events-none fixed right-6 top-[72px] z-[60] flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cn(
            'rounded-lg px-4 py-3 text-body-sm font-semibold shadow-md',
            t.tone === 'success'
              ? 'bg-success-subdued text-text-success'
              : 'bg-critical-subdued text-text-critical',
          )}
        >
          {t.message}
        </div>
      ))}
    </div>
  )
}

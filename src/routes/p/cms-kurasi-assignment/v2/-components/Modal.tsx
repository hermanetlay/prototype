import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/** Centered dialog over a scrim. Never dismisses on outside click. */
export function Modal({
  title,
  subtitle,
  size = 'md',
  onClose,
  footer,
  children,
}: {
  title: ReactNode
  subtitle?: ReactNode
  size?: 'md' | 'lg' | 'xl'
  onClose: () => void
  footer?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[55] flex items-center justify-center bg-gray-100/70 p-6">
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'flex max-h-full w-full flex-col rounded-xl bg-surface shadow-lg',
          size === 'md' && 'max-w-2xl',
          size === 'lg' && 'max-w-4xl',
          size === 'xl' && 'max-w-6xl',
        )}
      >
        <div className="flex items-start justify-between gap-4 px-8 pt-8">
          <div>
            <h2 className="text-heading-lg font-semibold">{title}</h2>
            {subtitle ? <p className="mt-1 text-body-sm text-text-subdued">{subtitle}</p> : null}
          </div>
          <button
            type="button"
            aria-label="Tutup"
            onClick={onClose}
            className="rounded-sm px-2 py-1 text-body-sm text-text-subdued hover:bg-surface-hovered"
          >
            Tutup
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-8 py-6">{children}</div>
        {footer ? (
          <div className="flex items-center justify-end gap-2 border-t border-border px-8 py-4">
            {footer}
          </div>
        ) : null}
      </div>
    </div>
  )
}

export function Alert({
  tone,
  title,
  children,
}: {
  tone: 'warning' | 'critical' | 'informational'
  title?: ReactNode
  children?: ReactNode
}) {
  return (
    <div
      role={tone === 'critical' ? 'alert' : 'note'}
      className={cn(
        'rounded-xl border p-4 text-body-sm',
        tone === 'warning' && 'border-warning bg-warning-subdued',
        tone === 'critical' && 'border-border-critical bg-critical-subdued',
        tone === 'informational' && 'border-blue-50 bg-informational-subdued',
      )}
    >
      {title ? <p className="font-semibold">{title}</p> : null}
      {children ? <div className={cn(title && 'mt-1')}>{children}</div> : null}
    </div>
  )
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="mb-6 flex items-center gap-2 text-helper">
      {steps.map((s, i) => (
        <li key={s} className="flex items-center gap-2">
          <span
            className={cn(
              'flex size-6 items-center justify-center rounded-full font-semibold',
              i < current && 'bg-success-subdued text-text-success',
              i === current && 'bg-interactive text-text-inverse',
              i > current && 'bg-gray-10 text-text-subdued',
            )}
          >
            {i + 1}
          </span>
          <span className={cn(i === current ? 'font-semibold text-text' : 'text-text-subdued')}>{s}</span>
          {i < steps.length - 1 ? <span className="h-px w-6 bg-border" /> : null}
        </li>
      ))}
    </ol>
  )
}

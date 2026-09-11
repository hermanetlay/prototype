import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

/** Label + control + hint/error, laid out per DESIGN.md form rules. */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  children,
}: {
  label: ReactNode
  htmlFor?: string
  error?: string
  hint?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={htmlFor} className="text-body-sm font-semibold">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-helper text-text-critical">{error}</p>
      ) : hint ? (
        <p className="text-helper text-text-subdued">{hint}</p>
      ) : null}
    </div>
  )
}

export const controlClass = (invalid?: boolean) =>
  cn(
    'h-10 w-full rounded-md border px-3 text-body-sm',
    // Attribute, not :read-only — Chrome matches <select> against :read-only.
    '[&[readonly]]:bg-surface-subdued [&[readonly]]:text-text-subdued',
    invalid
      ? 'border-border-critical bg-critical-subdued text-text-critical'
      : 'border-border bg-surface text-text',
  )

export function Input({
  invalid,
  className,
  ...props
}: ComponentProps<'input'> & { invalid?: boolean }) {
  return <input className={cn(controlClass(invalid), className)} {...props} />
}

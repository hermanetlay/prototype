import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

export function Card({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-surface shadow-[0_1px_2px_rgba(0,0,0,0.04)]',
        className,
      )}
      {...props}
    />
  )
}

export function CardHeader({
  title,
  subtitle,
  actions,
}: {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
      <div>
        <h2 className="text-heading-md font-semibold">{title}</h2>
        {subtitle ? (
          <p className="mt-1 text-body-sm text-text-subdued">{subtitle}</p>
        ) : null}
      </div>
      {actions ? <div className="flex gap-2">{actions}</div> : null}
    </div>
  )
}

export function CardBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('p-6', className)} {...props} />
}

import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'

export function Table({ className, ...props }: ComponentProps<'table'>) {
  return (
    <div className="overflow-x-auto">
      <table className={cn('w-full border-collapse text-body-sm', className)} {...props} />
    </div>
  )
}

export function Th({ className, ...props }: ComponentProps<'th'>) {
  return (
    <th
      className={cn(
        'bg-gray-5 px-3 py-3 text-left text-body-sm font-semibold text-text-subdued',
        'border-b border-border',
        className,
      )}
      {...props}
    />
  )
}

export function Td({ className, ...props }: ComponentProps<'td'>) {
  return (
    <td className={cn('border-b border-border px-3 py-3 align-middle', className)} {...props} />
  )
}

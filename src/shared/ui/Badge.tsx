import type { ReactNode } from 'react'
import { cn } from '@/shared/lib/cn'

type Tone = 'neutral' | 'success' | 'critical' | 'warning' | 'informational'

const tones: Record<Tone, string> = {
  neutral: 'bg-gray-10 text-text-subdued',
  success: 'bg-success-subdued text-text-success',
  critical: 'bg-critical-subdued text-text-critical',
  warning: 'bg-warning-subdued text-text-warning',
  informational: 'bg-informational-subdued text-text-informational',
}

export function Badge({
  tone = 'neutral',
  children,
}: {
  tone?: Tone
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-helper font-semibold',
        tones[tone],
      )}
    >
      {children}
    </span>
  )
}

import type { ComponentProps } from 'react'
import { cn } from '@/shared/lib/cn'

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary:
    'bg-interactive text-text-inverse hover:bg-interactive-hovered active:bg-interactive-pressed',
  secondary:
    'bg-surface text-text border border-border hover:bg-surface-hovered active:bg-surface-pressed',
  ghost: 'bg-transparent text-text hover:bg-surface-hovered',
  destructive: 'bg-critical text-text-inverse hover:brightness-95',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3',
  md: 'h-10 px-4',
  lg: 'h-11 px-8 text-action',
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ComponentProps<'button'> & { variant?: Variant; size?: Size }) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-md text-body-sm font-semibold transition-colors',
        'disabled:bg-interactive-disabled disabled:text-text-inverse disabled:cursor-not-allowed',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  )
}

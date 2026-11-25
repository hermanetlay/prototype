import type { ComponentProps, ReactNode } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { controlClass } from '@/shared/ui/Field'
import { cn } from '@/shared/lib/cn'
import type { KelompokItem } from '../-queries'
import type { Search } from '../-logic/search'

export const ROOT = '/p/cms-instrumen-kurasi/v1'
export const BANNER_TEXT = 'Perubahan hanya berlaku untuk penugasan berikutnya.'

/** Current search params (variant etc.) from whichever child route is mounted. */
export const useCurrentSearch = () => useSearch({ strict: false }) as Search

/** Navigation that always carries the variant (and the error simulation) along. */
export function useGo() {
  const navigate = useNavigate()
  const s = useCurrentSearch()
  const carry = { variant: s.variant, simulasi: s.simulasi }
  return {
    list: (extra: Partial<Search> = {}) =>
      navigate({ to: ROOT as never, search: { ...carry, ...extra } as never }),
    detail: (id: string, extra: Partial<Search> = {}) =>
      navigate({ to: `${ROOT}/${id}` as never, search: { ...carry, ...extra } as never }),
    patch: (patch: Partial<Search>, replace = true) =>
      navigate({ to: '.' as never, search: ((prev: Search) => ({ ...prev, ...patch })) as never, replace }),
  }
}

export function KLink({
  id,
  className,
  children,
}: {
  id?: string
  className?: string
  children: ReactNode
}) {
  const s = useCurrentSearch()
  return (
    <Link
      to={(id ? `${ROOT}/${id}` : ROOT) as never}
      search={{ variant: s.variant, simulasi: s.simulasi } as never}
      className={className}
    >
      {children}
    </Link>
  )
}

export function StatusBadges({ k }: { k: Pick<KelompokItem, 'status' | 'jumlah_indikator' | 'jenjang'> }) {
  return (
    <span className="inline-flex flex-wrap items-center gap-1.5">
      <Badge tone={k.status === 'active' ? 'success' : 'neutral'}>
        {k.status === 'active' ? 'Aktif' : 'Nonaktif'}
      </Badge>
      {k.jumlah_indikator === 0 ? <Badge tone="warning">Belum siap</Badge> : null}
      {k.jenjang.length === 0 ? <Badge tone="critical">Tanpa jenjang</Badge> : null}
    </span>
  )
}

export function Banner({ tone = 'informational', children }: { tone?: 'informational' | 'critical' | 'warning'; children: ReactNode }) {
  const tones = {
    informational: 'border-border-subdued bg-informational-subdued text-text-informational',
    critical: 'border-border-critical bg-critical-subdued text-text-critical',
    warning: 'border-border-subdued bg-warning-subdued text-text-warning',
  }
  return (
    <div role="note" className={cn('rounded-md border px-4 py-3 text-body-sm font-semibold', tones[tone])}>
      {children}
    </div>
  )
}

export function Select({ invalid, className, ...props }: ComponentProps<'select'> & { invalid?: boolean }) {
  return <select className={cn(controlClass(invalid), className)} {...props} />
}

export function Textarea({
  invalid,
  className,
  ...props
}: ComponentProps<'textarea'> & { invalid?: boolean }) {
  return (
    <textarea
      rows={3}
      className={cn(
        'w-full rounded-md border px-3 py-2 text-body-sm',
        invalid
          ? 'border-border-critical bg-critical-subdued text-text-critical'
          : 'border-border bg-surface text-text',
        className,
      )}
      {...props}
    />
  )
}

export function Modal({
  title,
  onClose,
  children,
  footer,
  className,
  z = 'z-[55]',
}: {
  title: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  className?: string
  z?: string
}) {
  return (
    <div className={cn('fixed inset-0 flex items-center justify-center p-6', z)}>
      <div className="absolute inset-0 bg-gray-100/60" onClick={onClose} />
      <div
        role="dialog"
        aria-label={typeof title === 'string' ? title : undefined}
        className={cn('relative flex max-h-full w-full max-w-lg flex-col rounded-xl bg-surface shadow-xl', className)}
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-heading-md font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Tutup" className="text-heading-md text-text-subdued">
            ×
          </button>
        </div>
        <div className="overflow-y-auto p-6">{children}</div>
        {footer ? <div className="flex items-center gap-2 border-t border-border px-6 py-4">{footer}</div> : null}
      </div>
    </div>
  )
}

/** Plain confirm dialog. `error` shows a refusal that came back from the API. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel = 'Hapus',
  pending,
  error,
  onConfirm,
  onClose,
}: {
  title: string
  message: ReactNode
  confirmLabel?: string
  pending?: boolean
  error?: string
  onConfirm: () => void
  onClose: () => void
}) {
  return (
    <Modal
      z="z-[58]"
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="destructive" disabled={pending} onClick={onConfirm}>
            {pending ? 'Memproses…' : confirmLabel}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3">
        <p className="text-body-sm">{message}</p>
        {error ? <Banner tone="critical">{error}</Banner> : null}
      </div>
    </Modal>
  )
}

/** The same confirm, but inline (no dialog): used by the panel variant. */
export function InlineConfirm({
  message,
  confirmLabel = 'Hapus',
  pending,
  error,
  onConfirm,
  onCancel,
}: {
  message: ReactNode
  confirmLabel?: string
  pending?: boolean
  error?: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border-critical bg-critical-subdued p-4">
      <p className="text-body-sm font-semibold text-text-critical">{message}</p>
      {error ? <p className="text-helper text-text-critical">{error}</p> : null}
      <div className="flex gap-2">
        <Button variant="destructive" size="sm" disabled={pending} onClick={onConfirm}>
          {pending ? 'Memproses…' : confirmLabel}
        </Button>
        <Button variant="secondary" size="sm" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </div>
  )
}

export function LoadingBlock({ label }: { label: string }) {
  return <p className="animate-pulse p-6 text-body-sm text-text-subdued">{label}</p>
}

export function ErrorBlock({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-start gap-3 p-6">
      <p className="text-body-sm font-semibold text-text-critical">{message}</p>
      {onRetry ? (
        <Button variant="secondary" onClick={onRetry}>
          Coba lagi
        </Button>
      ) : null}
    </div>
  )
}

export const fmtDate = (iso: string) =>
  new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Jakarta' }).format(
    new Date(iso),
  )

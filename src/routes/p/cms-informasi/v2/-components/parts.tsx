import { useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import type { UseQueryResult } from '@tanstack/react-query'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { controlClass } from '@/shared/ui/Field'
import { toast } from '@/shared/ui/Toast'
import { cn } from '@/shared/lib/cn'
import type { StatusTayang } from '../-data/seed'
import { thumbSrc } from '../-logic/thumb'
import { useDeleteInformasi } from '../-queries'
import type { Informasi } from '../-queries'

const tones = {
  Tayang: 'success',
  Terjadwal: 'informational',
  Berakhir: 'warning',
  Inaktif: 'neutral',
} as const

export const StatusBadge = ({ s }: { s: StatusTayang }) => <Badge tone={tones[s]}>{s}</Badge>

export function Thumb({ url, label, className }: { url: string; label: string; className?: string }) {
  return (
    <img
      src={thumbSrc(url, label)}
      alt=""
      className={cn('aspect-video rounded-md border border-border bg-gray-10 object-cover', className)}
    />
  )
}

export function PinIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={cn('size-4', className)} fill="currentColor" aria-label="Highlight">
      <path d="M16 3l5 5-2 1-3.5 3.5.5 4.5-2 2-3.2-4.8L6 19l-1-1 4.8-5.3L5 9.5l2-2 4.5.5L15 4.5z" />
    </svg>
  )
}

export function Select({ invalid, className, ...props }: ComponentProps<'select'> & { invalid?: boolean }) {
  return <select className={cn(controlClass(invalid), className)} {...props} />
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
        className={cn(
          'relative flex max-h-full w-full max-w-lg flex-col rounded-xl bg-surface shadow-xl',
          className,
        )}
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

export function Drawer({
  title,
  onClose,
  children,
  footer,
}: {
  title: ReactNode
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[55]">
      <div className="absolute inset-0 bg-gray-100/60" onClick={onClose} />
      <aside
        role="dialog"
        aria-label="Panel informasi"
        className="absolute inset-y-0 right-0 flex w-full max-w-[640px] flex-col bg-surface shadow-xl"
      >
        <div className="flex items-center justify-between border-b border-border px-6 py-4">
          <h2 className="text-heading-md font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Tutup" className="text-heading-md text-text-subdued">
            ×
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-6">{children}</div>
        {footer ? <div className="flex items-center gap-2 border-t border-border px-6 py-4">{footer}</div> : null}
      </aside>
    </div>
  )
}

export function ConfirmDelete({
  item,
  onClose,
  onDeleted,
}: {
  item: Pick<Informasi, 'id' | 'judul'> | null
  onClose: () => void
  onDeleted?: () => void
}) {
  const del = useDeleteInformasi()
  if (!item) return null
  return (
    <Modal
      z="z-[58]"
      title="Hapus informasi"
      onClose={onClose}
      footer={
        <>
          <Button
            variant="destructive"
            disabled={del.isPending}
            onClick={() =>
              del.mutate(item.id, {
                onSuccess: () => {
                  toast('Informasi dihapus')
                  onClose()
                  onDeleted?.()
                },
                onError: (e) => toast(e.message, 'critical'),
              })
            }
          >
            {del.isPending ? 'Menghapus…' : 'Hapus'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
        </>
      }
    >
      <p className="text-body-sm font-semibold">{item.judul}</p>
      <p className="mt-2 text-body-sm text-text-subdued">
        Hapus informasi ini? Tindakan ini tidak dapat dibatalkan.
      </p>
    </Modal>
  )
}

/** "⋯" menu; the panel is fixed-positioned so the table's scroll box can't clip it. */
export function RowMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  const [pos, setPos] = useState<{ top: number; right: number } | null>(null)
  const close = () => setPos(null)
  return (
    <>
      <button
        aria-label="Aksi"
        className="rounded-md px-2 py-1 text-body font-semibold text-text-subdued hover:bg-surface-hovered"
        onClick={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setPos({ top: r.bottom + 4, right: window.innerWidth - r.right })
        }}
      >
        ⋯
      </button>
      {pos ? (
        <>
          <div className="fixed inset-0 z-[52]" onClick={close} />
          <div
            className="fixed z-[53] w-32 rounded-md border border-border bg-surface py-1 shadow-md"
            style={{ top: pos.top, right: pos.right }}
          >
            <button
              className="block w-full px-3 py-2 text-left text-body-sm hover:bg-surface-hovered"
              onClick={() => (close(), onEdit())}
            >
              Ubah
            </button>
            <button
              className="block w-full px-3 py-2 text-left text-body-sm text-text-critical hover:bg-surface-hovered"
              onClick={() => (close(), onDelete())}
            >
              Hapus
            </button>
          </div>
        </>
      ) : null}
    </>
  )
}

export function Pager({
  total,
  page,
  size,
  onPage,
}: {
  total: number
  page: number
  size: number
  onPage: (p: number) => void
}) {
  const from = total === 0 ? 0 : (page - 1) * size + 1
  const to = Math.min(page * size, total)
  return (
    <div className="flex items-center justify-between border-t border-border px-4 py-3 text-body-sm">
      <span className="text-text-subdued">
        {from}–{to} dari {total}
      </span>
      <div className="flex gap-2">
        <Button size="sm" variant="secondary" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          Sebelumnya
        </Button>
        <Button size="sm" variant="secondary" disabled={to >= total} onClick={() => onPage(page + 1)}>
          Berikutnya
        </Button>
      </div>
    </div>
  )
}

export function EmptyState({
  filtered,
  onReset,
  action,
}: {
  filtered: boolean
  onReset: () => void
  action?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="text-heading-sm font-semibold">
        {filtered ? 'Tidak ada informasi yang cocok dengan filter' : 'Belum ada informasi'}
      </p>
      {filtered ? (
        <Button variant="secondary" onClick={onReset}>
          Reset Filter
        </Button>
      ) : (
        action
      )}
    </div>
  )
}

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
      <p className="text-heading-sm font-semibold text-text-critical">Gagal memuat informasi</p>
      <p className="text-body-sm text-text-subdued">{message}</p>
      <Button variant="secondary" onClick={onRetry}>
        Coba Lagi
      </Button>
    </div>
  )
}

export function SkeletonRows({ n = 6 }: { n?: number }) {
  return (
    <div className="flex animate-pulse flex-col gap-3 p-4" aria-label="Memuat">
      {Array.from({ length: n }, (_, i) => (
        <div key={i} className="h-12 rounded-md bg-gray-10" />
      ))}
    </div>
  )
}

/** Loading / error / empty around any list query. */
export function ListBoundary<T extends { data: unknown[] }>({
  query,
  filtered,
  onReset,
  skeleton = <SkeletonRows />,
  emptyAction,
  children,
}: {
  query: UseQueryResult<T>
  filtered: boolean
  onReset: () => void
  skeleton?: ReactNode
  emptyAction?: ReactNode
  children: (data: T) => ReactNode
}) {
  if (query.isPending) return <>{skeleton}</>
  if (query.isError)
    return <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
  if (query.data.data.length === 0)
    return <EmptyState filtered={filtered} onReset={onReset} action={emptyAction} />
  return <>{children(query.data)}</>
}

export const Panel = Card

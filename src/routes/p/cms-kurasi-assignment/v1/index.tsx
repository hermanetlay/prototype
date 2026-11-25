import { useState } from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Field'
import { cn } from '@/shared/lib/cn'
import type { Materi } from './-data/seed'
import { materiListQuery, type AssignResult } from './-queries'
import { MateriTable } from './-components/MateriList'
import { PanelDialog } from './-components/PanelDialog'
import { ReviewDialog } from './-components/ReviewDialog'
import { WizardDialog } from './-components/WizardDialog'
import { VariantSwitcher, type Variant } from './-components/VariantSwitcher'
import { Alert } from './-components/Modal'

type Search = { variant: Variant; tab: 'semua' | 'perlu' }

export const Route = createFileRoute('/p/cms-kurasi-assignment/v1/')({
  validateSearch: (s: Record<string, unknown>): Search => ({
    variant: s.variant === 'wizard' || s.variant === 'panel' ? s.variant : 'review',
    tab: s.tab === 'perlu' ? 'perlu' : 'semua',
  }),
  component: Page,
})

function Page() {
  const { variant, tab } = Route.useSearch()
  const navigate = Route.useNavigate()
  const qc = useQueryClient()
  const [q, setQ] = useState('')
  const [draft, setDraft] = useState('')
  const [selected, setSelected] = useState<Map<string, Materi>>(new Map())
  const [dialog, setDialog] = useState<{ n: number; materi: Materi[] } | null>(null)
  const list = useQuery(materiListQuery({ tab, q }))

  const toggle = (m: Materi) =>
    setSelected((s) => {
      const n = new Map(s)
      if (n.has(m.id)) n.delete(m.id)
      else n.set(m.id, m)
      return n
    })
  const toggleAll = (rows: Materi[], on: boolean) =>
    setSelected((s) => {
      const n = new Map(s)
      for (const m of rows) on ? n.set(m.id, m) : n.delete(m.id)
      return n
    })

  const open = () => setDialog((d) => ({ n: (d?.n ?? 0) + 1, materi: [...selected.values()] }))
  const applied = (r: AssignResult[]) => {
    setSelected((s) => {
      const n = new Map(s)
      for (const x of r) if (x.hasil === 'ok') n.delete(x.materi_id)
      return n
    })
  }
  const close = () => {
    setDialog(null)
    qc.invalidateQueries({ queryKey: ['cms-kurasi-assignment', 'v1', 'materi'] })
  }

  const props = dialog ? { materi: dialog.materi, onClose: close, onApplied: applied } : null
  const tabs: { key: Search['tab']; label: string }[] = [
    { key: 'semua', label: 'Semua Materi' },
    { key: 'perlu', label: 'Perlu Ditugaskan' },
  ]

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-1 rounded-full border border-gray-10 bg-surface p-1 shadow-sm">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => navigate({ search: (p) => ({ ...p, tab: t.key }) })}
              className={cn(
                'rounded-full border px-4 py-1.5 text-body-sm font-semibold',
                tab === t.key
                  ? 'border-interactive bg-surface text-interactive shadow-md'
                  : 'border-transparent text-text-subdued',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <form
          className="flex gap-2"
          onSubmit={(e) => {
            e.preventDefault()
            setQ(draft)
          }}
        >
          <Input placeholder="Cari judul atau mapel" value={draft} onChange={(e) => setDraft(e.target.value)} className="w-64" />
          <Button type="submit" variant="secondary">
            Cari
          </Button>
        </form>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-body-sm text-text-subdued">
            {list.data ? `Menampilkan ${list.data.data.length} dari ${list.data.total}` : 'Memuat materi…'}
            {selected.size ? ` · ${selected.size} dipilih` : ''}
          </p>
          <div className="flex gap-2">
            {selected.size ? (
              <Button variant="ghost" onClick={() => setSelected(new Map())}>
                Kosongkan
              </Button>
            ) : null}
            <Button disabled={selected.size === 0} onClick={open}>
              Tugaskan Kurasi
            </Button>
          </div>
        </div>
        {list.isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-10 animate-pulse rounded bg-gray-10" />
            ))}
          </div>
        ) : list.isError ? (
          <div className="p-4">
            <Alert tone="critical" title="Gagal memuat materi.">
              <button className="font-semibold text-interactive" onClick={() => list.refetch()}>
                Coba lagi
              </button>
            </Alert>
          </div>
        ) : list.data && list.data.data.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-body font-semibold">Tidak ada materi</p>
            <p className="mt-1 text-body-sm text-text-subdued">Ubah tab atau kata kunci pencarian.</p>
          </div>
        ) : (
          <MateriTable rows={list.data?.data ?? []} selected={selected} onToggle={toggle} onToggleAll={toggleAll} />
        )}
      </Card>

      {props && dialog ? (
        variant === 'panel' ? (
          <PanelDialog key={dialog.n} {...props} />
        ) : variant === 'review' ? (
          <ReviewDialog key={dialog.n} {...props} />
        ) : (
          <WizardDialog key={dialog.n} {...props} />
        )
      ) : null}

      <VariantSwitcher value={variant} onChange={(v) => navigate({ search: (p) => ({ ...p, variant: v }) })} />
    </>
  )
}

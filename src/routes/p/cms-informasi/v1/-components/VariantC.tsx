import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Card, CardHeader } from '@/shared/ui/Card'
import { STATUS_TAYANG } from '../-data/seed'
import type { StatusTayang } from '../-data/seed'
import { formatPeriode } from '../-logic/dates'
import { hasFilters } from '../-logic/search'
import type { VariantProps } from '../-logic/search'
import { listQuery } from '../-queries'
import type { Informasi } from '../-queries'
import { Filters } from './Filters'
import { FormActions, FormFields, FormHost } from './form'
import { ListBoundary, Modal, PinIcon, StatusBadge, Thumb } from './parts'
import { useInformasiList } from './useListParams'

const LANE_HINT: Record<StatusTayang, string> = {
  Tayang: 'Tampil di situs sekarang',
  Terjadwal: 'Mulai tayang nanti',
  Berakhir: 'Tanggal selesai sudah lewat',
  Inaktif: 'Dimatikan manual',
}

/** C: homepage strip + one lane per status tayang; the form is a centered modal. */
export function VariantC({ search, setSearch }: VariantProps) {
  const query = useInformasiList(search, { paged: false })
  const open = (id: string) => setSearch({ form: id })
  const close = () => setSearch({ form: undefined })
  const add = <Button onClick={() => open('new')}>Tambah Informasi</Button>
  return (
    <>
      <Card>
        <CardHeader title="Papan Informasi" subtitle="Kelompok per status tayang." actions={add} />
        <div className="p-4">
          <Filters search={search} setSearch={setSearch} />
        </div>
      </Card>

      <HomepageStrip simulasi={search.simulasi} onOpen={open} />

      <ListBoundary
        query={query}
        filtered={hasFilters(search)}
        onReset={() => setSearch({ q: undefined, kategori: undefined, layanan: undefined, jenjang_id: undefined, status_tayang: undefined, homepage: undefined })}
        emptyAction={add}
        skeleton={<div className="h-64 animate-pulse rounded-lg bg-gray-10" aria-label="Memuat" />}
      >
        {(r) => (
          <div className="grid grid-cols-4 gap-4">
            {STATUS_TAYANG.map((s) => {
              const items = r.data.filter((i) => i.status_tayang === s)
              return (
                <section key={s} className="flex flex-col gap-3 rounded-lg bg-gray-10 p-3">
                  <header>
                    <div className="flex items-center justify-between">
                      <StatusBadge s={s} />
                      <span className="text-helper font-semibold text-text-subdued">{items.length}</span>
                    </div>
                    <p className="mt-1 text-helper text-text-subdued">{LANE_HINT[s]}</p>
                  </header>
                  {items.length === 0 ? (
                    <p className="py-6 text-center text-helper text-text-subdued">Tidak ada informasi</p>
                  ) : (
                    items.map((i) => <BoardCard key={i.id} i={i} onOpen={() => open(i.id)} />)
                  )}
                </section>
              )
            })}
          </div>
        )}
      </ListBoundary>

      {search.form ? (
        <FormHost key={search.form} id={search.form} onClose={close}>
          {(c) => (
            <Modal
              className="max-w-3xl"
              title={c.isNew ? 'Tambah Informasi' : 'Ubah Informasi'}
              onClose={close}
              footer={<FormActions c={c} onClose={close} />}
            >
              <FormFields c={c} cols={2} />
            </Modal>
          )}
        </FormHost>
      ) : null}
    </>
  )
}

function BoardCard({ i, onOpen }: { i: Informasi; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="flex flex-col overflow-hidden rounded-lg border border-border bg-surface text-left hover:border-interactive"
    >
      <Thumb url={i.thumbnail} label={i.judul} className="w-full rounded-none border-0" />
      <div className="flex flex-col gap-1 p-3">
        <div className="flex items-start justify-between gap-2">
          <p className="text-body-sm font-semibold">{i.judul}</p>
          {i.pin_informasi ? <PinIcon className="shrink-0 text-interactive" /> : null}
        </div>
        <p className="text-helper text-text-subdued">{i.kategori}</p>
        <p className="text-helper text-text-subdued">{formatPeriode(i.tanggal_mulai, i.tanggal_selesai)}</p>
        {i.homepage_order !== undefined ? (
          <p className="text-helper font-semibold text-interactive">Beranda #{i.homepage_order}</p>
        ) : null}
      </div>
    </button>
  )
}

function HomepageStrip({ simulasi, onOpen }: { simulasi?: 'error'; onOpen: (id: string) => void }) {
  const q = useQuery(listQuery({ homepage: true, limit: 100, offset: 0, simulasi }))
  const counts = new Map<number, number>()
  q.data?.data.forEach((i) => counts.set(i.homepage_order!, (counts.get(i.homepage_order!) ?? 0) + 1))
  return (
    <Card>
      <CardHeader title="Beranda" subtitle="Urutan tampil di beranda: urutan terkecil dulu, lalu tanggal mulai terbaru." />
      <div className="flex gap-3 overflow-x-auto p-4">
        {q.isPending ? (
          <div className="h-20 w-full animate-pulse rounded-md bg-gray-10" aria-label="Memuat" />
        ) : q.isError ? (
          <div className="flex items-center gap-3 text-body-sm text-text-critical">
            Gagal memuat beranda.
            <Button size="sm" variant="secondary" onClick={() => q.refetch()}>
              Coba Lagi
            </Button>
          </div>
        ) : q.data.data.length === 0 ? (
          <p className="text-body-sm text-text-subdued">Belum ada informasi di beranda</p>
        ) : (
          q.data.data.map((i) => (
            <button
              key={i.id}
              onClick={() => onOpen(i.id)}
              className="flex w-64 shrink-0 gap-3 rounded-md border border-border p-2 text-left hover:border-interactive"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-5 text-body-sm font-semibold text-interactive">
                {i.homepage_order}
              </span>
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-body-sm font-semibold">{i.judul}</span>
                <span className="flex flex-wrap gap-1">
                  <StatusBadge s={i.status_tayang} />
                  {counts.get(i.homepage_order!)! > 1 ? <Badge tone="warning">Urutan sama</Badge> : null}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </Card>
  )
}

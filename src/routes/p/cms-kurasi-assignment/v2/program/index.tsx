import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Input } from '@/shared/ui/Field'
import { Table, Td, Th } from '@/shared/ui/Table'
import { tipeList, type Program, type Tipe } from '../-data/seed'
import { programListQuery } from '../-queries'
import { Alert } from '../-components/Modal'
import { SelectInput, Toggle } from '../-components/Sdk'
import { useNames } from '../-components/names'

type Search = { jenjang?: string; tipe?: Tipe; q?: string; perlu?: boolean; limit: 10 | 20 | 50; page: number }

export const Route = createFileRoute('/p/cms-kurasi-assignment/v2/program/')({
  validateSearch: (s: Record<string, unknown>): Search => ({
    jenjang: ['sd', 'smp', 'sma'].includes(s.jenjang as string) ? (s.jenjang as string) : undefined,
    tipe: tipeList.includes(s.tipe as Tipe) ? (s.tipe as Tipe) : undefined,
    q: typeof s.q === 'string' && s.q ? s.q : undefined,
    perlu: s.perlu === true || s.perlu === 'true' ? true : undefined,
    limit: s.limit === 10 || s.limit === '10' ? 10 : s.limit === 50 || s.limit === '50' ? 50 : 20,
    page: Math.max(1, Number(s.page) || 1),
  }),
  component: Page,
})

const ALL = '__all'

function Page() {
  const s = Route.useSearch()
  const navigate = Route.useNavigate()
  const names = useNames()
  const [draft, setDraft] = useState(s.q ?? '')
  const list = useQuery(
    programListQuery({ jenjang_id: s.jenjang, tipe: s.tipe, q: s.q, perlu: s.perlu, limit: s.limit, page: s.page }),
  )
  const patch = (p: Partial<Search>) => navigate({ search: (prev) => ({ ...prev, page: 1, ...p }) })

  useEffect(() => {
    const t = setTimeout(() => {
      if ((draft.trim() || undefined) !== s.q) patch({ q: draft.trim() || undefined })
    }, 300)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draft])

  const total = list.data?.total ?? 0
  const pages = Math.max(1, Math.ceil(total / s.limit))
  const filtered = !!(s.jenjang || s.tipe || s.q || s.perlu)
  const dash = <span className="text-text-subdued">—</span>

  return (
    <>
      <Card>
        <div className="flex flex-wrap items-end gap-3 border-b border-border p-4">
          <div className="w-40">
            <SelectInput
              value={s.jenjang ?? ''}
              onChange={(v) => patch({ jenjang: v === ALL ? undefined : v || undefined })}
              placeholder="Semua jenjang"
              options={[{ value: ALL, label: 'Semua Jenjang' }, ...['sd', 'smp', 'sma'].map((j) => ({ value: j, label: names.jenjang(j) }))]}
            />
          </div>
          <div className="w-56">
            <SelectInput
              value={s.tipe ?? ''}
              onChange={(v) => patch({ tipe: v === ALL ? undefined : ((v || undefined) as Tipe | undefined) })}
              placeholder="Semua tipe materi"
              options={[{ value: ALL, label: 'Semua Tipe Materi' }, ...tipeList.map((t) => ({ value: t, label: t }))]}
            />
          </div>
          <Input
            aria-label="Cari nama program"
            placeholder="Cari nama program"
            className="w-64"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="py-2">
            <Toggle checked={!!s.perlu} onChange={(v) => patch({ perlu: v || undefined })} label="Hanya yang perlu dilengkapi" />
          </div>
          {filtered ? (
            <Button
              variant="ghost"
              onClick={() => {
                setDraft('')
                navigate({ search: (p) => ({ limit: p.limit, page: 1 }) })
              }}
            >
              Reset
            </Button>
          ) : null}
        </div>

        {list.isLoading ? (
          <div className="flex flex-col gap-2 p-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-12 animate-pulse rounded bg-gray-10" />
            ))}
          </div>
        ) : list.isError ? (
          <div className="p-4">
            <Alert tone="critical" title="Gagal memuat program.">
              <button className="font-semibold text-interactive" onClick={() => list.refetch()}>
                Coba lagi
              </button>
            </Alert>
          </div>
        ) : list.data && list.data.data.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="text-body font-semibold">{filtered ? 'Tidak ada program yang cocok.' : 'Belum ada program.'}</p>
            {!filtered ? (
              <Link to="/p/cms-kurasi-assignment/v2/program/baru" className="mt-3 inline-block text-body-sm font-semibold text-interactive">
                Tambah Program
              </Link>
            ) : null}
          </div>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Nama</Th>
                <Th>Jenjang</Th>
                <Th>Tipe Materi</Th>
                <Th>Institusi</Th>
                <Th>Kelompok Instrumen</Th>
                <Th>Proses Bisnis</Th>
                <Th>Review</Th>
                <Th>Aksi</Th>
              </tr>
            </thead>
            <tbody>
              {(list.data?.data ?? []).map((p: Program) => {
                const v = p.partial
                return (
                  <tr key={p.id} className="hover:bg-surface-hovered">
                    <Td>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{p.nama}</span>
                        {p.is_legacy ? <Badge tone="warning">Lengkapi</Badge> : null}
                      </div>
                    </Td>
                    <Td>{names.jenjang(p.jenjang_id)}</Td>
                    <Td>{p.tipe_materi}</Td>
                    <Td>
                      <div className="flex flex-col gap-0.5 text-helper">
                        <span>Satker: {names.inst(v.institusi_satker_id) || '—'}</span>
                        <span>Puskur: {names.inst(v.institusi_puskur_id) || '—'}</span>
                        <span>Kurator Media: {names.inst(v.institusi_kurator_media_id) || '—'}</span>
                        <span>Kurator Substansi: {names.inst(v.institusi_kurator_substansi_id) || '—'}</span>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex flex-col gap-0.5 text-helper">
                        <span>Media: {names.kel(v.kelompok_instrumen_media_id) || '—'}</span>
                        <span>Substansi: {names.kel(v.kelompok_instrumen_substansi_id) || '—'}</span>
                      </div>
                    </Td>
                    <Td>{v.proses_bisnis ?? dash}</Td>
                    <Td>{v.review ?? dash}</Td>
                    <Td>
                      <div className="flex gap-3 font-semibold text-interactive">
                        <Link to="/p/cms-kurasi-assignment/v2/program/$id" params={{ id: p.id }}>
                          Lihat
                        </Link>
                        <Link to="/p/cms-kurasi-assignment/v2/program/$id" params={{ id: p.id }} search={{ edit: true }}>
                          {p.is_legacy ? 'Lengkapi' : 'Ubah'}
                        </Link>
                      </div>
                    </Td>
                  </tr>
                )
              })}
            </tbody>
          </Table>
        )}

        <div className="flex items-center justify-between border-t border-border px-4 py-3 text-body-sm">
          <p className="text-text-subdued">
            {list.data ? `Menampilkan ${list.data.data.length} dari ${total}` : 'Memuat program…'}
          </p>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-text-subdued">
              Per halaman
              <div className="w-20">
                <SelectInput
                  value={String(s.limit)}
                  onChange={(v) => patch({ limit: Number(v) as 10 | 20 | 50 })}
                  placeholder="20"
                  options={['10', '20', '50'].map((n) => ({ value: n, label: n }))}
                />
              </div>
            </label>
            <Button variant="secondary" size="sm" disabled={s.page <= 1} onClick={() => navigate({ search: (p) => ({ ...p, page: s.page - 1 }) })}>
              Sebelumnya
            </Button>
            <span>
              {s.page} / {pages}
            </span>
            <Button variant="secondary" size="sm" disabled={s.page >= pages} onClick={() => navigate({ search: (p) => ({ ...p, page: s.page + 1 }) })}>
              Berikutnya
            </Button>
          </div>
        </div>
      </Card>
    </>
  )
}

import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { toast } from '@/shared/ui/Toast'
import { ApiError, programDetailQuery, useUpdateProgram, type ProgramDetail, type ProgramValuesBody } from '../-queries'
import { Alert } from '../-components/Modal'
import {
  ProgramValuesFields,
  VALUE_LABELS,
  emptyValues,
  requiredErrors,
  type FormErrors,
} from '../-components/ProgramFields'
import { useNames } from '../-components/names'

export const Route = createFileRoute('/p/cms-kurasi-assignment/v2/program/$id')({
  validateSearch: (s: Record<string, unknown>): { edit?: boolean } => ({
    edit: s.edit === true || s.edit === '1' || s.edit === 'true' ? true : undefined,
  }),
  component: Page,
})

const fmt = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })

function Page() {
  const { id } = Route.useParams()
  const { edit } = Route.useSearch()
  const navigate = Route.useNavigate()
  const q = useQuery(programDetailQuery(id))
  const [completed, setCompleted] = useState(false)

  if (q.isLoading) {
    return (
      <Card>
        <div className="flex flex-col gap-2 p-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 animate-pulse rounded bg-gray-10" />
          ))}
        </div>
      </Card>
    )
  }
  if (q.isError) {
    const notFound = q.error instanceof ApiError && q.error.status === 404
    return (
      <Card>
        <div className="px-6 py-16 text-center">
          <p className="text-body font-semibold">{notFound ? 'Program tidak ditemukan.' : 'Gagal memuat program.'}</p>
          <div className="mt-3 flex justify-center gap-4 text-body-sm font-semibold text-interactive">
            {!notFound ? <button onClick={() => q.refetch()}>Coba lagi</button> : null}
            <Link to="/p/cms-kurasi-assignment/v2/program" search={{ limit: 20, page: 1 }}>Kembali ke Program Penugasan</Link>
          </div>
        </div>
      </Card>
    )
  }
  const p = q.data!
  return (
    <>
      {completed && !p.is_legacy ? (
        <Alert tone="informational" title="Program sudah lengkap dan bisa dipakai saat penugasan.">
          <Link to="/p/cms-kurasi-assignment/v2" search={{ tab: 'semua' }} className="font-semibold text-interactive">
            Tugaskan Kurasi di Kelola Materi
          </Link>
        </Alert>
      ) : null}
      <Header p={p} />
      {edit ? (
        <EditCard
          key={p.updated_at}
          p={p}
          onDone={(wasLegacy, nowComplete) => {
            if (wasLegacy && nowComplete) setCompleted(true)
            toast('Perubahan disimpan.')
            navigate({ search: {} })
          }}
          onCancel={() => navigate({ search: {} })}
        />
      ) : (
        <ViewCard p={p} onEdit={() => navigate({ search: { edit: true } })} />
      )}
    </>
  )
}

function Header({ p }: { p: ProgramDetail }) {
  const names = useNames()
  const row = (k: string, v: React.ReactNode) => (
    <div>
      <dt className="text-helper text-text-subdued">{k}</dt>
      <dd className="mt-1 text-body-sm font-semibold">{v}</dd>
    </div>
  )
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-start justify-between gap-4">
          <h2 className="text-heading-lg font-semibold">{p.nama}</h2>
          {p.is_legacy ? <Badge tone="warning">Perlu dilengkapi</Badge> : <Badge tone="success">Lengkap</Badge>}
        </div>
        <dl className="mt-4 grid grid-cols-4 gap-4">
          {row('Jenjang', names.jenjang(p.jenjang_id))}
          {row('Tipe Materi', p.tipe_materi)}
          {row('Materi terhubung', `${p.jumlah_materi} materi`)}
          {row('Diubah terakhir', `${fmt(p.updated_at)} oleh ${p.updated_by}`)}
        </dl>
        <p className="mt-4 text-helper text-text-subdued">Nama, jenjang, dan tipe materi: tidak dapat diubah.</p>
      </div>
    </Card>
  )
}

function ViewCard({ p, onEdit }: { p: ProgramDetail; onEdit: () => void }) {
  const names = useNames()
  const v = p.partial
  const show = (k: keyof ProgramValuesBody) => {
    const val = v[k]
    if (!val) return <span className="font-normal text-text-subdued">—</span>
    if (k.startsWith('institusi')) return names.inst(val)
    if (k.startsWith('kelompok')) return names.kel(val)
    return val
  }
  return (
    <Card>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-heading-lg font-semibold">Nilai Penugasan</h2>
          <Button onClick={onEdit}>{p.is_legacy ? 'Lengkapi' : 'Ubah'}</Button>
        </div>
        {p.is_legacy ? (
          <p className="mt-2 text-body-sm text-text-subdued">Lengkapi semua isian agar program bisa dipakai saat penugasan.</p>
        ) : null}
        <dl className="mt-4 grid grid-cols-2 gap-4">
          {(Object.keys(VALUE_LABELS) as (keyof ProgramValuesBody)[]).map((k) => (
            <div key={k}>
              <dt className="text-helper text-text-subdued">{VALUE_LABELS[k]}</dt>
              <dd className="mt-1 text-body-sm font-semibold">{show(k)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </Card>
  )
}

function EditCard({
  p,
  onDone,
  onCancel,
}: {
  p: ProgramDetail
  onDone: (wasLegacy: boolean, nowComplete: boolean) => void
  onCancel: () => void
}) {
  const update = useUpdateProgram(p.id)
  const [values, setValues] = useState<ProgramValuesBody>({ ...emptyValues(), ...p.partial })
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)
  useEffect(() => window.scrollTo({ top: 0 }), [])

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    if (!p.is_legacy) {
      const errs = requiredErrors(values)
      setErrors(errs)
      if (Object.keys(errs).length) return
    }
    const body = Object.fromEntries(Object.entries(values).filter(([, v]) => v)) as Partial<ProgramValuesBody>
    update.mutate(body, {
      onSuccess: (r) => onDone(p.is_legacy, r.lengkap),
      onError: (err) => setFormError(err instanceof Error ? err.message : 'Gagal menyimpan perubahan.'),
    })
  }

  return (
    <form onSubmit={submit} noValidate>
      <Card>
        <div className="p-6">
          <h2 className="text-heading-lg font-semibold">{p.is_legacy ? 'Lengkapi Nilai Penugasan' : 'Ubah Nilai Penugasan'}</h2>
          <div className="mb-4 mt-3 flex flex-col gap-3">
            <Alert tone="informational">
              Perubahan hanya berlaku untuk penugasan berikutnya. Materi yang sudah ditugaskan tidak berubah.
            </Alert>
            {p.is_legacy ? (
              <p className="text-body-sm text-text-subdued">Lengkapi semua isian agar program bisa dipakai saat penugasan.</p>
            ) : null}
          </div>
          <ProgramValuesFields
            values={values}
            set={(patch) => setValues((v) => ({ ...v, ...patch }))}
            jenjangId={p.jenjang_id}
            tipe={p.tipe_materi}
            errors={errors}
          />
          {formError ? (
            <div className="mt-4">
              <Alert tone="critical" title="Gagal menyimpan perubahan.">
                {formError}
              </Alert>
            </div>
          ) : null}
          <div className="mt-6 flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onCancel}>
              Batal
            </Button>
            <Button type="submit" disabled={update.isPending}>
              {update.isPending ? 'Menyimpan…' : 'Simpan Perubahan'}
            </Button>
          </div>
        </div>
      </Card>
    </form>
  )
}

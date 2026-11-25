import { useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Field, Input } from '@/shared/ui/Field'
import { toast } from '@/shared/ui/Toast'
import { tipeList, type Tipe } from '../-data/seed'
import { ApiError, useCreateProgram, type ProgramValuesBody } from '../-queries'
import { Alert } from '../-components/Modal'
import { SelectInput } from '../-components/Sdk'
import { ProgramValuesFields, emptyValues, requiredErrors, type FormErrors } from '../-components/ProgramFields'
import { useNames } from '../-components/names'

export const Route = createFileRoute('/p/cms-kurasi-assignment/v2/program/baru')({
  component: Page,
})

function Page() {
  const navigate = Route.useNavigate()
  const names = useNames()
  const create = useCreateProgram()
  const [nama, setNama] = useState('')
  const [jenjangId, setJenjangId] = useState('')
  const [tipe, setTipe] = useState<Tipe | ''>('')
  const [values, setValues] = useState<ProgramValuesBody>(emptyValues)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  const set = (p: Partial<ProgramValuesBody>) => setValues((v) => ({ ...v, ...p }))
  // Kelompok depends on jenjang and tipe, so changing either clears it.
  const clearKelompok = () => set({ kelompok_instrumen_media_id: '', kelompok_instrumen_substansi_id: '' })

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    const errs: FormErrors = { ...requiredErrors(values) }
    if (!nama.trim()) errs.nama = 'Wajib diisi'
    if (!jenjangId) errs.jenjang_id = 'Wajib diisi'
    if (!tipe) errs.tipe_materi = 'Wajib diisi'
    setErrors(errs)
    if (Object.keys(errs).length) return
    create.mutate(
      { ...values, nama: nama.trim(), jenjang_id: jenjangId, tipe_materi: tipe },
      {
        onSuccess: (p) => {
          toast('Program disimpan.')
          navigate({ to: '/p/cms-kurasi-assignment/v2/program/$id', params: { id: p.id } })
        },
        onError: (err) => {
          if (err instanceof ApiError && err.status === 409) setErrors({ nama: err.message })
          else setFormError(err instanceof Error ? err.message : 'Gagal menyimpan program.')
        },
      },
    )
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <Card>
        <div className="p-6">
          <h2 className="text-heading-lg font-semibold">Data Program</h2>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <Field label="Nama" htmlFor="pf-nama" error={errors.nama}>
              <Input id="pf-nama" maxLength={100} value={nama} invalid={!!errors.nama} onChange={(e) => setNama(e.target.value)} />
            </Field>
            <Field label="Jenjang" htmlFor="pf-jenjang" error={errors.jenjang_id}>
              <SelectInput
                id="pf-jenjang"
                value={jenjangId}
                onChange={(v) => {
                  setJenjangId(v)
                  clearKelompok()
                }}
                placeholder="Pilih jenjang"
                invalid={!!errors.jenjang_id}
                options={['sd', 'smp', 'sma'].map((j) => ({ value: j, label: names.jenjang(j) }))}
              />
            </Field>
            <Field label="Tipe Materi" htmlFor="pf-tipe" error={errors.tipe_materi}>
              <SelectInput
                id="pf-tipe"
                value={tipe}
                onChange={(v) => {
                  setTipe(v as Tipe)
                  clearKelompok()
                }}
                placeholder="Pilih tipe materi"
                invalid={!!errors.tipe_materi}
                options={tipeList.map((t) => ({ value: t, label: t }))}
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6">
          <h2 className="text-heading-lg font-semibold">Nilai Penugasan</h2>
          <p className="mb-4 mt-1 text-body-sm text-text-subdued">Nilai ini menjadi isian awal saat menugaskan kurasi.</p>
          <ProgramValuesFields values={values} set={set} jenjangId={jenjangId} tipe={tipe} errors={errors} />
        </div>
      </Card>

      {formError ? (
        <Alert tone="critical" title="Gagal menyimpan program.">
          {formError}
        </Alert>
      ) : null}
      <Alert tone="informational">Nama, jenjang, dan tipe materi tidak dapat diubah setelah disimpan.</Alert>
      <div className="flex justify-end gap-2">
        <Link to="/p/cms-kurasi-assignment/v2/program" search={{ limit: 20, page: 1 }}>
          <Button type="button" variant="secondary">
            Batal
          </Button>
        </Link>
        <Button type="submit" disabled={create.isPending}>
          {create.isPending ? 'Menyimpan…' : 'Simpan Program'}
        </Button>
      </div>
    </form>
  )
}

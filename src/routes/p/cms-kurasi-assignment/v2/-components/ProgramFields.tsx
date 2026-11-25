import { useQuery } from '@tanstack/react-query'
import { Field } from '@/shared/ui/Field'
import type { Tipe } from '../-data/seed'
import { institusiQuery, kelompokQuery, type ProgramValuesBody } from '../-queries'
import { SearchPick, SelectInput } from './Sdk'

export type FormErrors = Partial<Record<keyof ProgramValuesBody | 'nama' | 'jenjang_id' | 'tipe_materi', string>>

export const emptyValues = (): ProgramValuesBody => ({
  institusi_satker_id: '',
  institusi_puskur_id: '',
  institusi_kurator_media_id: '',
  institusi_kurator_substansi_id: '',
  kelompok_instrumen_media_id: '',
  kelompok_instrumen_substansi_id: '',
  proses_bisnis: '',
  review: '',
})

function KelompokPick({
  id,
  jenis,
  jenjangId,
  tipe,
  value,
  onChange,
  error,
}: {
  id: string
  jenis: 'Media' | 'Substansi'
  jenjangId: string
  tipe: Tipe | ''
  value: string
  onChange: (v: string) => void
  error?: string
}) {
  const ready = !!jenjangId && !!tipe
  const q = useQuery({
    ...kelompokQuery({ jenis, jenjang_id: jenjangId, tipe_materi: tipe || undefined }),
    enabled: ready,
  })
  return (
    <Field
      label={`Kelompok Instrumen ${jenis}`}
      htmlFor={id}
      error={error}
      hint={!ready ? 'Pilih jenjang dan tipe materi dulu' : undefined}
    >
      <SelectInput
        id={id}
        value={value}
        onChange={onChange}
        disabled={!ready || q.isLoading}
        invalid={!!error}
        placeholder={q.isLoading ? 'Memuat…' : 'Pilih kelompok'}
        options={(q.data?.data ?? []).map((k) => ({ value: k.id, label: k.nama }))}
      />
    </Field>
  )
}

/** The eight editable values of a Program. Shared by the create and edit screens. */
export function ProgramValuesFields({
  values,
  set,
  jenjangId,
  tipe,
  errors,
}: {
  values: ProgramValuesBody
  set: (patch: Partial<ProgramValuesBody>) => void
  jenjangId: string
  tipe: Tipe | ''
  errors: FormErrors
}) {
  const inst = useQuery(institusiQuery(''))
  const opts = (inst.data?.data ?? []).map((i) => ({ value: i.id, label: i.nama }))
  const pick = (id: string, label: string, k: keyof ProgramValuesBody) => (
    <Field label={label} htmlFor={id} error={errors[k]}>
      <SearchPick
        id={id}
        value={values[k]}
        onChange={(v) => set({ [k]: v })}
        options={opts}
        loading={inst.isLoading}
        invalid={!!errors[k]}
        placeholder="Cari institusi"
      />
    </Field>
  )
  const kurasi = values.proses_bisnis === 'Kurasi'
  return (
    <div className="grid grid-cols-2 gap-4">
      {pick('pf-satker', 'Satuan Kerja', 'institusi_satker_id')}
      {pick('pf-puskur', 'Pusat Kurikulum', 'institusi_puskur_id')}
      {pick('pf-km', 'Institusi Kurator Media', 'institusi_kurator_media_id')}
      {pick('pf-ks', 'Institusi Kurator Substansi', 'institusi_kurator_substansi_id')}
      <KelompokPick
        id="pf-kel-media"
        jenis="Media"
        jenjangId={jenjangId}
        tipe={tipe}
        value={values.kelompok_instrumen_media_id}
        onChange={(v) => set({ kelompok_instrumen_media_id: v })}
        error={errors.kelompok_instrumen_media_id}
      />
      <KelompokPick
        id="pf-kel-sub"
        jenis="Substansi"
        jenjangId={jenjangId}
        tipe={tipe}
        value={values.kelompok_instrumen_substansi_id}
        onChange={(v) => set({ kelompok_instrumen_substansi_id: v })}
        error={errors.kelompok_instrumen_substansi_id}
      />
      <Field label="Proses Bisnis" htmlFor="pf-pb" error={errors.proses_bisnis}>
        <SelectInput
          id="pf-pb"
          value={values.proses_bisnis}
          onChange={(v) => set({ proses_bisnis: v as 'Kurasi' | 'Produksi', ...(v === 'Kurasi' ? { review: 'Dalam CMS' } : {}) })}
          options={[
            { value: 'Kurasi', label: 'Kurasi' },
            { value: 'Produksi', label: 'Produksi' },
          ]}
          placeholder="Pilih proses bisnis"
          invalid={!!errors.proses_bisnis}
        />
      </Field>
      <Field
        label="Review"
        htmlFor="pf-review"
        error={errors.review}
        hint={kurasi ? 'Proses bisnis Kurasi selalu ditinjau Dalam CMS.' : undefined}
      >
        <SelectInput
          id="pf-review"
          value={values.review}
          onChange={(v) => set({ review: v as 'Dalam CMS' | 'Luar CMS' })}
          options={[
            { value: 'Dalam CMS', label: 'Dalam CMS' },
            { value: 'Luar CMS', label: 'Luar CMS' },
          ]}
          disabledValues={kurasi ? ['Luar CMS'] : undefined}
          placeholder="Pilih review"
          invalid={!!errors.review}
        />
      </Field>
    </div>
  )
}

export const VALUE_LABELS: Record<keyof ProgramValuesBody, string> = {
  institusi_satker_id: 'Satuan Kerja',
  institusi_puskur_id: 'Pusat Kurikulum',
  institusi_kurator_media_id: 'Institusi Kurator Media',
  institusi_kurator_substansi_id: 'Institusi Kurator Substansi',
  kelompok_instrumen_media_id: 'Kelompok Instrumen Media',
  kelompok_instrumen_substansi_id: 'Kelompok Instrumen Substansi',
  proses_bisnis: 'Proses Bisnis',
  review: 'Review',
}

export function requiredErrors(values: ProgramValuesBody): FormErrors {
  const e: FormErrors = {}
  for (const k of Object.keys(values) as (keyof ProgramValuesBody)[]) if (!values[k]) e[k] = 'Wajib diisi'
  return e
}

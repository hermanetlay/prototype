import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Field, controlClass } from '@/shared/ui/Field'
import type { Tipe } from '../-data/seed'
import type { AssignForm, FieldKey } from '../-logic/useAssignForm'
import { institusiQuery, kelompokQuery } from '../-queries'
import { useNames } from './names'

function Lbl({ text, k, form }: { text: string; k: FieldKey; form: AssignForm }) {
  return (
    <span className="flex items-center gap-2">
      {text}
      {form.overridden.has(k) ? (
        <span className="rounded-full bg-warning-subdued px-2 py-0.5 text-helper font-semibold text-text-warning">
          diubah dari program
        </span>
      ) : null}
    </span>
  )
}

export function InstitusiPicker({
  value,
  onChange,
  id,
}: {
  value: string
  onChange: (id: string) => void
  id: string
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const names = useNames()
  const list = useQuery(institusiQuery(q))
  return (
    <div className="relative">
      <input
        id={id}
        className={controlClass()}
        placeholder="Cari institusi"
        autoComplete="off"
        value={open ? q : names.inst(value)}
        onFocus={() => {
          setOpen(true)
          setQ('')
        }}
        onChange={(e) => setQ(e.target.value)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
      />
      {open ? (
        <ul className="absolute z-20 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-border bg-surface shadow-md">
          {list.isFetching && !list.data ? (
            <li className="px-3 py-2 text-body-sm text-text-subdued">Memuat…</li>
          ) : list.data?.data.length ? (
            list.data.data.map((i) => (
              <li key={i.id}>
                <button
                  type="button"
                  onMouseDown={() => {
                    onChange(i.id)
                    setOpen(false)
                  }}
                  className="w-full px-3 py-2 text-left text-body-sm hover:bg-surface-hovered"
                >
                  {i.nama}
                </button>
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-body-sm text-text-subdued">Institusi tidak ditemukan</li>
          )}
        </ul>
      ) : null}
    </div>
  )
}

function KelompokSelect({
  form,
  tipe,
  jenis,
  label,
  k,
}: {
  form: AssignForm
  tipe: Tipe
  jenis: 'Media' | 'Substansi'
  label: string
  k: FieldKey
}) {
  const q = useQuery(kelompokQuery({ jenis, jenjang_id: form.jenjangId, tipe_materi: tipe }))
  const which = jenis === 'Media' ? 'media' : 'substansi'
  const id = `kel-${jenis}-${tipe}`
  return (
    <Field
      label={<Lbl text={form.mixedTipe ? `${label} · ${tipe}` : label} k={k} form={form} />}
      htmlFor={id}
    >
      <select
        id={id}
        className={controlClass()}
        value={form.values.kelompok[tipe]?.[which] ?? ''}
        disabled={q.isLoading}
        onChange={(e) => form.setKelompok(tipe, which, e.target.value)}
      >
        <option value="">{q.isLoading ? 'Memuat…' : 'Pilih kelompok'}</option>
        {q.data?.data.map((x) => (
          <option key={x.id} value={x.id}>
            {x.nama}
          </option>
        ))}
      </select>
    </Field>
  )
}

export function ValuesForm({ form, cols = 2 }: { form: AssignForm; cols?: 1 | 2 }) {
  const v = form.values
  return (
    <div className={cols === 2 ? 'grid grid-cols-2 gap-4' : 'grid grid-cols-1 gap-4'}>
      <Field label={<Lbl text="Satuan Kerja" k="satker" form={form} />} htmlFor="v-satker">
        <InstitusiPicker id="v-satker" value={v.satker} onChange={(x) => form.set('satker', x)} />
      </Field>
      <Field label={<Lbl text="Pusat Kurikulum" k="puskur" form={form} />} htmlFor="v-puskur">
        <InstitusiPicker id="v-puskur" value={v.puskur} onChange={(x) => form.set('puskur', x)} />
      </Field>
      <Field label={<Lbl text="Institusi Kurator Media" k="kurator_media" form={form} />} htmlFor="v-km">
        <InstitusiPicker id="v-km" value={v.kuratorMedia} onChange={(x) => form.set('kuratorMedia', x)} />
      </Field>
      <Field label={<Lbl text="Institusi Kurator Substansi" k="kurator_substansi" form={form} />} htmlFor="v-ks">
        <InstitusiPicker id="v-ks" value={v.kuratorSubstansi} onChange={(x) => form.set('kuratorSubstansi', x)} />
      </Field>
      {form.tipes.map((t) => (
        <KelompokSelect key={`m-${t}`} form={form} tipe={t} jenis="Media" label="Kelompok Instrumen Media" k="kelompok_media" />
      ))}
      {form.tipes.map((t) => (
        <KelompokSelect key={`s-${t}`} form={form} tipe={t} jenis="Substansi" label="Kelompok Instrumen Substansi" k="kelompok_substansi" />
      ))}
      <Field label={<Lbl text="Proses Bisnis" k="proses_bisnis" form={form} />} htmlFor="v-pb">
        <select
          id="v-pb"
          className={controlClass()}
          value={v.prosesBisnis}
          onChange={(e) => form.set('prosesBisnis', e.target.value as 'Kurasi' | 'Produksi')}
        >
          <option value="">Pilih proses bisnis</option>
          <option value="Kurasi">Kurasi</option>
          <option value="Produksi">Produksi</option>
        </select>
      </Field>
      <Field
        label={<Lbl text="Review" k="review" form={form} />}
        htmlFor="v-rv"
        hint={v.prosesBisnis === 'Kurasi' ? 'Kurasi hanya dapat Dalam CMS.' : undefined}
      >
        <select
          id="v-rv"
          className={controlClass()}
          value={v.review}
          disabled={v.prosesBisnis === 'Kurasi'}
          onChange={(e) => form.set('review', e.target.value as 'Dalam CMS' | 'Luar CMS')}
        >
          <option value="">Pilih review</option>
          <option value="Dalam CMS">Dalam CMS</option>
          <option value="Luar CMS">Luar CMS</option>
        </select>
      </Field>
    </div>
  )
}

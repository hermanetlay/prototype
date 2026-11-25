import { useState } from 'react'
import Select from 'react-select'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/shared/ui/Button'
import { Field, Input } from '@/shared/ui/Field'
import { cn } from '@/shared/lib/cn'
import { JENIS_KURASI, TIPE_MATERI } from '../-data/seed'
import { validateKelompok } from '../-logic/guards'
import {
  ApiError,
  detailQuery,
  jenjangQuery,
  useCreateKelompok,
  useUpdateKelompok,
} from '../-queries'
import type { KelompokDetail } from '../-queries'
import { Banner, BANNER_TEXT, ErrorBlock, LoadingBlock, Modal, Select as Dropdown, useGo } from './parts'

type Option = { value: string; label: string }

function JenjangSelect({
  value,
  invalid,
  onChange,
}: {
  value: string[]
  invalid?: boolean
  onChange: (ids: string[]) => void
}) {
  const jenjang = useQuery(jenjangQuery)
  const options: Option[] = (jenjang.data?.data ?? []).map((j) => ({ value: j.id, label: j.nama_singkat }))
  return (
    <Select<Option, true>
      inputId="f-jenjang"
      isMulti
      unstyled
      isLoading={jenjang.isPending}
      options={options}
      value={options.filter((o) => value.includes(o.value))}
      onChange={(next) => onChange(next.map((o) => o.value))}
      placeholder="Pilih jenjang"
      noOptionsMessage={() => 'Jenjang tidak ditemukan'}
      classNames={{
        control: ({ isFocused }) =>
          cn(
            'min-h-10 rounded-md border px-2 py-1 text-body-sm',
            invalid
              ? 'border-border-critical bg-critical-subdued'
              : isFocused
                ? 'border-interactive bg-surface'
                : 'border-border bg-surface',
          ),
        valueContainer: () => 'gap-1 py-0.5',
        placeholder: () => 'px-1 text-text-disabled',
        input: () => 'px-1',
        multiValue: () => 'items-center rounded-full bg-blue-5 py-0.5 pl-2.5 pr-1 text-interactive',
        multiValueLabel: () => 'text-helper font-semibold',
        multiValueRemove: () => 'ml-1 rounded-full px-0.5 hover:bg-blue-10',
        indicatorsContainer: () => 'gap-1 text-text-subdued',
        clearIndicator: () => 'p-1 hover:text-text',
        dropdownIndicator: () => 'p-1 hover:text-text',
        indicatorSeparator: () => 'my-2 w-px bg-border',
        menu: () => 'mt-1 rounded-md border border-border bg-surface py-1 shadow-md',
        option: ({ isFocused }) => cn('px-3 py-2 text-body-sm', isFocused && 'bg-surface-hovered'),
        noOptionsMessage: () => 'px-3 py-2 text-body-sm text-text-subdued',
      }}
    />
  )
}

type Values = { nama: string; jenis_kurasi: string; tipe_materi: string; jenjang_ids: string[] }
type Errors = Partial<Record<keyof Values, string>>

function FormBody({ record, onClose }: { record?: KelompokDetail; onClose: () => void }) {
  const go = useGo()
  const create = useCreateKelompok()
  const update = useUpdateKelompok(record?.id ?? '')
  const [v, setV] = useState<Values>({
    nama: record?.nama ?? '',
    jenis_kurasi: record?.jenis_kurasi ?? '',
    tipe_materi: record?.tipe_materi ?? '',
    jenjang_ids: record?.jenjang.map((j) => j.id) ?? [],
  })
  const [errors, setErrors] = useState<Errors>({})
  const [refused, setRefused] = useState<string>()
  const pending = create.isPending || update.isPending

  const set = <K extends keyof Values>(k: K, val: Values[K]) => {
    setV((s) => ({ ...s, [k]: val }))
    setErrors((e) => ({ ...e, [k]: undefined }))
    setRefused(undefined)
  }

  const submit = () => {
    const bad = validateKelompok(v)
    if (bad) {
      setErrors({ [bad.field as keyof Values]: bad.message })
      return
    }
    const payload = {
      nama: v.nama.trim(),
      jenis_kurasi: v.jenis_kurasi,
      tipe_materi: v.tipe_materi || null,
      jenjang_ids: v.jenjang_ids,
    }
    const onError = (e: Error) => {
      if (e instanceof ApiError && e.field) setErrors({ [e.field]: e.message })
      else setRefused(e.message)
    }
    if (record) update.mutate(payload, { onSuccess: onClose, onError })
    else create.mutate(payload, { onSuccess: (r) => go.detail(r.data.id), onError })
  }

  return (
    <Modal
      title={record ? 'Ubah kelompok' : 'Tambah kelompok'}
      onClose={onClose}
      footer={
        <>
          <Button disabled={pending} onClick={submit}>
            {pending ? 'Menyimpan…' : 'Simpan'}
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Batal
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {record?.status === 'active' ? <Banner>{BANNER_TEXT}</Banner> : null}
        {refused ? <Banner tone="critical">{refused}</Banner> : null}
        <Field label="Nama" htmlFor="f-nama" error={errors.nama}>
          <Input id="f-nama" value={v.nama} invalid={!!errors.nama} onChange={(e) => set('nama', e.target.value)} />
        </Field>
        <Field label="Jenis kurasi" htmlFor="f-jenis" error={errors.jenis_kurasi}>
          <Dropdown
            id="f-jenis"
            value={v.jenis_kurasi}
            invalid={!!errors.jenis_kurasi}
            onChange={(e) => set('jenis_kurasi', e.target.value)}
          >
            <option value="">Pilih jenis kurasi</option>
            {JENIS_KURASI.map((j) => (
              <option key={j}>{j}</option>
            ))}
          </Dropdown>
        </Field>
        <Field label="Tipe materi" htmlFor="f-tipe" hint="Kosongkan untuk semua tipe materi.">
          <Dropdown id="f-tipe" value={v.tipe_materi} onChange={(e) => set('tipe_materi', e.target.value)}>
            <option value="">Semua tipe materi</option>
            {TIPE_MATERI.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </Dropdown>
        </Field>
        <Field label="Jenjang" htmlFor="f-jenjang" error={errors.jenjang_ids}>
          <JenjangSelect value={v.jenjang_ids} invalid={!!errors.jenjang_ids} onChange={(ids) => set('jenjang_ids', ids)} />
        </Field>
        {!record ? (
          <p className="text-helper text-text-subdued">Kelompok baru berstatus Nonaktif sampai siap dipakai.</p>
        ) : null}
      </div>
    </Modal>
  )
}

/** `id` is `new` or a kelompok id; edit mode loads the record first. */
export function KelompokFormModal({ id, onClose }: { id: string; onClose: () => void }) {
  const detail = useQuery({ ...detailQuery(id), enabled: id !== 'new' })
  if (id === 'new') return <FormBody onClose={onClose} />
  if (detail.isPending)
    return (
      <Modal title="Ubah kelompok" onClose={onClose}>
        <LoadingBlock label="Memuat kelompok…" />
      </Modal>
    )
  if (detail.isError)
    return (
      <Modal title="Ubah kelompok" onClose={onClose}>
        <ErrorBlock message={detail.error.message} />
      </Modal>
    )
  return <FormBody record={detail.data.data} onClose={onClose} />
}

import { useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Field, Input } from '@/shared/ui/Field'
import { toast } from '@/shared/ui/Toast'
import { cn } from '@/shared/lib/cn'
import { KATEGORI, LAYANAN } from '../-data/seed'
import { formatPeriode, todayJakarta } from '../-logic/dates'
import { validate } from '../-logic/rules'
import type { Errors, FormValues } from '../-logic/rules'
import { detailQuery, jenjangQuery, useSaveInformasi, useUploadThumbnail, ApiError } from '../-queries'
import type { Informasi } from '../-queries'
import { ConfirmDelete, PinIcon, Select, Thumb } from './parts'

const emptyValues = (today: string): FormValues => ({
  nama: '',
  judul: '',
  thumbnail: '',
  kategori: '',
  url: '',
  layanan: [],
  jenjang_ids: [],
  tanggal_mulai: today,
  tanggal_selesai: '',
  pin_informasi: false,
  homepage_order: '',
  status: 'Aktif',
})

const fromRecord = (r: Informasi): FormValues => ({
  nama: r.nama,
  judul: r.judul,
  thumbnail: r.thumbnail,
  kategori: r.kategori,
  url: r.url,
  layanan: r.layanan,
  jenjang_ids: r.jenjang.map((j) => j.id),
  tanggal_mulai: r.tanggal_mulai,
  tanggal_selesai: r.tanggal_selesai,
  pin_informasi: r.pin_informasi,
  homepage_order: r.homepage_order === undefined ? '' : String(r.homepage_order),
  status: r.status,
})

export type FormCtrl = {
  id: string
  isNew: boolean
  record?: Informasi
  values: FormValues
  set: <K extends keyof FormValues>(k: K, v: FormValues[K]) => void
  errors: Errors
  expired: boolean
  saving: boolean
  submit: () => void
  upload: (f: File) => void
  uploading: boolean
}

/** Loads the record (edit mode), then hands a ready controller to `children`. */
export function FormHost({
  id,
  onClose,
  children,
}: {
  id: string
  onClose: () => void
  children: (c: FormCtrl) => ReactNode
}) {
  const detail = useQuery({ ...detailQuery(id), enabled: id !== 'new' })
  if (id === 'new') return <FormState id={id} onClose={onClose} children={children} />
  if (detail.isPending)
    return <p className="animate-pulse p-6 text-body-sm text-text-subdued">Memuat informasi…</p>
  if (detail.isError)
    return (
      <div className="flex flex-col items-start gap-3 p-6">
        <p className="text-body-sm font-semibold text-text-critical">{detail.error.message}</p>
        <Button variant="secondary" onClick={onClose}>
          Tutup
        </Button>
      </div>
    )
  return <FormState id={id} record={detail.data.data} onClose={onClose} children={children} />
}

function FormState({
  id,
  record,
  onClose,
  children,
}: {
  id: string
  record?: Informasi
  onClose: () => void
  children: (c: FormCtrl) => ReactNode
}) {
  const today = todayJakarta()
  const [values, setValues] = useState(() => (record ? fromRecord(record) : emptyValues(today)))
  const [errors, setErrors] = useState<Errors>({})
  const save = useSaveInformasi(id)
  const up = useUploadThumbnail()
  const isNew = id === 'new'

  const set: FormCtrl['set'] = (k, v) => {
    setValues((s) => ({ ...s, [k]: v }))
    setErrors((e) => ({ ...e, [k]: undefined }))
  }

  const submit = () => {
    const found = validate(values, today)
    setErrors(found)
    if (Object.keys(found).length) return
    save.mutate(values, {
      onSuccess: () => {
        toast(isNew ? 'Informasi berhasil ditambahkan' : 'Perubahan disimpan')
        onClose()
      },
      onError: (e) => {
        if (e instanceof ApiError && e.errors) setErrors(e.errors)
        else if (e instanceof ApiError && e.field) setErrors({ [e.field]: e.message })
        else toast(e.message, 'critical')
      },
    })
  }

  const upload = (file: File) =>
    up.mutate(file, {
      onSuccess: (url) => set('thumbnail', url),
      onError: (e) => setErrors((x) => ({ ...x, thumbnail: e.message })),
    })

  return (
    <>
      {children({
        id,
        isNew,
        record,
        values,
        set,
        errors,
        expired: !isNew && !!record && record.tanggal_selesai < today && values.tanggal_selesai < today,
        saving: save.isPending,
        submit,
        upload,
        uploading: up.isPending,
      })}
    </>
  )
}

function Check({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (c: boolean) => void
}) {
  return (
    <label className="inline-flex items-center gap-2 text-body-sm">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  )
}

const toggle = (list: string[], v: string, on: boolean) =>
  on ? [...list, v] : list.filter((x) => x !== v)

/** The same fields in every variant; `cols` only changes the grid. */
export function FormFields({ c, cols = 1 }: { c: FormCtrl; cols?: 1 | 2 }) {
  const jenjang = useQuery(jenjangQuery)
  const file = useRef<HTMLInputElement>(null)
  const { values: v, errors: e, set } = c
  const full = cols === 2 ? 'col-span-2' : ''
  return (
    <div className={cn('grid gap-5', cols === 2 ? 'grid-cols-2' : 'grid-cols-1')}>
      <Field label="Nama (tidak muncul di web)" htmlFor="f-nama" error={e.nama} hint="Hanya untuk internal, tidak tampil di web">
        <Input id="f-nama" value={v.nama} invalid={!!e.nama} onChange={(x) => set('nama', x.target.value)} />
      </Field>
      <Field label="Judul" htmlFor="f-judul" error={e.judul}>
        <Input id="f-judul" value={v.judul} invalid={!!e.judul} onChange={(x) => set('judul', x.target.value)} />
      </Field>

      <div className={full}>
        <Field label="Thumbnail" error={e.thumbnail} hint="JPEG atau PNG, maksimal 2 MB">
          <div className="flex items-center gap-4">
            {v.thumbnail ? (
              <Thumb url={v.thumbnail} label={v.judul} className="w-40" />
            ) : (
              <div className="flex aspect-video w-40 items-center justify-center rounded-md border border-dashed border-border-subdued bg-surface-subdued text-helper text-text-subdued">
                Belum ada gambar
              </div>
            )}
            <input
              ref={file}
              type="file"
              accept="image/*"
              hidden
              onChange={(x) => {
                const f = x.target.files?.[0]
                if (f) c.upload(f)
                x.target.value = ''
              }}
            />
            <Button type="button" variant="secondary" disabled={c.uploading} onClick={() => file.current?.click()}>
              {c.uploading ? 'Mengunggah…' : v.thumbnail ? 'Ganti Thumbnail' : 'Unggah Thumbnail'}
            </Button>
          </div>
        </Field>
      </div>

      <Field label="Kategori" htmlFor="f-kategori" error={e.kategori}>
        <Select id="f-kategori" value={v.kategori} invalid={!!e.kategori} onChange={(x) => set('kategori', x.target.value)}>
          <option value="">Pilih kategori</option>
          {KATEGORI.map((k) => (
            <option key={k}>{k}</option>
          ))}
        </Select>
      </Field>
      <Field label="URL" htmlFor="f-url" error={e.url}>
        <Input id="f-url" value={v.url} placeholder="https://" invalid={!!e.url} onChange={(x) => set('url', x.target.value)} />
      </Field>

      <Field label="Layanan" error={e.layanan}>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {LAYANAN.map((l) => (
            <Check key={l} label={l} checked={v.layanan.includes(l)} onChange={(on) => set('layanan', toggle(v.layanan, l, on))} />
          ))}
        </div>
      </Field>
      <Field label="Jenjang" error={e.jenjang_ids}>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {jenjang.data?.data.map((j) => (
            <Check key={j.id} label={j.nama_singkat} checked={v.jenjang_ids.includes(j.id)} onChange={(on) => set('jenjang_ids', toggle(v.jenjang_ids, j.id, on))} />
          )) ?? <span className="text-helper text-text-subdued">Memuat…</span>}
        </div>
      </Field>

      <Field label="Tanggal Mulai" htmlFor="f-mulai" error={e.tanggal_mulai}>
        <Input id="f-mulai" type="date" value={v.tanggal_mulai} invalid={!!e.tanggal_mulai} onChange={(x) => set('tanggal_mulai', x.target.value)} />
      </Field>
      <Field label="Tanggal Selesai" htmlFor="f-selesai" error={e.tanggal_selesai}>
        <Input id="f-selesai" type="date" value={v.tanggal_selesai} invalid={!!e.tanggal_selesai} onChange={(x) => set('tanggal_selesai', x.target.value)} />
        {c.expired && !e.tanggal_selesai ? (
          <p role="alert" className="rounded-md bg-warning-subdued px-3 py-2 text-helper font-semibold text-text">
            Tanggal selesai sudah lewat. Ubah ke hari ini atau setelahnya untuk menyimpan.
          </p>
        ) : null}
      </Field>

      <Field label="Status" htmlFor="f-status" error={e.status}>
        <Select id="f-status" value={v.status} invalid={!!e.status} onChange={(x) => set('status', x.target.value)}>
          <option>Aktif</option>
          <option>Inaktif</option>
        </Select>
      </Field>
      <Field label="Urutan Beranda" htmlFor="f-order" error={e.homepage_order} hint="Kosongkan jika tidak tampil di beranda. Boleh sama dengan informasi lain.">
        <Input id="f-order" type="number" min={1} max={32767} value={v.homepage_order} invalid={!!e.homepage_order} onChange={(x) => set('homepage_order', x.target.value)} />
      </Field>

      <div className={full}>
        <Check label="Highlight (tampil paling atas di daftar publik)" checked={v.pin_informasi} onChange={(on) => set('pin_informasi', on)} />
      </div>
    </div>
  )
}

export function PreviewCard({ c }: { c: FormCtrl }) {
  const v = c.values
  return (
    <div className="overflow-hidden rounded-lg border border-border bg-surface">
      <Thumb url={v.thumbnail} label={v.judul} className="w-full rounded-none border-0" />
      <div className="flex flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          {v.kategori ? <Badge tone="informational">{v.kategori}</Badge> : null}
          {v.pin_informasi ? <PinIcon className="text-interactive" /> : null}
        </div>
        <p className="text-heading-sm font-semibold">{v.judul || 'Judul informasi'}</p>
        <p className="text-helper text-text-subdued">
          {v.tanggal_mulai && v.tanggal_selesai
            ? formatPeriode(v.tanggal_mulai, v.tanggal_selesai)
            : 'Periode tayang belum diisi'}
        </p>
      </div>
    </div>
  )
}

/** Simpan / Batal, plus Hapus when editing (still allowed on expired items). */
export function FormActions({ c, onClose }: { c: FormCtrl; onClose: () => void }) {
  const [del, setDel] = useState(false)
  return (
    <>
      <Button onClick={c.submit} disabled={c.saving || c.uploading}>
        {c.saving ? 'Menyimpan…' : 'Simpan'}
      </Button>
      <Button variant="secondary" onClick={onClose}>
        Batal
      </Button>
      {c.record ? (
        <>
          <Button variant="ghost" className="ml-auto text-text-critical" onClick={() => setDel(true)}>
            Hapus
          </Button>
          <ConfirmDelete item={del ? c.record : null} onClose={() => setDel(false)} onDeleted={onClose} />
        </>
      ) : null}
    </>
  )
}

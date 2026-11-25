import { useState } from 'react'
import type { ComponentProps } from 'react'
import { Button } from '@/shared/ui/Button'
import { Field, Input } from '@/shared/ui/Field'
import { toast } from '@/shared/ui/Toast'
import type { IndikatorRec } from '../-data/seed'
import { MSG, validateIndikator, validateNama } from '../-logic/guards'
import {
  ApiError,
  useAddIndikator,
  useAddKategori,
  useDeleteIndikator,
  useDeleteKategori,
  useDeleteKelompok,
  useEditIndikator,
  useRenameKategori,
  useSetStatus,
} from '../-queries'
import type { KelompokDetail } from '../-queries'
import { Banner, BANNER_TEXT, ConfirmDialog, KLink, Modal, StatusBadges, Textarea, useGo } from './parts'

/** Back link, title, badges, meta, and the kelompok-level actions. */
export function DetailHeader({ k, withStatus }: { k: KelompokDetail; withStatus: boolean }) {
  const go = useGo()
  const [confirm, setConfirm] = useState(false)
  const del = useDeleteKelompok()
  const [refused, setRefused] = useState<string>()
  const empty = k.jumlah_kategori === 0

  return (
    <div className="flex flex-col gap-4">
      <KLink className="w-fit text-body-sm font-semibold text-interactive hover:underline">
        ← Daftar kelompok
      </KLink>
      <div className="flex items-start justify-between gap-4 rounded-lg border border-border bg-surface p-6">
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-heading-lg font-semibold">{k.nama}</h2>
            <StatusBadges k={k} />
          </div>
          <p className="text-body-sm text-text-subdued">
            {k.jenis_kurasi} · {k.tipe_materi ?? 'Semua tipe materi'} ·{' '}
            {k.jenjang.map((j) => j.nama_singkat).join(', ') || 'Tanpa jenjang'}
          </p>
          <p className="text-helper text-text-subdued">
            {k.jumlah_kategori} kategori · {k.jumlah_indikator} indikator
          </p>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => go.patch({ form: k.id }, false)}>
              Ubah
            </Button>
            <Button
              variant="secondary"
              disabled={!empty}
              title={empty ? undefined : MSG.deleteKategoriFirst}
              onClick={() => (setRefused(undefined), setConfirm(true))}
            >
              Hapus
            </Button>
            {withStatus ? <StatusControl k={k} /> : null}
          </div>
          {!empty ? <p className="text-helper text-text-subdued">{MSG.deleteKategoriFirst}</p> : null}
        </div>
      </div>
      {k.status === 'active' ? <Banner>{BANNER_TEXT}</Banner> : null}
      {confirm ? (
        <ConfirmDialog
          title="Hapus kelompok"
          message={`Hapus "${k.nama}"? Tindakan ini tidak dapat dibatalkan.`}
          pending={del.isPending}
          error={refused}
          onClose={() => setConfirm(false)}
          onConfirm={() =>
            del.mutate(k.id, {
              onSuccess: () => go.list(),
              onError: (e) => setRefused(e.message),
            })
          }
        />
      ) : null}
    </div>
  )
}

/** Aktifkan / Nonaktifkan with the 409 reason kept visible under the button. */
export function StatusControl({ k, inline = false }: { k: KelompokDetail; inline?: boolean }) {
  const set = useSetStatus(k.id)
  const [reason, setReason] = useState<string>()
  const active = k.status === 'active'
  const button = (
    <Button
      variant={active ? 'secondary' : 'primary'}
      disabled={set.isPending}
      onClick={() => {
        setReason(undefined)
        set.mutate(active ? 'inactive' : 'active', {
          onSuccess: () => toast(active ? 'Kelompok dinonaktifkan.' : 'Kelompok diaktifkan.'),
          onError: (e) => setReason(e.message),
        })
      }}
    >
      {set.isPending ? 'Memproses…' : active ? 'Nonaktifkan' : 'Aktifkan'}
    </Button>
  )
  if (inline)
    return (
      <div className="flex items-center gap-3">
        {reason ? <span className="text-helper font-semibold text-text-critical">{reason}</span> : null}
        {button}
      </div>
    )
  return button
}

/** Add (no `kategori`) or rename. */
export function KategoriDialog({
  kelompokId,
  kategori,
  onClose,
}: {
  kelompokId: string
  kategori?: { id: string; nama: string }
  onClose: () => void
}) {
  const add = useAddKategori(kelompokId)
  const rename = useRenameKategori()
  const [nama, setNama] = useState(kategori?.nama ?? '')
  const [error, setError] = useState<string>()
  const pending = add.isPending || rename.isPending
  const submit = () => {
    const bad = validateNama(nama)
    if (bad) return setError(bad.message)
    const opts = { onSuccess: onClose, onError: (e: Error) => setError(e.message) }
    if (kategori) rename.mutate({ id: kategori.id, nama: nama.trim() }, opts)
    else add.mutate(nama.trim(), opts)
  }
  return (
    <Modal
      title={kategori ? 'Ubah kategori' : 'Tambah kategori'}
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
      <Field label="Nama kategori" htmlFor="kat-nama" error={error}>
        <Input
          id="kat-nama"
          autoFocus
          value={nama}
          invalid={!!error}
          onChange={(e) => (setNama(e.target.value), setError(undefined))}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
        />
      </Field>
    </Modal>
  )
}

type IndValues = { nama_indikator: string; negasi_indikator: string }

/** Two text areas. Shared by the dialog (halaman, tabel) and the inline editor (panel). */
export function IndikatorForm({
  initial,
  submitLabel = 'Simpan',
  pending,
  serverError,
  onSubmit,
  onCancel,
}: {
  initial?: Pick<IndikatorRec, 'nama_indikator' | 'negasi_indikator'>
  submitLabel?: string
  pending: boolean
  serverError?: ApiError | Error | null
  onSubmit: (v: IndValues) => void
  onCancel: () => void
}) {
  const [v, setV] = useState<IndValues>({
    nama_indikator: initial?.nama_indikator ?? '',
    negasi_indikator: initial?.negasi_indikator ?? '',
  })
  const [error, setError] = useState<{ field?: string; message: string }>()
  const shown = error ?? (serverError ? { field: (serverError as ApiError).field, message: serverError.message } : undefined)
  const set = (k: keyof IndValues, val: string) => (setV((s) => ({ ...s, [k]: val })), setError(undefined))
  const submit = () => {
    const bad = validateIndikator(v)
    if (bad) return setError({ field: bad.field, message: bad.message })
    onSubmit({ nama_indikator: v.nama_indikator.trim(), negasi_indikator: v.negasi_indikator.trim() })
  }
  const err = (f: keyof IndValues) => (shown?.field === f ? shown.message : undefined)
  return (
    <div className="flex flex-col gap-4">
      <Field label="Indikator" htmlFor="ind-nama" error={err('nama_indikator')}>
        <Textarea
          id="ind-nama"
          value={v.nama_indikator}
          invalid={!!err('nama_indikator')}
          onChange={(e) => set('nama_indikator', e.target.value)}
        />
      </Field>
      <Field label="Negasi" htmlFor="ind-negasi" error={err('negasi_indikator')} hint="Kalimat yang dipakai bila indikator tidak terpenuhi.">
        <Textarea
          id="ind-negasi"
          value={v.negasi_indikator}
          invalid={!!err('negasi_indikator')}
          onChange={(e) => set('negasi_indikator', e.target.value)}
        />
      </Field>
      <div className="flex gap-2">
        <Button disabled={pending} onClick={submit}>
          {pending ? 'Menyimpan…' : submitLabel}
        </Button>
        <Button variant="secondary" onClick={onCancel}>
          Batal
        </Button>
      </div>
    </div>
  )
}

/** Add (give `kategoriId`) or edit (give `indikator`) in a dialog. */
export function IndikatorDialog({
  kategoriId,
  indikator,
  onClose,
}: {
  kategoriId: string
  indikator?: IndikatorRec
  onClose: () => void
}) {
  const add = useAddIndikator()
  const edit = useEditIndikator()
  const m = indikator ? edit : add
  return (
    <Modal title={indikator ? 'Ubah indikator' : 'Tambah indikator'} onClose={onClose} className="max-w-xl">
      <IndikatorForm
        initial={indikator}
        pending={m.isPending}
        serverError={m.error}
        onCancel={onClose}
        onSubmit={(v) =>
          indikator
            ? edit.mutate({ ...v, id: indikator.id }, { onSuccess: onClose })
            : add.mutate({ ...v, kategoriId }, { onSuccess: onClose })
        }
      />
    </Modal>
  )
}

export function ConfirmKategori({
  kategori,
  jumlah,
  onClose,
}: {
  kategori: { id: string; nama: string }
  jumlah: number
  onClose: () => void
}) {
  const del = useDeleteKategori()
  const [error, setError] = useState<string>()
  return (
    <ConfirmDialog
      title="Hapus kategori"
      message={`Hapus kategori "${kategori.nama}"? ${jumlah} indikator akan ikut terhapus.`}
      pending={del.isPending}
      error={error}
      onClose={onClose}
      onConfirm={() => del.mutate(kategori.id, { onSuccess: onClose, onError: (e) => setError(e.message) })}
    />
  )
}

export function ConfirmIndikator({ id, onClose }: { id: string; onClose: () => void }) {
  const del = useDeleteIndikator()
  const [error, setError] = useState<string>()
  return (
    <ConfirmDialog
      title="Hapus indikator"
      message="Hapus indikator ini? Tindakan ini tidak dapat dibatalkan."
      pending={del.isPending}
      error={error}
      onClose={onClose}
      onConfirm={() => del.mutate(id, { onSuccess: onClose, onError: (e) => setError(e.message) })}
    />
  )
}

/** Small text-button used in row/header actions. */
export function LinkButton({
  danger,
  ...props
}: ComponentProps<'button'> & { danger?: boolean }) {
  return (
    <button
      {...props}
      className={`text-body-sm font-semibold hover:underline ${danger ? 'text-text-critical' : 'text-interactive'}`}
    />
  )
}

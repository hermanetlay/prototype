import { useState } from 'react'
import type { ReactNode } from 'react'
import { useQueries } from '@tanstack/react-query'
import { Button } from '@/shared/ui/Button'
import { Card, CardBody } from '@/shared/ui/Card'
import { Field, Input } from '@/shared/ui/Field'
import { cn } from '@/shared/lib/cn'
import { validateNama } from '../-logic/guards'
import type { Search } from '../-logic/search'
import {
  kategoriQuery,
  useAddIndikator,
  useAddKategori,
  useDeleteIndikator,
  useDeleteKategori,
  useEditIndikator,
  useRenameKategori,
} from '../-queries'
import type { KategoriFull, KelompokDetail } from '../-queries'
import { InlineConfirm, useCurrentSearch, useGo } from './parts'
import { DetailHeader, IndikatorForm, StatusControl } from './shared'

/** Variant "panel": tree on the left, inline editor on the right, no dialogs. */
export function DetailPanel({ k }: { k: KelompokDetail }) {
  const go = useGo()
  const sel = useCurrentSearch().sel
  const results = useQueries({ queries: k.kategori.map((c) => kategoriQuery(c.id)) })
  const loaded = results.map((r) => r.data?.data).filter((c): c is KategoriFull => !!c)
  const loading = results.some((r) => r.isPending)
  const select = (s?: string) => go.patch({ sel: s })

  const [type, id] = (sel ?? '').split(/:(.*)/s)
  const kat =
    type === 'k' || type === 'new-i' ? loaded.find((c) => c.id === id) : undefined
  const owner = type === 'i' ? loaded.find((c) => c.indikator.some((i) => i.id === id)) : undefined
  const ind = owner?.indikator.find((i) => i.id === id)

  let editor
  if (sel === 'new-k') editor = <NewKategori key={sel} kelompokId={k.id} onDone={select} />
  else if (type === 'k' && kat) editor = <KategoriEditor key={sel} kat={kat} onDone={select} />
  else if (type === 'new-i' && kat) editor = <NewIndikator key={sel} kat={kat} onDone={select} />
  else if (type === 'i' && owner && ind) editor = <IndikatorEditor key={sel} kat={owner} ind={ind} onDone={select} />
  else
    editor = (
      <p className="py-16 text-center text-body-sm text-text-subdued">
        {sel && loading ? 'Memuat…' : 'Pilih kategori atau indikator di kiri untuk mengubahnya.'}
      </p>
    )

  return (
    <div className="flex flex-col gap-4">
      <DetailHeader k={k} withStatus={false} />
      <div className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] items-start gap-4">
        <Card>
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-body-sm font-semibold">Struktur</h3>
            <StatusControl k={k} inline />
          </div>
          <CardBody className="flex flex-col gap-1 p-3">
            {k.kategori.length === 0 ? (
              <p className="px-2 py-6 text-center text-body-sm text-text-subdued">Belum ada kategori.</p>
            ) : (
              k.kategori.map((c, n) => {
                const data = results[n]?.data?.data
                return (
                  <div key={c.id} className="flex flex-col">
                    <NodeButton active={sel === `k:${c.id}`} onClick={() => select(`k:${c.id}`)} strong>
                      {c.nama}
                      <span className="ml-auto text-helper font-normal text-text-subdued">{c.jumlah_indikator}</span>
                    </NodeButton>
                    <div className="ml-4 flex flex-col border-l border-border pl-2">
                      {results[n]?.isPending ? (
                        <p className="px-2 py-1 text-helper text-text-subdued">Memuat…</p>
                      ) : results[n]?.isError ? (
                        <p className="px-2 py-1 text-helper text-text-critical">Gagal memuat indikator.</p>
                      ) : data && data.indikator.length === 0 ? (
                        <p className="px-2 py-1 text-helper text-text-subdued">Belum ada indikator</p>
                      ) : (
                        data?.indikator.map((i, m) => (
                          <NodeButton key={i.id} active={sel === `i:${i.id}`} onClick={() => select(`i:${i.id}`)}>
                            <span className="text-text-subdued">{m + 1}.</span>
                            <span className="line-clamp-2">{i.nama_indikator}</span>
                          </NodeButton>
                        ))
                      )}
                      <button
                        className="px-2 py-1 text-left text-helper font-semibold text-interactive hover:underline"
                        onClick={() => select(`new-i:${c.id}`)}
                      >
                        + Tambah indikator
                      </button>
                    </div>
                  </div>
                )
              })
            )}
            <button
              className="mt-2 rounded-md border border-dashed border-border-subdued px-2 py-2 text-left text-body-sm font-semibold text-interactive hover:bg-surface-hovered"
              onClick={() => select('new-k')}
            >
              + Tambah kategori
            </button>
          </CardBody>
        </Card>
        <Card>
          <CardBody>{editor}</CardBody>
        </Card>
      </div>
    </div>
  )
}

function NodeButton({
  active,
  strong,
  onClick,
  children,
}: {
  active: boolean
  strong?: boolean
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-start gap-2 rounded-md px-2 py-1.5 text-left text-body-sm hover:bg-surface-hovered',
        strong && 'font-semibold',
        active && 'bg-surface-selected text-interactive',
      )}
    >
      {children}
    </button>
  )
}

type Done = (sel?: Search['sel']) => void

function NamaForm({
  title,
  initial,
  pending,
  onSubmit,
  onCancel,
  extra,
  confirm,
}: {
  title: string
  initial: string
  pending: boolean
  onSubmit: (nama: string, fail: (m: string) => void) => void
  onCancel?: () => void
  extra?: ReactNode
  confirm?: ReactNode
}) {
  const [nama, setNama] = useState(initial)
  const [error, setError] = useState<string>()
  const submit = () => {
    const bad = validateNama(nama)
    if (bad) return setError(bad.message)
    onSubmit(nama.trim(), setError)
  }
  return (
    <div className="flex flex-col gap-4">
      <h3 className="text-heading-sm font-semibold">{title}</h3>
      <Field label="Nama kategori" htmlFor="p-kat" error={error}>
        <Input id="p-kat" value={nama} invalid={!!error} onChange={(e) => (setNama(e.target.value), setError(undefined))} />
      </Field>
      <div className="flex flex-wrap gap-2">
        <Button disabled={pending} onClick={submit}>
          {pending ? 'Menyimpan…' : 'Simpan'}
        </Button>
        {onCancel ? (
          <Button variant="secondary" onClick={onCancel}>
            Batal
          </Button>
        ) : null}
        {extra}
      </div>
      {confirm}
    </div>
  )
}

function NewKategori({ kelompokId, onDone }: { kelompokId: string; onDone: Done }) {
  const add = useAddKategori(kelompokId)
  return (
    <NamaForm
      title="Tambah kategori"
      initial=""
      pending={add.isPending}
      onCancel={() => onDone()}
      onSubmit={(nama, fail) =>
        add.mutate(nama, { onSuccess: (r) => onDone(`k:${r.data.id}`), onError: (e) => fail(e.message) })
      }
    />
  )
}

function KategoriEditor({ kat, onDone }: { kat: KategoriFull; onDone: Done }) {
  const rename = useRenameKategori()
  const del = useDeleteKategori()
  const [asking, setAsking] = useState(false)
  const [refused, setRefused] = useState<string>()
  return (
    <NamaForm
      title="Ubah kategori"
      initial={kat.nama}
      pending={rename.isPending}
      onSubmit={(nama, fail) => rename.mutate({ id: kat.id, nama }, { onError: (e) => fail(e.message) })}
      extra={
        <>
          <Button variant="secondary" onClick={() => onDone(`new-i:${kat.id}`)}>
            Tambah indikator
          </Button>
          <Button variant="ghost" onClick={() => (setRefused(undefined), setAsking(true))}>
            Hapus
          </Button>
        </>
      }
      confirm={
        asking ? (
          <InlineConfirm
            message={`Hapus kategori "${kat.nama}"? ${kat.indikator.length} indikator akan ikut terhapus.`}
            pending={del.isPending}
            error={refused}
            onCancel={() => setAsking(false)}
            onConfirm={() => del.mutate(kat.id, { onSuccess: () => onDone(), onError: (e) => setRefused(e.message) })}
          />
        ) : null
      }
    />
  )
}

function NewIndikator({ kat, onDone }: { kat: KategoriFull; onDone: Done }) {
  const add = useAddIndikator()
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-heading-sm font-semibold">Tambah indikator</h3>
        <p className="mt-1 text-helper text-text-subdued">Kategori: {kat.nama}</p>
      </div>
      <IndikatorForm
        pending={add.isPending}
        serverError={add.error}
        onCancel={() => onDone()}
        onSubmit={(v) => add.mutate({ ...v, kategoriId: kat.id }, { onSuccess: (r) => onDone(`i:${r.data.id}`) })}
      />
    </div>
  )
}

function IndikatorEditor({
  kat,
  ind,
  onDone,
}: {
  kat: KategoriFull
  ind: KategoriFull['indikator'][number]
  onDone: Done
}) {
  const edit = useEditIndikator()
  const del = useDeleteIndikator()
  const [asking, setAsking] = useState(false)
  const [refused, setRefused] = useState<string>()
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h3 className="text-heading-sm font-semibold">Ubah indikator</h3>
        <p className="mt-1 text-helper text-text-subdued">Kategori: {kat.nama}</p>
      </div>
      <IndikatorForm
        initial={ind}
        pending={edit.isPending}
        serverError={edit.error}
        onCancel={() => onDone(`k:${kat.id}`)}
        onSubmit={(v) => edit.mutate({ ...v, id: ind.id })}
      />
      <div>
        <Button variant="ghost" onClick={() => (setRefused(undefined), setAsking(true))}>
          Hapus indikator
        </Button>
      </div>
      {asking ? (
        <InlineConfirm
          message="Hapus indikator ini?"
          pending={del.isPending}
          error={refused}
          onCancel={() => setAsking(false)}
          onConfirm={() => del.mutate(ind.id, { onSuccess: () => onDone(`k:${kat.id}`), onError: (e) => setRefused(e.message) })}
        />
      ) : null}
    </div>
  )
}

import { useState } from 'react'
import { useQueries } from '@tanstack/react-query'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { Card } from '@/shared/ui/Card'
import { Table, Td, Th } from '@/shared/ui/Table'
import type { IndikatorRec } from '../-data/seed'
import { kategoriQuery } from '../-queries'
import type { KategoriRef, KelompokDetail } from '../-queries'
import { ErrorBlock } from './parts'
import {
  ConfirmIndikator,
  ConfirmKategori,
  DetailHeader,
  IndikatorDialog,
  KategoriDialog,
  LinkButton,
  StatusControl,
} from './shared'

type Dialog =
  | { t: 'add-kat' }
  | { t: 'edit-kat'; kat: KategoriRef }
  | { t: 'del-kat'; kat: KategoriRef }
  | { t: 'add-ind'; kategoriId: string }
  | { t: 'edit-ind'; kategoriId: string; ind: IndikatorRec }
  | { t: 'del-ind'; id: string }

/** Variant "tabel": one flat table, kategori as header rows, sticky status bar. */
export function DetailTabel({ k }: { k: KelompokDetail }) {
  const [dlg, setDlg] = useState<Dialog | null>(null)
  const close = () => setDlg(null)
  const results = useQueries({ queries: k.kategori.map((c) => kategoriQuery(c.id)) })

  return (
    <div className="flex flex-col gap-4">
      <DetailHeader k={k} withStatus={false} />

      <div className="sticky top-header z-30 -mx-6 border-b border-border bg-surface px-6 py-3 shadow-[0_1px_2px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-body-sm">
            <Badge tone={k.siap_dipakai ? 'success' : 'warning'}>{k.siap_dipakai ? 'Siap dipakai' : 'Belum siap'}</Badge>
            <span className="text-text-subdued">
              {k.jumlah_kategori} kategori · {k.jumlah_indikator} indikator
            </span>
            <Badge tone={k.status === 'active' ? 'success' : 'neutral'}>
              {k.status === 'active' ? 'Aktif' : 'Nonaktif'}
            </Badge>
          </div>
          <StatusControl k={k} inline />
        </div>
      </div>

      <Card>
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-body-sm font-semibold">Semua indikator</h3>
          <Button size="sm" onClick={() => setDlg({ t: 'add-kat' })}>
            Tambah kategori
          </Button>
        </div>
        <Table>
          <thead>
            <tr>
              <Th className="w-12">No</Th>
              <Th>Indikator</Th>
              <Th>Negasi</Th>
              <Th className="w-40">Aksi</Th>
            </tr>
          </thead>
          <tbody>
            {k.kategori.length === 0 ? (
              <tr>
                <Td colSpan={4} className="py-10 text-center">
                  <p className="text-body-sm font-semibold">Belum ada kategori.</p>
                  <p className="mt-1 text-helper text-text-subdued">Tambah kategori untuk mulai menyusun indikator.</p>
                </Td>
              </tr>
            ) : (
              k.kategori.map((kat, n) => {
                const r = results[n]
                const inds = r?.data?.data.indikator
                return (
                  <KategoriGroup
                    key={kat.id}
                    kat={kat}
                    inds={inds}
                    error={r?.isError ? r.error.message : undefined}
                    onRetry={() => r?.refetch()}
                    onEdit={() => setDlg({ t: 'edit-kat', kat })}
                    onDelete={() => setDlg({ t: 'del-kat', kat })}
                    onAddInd={() => setDlg({ t: 'add-ind', kategoriId: kat.id })}
                    onEditInd={(ind) => setDlg({ t: 'edit-ind', kategoriId: kat.id, ind })}
                    onDeleteInd={(id) => setDlg({ t: 'del-ind', id })}
                  />
                )
              })
            )}
          </tbody>
        </Table>
      </Card>

      {dlg?.t === 'add-kat' ? <KategoriDialog kelompokId={k.id} onClose={close} /> : null}
      {dlg?.t === 'edit-kat' ? <KategoriDialog kelompokId={k.id} kategori={dlg.kat} onClose={close} /> : null}
      {dlg?.t === 'del-kat' ? (
        <ConfirmKategori kategori={dlg.kat} jumlah={dlg.kat.jumlah_indikator} onClose={close} />
      ) : null}
      {dlg?.t === 'add-ind' ? <IndikatorDialog kategoriId={dlg.kategoriId} onClose={close} /> : null}
      {dlg?.t === 'edit-ind' ? (
        <IndikatorDialog kategoriId={dlg.kategoriId} indikator={dlg.ind} onClose={close} />
      ) : null}
      {dlg?.t === 'del-ind' ? <ConfirmIndikator id={dlg.id} onClose={close} /> : null}
    </div>
  )
}

function KategoriGroup({
  kat,
  inds,
  error,
  onRetry,
  onEdit,
  onDelete,
  onAddInd,
  onEditInd,
  onDeleteInd,
}: {
  kat: KategoriRef
  inds?: IndikatorRec[]
  error?: string
  onRetry: () => void
  onEdit: () => void
  onDelete: () => void
  onAddInd: () => void
  onEditInd: (i: IndikatorRec) => void
  onDeleteInd: (id: string) => void
}) {
  return (
    <>
      <tr className="bg-gray-5">
        <Td colSpan={2} className="font-semibold">
          {kat.nama}
          <span className="ml-2 text-helper font-normal text-text-subdued">{kat.jumlah_indikator} indikator</span>
        </Td>
        <Td colSpan={2}>
          <div className="flex items-center gap-4 whitespace-nowrap">
            <LinkButton onClick={onAddInd}>Tambah indikator</LinkButton>
            <LinkButton onClick={onEdit}>Ubah</LinkButton>
            <LinkButton danger onClick={onDelete}>
              Hapus
            </LinkButton>
          </div>
        </Td>
      </tr>
      {error ? (
        <tr>
          <Td colSpan={4}>
            <ErrorBlock message={error} onRetry={onRetry} />
          </Td>
        </tr>
      ) : !inds ? (
        <tr className="animate-pulse">
          <Td colSpan={4} className="text-text-subdued">
            Memuat indikator…
          </Td>
        </tr>
      ) : inds.length === 0 ? (
        <tr>
          <Td colSpan={4} className="text-text-subdued">
            Belum ada indikator
          </Td>
        </tr>
      ) : (
        inds.map((i, n) => (
          <tr key={i.id} className="align-top hover:bg-surface-hovered">
            <Td className="text-text-subdued">{n + 1}</Td>
            <Td>{i.nama_indikator}</Td>
            <Td className="text-text-subdued">{i.negasi_indikator}</Td>
            <Td>
              <div className="flex items-center gap-4">
                <LinkButton onClick={() => onEditInd(i)}>Ubah</LinkButton>
                <LinkButton danger onClick={() => onDeleteInd(i.id)}>
                  Hapus
                </LinkButton>
              </div>
            </Td>
          </tr>
        ))
      )}
    </>
  )
}

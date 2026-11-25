import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/shared/ui/Button'
import { Card, CardBody, CardHeader } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { cn } from '@/shared/lib/cn'
import type { IndikatorRec } from '../-data/seed'
import { kategoriQuery } from '../-queries'
import type { KategoriRef, KelompokDetail } from '../-queries'
import { ErrorBlock, LoadingBlock } from './parts'
import {
  ConfirmIndikator,
  ConfirmKategori,
  DetailHeader,
  IndikatorDialog,
  KategoriDialog,
  LinkButton,
} from './shared'

type Dialog =
  | { t: 'add-kat' }
  | { t: 'edit-kat'; kat: KategoriRef }
  | { t: 'del-kat'; kat: KategoriRef }
  | { t: 'add-ind'; kategoriId: string }
  | { t: 'edit-ind'; kategoriId: string; ind: IndikatorRec }
  | { t: 'del-ind'; id: string }

/** Variant "halaman": the RFC layout. Accordion of kategori, dialogs for indikator. */
export function DetailHalaman({ k }: { k: KelompokDetail }) {
  const [open, setOpen] = useState<Set<string>>(new Set())
  const [dlg, setDlg] = useState<Dialog | null>(null)
  const close = () => setDlg(null)
  const toggle = (id: string) =>
    setOpen((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  return (
    <div className="flex flex-col gap-4">
      <DetailHeader k={k} withStatus />
      <Card>
        <CardHeader
          title="Kategori dan indikator"
          subtitle="Buka kategori untuk melihat indikatornya."
          actions={<Button onClick={() => setDlg({ t: 'add-kat' })}>Tambah kategori</Button>}
        />
        <CardBody className="flex flex-col gap-3">
          {k.kategori.length === 0 ? (
            <div className="rounded-md border border-dashed border-border-subdued py-10 text-center">
              <p className="text-body-sm font-semibold">Belum ada kategori.</p>
              <p className="mt-1 text-helper text-text-subdued">Tambah kategori untuk mulai menyusun indikator.</p>
            </div>
          ) : (
            k.kategori.map((kat) => (
              <KategoriRow
                key={kat.id}
                kat={kat}
                open={open.has(kat.id)}
                onToggle={() => toggle(kat.id)}
                onEdit={() => setDlg({ t: 'edit-kat', kat })}
                onDelete={() => setDlg({ t: 'del-kat', kat })}
                onAddInd={() => setDlg({ t: 'add-ind', kategoriId: kat.id })}
                onEditInd={(ind) => setDlg({ t: 'edit-ind', kategoriId: kat.id, ind })}
                onDeleteInd={(id) => setDlg({ t: 'del-ind', id })}
              />
            ))
          )}
        </CardBody>
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

function KategoriRow({
  kat,
  open,
  onToggle,
  onEdit,
  onDelete,
  onAddInd,
  onEditInd,
  onDeleteInd,
}: {
  kat: KategoriRef
  open: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onAddInd: () => void
  onEditInd: (i: IndikatorRec) => void
  onDeleteInd: (id: string) => void
}) {
  // Lazy: the indikator are fetched only once the row is opened.
  const q = useQuery({ ...kategoriQuery(kat.id), enabled: open })
  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <button
          aria-expanded={open}
          onClick={onToggle}
          className="flex flex-1 items-center gap-3 text-left text-body-sm font-semibold"
        >
          <span className={cn('inline-block text-text-subdued transition-transform', open && 'rotate-90')}>▶</span>
          {kat.nama}
          <Badge tone={kat.jumlah_indikator === 0 ? 'warning' : 'neutral'}>
            {kat.jumlah_indikator === 0 ? 'Belum ada indikator' : `${kat.jumlah_indikator} indikator`}
          </Badge>
        </button>
        <div className="flex items-center gap-4">
          <LinkButton onClick={onEdit}>Ubah</LinkButton>
          <LinkButton danger onClick={onDelete}>
            Hapus
          </LinkButton>
        </div>
      </div>
      {open ? (
        <div className="border-t border-border bg-surface-subdued p-4">
          {q.isPending ? (
            <LoadingBlock label="Memuat indikator…" />
          ) : q.isError ? (
            <ErrorBlock message={q.error.message} onRetry={() => q.refetch()} />
          ) : (
            <div className="flex flex-col gap-3">
              {q.data.data.indikator.length === 0 ? (
                <p className="text-body-sm text-text-subdued">Belum ada indikator</p>
              ) : (
                q.data.data.indikator.map((i, n) => (
                  <div key={i.id} className="flex items-start justify-between gap-4 rounded-md border border-border bg-surface p-4">
                    <div className="flex flex-col gap-1">
                      <p className="text-body-sm">
                        <span className="mr-2 font-semibold text-text-subdued">{n + 1}.</span>
                        {i.nama_indikator}
                      </p>
                      <p className="text-helper text-text-subdued">Negasi: {i.negasi_indikator}</p>
                    </div>
                    <div className="flex shrink-0 items-center gap-4">
                      <LinkButton onClick={() => onEditInd(i)}>Ubah</LinkButton>
                      <LinkButton danger onClick={() => onDeleteInd(i.id)}>
                        Hapus
                      </LinkButton>
                    </div>
                  </div>
                ))
              )}
              <div>
                <Button variant="secondary" size="sm" onClick={onAddInd}>
                  Tambah indikator
                </Button>
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}

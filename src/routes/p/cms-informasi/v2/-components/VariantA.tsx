import { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Card, CardBody, CardHeader } from '@/shared/ui/Card'
import { hasFilters } from '../-logic/search'
import type { VariantProps } from '../-logic/search'
import type { Informasi } from '../-queries'
import { Filters } from './Filters'
import { FormActions, FormFields, FormHost } from './form'
import { InformasiTable } from './InformasiTable'
import { ConfirmDelete, ListBoundary, Pager } from './parts'
import { PAGE_SIZE, useInformasiList } from './useListParams'

/** A: table; "Tambah" / "Ubah" swap the whole page for a form (`?form=`). */
export function VariantA({ search, setSearch }: VariantProps) {
  if (search.form) return <FormPage id={search.form} setSearch={setSearch} />
  return <ListPage search={search} setSearch={setSearch} />
}

function FormPage({ id, setSearch }: { id: string; setSearch: VariantProps['setSearch'] }) {
  const close = () => setSearch({ form: undefined })
  return (
    <FormHost id={id} onClose={close}>
      {(c) => (
        <Card>
          <CardHeader
            title={c.isNew ? 'Tambah Informasi' : 'Ubah Informasi'}
            subtitle={c.record?.judul}
            actions={
              <Button variant="ghost" onClick={close}>
                ← Kembali ke daftar
              </Button>
            }
          />
          <CardBody>
            <div className="max-w-3xl">
              <FormFields c={c} cols={2} />
            </div>
          </CardBody>
          <div className="flex items-center gap-2 border-t border-border px-6 py-4">
            <FormActions c={c} onClose={close} />
          </div>
        </Card>
      )}
    </FormHost>
  )
}

function ListPage({ search, setSearch }: VariantProps) {
  const query = useInformasiList(search, { paged: true })
  const [del, setDel] = useState<Informasi | null>(null)
  const page = search.page ?? 1
  const add = (
    <Button onClick={() => setSearch({ form: 'new' })}>Tambah Informasi</Button>
  )
  return (
    <Card>
      <CardHeader title="Daftar Informasi" subtitle="Banner dan pengumuman di situs Ruang Murid." actions={add} />
      <div className="border-b border-border p-4">
        <Filters search={search} setSearch={setSearch} />
      </div>
      <ListBoundary
        query={query}
        filtered={hasFilters(search)}
        onReset={() => setSearch({ q: undefined, kategori: undefined, layanan: undefined, jenjang_id: undefined, status_tayang: undefined, homepage: undefined, page: undefined })}
        emptyAction={add}
      >
        {(r) => (
          <>
            <InformasiTable items={r.data} onEdit={(i) => setSearch({ form: i.id })} onDelete={setDel} />
            <Pager total={r.total} page={page} size={PAGE_SIZE} onPage={(p) => setSearch({ page: p })} />
          </>
        )}
      </ListBoundary>
      <ConfirmDelete item={del} onClose={() => setDel(null)} />
    </Card>
  )
}

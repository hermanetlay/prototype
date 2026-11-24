import { useState } from 'react'
import { Button } from '@/shared/ui/Button'
import { Card, CardHeader } from '@/shared/ui/Card'
import { hasFilters } from '../-logic/search'
import type { VariantProps } from '../-logic/search'
import type { Informasi } from '../-queries'
import { Filters } from './Filters'
import { FormActions, FormFields, FormHost, PreviewCard } from './form'
import type { FormCtrl } from './form'
import { InformasiTable } from './InformasiTable'
import { ConfirmDelete, Drawer, ListBoundary, Pager } from './parts'
import { PAGE_SIZE, useInformasiList } from './useListParams'

/** B: the table never leaves; the form slides in from the right with a live preview. */
export function VariantB({ search, setSearch }: VariantProps) {
  const query = useInformasiList(search, { paged: true })
  const [del, setDel] = useState<Informasi | null>(null)
  const page = search.page ?? 1
  const close = () => setSearch({ form: undefined })
  const add = <Button onClick={() => setSearch({ form: 'new' })}>Tambah Informasi</Button>
  return (
    <>
      <Card>
        <CardHeader title="Daftar Informasi" subtitle="Klik judul untuk mengubah." actions={add} />
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

      {search.form ? (
        <FormHost key={search.form} id={search.form} onClose={close}>
          {(c) => <DrawerForm c={c} onClose={close} />}
        </FormHost>
      ) : null}
    </>
  )
}

function DrawerForm({ c, onClose }: { c: FormCtrl; onClose: () => void }) {
  return (
    <Drawer
      title={c.isNew ? 'Tambah Informasi' : 'Ubah Informasi'}
      onClose={onClose}
      footer={<FormActions c={c} onClose={onClose} />}
    >
      <div className="flex flex-col gap-6">
        <div>
          <p className="mb-2 text-helper font-semibold text-text-subdued">Pratinjau</p>
          <div className="max-w-sm">
            <PreviewCard c={c} />
          </div>
        </div>
        <FormFields c={c} />
      </div>
    </Drawer>
  )
}

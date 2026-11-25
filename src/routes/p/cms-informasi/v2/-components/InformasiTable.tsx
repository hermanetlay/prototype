import { Table, Td, Th } from '@/shared/ui/Table'
import { formatDateTime, formatPeriode } from '../-logic/dates'
import type { Informasi } from '../-queries'
import { PinIcon, RowMenu, StatusBadge, Thumb } from './parts'

export function InformasiTable({
  items,
  onEdit,
  onDelete,
}: {
  items: Informasi[]
  onEdit: (i: Informasi) => void
  onDelete: (i: Informasi) => void
}) {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Thumbnail</Th>
          <Th>Judul</Th>
          <Th>Kategori</Th>
          <Th>Layanan</Th>
          <Th>Jenjang</Th>
          <Th>Periode Tayang</Th>
          <Th>Status Tayang</Th>
          <Th>Beranda</Th>
          <Th>Diubah</Th>
          <Th className="text-right">Aksi</Th>
        </tr>
      </thead>
      <tbody>
        {items.map((i) => (
          <tr key={i.id} className="hover:bg-surface-hovered">
            <Td>
              <Thumb url={i.thumbnail} label={i.judul} className="w-24" />
            </Td>
            <Td className="max-w-64">
              <button className="flex items-center gap-1 text-left font-semibold hover:text-interactive" onClick={() => onEdit(i)}>
                {i.judul}
                {i.pin_informasi ? <PinIcon className="shrink-0 text-interactive" /> : null}
              </button>
              <div className="text-helper text-text-subdued">{i.nama}</div>
            </Td>
            <Td>{i.kategori}</Td>
            <Td>{i.layanan.join(', ')}</Td>
            <Td>{i.jenjang.map((j) => j.nama_singkat).join(', ')}</Td>
            <Td className="whitespace-nowrap">{formatPeriode(i.tanggal_mulai, i.tanggal_selesai)}</Td>
            <Td>
              <StatusBadge s={i.status_tayang} />
            </Td>
            <Td>{i.homepage_order ?? '—'}</Td>
            <Td>
              <div>{i.updated_by?.nama ?? 'Data lama (dari Sheet)'}</div>
              <div className="text-helper text-text-subdued">{formatDateTime(i.updated_at)}</div>
            </Td>
            <Td className="text-right">
              <RowMenu onEdit={() => onEdit(i)} onDelete={() => onDelete(i)} />
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

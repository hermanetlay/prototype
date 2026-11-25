import type { Materi } from '../-data/seed'
import { lockReason } from '../-logic/labels'
import { Table, Td, Th } from '@/shared/ui/Table'
import { useNames } from './names'
import { StatusBadge } from './StatusBadge'
import { useQuery } from '@tanstack/react-query'
import { programNamesQuery } from '../-queries'

export function MateriTable({
  rows,
  selected,
  onToggle,
  onToggleAll,
}: {
  rows: Materi[]
  selected: Map<string, Materi>
  onToggle: (m: Materi) => void
  onToggleAll: (rows: Materi[], on: boolean) => void
}) {
  const names = useNames()
  const programs = useQuery(programNamesQuery)
  const selectable = rows.filter((m) => !lockReason(m))
  const allOn = selectable.length > 0 && selectable.every((m) => selected.has(m.id))
  return (
    <Table>
      <thead>
        <tr>
          <Th className="w-10">
            <input
              type="checkbox"
              aria-label="Pilih semua"
              checked={allOn}
              disabled={selectable.length === 0}
              onChange={(e) => onToggleAll(selectable, e.target.checked)}
            />
          </Th>
          <Th>Judul</Th>
          <Th>Tipe Materi</Th>
          <Th>Satuan Pendidikan</Th>
          <Th>Program Pemerkayaan</Th>
          <Th>Probis</Th>
          <Th>Kurator / Penelaah</Th>
          <Th>Status Materi</Th>
        </tr>
      </thead>
      <tbody>
        {rows.map((m) => {
          const reason = lockReason(m)
          const on = selected.has(m.id)
          return (
            <tr key={m.id} className={on ? 'bg-surface-selected' : 'hover:bg-surface-hovered'}>
              <Td>
                <span className="group relative inline-block">
                  <input
                    type="checkbox"
                    aria-label={`Pilih ${m.judul}`}
                    checked={on}
                    disabled={!!reason}
                    onChange={() => onToggle(m)}
                  />
                  {reason ? (
                    <span className="pointer-events-none absolute left-6 top-0 z-30 hidden w-max rounded-lg bg-gray-90 px-3 py-2 text-helper text-text-inverse shadow-md group-hover:block">
                      {reason}
                    </span>
                  ) : null}
                </span>
              </Td>
              <Td className="font-semibold">{m.judul}</Td>
              <Td>{m.tipe}</Td>
              <Td>{names.jenjang(m.jenjang_id)}</Td>
              <Td>{m.program_id ? (programs.data?.data.find((p) => p.id === m.program_id)?.nama ?? '…') : '-'}</Td>
              <Td>
                {m.proses_bisnis ?? '-'}
                {m.proses_bisnis && m.proses_bisnis !== 'Kurasi' && m.review ? (
                  <span className="block text-helper text-text-subdued">{m.review}</span>
                ) : null}
              </Td>
              <Td>
                <div className="flex flex-col text-helper">
                  <span>Media: {names.inst(m.institusi_kurator_media_id) || '-'}</span>
                  <span>Substansi: {names.inst(m.institusi_kurator_substansi_id) || '-'}</span>
                </div>
              </Td>
              <Td>
                <StatusBadge status={m.status} />
              </Td>
            </tr>
          )
        })}
      </tbody>
    </Table>
  )
}

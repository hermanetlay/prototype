import { createFileRoute, Link } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { Suspense } from 'react'
import { Card, CardHeader } from '@/shared/ui/Card'
import { Table, Th, Td } from '@/shared/ui/Table'
import { Badge } from '@/shared/ui/Badge'
import { materiListQuery } from './-queries'
import type { MateriStatus } from './-data/materi'

type Search = { status: string }

export const Route = createFileRoute('/p/persetujuan-materi/v1/')({
  validateSearch: (search: Record<string, unknown>): Search => ({
    status: typeof search.status === 'string' ? search.status : 'menunggu',
  }),
  loaderDeps: ({ search }) => ({ status: search.status }),
  loader: ({ context, deps }) =>
    context.queryClient.ensureQueryData(materiListQuery(deps.status)),
  component: AntreanPage,
})

const tone: Record<MateriStatus, 'informational' | 'success' | 'critical'> = {
  menunggu: 'informational',
  disetujui: 'success',
  ditolak: 'critical',
}

const filters = ['menunggu', 'disetujui', 'ditolak', 'semua'] as const

function AntreanPage() {
  const { status } = Route.useSearch()
  return (
    <Card>
      <CardHeader
        title="Antrean Review"
        subtitle="Materi yang dikirim guru dan menunggu keputusan reviewer."
        actions={
          <div className="flex gap-1 rounded-full bg-gray-5 p-1">
            {filters.map((f) => (
              <Link
                key={f}
                to="/p/persetujuan-materi/v1"
                search={{ status: f }}
                className="rounded-full px-3 py-1.5 text-body-sm capitalize text-text-subdued hover:text-text"
                activeProps={{}}
              >
                <span className={f === status ? 'font-semibold text-interactive' : undefined}>
                  {f}
                </span>
              </Link>
            ))}
          </div>
        }
      />
      <Suspense fallback={<p className="p-6 text-text-subdued">Memuat…</p>}>
        <MateriTable status={status} />
      </Suspense>
    </Card>
  )
}

function MateriTable({ status }: { status: string }) {
  const { data } = useSuspenseQuery(materiListQuery(status))
  if (data.items.length === 0) {
    return <p className="p-6 text-text-subdued">Tidak ada materi pada filter ini.</p>
  }
  return (
    <Table>
      <thead>
        <tr>
          <Th>Judul</Th>
          <Th>Mata Pelajaran</Th>
          <Th>Jenjang</Th>
          <Th>Penulis</Th>
          <Th>Dikirim</Th>
          <Th>Status</Th>
        </tr>
      </thead>
      <tbody>
        {data.items.map((m) => (
          <tr key={m.id} className="hover:bg-surface-hovered">
            <Td>
              <Link
                to="/p/persetujuan-materi/v1/$materiId"
                params={{ materiId: m.id }}
                className="font-semibold text-interactive hover:underline"
              >
                {m.judul}
              </Link>
              <span className="mt-0.5 block text-helper text-text-subdued">{m.id}</span>
            </Td>
            <Td>{m.mataPelajaran}</Td>
            <Td>{m.jenjang}</Td>
            <Td>{m.penulis}</Td>
            <Td className="text-text-subdued">{m.dikirimPada}</Td>
            <Td>
              <Badge tone={tone[m.status]}>{m.status}</Badge>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  )
}

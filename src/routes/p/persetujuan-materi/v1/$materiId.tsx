import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import { useSuspenseQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Card, CardHeader, CardBody } from '@/shared/ui/Card'
import { Badge } from '@/shared/ui/Badge'
import { Button } from '@/shared/ui/Button'
import { materiDetailQuery, useKeputusan } from './-queries'

export const Route = createFileRoute('/p/persetujuan-materi/v1/$materiId')({
  loader: ({ context, params }) =>
    context.queryClient.ensureQueryData(materiDetailQuery(params.materiId)),
  component: DetailPage,
})

function DetailPage() {
  const { materiId } = Route.useParams()
  const navigate = useNavigate()
  const { data: materi } = useSuspenseQuery(materiDetailQuery(materiId))
  const keputusan = useKeputusan(materiId)
  const [catatan, setCatatan] = useState(materi.catatan ?? '')

  const decide = (status: 'disetujui' | 'ditolak') =>
    keputusan.mutate(
      { status, catatan: catatan || undefined },
      { onSuccess: () => navigate({ to: '/p/persetujuan-materi/v1', search: { status: 'menunggu' } }) },
    )

  return (
    <Card>
      <CardHeader
        title={materi.judul}
        subtitle={`${materi.mataPelajaran} · ${materi.jenjang} · ${materi.penulis}`}
        actions={<Badge tone={materi.status === 'menunggu' ? 'informational' : 'neutral'}>{materi.status}</Badge>}
      />
      <CardBody className="flex flex-col gap-6">
        <p className="text-body-sm text-text-subdued">{materi.ringkasan}</p>

        <label className="flex flex-col gap-2">
          <span className="text-subheading font-semibold">Catatan reviewer</span>
          <textarea
            value={catatan}
            onChange={(e) => setCatatan(e.target.value)}
            rows={4}
            placeholder="Wajib diisi bila menolak materi."
            className="rounded-md border border-border bg-surface p-3 text-body-sm"
          />
        </label>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => decide('disetujui')}
            disabled={keputusan.isPending}
          >
            Setujui
          </Button>
          <Button
            variant="destructive"
            onClick={() => decide('ditolak')}
            disabled={keputusan.isPending || catatan.trim().length === 0}
          >
            Tolak
          </Button>
          <Link to="/p/persetujuan-materi/v1" search={{ status: 'menunggu' }} className="ml-auto">
            <Button variant="ghost">Kembali</Button>
          </Link>
        </div>
      </CardBody>
    </Card>
  )
}

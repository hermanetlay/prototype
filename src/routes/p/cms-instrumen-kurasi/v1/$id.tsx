import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Card } from '@/shared/ui/Card'
import { DetailHalaman } from './-components/DetailHalaman'
import { DetailPanel } from './-components/DetailPanel'
import { DetailTabel } from './-components/DetailTabel'
import { ErrorBlock, KLink, LoadingBlock } from './-components/parts'
import { ApiError, detailQuery } from './-queries'

export const Route = createFileRoute('/p/cms-instrumen-kurasi/v1/$id')({
  component: Page,
})

function Page() {
  const { id } = Route.useParams()
  const { variant } = Route.useSearch()
  const q = useQuery(detailQuery(id))

  if (q.isPending)
    return (
      <Card>
        <LoadingBlock label="Memuat kelompok…" />
      </Card>
    )
  if (q.isError) {
    const missing = q.error instanceof ApiError && q.error.status === 404
    return (
      <Card>
        <div className="flex flex-col items-start gap-3 p-6">
          <h2 className="text-heading-md font-semibold">{missing ? 'Kelompok tidak ditemukan' : 'Gagal memuat kelompok'}</h2>
          {missing ? (
            <p className="text-body-sm text-text-subdued">Kelompok ini sudah dihapus atau tautannya salah.</p>
          ) : (
            <ErrorBlock message={q.error.message} onRetry={() => q.refetch()} />
          )}
          <KLink className="text-body-sm font-semibold text-interactive hover:underline">← Daftar kelompok</KLink>
        </div>
      </Card>
    )
  }
  const k = q.data.data
  if (variant === 'panel') return <DetailPanel k={k} />
  if (variant === 'tabel') return <DetailTabel k={k} />
  return <DetailHalaman k={k} />
}

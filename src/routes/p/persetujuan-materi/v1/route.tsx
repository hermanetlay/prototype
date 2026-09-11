import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppShell } from '@/shared/layout/AppShell'
import { meta } from './-meta'

const root = '/p/persetujuan-materi/v1'

export const Route = createFileRoute('/p/persetujuan-materi/v1')({
  component: Layout,
})

function Layout() {
  return (
    <AppShell
      product="Ruang Murid CMS"
      nav={[
        { label: 'Antrean Review', to: root, exact: true },
        { label: 'Riwayat', to: `${root}?status=semua` },
      ]}
      breadcrumb={`Prototype · persetujuan-materi · v1`}
      title={meta.title}
      subtitle={meta.summary}
    >
      <Outlet />
    </AppShell>
  )
}

import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppShell } from '@/shared/layout/AppShell'
import { meta } from './-meta'

const root = '/p/cms-kurasi-assignment/v1'

export const Route = createFileRoute('/p/cms-kurasi-assignment/v1')({
  component: Layout,
})

function Layout() {
  return (
    <AppShell
      product="Ruang Murid CMS"
      nav={[{ label: 'Kelola Materi', to: root, exact: true }]}
      breadcrumb="Materi / Kelola Materi"
      title="Kelola Materi"
      subtitle={meta.summary}
    >
      <Outlet />
    </AppShell>
  )
}

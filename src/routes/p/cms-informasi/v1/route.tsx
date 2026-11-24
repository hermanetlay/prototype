import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppShell } from '@/shared/layout/AppShell'

const root = '/p/cms-informasi/v1'

export const Route = createFileRoute('/p/cms-informasi/v1')({
  component: Layout,
})

function Layout() {
  return (
    <AppShell
      product="Ruang Murid CMS"
      nav={[{ label: 'Informasi', to: root, exact: true }]}
      breadcrumb="Konsol Admin / Informasi"
      title="Informasi"
      subtitle="Kelola banner dan pengumuman yang tampil di situs Ruang Murid."
    >
      <Outlet />
    </AppShell>
  )
}

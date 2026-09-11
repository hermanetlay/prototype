import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppShell } from '@/shared/layout/AppShell'
import { meta } from './-meta'

const root = '/p/cms-user-management/v1'

export const Route = createFileRoute('/p/cms-user-management/v1')({
  component: Layout,
})

function Layout() {
  return (
    <AppShell
      product="Ruang Murid CMS"
      nav={[{ label: 'Kelola Pengguna', to: root }]}
      breadcrumb="Pengaturan / Kelola Pengguna"
      title={meta.title}
      subtitle="Cek email terlebih dahulu untuk menambah pengguna baru atau memperbarui pengguna yang sudah terdaftar."
    >
      <Outlet />
    </AppShell>
  )
}

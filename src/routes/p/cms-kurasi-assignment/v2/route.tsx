import { createFileRoute, Link, Outlet, useRouterState } from '@tanstack/react-router'
import { AppShell } from '@/shared/layout/AppShell'
import { Button } from '@/shared/ui/Button'
import { SimulationBar } from './-components/SimulationBar'

const root = '/p/cms-kurasi-assignment/v2'

export const Route = createFileRoute('/p/cms-kurasi-assignment/v2')({
  component: Layout,
})

function head(path: string) {
  const p = path.replace(/\/+$/, '')
  if (p === `${root}/program`)
    return { crumb: 'Penugasan Kurasi / Program Penugasan', title: 'Program Penugasan', subtitle: 'Kelola nilai bawaan penugasan kurasi per jenjang dan tipe materi.' }
  if (p === `${root}/program/baru`)
    return { crumb: 'Penugasan Kurasi / Program Penugasan / Tambah', title: 'Tambah Program', subtitle: undefined }
  if (p.startsWith(`${root}/program/`))
    return { crumb: 'Penugasan Kurasi / Program Penugasan / Detail', title: 'Detail Program', subtitle: undefined }
  return {
    crumb: 'Materi / Kelola Materi',
    title: 'Kelola Materi',
    subtitle: 'Pilih materi lalu tugaskan kurasi sekaligus.',
  }
}

function Layout() {
  const path = useRouterState({ select: (s) => s.location.pathname })
  const h = head(path)
  const isList = path.replace(/\/+$/, '') === `${root}/program`
  return (
    <AppShell
      product="Ruang Murid CMS"
      nav={[
        { label: 'Kelola Materi', to: root, exact: true },
        { label: 'Program Penugasan', to: `${root}/program` },
      ]}
      breadcrumb={h.crumb}
      title={h.title}
      subtitle={h.subtitle}
      actions={
        isList ? (
          <Link to="/p/cms-kurasi-assignment/v2/program/baru">
            <Button>Tambah Program</Button>
          </Link>
        ) : undefined
      }
    >
      <Outlet />
      <SimulationBar />
    </AppShell>
  )
}

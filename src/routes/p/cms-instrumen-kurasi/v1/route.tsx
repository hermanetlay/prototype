import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppShell } from '@/shared/layout/AppShell'
import { KelompokFormModal } from './-components/KelompokForm'
import { VariantSwitcher } from './-components/VariantSwitcher'
import { parseSearch } from './-logic/search'
import type { Search } from './-logic/search'
import { meta } from './-meta'

const root = '/p/cms-instrumen-kurasi/v1'

export const Route = createFileRoute('/p/cms-instrumen-kurasi/v1')({
  validateSearch: parseSearch,
  component: Layout,
})

function Layout() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const setSearch = (patch: Partial<Search>, replace = true) =>
    navigate({ search: ((prev: Search) => ({ ...prev, ...patch })) as never, replace })

  return (
    <AppShell
      product="Ruang Murid CMS"
      nav={[{ label: 'Instrumen Kurasi', to: root, exact: false }]}
      breadcrumb="Konsol Admin / Instrumen Kurasi"
      title={meta.title}
      subtitle="Kelola kelompok instrumen, kategori dan indikator untuk kurasi materi."
    >
      <Outlet />
      {search.form ? (
        <KelompokFormModal id={search.form} onClose={() => setSearch({ form: undefined }, false)} />
      ) : null}
      <VariantSwitcher
        variant={search.variant}
        onChange={(variant) => setSearch({ variant, sel: undefined })}
        error={search.simulasi === 'error'}
        onToggleError={() => setSearch({ simulasi: search.simulasi ? undefined : 'error' })}
      />
      <div className="h-20" />
    </AppShell>
  )
}

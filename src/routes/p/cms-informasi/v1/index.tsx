import { createFileRoute } from '@tanstack/react-router'
import { parseSearch } from './-logic/search'
import type { Search } from './-logic/search'
import { VariantA } from './-components/VariantA'
import { VariantB } from './-components/VariantB'
import { VariantC } from './-components/VariantC'
import { VariantSwitcher } from './-components/VariantSwitcher'

export const Route = createFileRoute('/p/cms-informasi/v1/')({
  validateSearch: parseSearch,
  component: Page,
})

function Page() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const setSearch = (patch: Partial<Search>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) })

  const View = { A: VariantA, B: VariantB, C: VariantC }[search.variant]
  return (
    <>
      <View search={search} setSearch={setSearch} />
      <VariantSwitcher
        variant={search.variant}
        onChange={(variant) => setSearch({ variant })}
        error={search.simulasi === 'error'}
        onToggleError={() => setSearch({ simulasi: search.simulasi ? undefined : 'error' })}
      />
      <div className="h-20" />
    </>
  )
}

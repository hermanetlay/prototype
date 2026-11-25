import { createFileRoute } from '@tanstack/react-router'
import { parseSearch } from './-logic/search'
import type { Search } from './-logic/search'
import { VariantA } from './-components/VariantA'
import { SimulasiToggle } from './-components/SimulasiToggle'

export const Route = createFileRoute('/p/cms-informasi/v2/')({
  validateSearch: parseSearch,
  component: Page,
})

function Page() {
  const search = Route.useSearch()
  const navigate = Route.useNavigate()
  const setSearch = (patch: Partial<Search>) =>
    navigate({ search: (prev) => ({ ...prev, ...patch }) })

  return (
    <>
      <VariantA search={search} setSearch={setSearch} />
      <SimulasiToggle
        error={search.simulasi === 'error'}
        onToggle={() => setSearch({ simulasi: search.simulasi ? undefined : 'error' })}
      />
      <div className="h-20" />
    </>
  )
}

import { createFileRoute } from '@tanstack/react-router'
import { ListPage } from './-components/ListPage'

export const Route = createFileRoute('/p/cms-instrumen-kurasi/v1/')({
  component: Page,
})

function Page() {
  return <ListPage search={Route.useSearch()} />
}

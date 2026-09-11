import { createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { LookupCard } from './-components/LookupCard'
import { InsertForm, UpdateForm } from './-components/UserForms'
import { isEmail } from './-components/validation'
import { lookupQuery, normEmail, organizationsQuery } from './-queries'
import type { User } from './-data/seed'

type Search = { email?: string }

export const Route = createFileRoute('/p/cms-user-management/v1/')({
  // Accepted trade-off (see CONTEXT.md): the email lives in the URL so every
  // state is shareable.
  validateSearch: (search: Record<string, unknown>): Search => ({
    email: typeof search.email === 'string' && search.email ? search.email : undefined,
  }),
  component: Page,
})

function Page() {
  const { email } = Route.useSearch()
  const navigate = Route.useNavigate()
  const goTo = (next?: string) =>
    navigate({ search: next ? { email: normEmail(next) } : {} })

  if (!email) return <LookupCard key="empty" onSubmit={goTo} />
  // A malformed address from the URL never reaches the API.
  if (!isEmail(email)) return <LookupCard key={email} initialEmail={email} onSubmit={goTo} />
  return <Resolved key={normEmail(email)} email={email} goTo={goTo} />
}

function Resolved({ email, goTo }: { email: string; goTo: (email?: string) => void }) {
  const lookup = useQuery(lookupQuery(email))
  const orgs = useQuery(organizationsQuery)

  if (lookup.isError || orgs.isError) {
    return (
      <LookupCard
        initialEmail={email}
        failed
        onSubmit={(next) => (normEmail(next) === normEmail(email) ? lookup.refetch() : goTo(next))}
        onRetry={() => {
          if (lookup.isError) lookup.refetch()
          if (orgs.isError) orgs.refetch()
        }}
      />
    )
  }
  if (!lookup.data || !orgs.data) {
    return <LookupCard initialEmail={email} pending onSubmit={goTo} />
  }

  const onSaved = (user: User) => goTo(user.email)

  if (lookup.data.status === 'new') {
    return (
      <InsertForm
        email={normEmail(email)}
        organizations={orgs.data}
        onChangeEmail={() => goTo()}
        onSaved={onSaved}
      />
    )
  }

  const { user } = lookup.data
  return (
    <UpdateForm
      // Remount after every save so the freshly saved orgs become fixed.
      key={`${user.id}:${user.email}:${user.organizationIds.join(',')}`}
      user={user}
      organizations={orgs.data}
      onLookupAnother={() => goTo()}
      onSaved={onSaved}
    />
  )
}

import { queryOptions, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Organization, Role, User } from './-data/seed'

const base = '/api/cms-user-management/v1'
const key = ['cms-user-management', 'v1'] as const

export type Lookup = { status: 'new' } | { status: 'registered'; user: User }

/** A non-2xx response, carrying the field the API blamed (if any). */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly field?: string,
  ) {
    super(message)
  }
}

async function json<T>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(input, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { message?: string; field?: string }
    throw new ApiError(res.status, body.message ?? res.statusText, body.field)
  }
  return res.json() as Promise<T>
}

export const normEmail = (email: string) => email.trim().toLowerCase()

export const lookupQuery = (email: string) =>
  queryOptions({
    queryKey: [...key, 'lookup', normEmail(email)],
    queryFn: () =>
      json<Lookup>(`${base}/users/lookup?email=${encodeURIComponent(normEmail(email))}`),
  })

export const organizationsQuery = queryOptions({
  queryKey: [...key, 'organizations'],
  queryFn: () => json<Organization[]>(`${base}/organizations`),
  staleTime: Infinity,
})

/** After any save the lookup cache is stale; seed the saved user's entry so the
 *  page can flip straight into update mode without a loading flash. */
function useOnSaved() {
  const qc = useQueryClient()
  return (user: User) => {
    const saved = lookupQuery(user.email).queryKey
    const data: Lookup = { status: 'registered', user }
    qc.setQueryData(saved, data)
    // Every other cached lookup may now be wrong (e.g. an email just freed or
    // taken). Mark them stale without refetching the one still on screen.
    qc.invalidateQueries({
      queryKey: [...key, 'lookup'],
      predicate: (q) => q.queryKey[3] !== saved[3],
      refetchType: 'none',
    })
  }
}

export function useCreateUser() {
  const onSaved = useOnSaved()
  return useMutation({
    mutationFn: (body: {
      email: string
      displayName: string
      role: Role
      organizationIds: string[]
    }) => json<User>(`${base}/users`, { method: 'POST', body: JSON.stringify(body) }),
    onSuccess: onSaved,
  })
}

export function useUpdateUser(id: string) {
  const onSaved = useOnSaved()
  return useMutation({
    mutationFn: (body: { email: string; displayName: string; organizationIds: string[] }) =>
      json<User>(`${base}/users/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
    onSuccess: onSaved,
  })
}

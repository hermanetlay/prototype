import { http, HttpResponse, delay } from 'msw'
import { organizations, seedUsers, type Role, type User } from '../-data/seed'

const base = '/api/cms-user-management/v1'

const users = new Map<string, User>(seedUsers.map((u) => [u.id, u]))
let nextId = seedUsers.length + 1

const norm = (email: string) => email.trim().toLowerCase()
const byEmail = (email: string) =>
  [...users.values()].find((u) => norm(u.email) === norm(email))

export const handlers = [
  http.get(`${base}/users/lookup`, async ({ request }) => {
    await delay(500)
    const email = new URL(request.url).searchParams.get('email') ?? ''
    // Test hook: any address containing "error" simulates a server failure.
    if (email.includes('error')) {
      return HttpResponse.json({ message: 'Server error' }, { status: 500 })
    }
    const user = byEmail(email)
    return HttpResponse.json(user ? { status: 'registered', user } : { status: 'new' })
  }),

  http.get(`${base}/organizations`, async () => {
    await delay(300)
    return HttpResponse.json(organizations)
  }),

  http.post(`${base}/users`, async ({ request }) => {
    await delay(500)
    const body = (await request.json()) as {
      email: string
      displayName: string
      role: Role
      organizationIds: string[]
    }
    if (byEmail(body.email)) {
      return HttpResponse.json(
        { field: 'email', message: 'Email sudah terdaftar.' },
        { status: 409 },
      )
    }
    const user: User = {
      id: `u_${String(nextId++).padStart(3, '0')}`,
      email: norm(body.email),
      displayName: body.displayName.trim(),
      role: body.role,
      organizationIds: body.organizationIds,
    }
    users.set(user.id, user)
    return HttpResponse.json(user, { status: 201 })
  }),

  http.patch(`${base}/users/:id`, async ({ params, request }) => {
    await delay(500)
    const current = users.get(String(params.id))
    if (!current) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as {
      email: string
      displayName: string
      organizationIds: string[]
    }

    const owner = byEmail(body.email)
    if (owner && owner.id !== current.id) {
      return HttpResponse.json(
        { field: 'email', message: 'Email sudah digunakan pengguna lain.' },
        { status: 409 },
      )
    }
    // Append-only: every previously saved organization must still be present.
    if (!current.organizationIds.every((id) => body.organizationIds.includes(id))) {
      return HttpResponse.json(
        { field: 'organizationIds', message: 'Organisasi yang tersimpan tidak dapat dihapus.' },
        { status: 422 },
      )
    }

    const updated: User = {
      ...current,
      email: norm(body.email),
      displayName: body.displayName.trim(),
      organizationIds: body.organizationIds,
    }
    users.set(updated.id, updated)
    return HttpResponse.json(updated)
  }),
]

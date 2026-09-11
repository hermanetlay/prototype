import { http, HttpResponse, delay } from 'msw'
import { seedMateri, type Materi, type MateriStatus } from '../-data/materi'

const base = '/api/persetujuan-materi/v1'

/** In-memory store so approve/reject persist for the length of the session. */
const store = new Map<string, Materi>(seedMateri.map((m) => [m.id, m]))

export const handlers = [
  http.get(`${base}/materi`, async ({ request }) => {
    await delay(300)
    const status = new URL(request.url).searchParams.get('status')
    const items = [...store.values()].filter(
      (m) => !status || status === 'semua' || m.status === status,
    )
    return HttpResponse.json({ items })
  }),

  http.get(`${base}/materi/:id`, async ({ params }) => {
    await delay(200)
    const materi = store.get(String(params.id))
    if (!materi) return new HttpResponse(null, { status: 404 })
    return HttpResponse.json(materi)
  }),

  http.post(`${base}/materi/:id/keputusan`, async ({ params, request }) => {
    await delay(400)
    const materi = store.get(String(params.id))
    if (!materi) return new HttpResponse(null, { status: 404 })
    const body = (await request.json()) as {
      status: Extract<MateriStatus, 'disetujui' | 'ditolak'>
      catatan?: string
    }
    const updated = { ...materi, status: body.status, catatan: body.catatan }
    store.set(updated.id, updated)
    return HttpResponse.json(updated)
  }),
]

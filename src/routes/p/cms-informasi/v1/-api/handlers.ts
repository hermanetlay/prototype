import { http, HttpResponse, delay } from 'msw'
import { BUDI, buildSeed, CDN_BASE, JENJANG } from '../-data/seed'
import type { InformasiRecord, Kategori, Layanan } from '../-data/seed'
import { statusTayang, todayJakarta } from '../-logic/dates'
import { MAX_UPLOAD, validate } from '../-logic/rules'
import type { FormValues } from '../-logic/rules'

const base = '/api/cms-informasi/v1'
const ACTOR = BUDI // login is out of scope: always admin_super

const db = new Map<string, InformasiRecord>(buildSeed().map((r) => [r.id, r]))

const latency = () => delay(300 + Math.random() * 300)
const err = (status: number, message: string, extra?: object) =>
  HttpResponse.json({ message, ...extra }, { status })

function view(r: InformasiRecord) {
  const { jenjang_ids, ...rest } = r
  return {
    ...rest,
    jenjang: jenjang_ids.map((id) => ({
      id,
      nama_singkat: JENJANG.find((j) => j.id === id)?.nama_singkat ?? '?',
    })),
    status_tayang: statusTayang(r),
  }
}

type Body = Record<string, unknown>
const toValues = (b: Body): FormValues => ({
  nama: String(b.nama ?? ''),
  judul: String(b.judul ?? ''),
  thumbnail: String(b.thumbnail ?? ''),
  kategori: String(b.kategori ?? ''),
  url: String(b.url ?? ''),
  layanan: Array.isArray(b.layanan) ? b.layanan.map(String) : [],
  jenjang_ids: Array.isArray(b.jenjang_ids) ? b.jenjang_ids.map(String) : [],
  tanggal_mulai: String(b.tanggal_mulai ?? ''),
  tanggal_selesai: String(b.tanggal_selesai ?? ''),
  pin_informasi: b.pin_informasi === true,
  homepage_order: b.homepage_order == null ? '' : String(b.homepage_order),
  status: String(b.status ?? ''),
})

/** Shared by POST and PUT: 400 rules, unknown jenjang, then 409 on nama. */
function check(v: FormValues, selfId?: string) {
  const errors = validate(v, todayJakarta())
  const first = Object.values(errors)[0]
  if (first) return err(400, first, { errors })
  if (v.jenjang_ids.some((id) => !JENJANG.some((j) => j.id === id)))
    return err(400, 'jenjang tidak ditemukan', { errors: { jenjang_ids: 'Jenjang tidak ditemukan.' } })
  const clash = [...db.values()].some(
    (r) => r.id !== selfId && r.nama.toLowerCase() === v.nama.trim().toLowerCase(),
  )
  if (clash) return err(409, 'nama informasi sudah digunakan', { field: 'nama' })
  return null
}

const fields = (v: FormValues) => ({
  nama: v.nama.trim(),
  judul: v.judul.trim(),
  thumbnail: v.thumbnail,
  kategori: v.kategori as Kategori,
  layanan: v.layanan as Layanan[],
  jenjang_ids: v.jenjang_ids,
  url: v.url.trim(),
  tanggal_mulai: v.tanggal_mulai,
  tanggal_selesai: v.tanggal_selesai,
  pin_informasi: v.pin_informasi,
  homepage_order: v.homepage_order.trim() === '' ? undefined : Number(v.homepage_order),
  status: v.status as 'Aktif' | 'Inaktif',
})

export const handlers = [
  http.get(`${base}/informasi`, async ({ request }) => {
    await latency()
    const p = new URL(request.url).searchParams
    if (p.get('simulasi') === 'error') return err(500, 'Terjadi kesalahan pada server')

    const q = p.get('q')?.toLowerCase()
    const homepage = p.get('homepage') === 'true'
    const rows = [...db.values()]
      .filter((r) => !q || r.nama.toLowerCase().includes(q) || r.judul.toLowerCase().includes(q))
      .filter((r) => !p.get('kategori') || r.kategori === p.get('kategori'))
      .filter((r) => !p.get('layanan') || r.layanan.includes(p.get('layanan') as Layanan))
      .filter((r) => !p.get('jenjang_id') || r.jenjang_ids.includes(p.get('jenjang_id') as string))
      .filter((r) => !p.get('status_tayang') || statusTayang(r) === p.get('status_tayang'))
      .filter((r) => !homepage || r.homepage_order !== undefined)
      .sort((a, b) =>
        homepage
          ? a.homepage_order! - b.homepage_order! ||
            b.tanggal_mulai.localeCompare(a.tanggal_mulai) ||
            a.id.localeCompare(b.id)
          : b.updated_at.localeCompare(a.updated_at) || a.id.localeCompare(b.id),
      )
    const limit = Number(p.get('limit') ?? 10)
    const offset = Number(p.get('offset') ?? 0)
    return HttpResponse.json({ data: rows.slice(offset, offset + limit).map(view), total: rows.length })
  }),

  http.get(`${base}/informasi/:id`, async ({ params }) => {
    await latency()
    const r = db.get(String(params.id))
    if (!r) return err(404, 'informasi tidak ditemukan')
    return HttpResponse.json({ data: view(r) })
  }),

  http.post(`${base}/informasi`, async ({ request }) => {
    await latency()
    const v = toValues((await request.json()) as Body)
    const bad = check(v)
    if (bad) return bad
    const now = new Date().toISOString()
    const id = crypto.randomUUID()
    db.set(id, {
      id,
      ...fields(v),
      created_by: ACTOR,
      updated_by: ACTOR,
      created_at: now,
      updated_at: now,
    })
    return HttpResponse.json({ data: { id } }, { status: 201 })
  }),

  http.put(`${base}/informasi/:id`, async ({ params, request }) => {
    await latency()
    const cur = db.get(String(params.id))
    if (!cur) return err(404, 'informasi tidak ditemukan')
    const v = toValues((await request.json()) as Body)
    const bad = check(v, cur.id)
    if (bad) return bad
    db.set(cur.id, { ...cur, ...fields(v), updated_by: ACTOR, updated_at: new Date().toISOString() })
    return new HttpResponse(null, { status: 204 })
  }),

  http.delete(`${base}/informasi/:id`, async ({ params }) => {
    await latency()
    if (!db.delete(String(params.id))) return err(404, 'informasi tidak ditemukan')
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(`${base}/jenjang`, async () => {
    await delay(300)
    return HttpResponse.json({ data: JENJANG })
  }),

  http.post(`${base}/files/upload`, async ({ request }) => {
    await delay(500 + Math.random() * 300)
    const form = await request.formData()
    const file = form.get('file')
    if (!(file instanceof File) || form.get('folder') !== 'informasi')
      return err(400, 'File atau folder tidak valid')
    if (file.type !== 'image/jpeg' && file.type !== 'image/png')
      return err(400, 'Tipe file tidak di support')
    if (file.size > MAX_UPLOAD) return err(413, 'Ukuran file melebihi batas yang diizinkan')
    const ext = file.type === 'image/png' ? 'png' : 'jpg'
    const name = file.name.replace(/\.[^.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40) || 'banner'
    const rand = Math.random().toString(36).slice(2, 8)
    return HttpResponse.json({ data: { url: `${CDN_BASE}/${name}_${rand}.${ext}` } })
  }),
]

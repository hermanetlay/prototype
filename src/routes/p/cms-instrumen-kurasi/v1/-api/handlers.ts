import { http, HttpResponse, delay } from 'msw'
import { buildSeed, JENJANG } from '../-data/seed'
import type { KategoriRec, KelompokRec, TipeMateri } from '../-data/seed'
import {
  guardActivate,
  guardDeleteIndikator,
  guardDeleteKategori,
  guardDeleteKelompok,
  guardDuplicateIndikator,
  guardDuplicateKategori,
  guardDuplicateKelompok,
  guardProgramEdit,
  indikatorCount,
  isReady,
  validateIndikator,
  validateKelompok,
  validateNama,
} from '../-logic/guards'
import type { Refusal } from '../-logic/guards'

const base = '/api/cms-instrumen-kurasi/v1'

// In-memory state: edits persist while the tab is open, reset on reload.
const seed = buildSeed()
const kelompokDb = new Map<string, KelompokRec>(seed.kelompok.map((k) => [k.id, k]))
const programs = seed.programs
let nextId = 1000
const newId = (p: string) => `${p}-${++nextId}`
const now = () => new Date().toISOString()

const latency = () => delay(250 + Math.random() * 250)
const fail = (status: number, message: string, field?: string) =>
  HttpResponse.json({ message, field }, { status })
const refusal = (r: Refusal) => fail(r.status, r.message, r.field)
const notFound = (what: string) => fail(404, `${what} tidak ditemukan.`)

type Body = Record<string, unknown>
const readBody = async (req: Request): Promise<Body> => ((await req.json().catch(() => ({}))) as Body)

const jenjangView = (ids: string[]) =>
  ids.map((id) => ({ id, nama_singkat: JENJANG.find((j) => j.id === id)?.nama_singkat ?? '?' }))

function item(k: KelompokRec) {
  return {
    id: k.id,
    nama: k.nama,
    jenis_kurasi: k.jenis_kurasi,
    tipe_materi: k.tipe_materi,
    status: k.status,
    jenjang: jenjangView(k.jenjang_ids),
    jumlah_kategori: k.kategori.length,
    jumlah_indikator: indikatorCount(k),
    siap_dipakai: isReady(k),
    updated_at: k.updated_at,
  }
}

const detail = (k: KelompokRec) => ({
  ...item(k),
  kategori: k.kategori.map((c) => ({ id: c.id, nama: c.nama, jumlah_indikator: c.indikator.length })),
})

const kategoriView = (k: KelompokRec, c: KategoriRec) => ({
  id: c.id,
  nama: c.nama,
  kelompok_id: k.id,
  updated_at: c.updated_at,
  indikator: c.indikator,
})

function findKategori(id: string) {
  for (const k of kelompokDb.values()) {
    const c = k.kategori.find((x) => x.id === id)
    if (c) return { k, c }
  }
  return null
}
function findIndikator(id: string) {
  for (const k of kelompokDb.values())
    for (const c of k.kategori) {
      const i = c.indikator.find((x) => x.id === id)
      if (i) return { k, c, i }
    }
  return null
}

const touch = (k: KelompokRec, c?: KategoriRec) => {
  const t = now()
  k.updated_at = t
  if (c) c.updated_at = t
}
const tipeOf = (v: unknown): TipeMateri | null => (typeof v === 'string' && v ? (v as TipeMateri) : null)
const jenjangIdsOf = (v: unknown) => (Array.isArray(v) ? v.map(String) : [])
const unknownJenjang = (ids: string[]) =>
  ids.some((id) => !JENJANG.some((j) => j.id === id)) ? fail(400, 'Jenjang tidak ditemukan.', 'jenjang_ids') : null

export const handlers = [
  http.get(`${base}/jenjang`, async () => {
    await delay(150)
    return HttpResponse.json({ data: JENJANG })
  }),

  // K1
  http.get(`${base}/kelompok-instrumen`, async ({ request }) => {
    await latency()
    const p = new URL(request.url).searchParams
    if (p.get('simulasi') === 'error') return fail(500, 'Terjadi kesalahan pada server.')
    const q = p.get('q')?.trim().toLowerCase()
    const jenis = p.get('jenis_kurasi')
    const tipe = p.get('tipe_materi')
    const jenjang = p.get('jenjang_id')
    const status = p.get('status')
    const limit = Number(p.get('limit')) || 10
    const offset = Number(p.get('offset')) || 0
    const rows = [...kelompokDb.values()]
      .filter((k) => !q || k.nama.toLowerCase().includes(q))
      .filter((k) => !jenis || k.jenis_kurasi === jenis)
      .filter((k) => !tipe || k.tipe_materi === tipe)
      .filter((k) => !jenjang || k.jenjang_ids.includes(jenjang))
      .filter((k) => !status || k.status === status)
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    return HttpResponse.json({
      data: rows.slice(offset, offset + limit).map(item),
      meta: { limit, offset, total: rows.length },
    })
  }),

  // K2
  http.get(`${base}/kelompok-instrumen/:id`, async ({ params }) => {
    await latency()
    const k = kelompokDb.get(String(params.id))
    return k ? HttpResponse.json({ data: detail(k) }) : notFound('Kelompok')
  }),

  // K3
  http.post(`${base}/kelompok-instrumen`, async ({ request }) => {
    await latency()
    const b = await readBody(request)
    const bad = validateKelompok(b)
    if (bad) return refusal(bad)
    const jenjang = jenjangIdsOf(b.jenjang_ids)
    const unknown = unknownJenjang(jenjang)
    if (unknown) return unknown
    const nama = String(b.nama).trim()
    const dup = guardDuplicateKelompok(nama, [...kelompokDb.values()])
    if (dup) return refusal(dup)
    const k: KelompokRec = {
      id: newId('kel'),
      nama,
      jenis_kurasi: b.jenis_kurasi as KelompokRec['jenis_kurasi'],
      tipe_materi: tipeOf(b.tipe_materi),
      status: 'inactive',
      jenjang_ids: jenjang,
      kategori: [],
      updated_at: now(),
    }
    kelompokDb.set(k.id, k)
    return HttpResponse.json({ data: detail(k) }, { status: 201 })
  }),

  // K4: edit fields and/or status
  http.patch(`${base}/kelompok-instrumen/:id`, async ({ params, request }) => {
    await latency()
    const k = kelompokDb.get(String(params.id))
    if (!k) return notFound('Kelompok')
    const b = await readBody(request)
    const next = {
      nama: 'nama' in b ? String(b.nama ?? '') : k.nama,
      jenis_kurasi: ('jenis_kurasi' in b ? b.jenis_kurasi : k.jenis_kurasi) as string,
      tipe_materi: 'tipe_materi' in b ? tipeOf(b.tipe_materi) : k.tipe_materi,
      jenjang_ids: 'jenjang_ids' in b ? jenjangIdsOf(b.jenjang_ids) : k.jenjang_ids,
    }
    const touchesFields = ['nama', 'jenis_kurasi', 'tipe_materi', 'jenjang_ids'].some((f) => f in b)
    if (touchesFields) {
      const bad = validateKelompok(next)
      if (bad) return refusal(bad)
      const unknown = unknownJenjang(next.jenjang_ids)
      if (unknown) return unknown
      const name = next.nama.trim()
      if (name.toLowerCase() !== k.nama.trim().toLowerCase()) {
        const dup = guardDuplicateKelompok(name, [...kelompokDb.values()], k.id)
        if (dup) return refusal(dup)
      }
      const used = guardProgramEdit(k, next, programs)
      if (used) return refusal(used)
    }
    if (b.status !== undefined && b.status !== 'active' && b.status !== 'inactive')
      return fail(400, 'Status tidak valid.', 'status')
    if (b.status === 'active' && k.status !== 'active') {
      const notReady = guardActivate(k)
      if (notReady) return refusal(notReady)
    }
    if (touchesFields) {
      k.nama = next.nama.trim()
      k.jenis_kurasi = next.jenis_kurasi as KelompokRec['jenis_kurasi']
      k.tipe_materi = next.tipe_materi
      k.jenjang_ids = next.jenjang_ids
    }
    if (b.status === 'active' || b.status === 'inactive') k.status = b.status
    touch(k)
    return HttpResponse.json({ data: detail(k) })
  }),

  // K5
  http.delete(`${base}/kelompok-instrumen/:id`, async ({ params }) => {
    await latency()
    const k = kelompokDb.get(String(params.id))
    if (!k) return notFound('Kelompok')
    const bad = guardDeleteKelompok(k, programs)
    if (bad) return refusal(bad)
    kelompokDb.delete(k.id)
    return new HttpResponse(null, { status: 204 })
  }),

  // C1
  http.post(`${base}/kelompok-instrumen/:id/kategori`, async ({ params, request }) => {
    await latency()
    const k = kelompokDb.get(String(params.id))
    if (!k) return notFound('Kelompok')
    const b = await readBody(request)
    const bad = validateNama(b.nama)
    if (bad) return refusal(bad)
    const nama = String(b.nama).trim()
    const dup = guardDuplicateKategori(nama, k.kategori)
    if (dup) return refusal(dup)
    const c: KategoriRec = { id: newId('kat'), nama, indikator: [], updated_at: now() }
    k.kategori.push(c)
    touch(k)
    return HttpResponse.json({ data: kategoriView(k, c) }, { status: 201 })
  }),

  // C2
  http.get(`${base}/kategori/:id`, async ({ params }) => {
    await latency()
    const hit = findKategori(String(params.id))
    return hit ? HttpResponse.json({ data: kategoriView(hit.k, hit.c) }) : notFound('Kategori')
  }),

  // C3
  http.patch(`${base}/kategori/:id`, async ({ params, request }) => {
    await latency()
    const hit = findKategori(String(params.id))
    if (!hit) return notFound('Kategori')
    const b = await readBody(request)
    const bad = validateNama(b.nama)
    if (bad) return refusal(bad)
    const nama = String(b.nama).trim()
    if (nama.toLowerCase() !== hit.c.nama.trim().toLowerCase()) {
      const dup = guardDuplicateKategori(nama, hit.k.kategori, hit.c.id)
      if (dup) return refusal(dup)
    }
    hit.c.nama = nama
    touch(hit.k, hit.c)
    return HttpResponse.json({ data: kategoriView(hit.k, hit.c) })
  }),

  // C4
  http.delete(`${base}/kategori/:id`, async ({ params }) => {
    await latency()
    const hit = findKategori(String(params.id))
    if (!hit) return notFound('Kategori')
    const bad = guardDeleteKategori(hit.k, hit.c.id)
    if (bad) return refusal(bad)
    hit.k.kategori = hit.k.kategori.filter((c) => c.id !== hit.c.id)
    touch(hit.k)
    return new HttpResponse(null, { status: 204 })
  }),

  // I1
  http.post(`${base}/kategori/:id/indikator`, async ({ params, request }) => {
    await latency()
    const hit = findKategori(String(params.id))
    if (!hit) return notFound('Kategori')
    const b = await readBody(request)
    const bad = validateIndikator(b)
    if (bad) return refusal(bad)
    const text = String(b.nama_indikator).trim()
    const dup = guardDuplicateIndikator(text, hit.c)
    if (dup) return refusal(dup)
    const i = {
      id: newId('ind'),
      nama_indikator: text,
      negasi_indikator: String(b.negasi_indikator).trim(),
      updated_at: now(),
    }
    hit.c.indikator.push(i)
    touch(hit.k, hit.c)
    return HttpResponse.json({ data: i }, { status: 201 })
  }),

  // I2
  http.patch(`${base}/indikator/:id`, async ({ params, request }) => {
    await latency()
    const hit = findIndikator(String(params.id))
    if (!hit) return notFound('Indikator')
    const b = await readBody(request)
    const merged = {
      nama_indikator: 'nama_indikator' in b ? b.nama_indikator : hit.i.nama_indikator,
      negasi_indikator: 'negasi_indikator' in b ? b.negasi_indikator : hit.i.negasi_indikator,
    }
    const bad = validateIndikator(merged)
    if (bad) return refusal(bad)
    const text = String(merged.nama_indikator).trim()
    if (text.toLowerCase() !== hit.i.nama_indikator.trim().toLowerCase()) {
      const dup = guardDuplicateIndikator(text, hit.c, hit.i.id)
      if (dup) return refusal(dup)
    }
    hit.i.nama_indikator = text
    hit.i.negasi_indikator = String(merged.negasi_indikator).trim()
    hit.i.updated_at = now()
    touch(hit.k, hit.c)
    return HttpResponse.json({ data: hit.i })
  }),

  // I3
  http.delete(`${base}/indikator/:id`, async ({ params }) => {
    await latency()
    const hit = findIndikator(String(params.id))
    if (!hit) return notFound('Indikator')
    const bad = guardDeleteIndikator(hit.k)
    if (bad) return refusal(bad)
    hit.c.indikator = hit.c.indikator.filter((i) => i.id !== hit.i.id)
    touch(hit.k, hit.c)
    return new HttpResponse(null, { status: 204 })
  }),
]

import { http, HttpResponse, delay } from 'msw'
import {
  FAIL_IDS,
  RACE_ID,
  institusi,
  jenjang,
  kelompok,
  programs,
  seedMateri,
  tipeList,
  type Materi,
  type Program,
  type ProgramValues,
} from '../-data/seed'
import { EDITABLE, type Alasan } from '../-logic/labels'

const base = '/api/cms-kurasi-assignment/v2'
const wait = () => delay(400 + Math.round(Math.random() * 400))

// In-memory state; resets on reload.
const store = new Map<string, Materi>(seedMateri().map((m) => [m.id, m]))

const PROGRAM_FIELDS = [
  'institusi_satker_id',
  'institusi_puskur_id',
  'institusi_kurator_media_id',
  'institusi_kurator_substansi_id',
  'kelompok_instrumen_media_id',
  'kelompok_instrumen_substansi_id',
  'proses_bisnis',
  'review',
] as const

const countMateri = (programId: string) => [...store.values()].filter((m) => m.program_id === programId).length

function pickValues(b: Record<string, any>) {
  const out: Record<string, string> = {}
  for (const k of PROGRAM_FIELDS) if (b[k]) out[k] = b[k]
  return out
}

/** RFC 4.1 rules shared by POST and PATCH; returns an error message or null. */
function validateValues(v: Record<string, any>, jenjangId: string, tipe: string): string | null {
  if (v.proses_bisnis === 'Kurasi' && v.review === 'Luar CMS') return 'Kurasi hanya dapat dilakukan Dalam CMS.'
  const okK = (id: string | undefined, jenis: 'Media' | 'Substansi') => {
    if (!id) return true
    const k = kelompok.find((x) => x.id === id)
    return !!k && k.jenis === jenis && k.jenjang_id === jenjangId && (k.tipe === null || k.tipe === tipe)
  }
  if (!okK(v.kelompok_instrumen_media_id, 'Media') || !okK(v.kelompok_instrumen_substansi_id, 'Substansi')) {
    return 'Kelompok instrumen tidak sesuai jenjang atau tipe materi.'
  }
  return null
}

// The "race" materi flips to Divalidasi the first time impact is read, so the
// terkunci path is reachable even though the list never lets you pick locked rows.
let raceFlipped = false
function maybeFlip(ids: string[]) {
  if (!raceFlipped && ids.includes(RACE_ID)) {
    raceFlipped = true
    const m = store.get(RACE_ID)
    if (m) m.status = 'Divalidasi'
  }
}

function lockOf(m: Materi): { alasan: Alasan; status?: string } | null {
  if (m.pernah_terbit) return { alasan: 'pernah_terbit' }
  if (!EDITABLE.includes(m.status)) return { alasan: 'status_terkunci', status: m.status }
  return null
}

export const handlers = [
  http.get(`${base}/materi`, async ({ request }) => {
    await wait()
    const u = new URL(request.url)
    const tab = u.searchParams.get('tab')
    const q = (u.searchParams.get('q') ?? '').toLowerCase()
    const limit = Number(u.searchParams.get('limit') ?? 20)
    const offset = Number(u.searchParams.get('offset') ?? 0)
    let rows = [...store.values()]
    if (tab === 'perlu') rows = rows.filter((m) => m.status === 'Penugasan Institusi')
    if (q) rows = rows.filter((m) => `${m.judul} ${m.mapel}`.toLowerCase().includes(q))
    return HttpResponse.json({ data: rows.slice(offset, offset + limit), total: rows.length })
  }),

  http.get(`${base}/jenjang`, async () => {
    await wait()
    return HttpResponse.json({ data: jenjang })
  }),

  http.get(`${base}/institusi`, async ({ request }) => {
    await wait()
    const q = (new URL(request.url).searchParams.get('q') ?? '').toLowerCase()
    return HttpResponse.json({ data: institusi.filter((i) => i.nama.toLowerCase().includes(q)) })
  }),

  http.get(`${base}/kelompok-instrumen`, async ({ request }) => {
    await wait()
    const p = new URL(request.url).searchParams
    const jenis = p.get('jenis_kurasi') ?? p.get('jenis')
    const j = p.get('jenjang_id')
    const t = p.get('tipe_materi')
    return HttpResponse.json({
      data: kelompok.filter(
        (k) => (!jenis || k.jenis === jenis) && (!j || k.jenjang_id === j) && (!t || k.tipe === null || k.tipe === t),
      ),
    })
  }),

  // E3
  http.get(`${base}/program`, async ({ request }) => {
    await wait()
    if (request.headers.get('x-simulate') === 'program-list-500') {
      return HttpResponse.json({ message: 'Gagal memuat daftar program.' }, { status: 500 })
    }
    const p = new URL(request.url).searchParams
    const j = p.get('jenjang_id')
    const t = p.get('tipe')
    const lengkap = p.get('lengkap')
    const q = (p.get('q') ?? '').trim().toLowerCase()
    const limit = Number(p.get('limit')) || 0
    const offset = Number(p.get('offset')) || 0
    const jOrder = jenjang.map((x) => x.id)
    const all = programs
      .filter(
        (x) =>
          (!j || x.jenjang_id === j) &&
          (!t || x.tipe_materi === t) &&
          (lengkap === null || String(x.lengkap) === lengkap) &&
          (!q || x.nama.toLowerCase().includes(q)),
      )
      .sort(
        (a, b) =>
          jOrder.indexOf(a.jenjang_id) - jOrder.indexOf(b.jenjang_id) ||
          tipeList.indexOf(a.tipe_materi) - tipeList.indexOf(b.tipe_materi) ||
          a.nama.localeCompare(b.nama),
      )
    return HttpResponse.json({ data: limit ? all.slice(offset, offset + limit) : all, total: all.length })
  }),

  // E5
  http.get(`${base}/program/:id`, async ({ params }) => {
    await wait()
    const pr = programs.find((x) => x.id === params.id)
    if (!pr) return HttpResponse.json({ message: 'Program tidak ditemukan.' }, { status: 404 })
    return HttpResponse.json({ data: { ...pr, jumlah_materi: countMateri(pr.id) } })
  }),

  // E4
  http.post(`${base}/program`, async ({ request }) => {
    await wait()
    const b = (await request.json()) as Record<string, any>
    const missing = [...PROGRAM_FIELDS, 'nama', 'jenjang_id', 'tipe_materi'].filter((k) => !String(b[k] ?? '').trim())
    if (missing.length) {
      return HttpResponse.json({ message: `Isian wajib belum lengkap: ${missing.join(', ')}.` }, { status: 400 })
    }
    const bad = validateValues(b, b.jenjang_id, b.tipe_materi)
    if (bad) return HttpResponse.json({ message: bad }, { status: 400 })
    const nama = String(b.nama).trim().slice(0, 100)
    const dup =
      request.headers.get('x-simulate') === 'program-409' ||
      programs.some(
        (x) =>
          x.jenjang_id === b.jenjang_id &&
          x.tipe_materi === b.tipe_materi &&
          x.nama.trim().toLowerCase() === nama.toLowerCase(),
      )
    if (dup) {
      return HttpResponse.json({ message: 'Nama sudah digunakan untuk jenjang dan tipe ini' }, { status: 409 })
    }
    const now = new Date().toISOString()
    const values = pickValues(b) as ProgramValues
    const created: Program = {
      id: `p-${Date.now().toString(36)}`,
      nama,
      jenjang_id: b.jenjang_id,
      tipe_materi: b.tipe_materi,
      is_legacy: false,
      lengkap: true,
      values,
      partial: { ...values },
      created_at: now,
      updated_at: now,
      updated_by: 'Admin Super',
    }
    programs.push(created)
    return HttpResponse.json({ data: created }, { status: 201 })
  }),

  // E6
  http.patch(`${base}/program/:id`, async ({ request, params }) => {
    await wait()
    const pr = programs.find((x) => x.id === params.id)
    if (!pr) return HttpResponse.json({ message: 'Program tidak ditemukan.' }, { status: 404 })
    const b = (await request.json()) as Record<string, any>
    if ('nama' in b || 'jenjang_id' in b || 'tipe_materi' in b) {
      return HttpResponse.json({ message: 'Nama, jenjang, dan tipe materi tidak dapat diubah.' }, { status: 400 })
    }
    const merged = { ...pr.partial, ...pickValues(b) } as Record<string, string>
    const filled = PROGRAM_FIELDS.filter((k) => merged[k])
    if (!pr.is_legacy && filled.length < PROGRAM_FIELDS.length) {
      const missing = PROGRAM_FIELDS.filter((k) => !merged[k])
      return HttpResponse.json({ message: `Isian wajib belum lengkap: ${missing.join(', ')}.` }, { status: 400 })
    }
    const bad = validateValues(merged, pr.jenjang_id, pr.tipe_materi)
    if (bad) return HttpResponse.json({ message: bad }, { status: 400 })
    pr.partial = merged as Partial<ProgramValues>
    if (filled.length === PROGRAM_FIELDS.length) {
      pr.values = { ...(merged as unknown as ProgramValues) }
      pr.is_legacy = false
      pr.lengkap = true
    }
    pr.updated_at = new Date().toISOString()
    pr.updated_by = 'Admin Super'
    return HttpResponse.json({ data: { ...pr, jumlah_materi: countMateri(pr.id) } })
  }),

  // E2
  http.get(`${base}/penugasan-kurasi/dampak`, async ({ request }) => {
    await wait()
    if (request.headers.get('x-simulate') === 'e2-error') {
      return HttpResponse.json({ message: 'Gagal memuat dampak.' }, { status: 500 })
    }
    const ids = (new URL(request.url).searchParams.get('materi_ids') ?? '').split(',').filter(Boolean)
    maybeFlip(ids)
    const terkunci: { materi_id: string; alasan: Alasan; status?: string }[] = []
    let dapat = 0
    let reset = 0
    let kurator = 0
    let diperiksa = 0
    let selesai = 0
    for (const id of ids) {
      const m = store.get(id)
      if (!m) {
        terkunci.push({ materi_id: id, alasan: 'materi_tidak_ditemukan' })
        continue
      }
      const lock = lockOf(m)
      if (lock) {
        terkunci.push({ materi_id: id, ...lock })
        continue
      }
      dapat++
      if (m.status === 'Penugasan Institusi') continue
      reset++
      for (const row of [m.media, m.substansi]) {
        if (row.kurator) kurator++
        if (row.status === 'Diperiksa') diperiksa++
        if (row.status === 'Lolos' || row.status === 'Ditolak') selesai++
      }
    }
    return HttpResponse.json({
      data: {
        jumlah_materi: ids.length,
        dapat_diubah: dapat,
        terkunci,
        akan_direset: reset,
        pekerjaan_hilang: {
          kurator_sudah_ditugaskan: kurator,
          kurasi_diperiksa: diperiksa,
          kurasi_lolos_atau_ditolak: selesai,
        },
      },
    })
  }),

  // E1
  http.post(`${base}/penugasan-kurasi`, async ({ request }) => {
    await wait()
    const sim = request.headers.get('x-simulate')
    if (sim === 'e1-403') {
      return HttpResponse.json({ message: 'Hanya Admin Super yang dapat menugaskan kurasi.' }, { status: 403 })
    }
    if (sim === 'e1-400') {
      return HttpResponse.json({ message: 'Institusi tidak dikenali.' }, { status: 400 })
    }
    const b = (await request.json()) as Record<string, any>
    const required = [
      'institusi_satker_id',
      'institusi_puskur_id',
      'institusi_kurator_media_id',
      'institusi_kurator_substansi_id',
      'kelompok_instrumen_media_id',
      'kelompok_instrumen_substansi_id',
      'proses_bisnis',
      'review',
    ]
    const missing = required.filter((k) => !b[k])
    if (missing.length) {
      return HttpResponse.json({ message: `Isian wajib belum lengkap: ${missing.join(', ')}.` }, { status: 400 })
    }
    if (b.proses_bisnis === 'Kurasi' && b.review === 'Luar CMS') {
      return HttpResponse.json({ message: 'Kurasi hanya dapat dilakukan Dalam CMS.' }, { status: 400 })
    }
    const ids = (b.materi_ids ?? []) as string[]
    if (ids.length < 1 || ids.length > 100) {
      return HttpResponse.json({ message: 'Jumlah materi harus 1 sampai 100.' }, { status: 400 })
    }
    maybeFlip(ids)

    const program = b.program_id ? programs.find((p) => p.id === b.program_id) : null
    const results = ids.map((id) => {
      const m = store.get(id)
      if (!m) return { materi_id: id, hasil: 'terkunci', alasan: 'materi_tidak_ditemukan' }
      const lock = lockOf(m)
      if (lock) return { materi_id: id, hasil: 'terkunci', ...lock }
      if (FAIL_IDS.has(id)) return { materi_id: id, hasil: 'gagal', alasan: 'kesalahan_server' }

      const pair = b.kelompok_per_tipe?.[m.tipe] as { media: string; substansi: string } | undefined
      const kMedia = pair?.media ?? (b.kelompok_per_tipe ? undefined : b.kelompok_instrumen_media_id)
      const kSub = pair?.substansi ?? (b.kelompok_per_tipe ? undefined : b.kelompok_instrumen_substansi_id)
      const okK = (kid: string | undefined, jenis: 'Media' | 'Substansi') => {
        const k = kelompok.find((x) => x.id === kid)
        return !!k && k.jenis === jenis && k.jenjang_id === m.jenjang_id && (k.tipe === null || k.tipe === m.tipe)
      }
      if (!okK(kMedia, 'Media') || !okK(kSub, 'Substansi')) {
        return { materi_id: id, hasil: 'gagal', alasan: 'kelompok_tidak_sesuai' }
      }
      if (b.program_id) {
        if (!program || program.is_legacy || program.jenjang_id !== m.jenjang_id || program.tipe_materi !== m.tipe) {
          return { materi_id: id, hasil: 'gagal', alasan: 'program_tidak_sesuai' }
        }
      }

      const next = {
        institusi_satker_id: b.institusi_satker_id,
        institusi_puskur_id: b.institusi_puskur_id,
        institusi_kurator_media_id: b.institusi_kurator_media_id,
        institusi_kurator_substansi_id: b.institusi_kurator_substansi_id,
        kelompok_instrumen_media_id: kMedia,
        kelompok_instrumen_substansi_id: kSub,
        proses_bisnis: b.proses_bisnis,
        review: b.review,
        program_id: b.program_id ?? null,
      } as Partial<Materi>
      const same = (Object.keys(next) as (keyof Materi)[]).every((k) => m[k] === next[k])
      if (same) return { materi_id: id, hasil: 'ok', berubah: false, status_baru: m.status, direset: false }

      const direset = m.status !== 'Penugasan Institusi'
      if (direset) {
        m.media = { status: 'Penugasan Kurator', kurator: null }
        m.substansi = { status: 'Penugasan Kurator', kurator: null }
      } else {
        m.media = { ...m.media, status: 'Penugasan Kurator' }
        m.substansi = { ...m.substansi, status: 'Penugasan Kurator' }
      }
      Object.assign(m, next)
      m.status = 'Penugasan Kurator'
      return { materi_id: id, hasil: 'ok', berubah: true, status_baru: m.status, direset }
    })
    return HttpResponse.json({ data: results })
  }),
]

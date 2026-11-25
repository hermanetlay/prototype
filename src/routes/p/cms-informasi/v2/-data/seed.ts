import { addDays, todayJakarta } from '../-logic/dates'

export const CDN_BASE = 'https://cdn.murid.belajar.id/informasi'

export const KATEGORI = [
  'Kebijakan',
  'Fitur',
  'Webinar',
  'Panduan',
  'Rekomendasi Materi',
  'Program dan Kegiatan',
  'Lainnya',
] as const
export const LAYANAN = ['Sumber Belajar', 'Latihan Soal', 'Kelas Belajar'] as const
export const STATUS_TAYANG = ['Tayang', 'Terjadwal', 'Berakhir', 'Inaktif'] as const

export type Kategori = (typeof KATEGORI)[number]
export type Layanan = (typeof LAYANAN)[number]
export type StatusTayang = (typeof STATUS_TAYANG)[number]
export type Editor = { nama: string; email: string }
export type Jenjang = { id: string; nama_singkat: string }

/** Row as the "database" holds it; the API adds jenjang objects and status_tayang. */
export type InformasiRecord = {
  id: string
  nama: string
  judul: string
  thumbnail: string
  kategori: Kategori
  layanan: Layanan[]
  jenjang_ids: string[]
  url: string
  tanggal_mulai: string
  tanggal_selesai: string
  pin_informasi: boolean
  homepage_order?: number
  status: 'Aktif' | 'Inaktif'
  created_by?: Editor
  updated_by?: Editor
  created_at: string
  updated_at: string
}

export const JENJANG: Jenjang[] = [
  { id: '8e77cb37-13da-4235-903b-4e46c47b99ba', nama_singkat: 'SD' },
  { id: '66c2e32e-fc65-4e7d-9daf-fedc7b67f0f5', nama_singkat: 'SMP' },
  { id: 'bb0a015d-ba30-46ea-bdf8-e0cc94c0800b', nama_singkat: 'SMA' },
  { id: '2f0c6a1e-5b7d-4c3a-9a51-7d1e0b8c4a10', nama_singkat: 'PAUD' },
  { id: '9c4d2b7a-31e8-4f6b-8d02-5a6e1f3b7c21', nama_singkat: 'SMK' },
  { id: 'd1a85e3c-72b4-4e09-b6f1-0c9a4d2e8b32', nama_singkat: 'SLB' },
]
const [SD, SMP, SMA, PAUD, SMK, SLB] = JENJANG.map((j) => j.id)

/** Token-equivalent colors for the SVG placeholder thumbnails (the only hex in the app). */
export const PLACEHOLDER_COLORS = [
  { bg: '#e1effe', fg: '#103178' },
  { bg: '#e3fdeb', fg: '#2e8a5c' },
  { bg: '#ffeece', fg: '#45474a' },
  { bg: '#fef4f4', fg: '#c82236' },
  { bg: '#efefef', fg: '#45474a' },
  { bg: '#4c8df6', fg: '#ffffff' },
]

export const BUDI: Editor = { nama: 'Budi Santoso', email: 'budi@contoh.id' }
export const SARI: Editor = { nama: 'Sari Dewi', email: 'sari@contoh.id' }

const SB: Layanan = 'Sumber Belajar'
const LS: Layanan = 'Latihan Soal'
const KB: Layanan = 'Kelas Belajar'

type Row = {
  nama: string
  judul: string
  kategori: Kategori
  layanan: Layanan[]
  jenjang: string[]
  mulai: number
  selesai: number
  pin?: boolean
  order?: number
  status?: 'Aktif' | 'Inaktif'
  by?: Editor // omitted = old sheet-synced row
}

const rows: Row[] = [
  // Tayang (5)
  { nama: 'webinar-literasi-numerasi', judul: 'Webinar Literasi Numerasi', kategori: 'Webinar', layanan: [SB], jenjang: [SD, SMP], mulai: -10, selesai: 20, pin: true, order: 1, by: BUDI },
  { nama: 'panduan-kurikulum-merdeka', judul: 'Panduan Kurikulum Merdeka untuk Guru', kategori: 'Panduan', layanan: [SB, LS], jenjang: [SD, SMP, SMA], mulai: -30, selesai: 60, order: 2, by: SARI },
  { nama: 'fitur-latihan-soal-adaptif', judul: 'Fitur Baru: Latihan Soal Adaptif', kategori: 'Fitur', layanan: [LS], jenjang: [SMP, SMA, SMK], mulai: -5, selesai: 40, order: 2, by: BUDI },
  { nama: 'rekomendasi-materi-hari-guru', judul: 'Rekomendasi Materi Hari Guru', kategori: 'Rekomendasi Materi', layanan: [SB, KB], jenjang: [SD, SMP, SMA, SMK, SLB, PAUD], mulai: -2, selesai: 9 },
  { nama: 'program-guru-penggerak', judul: 'Program Guru Penggerak Angkatan Baru', kategori: 'Program dan Kegiatan', layanan: [SB], jenjang: [SMA, SMK], mulai: -15, selesai: 2, by: SARI },
  // Terjadwal (3)
  { nama: 'webinar-asesmen-diagnostik', judul: 'Webinar Asesmen Diagnostik', kategori: 'Webinar', layanan: [SB, LS], jenjang: [SD], mulai: 5, selesai: 12, order: 3, by: BUDI },
  { nama: 'kebijakan-semester-genap', judul: 'Kebijakan Pembelajaran Semester Genap', kategori: 'Kebijakan', layanan: [SB], jenjang: [SD, SMP, SMA, SMK], mulai: 14, selesai: 90, by: SARI },
  { nama: 'fitur-bank-soal-paud', judul: 'Fitur Bank Soal untuk PAUD dan SLB', kategori: 'Fitur', layanan: [LS], jenjang: [PAUD, SLB], mulai: 3, selesai: 30, pin: true, by: BUDI },
  // Berakhir (3)
  { nama: 'webinar-evaluasi-semester', judul: 'Webinar Evaluasi Semester Ganjil', kategori: 'Webinar', layanan: [SB], jenjang: [SMP, SMA], mulai: -40, selesai: -1, by: BUDI },
  { nama: 'panduan-tahun-ajaran-baru', judul: 'Panduan Persiapan Tahun Ajaran Baru', kategori: 'Panduan', layanan: [SB, LS], jenjang: [SD, SMP], mulai: -60, selesai: -20, by: SARI },
  { nama: 'survei-kepuasan-pengguna', judul: 'Survei Kepuasan Pengguna', kategori: 'Lainnya', layanan: [SB, LS, KB], jenjang: [SD, SMP, SMA], mulai: -50, selesai: -7 },
  // Inaktif (3)
  { nama: 'kebijakan-penilaian-lama', judul: 'Kebijakan Penilaian Lama', kategori: 'Kebijakan', layanan: [SB], jenjang: [SMA], mulai: -20, selesai: 30, status: 'Inaktif', by: SARI },
  { nama: 'fitur-forum-guru', judul: 'Fitur Forum Diskusi Guru', kategori: 'Fitur', layanan: [SB], jenjang: [SD, SMP, SMA], mulai: 10, selesai: 40, status: 'Inaktif', by: BUDI },
  { nama: 'program-literasi-sekolah', judul: 'Program Gerakan Literasi Sekolah', kategori: 'Program dan Kegiatan', layanan: [SB, LS], jenjang: [SD, SMP], mulai: -10, selesai: 5, status: 'Inaktif', by: BUDI },
  { nama: 'panduan-kelas-belajar-guru', judul: 'Panduan Kelas Belajar untuk Guru', kategori: 'Panduan', layanan: [KB], jenjang: [SD, SMP], mulai: -3, selesai: 25, by: SARI },
]

/** Dates are relative to "today" at load, so all four statuses always exist. */
export function buildSeed(): InformasiRecord[] {
  const today = todayJakarta()
  const now = Date.now()
  return rows.map((r, i) => {
    const updated = new Date(now - (i + 1) * 7 * 3600_000).toISOString()
    return {
      id: `5e1d0000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`,
      nama: r.nama,
      judul: r.judul,
      thumbnail: `${CDN_BASE}/${r.nama}_seed${i + 1}.png`,
      kategori: r.kategori,
      layanan: r.layanan,
      jenjang_ids: r.jenjang,
      url: `https://murid.belajar.id/informasi/${r.nama}`,
      tanggal_mulai: addDays(today, r.mulai),
      tanggal_selesai: addDays(today, r.selesai),
      pin_informasi: r.pin ?? false,
      homepage_order: r.order,
      status: r.status ?? 'Aktif',
      created_by: r.by,
      updated_by: r.by,
      created_at: updated,
      updated_at: updated,
    }
  })
}

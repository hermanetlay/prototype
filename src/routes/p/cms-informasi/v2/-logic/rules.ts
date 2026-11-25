import { CDN_BASE, KATEGORI, LAYANAN } from '../-data/seed'

/** Form state. `homepage_order` stays a string so an empty field is representable. */
export type FormValues = {
  nama: string
  judul: string
  thumbnail: string
  kategori: string
  url: string
  layanan: string[]
  jenjang_ids: string[]
  tanggal_mulai: string
  tanggal_selesai: string
  pin_informasi: boolean
  homepage_order: string
  status: string
}
export type Errors = Partial<Record<keyof FormValues, string>>

export const MAX_UPLOAD = 2 * 1024 * 1024

const isHttpUrl = (s: string) => {
  try {
    const u = new URL(s)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}
const unique = (a: string[]) => new Set(a).size === a.length

/**
 * RFC 6.4 / 6.5 rules. Runs in the form (instant feedback) and again in the
 * MSW handler (400), so both paths show the same messages.
 */
export function validate(v: FormValues, today: string): Errors {
  const e: Errors = {}
  if (!v.nama.trim()) e.nama = 'Isi nama informasi.'
  else if (v.nama.length > 255) e.nama = 'Nama maksimal 255 karakter.'
  if (!v.judul.trim()) e.judul = 'Isi judul.'
  else if (v.judul.length > 255) e.judul = 'Judul maksimal 255 karakter.'

  if (!v.thumbnail) e.thumbnail = 'Unggah thumbnail.'
  else if (!v.thumbnail.startsWith(`${CDN_BASE}/`))
    e.thumbnail = 'Thumbnail harus berasal dari host CDN Murid.'

  if (v.layanan.length < 1) e.layanan = 'Pilih minimal 1 layanan.'
  else if (!unique(v.layanan) || v.layanan.some((l) => !(LAYANAN as readonly string[]).includes(l)))
    e.layanan = 'Layanan tidak valid.'
  if (v.jenjang_ids.length < 1) e.jenjang_ids = 'Pilih minimal 1 jenjang.'
  else if (!unique(v.jenjang_ids)) e.jenjang_ids = 'Jenjang tidak boleh duplikat.'

  if (!(KATEGORI as readonly string[]).includes(v.kategori)) e.kategori = 'Pilih kategori.'
  if (!v.url.trim()) e.url = 'Isi URL.'
  else if (!isHttpUrl(v.url.trim())) e.url = 'URL harus diawali http:// atau https://.'
  if (v.status !== 'Aktif' && v.status !== 'Inaktif') e.status = 'Pilih status.'

  if (!v.tanggal_mulai) e.tanggal_mulai = 'Isi tanggal mulai.'
  if (!v.tanggal_selesai) e.tanggal_selesai = 'Isi tanggal selesai.'
  else if (v.tanggal_mulai && v.tanggal_selesai < v.tanggal_mulai)
    e.tanggal_selesai = 'Tanggal selesai tidak boleh sebelum tanggal mulai.'
  else if (v.tanggal_selesai < today)
    e.tanggal_selesai = 'Tanggal selesai tidak boleh sebelum hari ini.'

  if (v.homepage_order.trim() !== '') {
    const n = Number(v.homepage_order)
    if (!Number.isInteger(n) || n < 1 || n > 32767)
      e.homepage_order = 'Urutan beranda harus bilangan bulat 1–32767.'
  }
  return e
}

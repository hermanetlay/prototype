import type { StatusTayang } from '../-data/seed'

/** Today as YYYY-MM-DD in Asia/Jakarta. */
export function todayJakarta(now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)
}

export function addDays(iso: string, days: number): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().slice(0, 10)
}

/** RFC 6.1: derived, never stored. ISO dates compare correctly as strings. */
export function statusTayang(
  r: { status: 'Aktif' | 'Inaktif'; tanggal_mulai: string; tanggal_selesai: string },
  today = todayJakarta(),
): StatusTayang {
  if (r.status === 'Inaktif') return 'Inaktif'
  if (r.tanggal_mulai > today) return 'Terjadwal'
  if (r.tanggal_selesai < today) return 'Berakhir'
  return 'Tayang'
}

const dateFmt = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  timeZone: 'UTC',
})
export const formatDate = (iso: string) => dateFmt.format(new Date(`${iso}T00:00:00Z`))
export const formatPeriode = (a: string, b: string) => `${formatDate(a)} – ${formatDate(b)}`

const dateTimeFmt = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
  timeZone: 'Asia/Jakarta',
})
export const formatDateTime = (iso: string) => dateTimeFmt.format(new Date(iso))

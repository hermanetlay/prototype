import type { Status } from '../-data/seed'

export type Alasan =
  | 'status_terkunci'
  | 'pernah_terbit'
  | 'materi_tidak_ditemukan'
  | 'kelompok_tidak_sesuai'
  | 'program_tidak_sesuai'
  | 'kesalahan_server'

export const alasanLabel: Record<Alasan, string> = {
  status_terkunci: 'Status materi tidak dapat diubah',
  pernah_terbit: 'Pernah terbit, tidak dapat diubah',
  materi_tidak_ditemukan: 'Materi tidak ditemukan',
  kelompok_tidak_sesuai: 'Kelompok instrumen tidak sesuai jenjang atau tipe materi',
  program_tidak_sesuai: 'Program tidak sesuai jenjang atau tipe materi',
  kesalahan_server: 'Terjadi kesalahan di server, coba lagi',
}

/** Display status for Admin Super (RFC 6 / brief). */
export function displayStatus(s: Status): { label: string; tone: 'neutral' | 'success' | 'critical' | 'warning' | 'informational' } {
  switch (s) {
    case 'Penugasan Institusi':
      return { label: 'Perlu Ditugaskan', tone: 'warning' }
    case 'Penugasan Kurator':
    case 'Diperiksa':
    case 'Perlu Perbaikan':
      return { label: 'Sedang Diperiksa', tone: 'informational' }
    case 'Divalidasi':
    case 'Perlu Perbaikan Akhir':
      return { label: 'Sedang Validasi', tone: 'informational' }
    case 'Terbit':
      return { label: 'Terbit', tone: 'success' }
    case 'Ditolak':
      return { label: 'Ditolak', tone: 'critical' }
    default:
      return { label: s, tone: 'neutral' }
  }
}

export const EDITABLE: Status[] = ['Penugasan Institusi', 'Penugasan Kurator', 'Diperiksa']

/** Why a row cannot be picked in the list, or null when it can. */
export function lockReason(m: { status: Status; pernah_terbit: boolean }): string | null {
  if (m.pernah_terbit) return 'Pernah terbit, tidak dapat diubah'
  if (m.status === 'Draf') return 'Status Draf tidak dapat diubah'
  if (!EDITABLE.includes(m.status)) return `Status ${m.status} tidak dapat diubah`
  return null
}

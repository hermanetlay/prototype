/**
 * Pure guard rules for Instrumen Kurasi. The MSW handlers call these; the form
 * also reuses the 400 checks so client and "server" show the same messages.
 * Every function returns a Refusal (status + message) or null when allowed.
 */
import type { KategoriRec, KelompokRec, ProgramRec } from '../-data/seed'

export type Refusal = { status: 400 | 409; message: string; field?: string }

export const MSG = {
  notReady: 'Kelompok belum siap dipakai: tambahkan minimal satu kategori dan satu indikator.',
  deactivateFirst: 'Nonaktifkan kelompok terlebih dahulu.',
  deleteKategoriFirst: 'Hapus semua kategori terlebih dahulu.',
} as const

const clean = (s: unknown) => (typeof s === 'string' ? s.trim() : '')
export const norm = (s: string) => s.trim().toLowerCase()
const refuse = (status: 400 | 409, message: string, field?: string): Refusal => ({ status, message, field })

export const indikatorCount = (k: KelompokRec) => k.kategori.reduce((n, c) => n + c.indikator.length, 0)
export const isReady = (k: KelompokRec) => k.kategori.length > 0 && indikatorCount(k) > 0

export const programsUsing = (id: string, programs: ProgramRec[]) =>
  programs.filter((p) => p.kelompok_ids.includes(id)).map((p) => p.nama)
const usedBy = (names: string[]) => `Dipakai oleh program: ${names.join(', ')}.`

// ---- 400: input validation ------------------------------------------------

export type KelompokInput = {
  nama?: unknown
  jenis_kurasi?: unknown
  tipe_materi?: unknown
  jenjang_ids?: unknown
}

export function validateKelompok(i: KelompokInput): Refusal | null {
  const nama = clean(i.nama)
  if (!nama) return refuse(400, 'Nama wajib diisi.', 'nama')
  if (nama.length > 255) return refuse(400, 'Nama maksimal 255 karakter.', 'nama')
  if (i.jenis_kurasi !== 'Media' && i.jenis_kurasi !== 'Substansi')
    return refuse(400, 'Jenis kurasi wajib dipilih.', 'jenis_kurasi')
  if (!Array.isArray(i.jenjang_ids) || i.jenjang_ids.length === 0)
    return refuse(400, 'Pilih minimal satu jenjang.', 'jenjang_ids')
  return null
}

export function validateNama(nama: unknown): Refusal | null {
  const v = clean(nama)
  if (!v) return refuse(400, 'Nama wajib diisi.', 'nama')
  if (v.length > 255) return refuse(400, 'Nama maksimal 255 karakter.', 'nama')
  return null
}

export function validateIndikator(i: { nama_indikator?: unknown; negasi_indikator?: unknown }): Refusal | null {
  const a = clean(i.nama_indikator)
  const b = clean(i.negasi_indikator)
  if (!a) return refuse(400, 'Indikator wajib diisi.', 'nama_indikator')
  if (a.length > 2000) return refuse(400, 'Indikator maksimal 2000 karakter.', 'nama_indikator')
  if (!b) return refuse(400, 'Negasi wajib diisi.', 'negasi_indikator')
  if (b.length > 2000) return refuse(400, 'Negasi maksimal 2000 karakter.', 'negasi_indikator')
  return null
}

// ---- 409: duplicates ------------------------------------------------------

/** `current` is the existing name when renaming: an unchanged name is never refused. */
export function guardDuplicateKelompok(
  nama: string,
  all: KelompokRec[],
  selfId?: string,
): Refusal | null {
  const hit = all.find((k) => k.id !== selfId && norm(k.nama) === norm(nama))
  if (!hit) return null
  return refuse(
    409,
    hit.status === 'inactive'
      ? 'Nama sudah dipakai kelompok nonaktif. Aktifkan kembali kelompok itu.'
      : 'Nama sudah dipakai kelompok lain.',
    'nama',
  )
}

export function guardDuplicateKategori(nama: string, siblings: KategoriRec[], selfId?: string): Refusal | null {
  const dup = siblings.some((c) => c.id !== selfId && norm(c.nama) === norm(nama))
  return dup ? refuse(409, 'Nama kategori sudah ada di kelompok ini.', 'nama') : null
}

export function guardDuplicateIndikator(text: string, kat: KategoriRec, selfId?: string): Refusal | null {
  const dup = kat.indikator.some((i) => i.id !== selfId && norm(i.nama_indikator) === norm(text))
  return dup ? refuse(409, 'Indikator sudah ada di kategori ini.', 'nama_indikator') : null
}

// ---- 409: status and structure -------------------------------------------

/** 1. Activation guard. */
export function guardActivate(k: KelompokRec): Refusal | null {
  return isReady(k) ? null : refuse(409, MSG.notReady)
}

/** 2a. Keep-active-usable: the last indikator of an active kelompok. */
export function guardDeleteIndikator(k: KelompokRec): Refusal | null {
  return k.status === 'active' && indikatorCount(k) <= 1 ? refuse(409, MSG.deactivateFirst) : null
}

/** 2b. Keep-active-usable: the last kategori that holds indikator. */
export function guardDeleteKategori(k: KelompokRec, kategoriId: string): Refusal | null {
  if (k.status !== 'active') return null
  const rest = k.kategori.filter((c) => c.id !== kategoriId).reduce((n, c) => n + c.indikator.length, 0)
  return rest === 0 ? refuse(409, MSG.deactivateFirst) : null
}

/** 3. Delete guard (the UI only offers delete on an empty kelompok). */
export function guardDeleteKelompok(k: KelompokRec, programs: ProgramRec[]): Refusal | null {
  if (k.kategori.length > 0) return refuse(409, MSG.deleteKategoriFirst)
  const used = programsUsing(k.id, programs)
  if (used.length) return refuse(409, `${usedBy(used)} Nonaktifkan saja.`)
  return null
}

/** 4. Program-reference edit guard. */
export function guardProgramEdit(
  k: KelompokRec,
  next: { jenis_kurasi: string; tipe_materi: string | null; jenjang_ids: string[] },
  programs: ProgramRec[],
): Refusal | null {
  const used = programsUsing(k.id, programs)
  if (!used.length) return null
  const removedJenjang = k.jenjang_ids.some((id) => !next.jenjang_ids.includes(id))
  if (next.jenis_kurasi !== k.jenis_kurasi || next.tipe_materi !== k.tipe_materi || removedJenjang)
    return refuse(409, usedBy(used))
  return null
}

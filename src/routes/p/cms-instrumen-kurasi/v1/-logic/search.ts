import { JENIS_KURASI, TIPE_MATERI } from '../-data/seed'
import type { JenisKurasi, TipeMateri } from '../-data/seed'

export type Variant = 'halaman' | 'panel' | 'tabel'
export const VARIANTS: Variant[] = ['halaman', 'panel', 'tabel']

export const PAGE_SIZES = [10, 20, 50] as const

export type Search = {
  variant: Variant
  q?: string
  jenis_kurasi?: JenisKurasi
  tipe_materi?: TipeMateri
  jenjang_id?: string
  status?: 'active' | 'inactive'
  limit: 10 | 20 | 50
  page?: number
  /** `new` or a kelompok id: opens the form modal. */
  form?: string
  /** Panel variant: `k:<id>`, `i:<id>`, `new-k` or `new-i:<kategoriId>`. */
  sel?: string
  /** `error` makes the list endpoint return 500. */
  simulasi?: 'error'
}

const str = (v: unknown) =>
  (typeof v === 'string' || typeof v === 'number') && String(v) !== '' ? String(v) : undefined
const oneOf = <T extends string>(list: readonly T[], v: unknown) =>
  typeof v === 'string' && (list as readonly string[]).includes(v) ? (v as T) : undefined

export function parseSearch(raw: Record<string, unknown>): Search {
  const page = Number(raw.page)
  const limit = Number(raw.limit)
  return {
    variant: oneOf(VARIANTS, raw.variant) ?? 'halaman',
    q: str(raw.q),
    jenis_kurasi: oneOf(JENIS_KURASI, raw.jenis_kurasi),
    tipe_materi: oneOf(TIPE_MATERI, raw.tipe_materi),
    jenjang_id: str(raw.jenjang_id),
    status: oneOf(['active', 'inactive'] as const, raw.status),
    limit: (PAGE_SIZES as readonly number[]).includes(limit) ? (limit as 10 | 20 | 50) : 10,
    page: Number.isInteger(page) && page > 1 ? page : undefined,
    form: str(raw.form),
    sel: str(raw.sel),
    simulasi: raw.simulasi === 'error' ? 'error' : undefined,
  }
}

export const FILTER_KEYS = ['q', 'jenis_kurasi', 'tipe_materi', 'jenjang_id', 'status'] as const
export const hasFilters = (s: Search) => FILTER_KEYS.some((k) => s[k] !== undefined)

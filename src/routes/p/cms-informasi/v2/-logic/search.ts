import { KATEGORI, LAYANAN, STATUS_TAYANG } from '../-data/seed'
import type { Kategori, Layanan, StatusTayang } from '../-data/seed'

export type Search = {
  q?: string
  kategori?: Kategori
  layanan?: Layanan
  jenjang_id?: string
  status_tayang?: StatusTayang
  homepage?: true
  page?: number
  /** `new` or an informasi id: opens the form (full-page form). */
  form?: string
  /** `error` makes the list endpoints return 500. */
  simulasi?: 'error'
}

const str = (v: unknown) =>
  (typeof v === 'string' || typeof v === 'number') && String(v) !== '' ? String(v) : undefined
const oneOf = <T extends string>(list: readonly T[], v: unknown) =>
  typeof v === 'string' && (list as readonly string[]).includes(v) ? (v as T) : undefined

export function parseSearch(raw: Record<string, unknown>): Search {
  const page = Number(raw.page)
  return {
    q: str(raw.q),
    kategori: oneOf(KATEGORI, raw.kategori),
    layanan: oneOf(LAYANAN, raw.layanan),
    jenjang_id: str(raw.jenjang_id),
    status_tayang: oneOf(STATUS_TAYANG, raw.status_tayang),
    homepage: raw.homepage === true || raw.homepage === 'true' ? true : undefined,
    page: Number.isInteger(page) && page > 1 ? page : undefined,
    form: str(raw.form),
    simulasi: raw.simulasi === 'error' ? 'error' : undefined,
  }
}

export type SetSearch = (patch: Partial<Search>) => void
export type VariantProps = { search: Search; setSearch: SetSearch }

export const FILTER_KEYS = ['q', 'kategori', 'layanan', 'jenjang_id', 'status_tayang', 'homepage'] as const
export const hasFilters = (s: Search) => FILTER_KEYS.some((k) => s[k] !== undefined)

/**
 * Auto-discovered catalogue of prototypes.
 *
 * Every initiative version owns a `-meta.ts` next to its routes:
 *   src/routes/p/<initiative>/<version>/-meta.ts
 * No central list to keep in sync — drop the folder in and it appears on `/`.
 */
export type PrototypeStatus = 'draft' | 'review' | 'shipped' | 'archived'

export type PrototypeMeta = {
  /** Human title of the initiative, e.g. "Persetujuan Materi". */
  title: string
  /** One line: what question this prototype answers. */
  summary: string
  status: PrototypeStatus
  /** ISO date, e.g. "2026-09-10". */
  updated: string
  owners?: string[]
  /** What changed relative to the previous version of this initiative. */
  changes?: string
  /** Path under the version root, if the entry screen is not the index. */
  entry?: string
}

export type PrototypeEntry = PrototypeMeta & {
  initiative: string
  version: string
  path: string
}

const modules = import.meta.glob<{ meta: PrototypeMeta }>(
  '/src/routes/p/*/*/-meta.ts',
  { eager: true },
)

export const prototypes: PrototypeEntry[] = Object.entries(modules)
  .map(([file, mod]) => {
    const [, initiative, version] =
      /^\/src\/routes\/p\/([^/]+)\/([^/]+)\/-meta\.ts$/.exec(file) ?? []
    return {
      ...mod.meta,
      initiative: initiative!,
      version: version!,
      path: `/p/${initiative}/${version}${mod.meta.entry ?? ''}`,
    }
  })
  .sort(
    (a, b) =>
      a.initiative.localeCompare(b.initiative) || b.version.localeCompare(a.version),
  )

export function versionsOf(initiative: string) {
  return prototypes.filter((p) => p.initiative === initiative)
}

export const initiatives = [...new Set(prototypes.map((p) => p.initiative))]

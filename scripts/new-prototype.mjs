#!/usr/bin/env node
/**
 * Scaffold a new initiative, or a new version of an existing one.
 *
 *   pnpm new cms-user-management v2
 *
 * Creates src/routes/p/<initiative>/<version>/ with meta, CONTEXT, a mock API
 * and an index page, plus the initiative-level CONTEXT.md if it is missing. Nothing else needs registering — the catalogue at `/` and
 * the MSW worker both discover the folder by glob.
 */
import { mkdir, writeFile, access } from 'node:fs/promises'
import { join } from 'node:path'

const [initiative, version = 'v1'] = process.argv.slice(2)

if (!initiative || !/^[a-z0-9-]+$/.test(initiative)) {
  console.error('usage: pnpm new <initiative-slug> [version]   (slug: a-z 0-9 -)')
  process.exit(1)
}
if (!/^v\d+$/.test(version)) {
  console.error(`version must look like v1, v2 — got "${version}"`)
  process.exit(1)
}

const root = join('src/routes/p', initiative, version)
const base = `/p/${initiative}/${version}`
const today = new Date().toISOString().slice(0, 10)
const title = initiative.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())

try {
  await access(root)
  console.error(`${root} already exists — pick another version.`)
  process.exit(1)
} catch {}

const files = {
  '-meta.ts': `import type { PrototypeMeta } from '@/shared/lib/registry'

export const meta: PrototypeMeta = {
  title: '${title}',
  summary: 'TODO: satu kalimat — pertanyaan apa yang dijawab prototype ini.',
  status: 'draft',
  updated: '${today}',
  owners: [],
  changes: '${version === 'v1' ? 'Versi awal.' : 'TODO: apa yang berubah dari versi sebelumnya.'}',
}
`,
  'CONTEXT.md': `# ${title} — ${version}

**Question this prototype answers:** TODO

## Scope
- TODO

## Decisions
- TODO

## Open questions
- TODO

## Mock API
\`/api/${initiative}/${version}/*\`, defined in \`-api/handlers.ts\`.
`,
  '-api/handlers.ts': `import { http, HttpResponse, delay } from 'msw'

const base = '/api/${initiative}/${version}'

export const handlers = [
  http.get(\`\${base}/ping\`, async () => {
    await delay(200)
    return HttpResponse.json({ ok: true })
  }),
]
`,
  'route.tsx': `import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppShell } from '@/shared/layout/AppShell'
import { meta } from './-meta'

const root = '${base}'

export const Route = createFileRoute('${base}')({
  component: Layout,
})

function Layout() {
  return (
    <AppShell
      product="Ruang Murid CMS"
      nav={[{ label: 'Beranda', to: root, exact: true }]}
      breadcrumb="Prototype · ${initiative} · ${version}"
      title={meta.title}
      subtitle={meta.summary}
    >
      <Outlet />
    </AppShell>
  )
}
`,
  'index.tsx': `import { createFileRoute } from '@tanstack/react-router'
import { Card, CardHeader, CardBody } from '@/shared/ui/Card'

export const Route = createFileRoute('${base}/')({
  component: Page,
})

function Page() {
  return (
    <Card>
      <CardHeader title="Mulai di sini" subtitle="Ganti isi kartu ini." />
      <CardBody>TODO</CardBody>
    </Card>
  )
}
`,
}

// Initiative-level context, written once — the first version creates it.
const initiativeContext = join('src/routes/p', initiative, 'CONTEXT.md')
try {
  await access(initiativeContext)
} catch {
  await mkdir(join('src/routes/p', initiative), { recursive: true })
  await writeFile(
    initiativeContext,
    `# ${title}

Initiative-level context. Applies to every version; each version's own
\`CONTEXT.md\` records what that iteration tried and decided.

## Problem
TODO

## Glossary
| Term (UI) | Meaning |
|---|---|
| TODO | TODO |

## Business rules
1. TODO

## Versions
| Version | Status | Date | What it explores |
|---|---|---|---|
| [${version}](${version}/CONTEXT.md) | draft | ${today} | TODO |

## Decision log
| Date | Decision | Why |
|---|---|---|

## Open questions
- TODO
`,
  )
  console.log('created', initiativeContext)
}

for (const [name, content] of Object.entries(files)) {
  const path = join(root, name)
  await mkdir(join(path, '..'), { recursive: true })
  await writeFile(path, content)
  console.log('created', path)
}

console.log(`\nRun \`pnpm dev\` and open http://localhost:5173${base}`)

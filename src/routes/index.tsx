import { createFileRoute, Link } from '@tanstack/react-router'
import { prototypes, initiatives, versionsOf } from '@/shared/lib/registry'
import { Badge } from '@/shared/ui/Badge'
import { Card } from '@/shared/ui/Card'

export const Route = createFileRoute('/')({
  component: Catalog,
})

const tone = {
  draft: 'neutral',
  review: 'informational',
  shipped: 'success',
  archived: 'warning',
} as const

function Catalog() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16">
      <h1 className="text-display-md font-semibold">Prototypes</h1>
      <p className="mt-1 text-body text-text-subdued">
        {prototypes.length} prototype{prototypes.length === 1 ? '' : 's'} across{' '}
        {initiatives.length} initiative{initiatives.length === 1 ? '' : 's'}. Each
        initiative lives at <code>/p/&lt;initiative&gt;/&lt;version&gt;</code>.
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {initiatives.map((initiative) => (
          <section key={initiative}>
            <h2 className="mb-2 text-subheading font-semibold uppercase tracking-wide text-text-subdued">
              {initiative}
            </h2>
            <Card className="divide-y divide-border">
              {versionsOf(initiative).map((p) => (
                <Link
                  key={p.path}
                  to={p.path as never}
                  className="flex items-start gap-4 p-4 hover:bg-surface-hovered"
                >
                  <span className="mt-0.5 w-10 shrink-0 text-body-sm font-semibold text-interactive">
                    {p.version}
                  </span>
                  <span className="flex-1">
                    <span className="flex items-center gap-2">
                      <span className="text-body-sm font-semibold">{p.title}</span>
                      <Badge tone={tone[p.status]}>{p.status}</Badge>
                    </span>
                    <span className="mt-1 block text-body-sm text-text-subdued">
                      {p.summary}
                    </span>
                    {p.changes ? (
                      <span className="mt-1 block text-helper text-text-subdued">
                        Δ {p.changes}
                      </span>
                    ) : null}
                  </span>
                  <span className="text-helper text-text-subdued">{p.updated}</span>
                </Link>
              ))}
            </Card>
          </section>
        ))}
      </div>
    </div>
  )
}

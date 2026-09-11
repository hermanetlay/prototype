import type { ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import { cn } from '@/shared/lib/cn'

export type NavItem = { label: string; to: string; exact?: boolean }

/**
 * The Ruang Murid CMS chrome from DESIGN.md: fixed 56px header, navy 256px
 * sidebar, white toolbar, gray canvas. Initiatives wrap their pages in this.
 */
export function AppShell({
  product,
  nav,
  breadcrumb,
  title,
  subtitle,
  actions,
  children,
}: {
  product: string
  nav: NavItem[]
  breadcrumb?: ReactNode
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="min-h-full">
      <header className="fixed inset-x-0 top-0 z-50 flex h-header items-center justify-between border-b border-border bg-surface px-4">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-body-sm font-semibold text-text-subdued hover:text-text">
            ← Prototypes
          </Link>
          <span className="h-5 w-px bg-border" />
          <span className="text-body-sm font-semibold">{product}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-helper text-text-subdued">SMA Negeri 1 Jakarta</span>
          <span className="h-5 w-px bg-border" />
          <span className="flex size-8 items-center justify-center rounded-full bg-blue-5 text-helper font-semibold text-interactive">
            BS
          </span>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 z-40 w-sidebar bg-sidebar pt-header">
        <nav className="flex flex-col gap-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.to}
              to={item.to as never}
              activeOptions={{ exact: item.exact ?? false }}
              className="rounded-md p-2 text-body-sm text-text-inverse hover:bg-white/10"
              activeProps={{ className: 'bg-white/10 font-semibold' }}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="pt-header pl-sidebar">
        <div className="border-b-2 border-border bg-surface px-8 py-8">
          {breadcrumb ? (
            <div className="mb-2 text-helper text-text-subdued">{breadcrumb}</div>
          ) : null}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-display-md font-semibold">{title}</h1>
              {subtitle ? (
                <p className="mt-1 text-body text-text-subdued">{subtitle}</p>
              ) : null}
            </div>
            {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
          </div>
        </div>
        <main className={cn('bg-background p-6')}>
          <div className="flex flex-col gap-4">{children}</div>
        </main>
      </div>
    </div>
  )
}

import { Badge } from '@/shared/ui/Badge'
import type { Status } from '../-data/seed'
import { displayStatus } from '../-logic/labels'

export function StatusBadge({ status }: { status: Status }) {
  const d = displayStatus(status)
  return (
    <div className="flex flex-col items-start gap-1">
      <Badge tone={d.tone}>{d.label}</Badge>
      <span className="text-helper text-text-subdued">{status}</span>
    </div>
  )
}

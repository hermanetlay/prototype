import type { Materi } from '../-data/seed'
import type { AssignResult } from '../-queries'

export type DialogProps = {
  materi: Materi[]
  onClose: () => void
  onApplied: (r: AssignResult[]) => void
}

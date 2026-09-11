# Persetujuan Materi — v1

**Question this prototype answers:** can a reviewer clear the approval queue
without leaving the list, and is a free-text note enough of a rejection reason?

## Scope
- Queue filtered by status (menunggu / disetujui / ditolak / semua).
- Detail screen with approve + reject, note required on reject.

## Decisions
- Filter state lives in the URL (`?status=`) so a review session is shareable.
- Decisions are optimistic-free: mutate, invalidate, navigate back to the queue.

## Open questions
- Should reject require a structured reason code instead of free text?
- Bulk approve for a whole subject at once?

## Mock API
`/api/persetujuan-materi/v1/*`, defined in `-api/handlers.ts`, backed by an
in-memory map seeded from `-data/materi.ts`. State resets on reload.

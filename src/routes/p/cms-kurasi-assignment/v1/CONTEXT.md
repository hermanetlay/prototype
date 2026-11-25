# Penugasan Kurasi Massal — v1

## Outcome (2026-11-25)

**Variant `review` is chosen.** It is the direction for the bulk assign dialog: eligibility table from E2, values,
per-materi before/after confirm, then Hasil. `review` is now the default (`?variant=wizard|panel` still opens the
others). `wizard` and `panel` stay in this version as the record of what was compared.

The version is frozen (`status: 'review'`). Further changes go into `v2`, which starts from `review` only.
The open questions below are still open and go to the BE and the RFC owner.

**Question this prototype answers:** Does the `AssignKurasiDialog` flow work for Admin Super doing a bulk
assignment? Can the admin tell what will be locked and what will be discarded before confirming?

RFC: `murid-command-center/docs/rfc/admin-super-kurasi-assignment-and-program.md` (sections 5, 6, 7.2, 7.3).
Initiative context: [../CONTEXT.md](../CONTEXT.md).

## URL
`/p/cms-kurasi-assignment/v1?variant=review|wizard|panel&tab=semua|perlu` (default `review`)

## Scope
- Host page: mock "Kelola Materi" list in AppShell, tabs, search, checkboxes, **Tugaskan Kurasi**. Rows beyond
  `Diperiksa`, `Draf` or `pernah_terbit` are not selectable (tooltip gives the reason).
- Three structurally different dialogs over the same form logic (`-logic/useAssignForm.ts`):
  - `wizard`: Jenjang, Program, Nilai, Dampak, Hasil (E2 on step 4).
  - `panel`: one wide dialog, form left, live Dampak panel right (E2 on open, client-side warnings update live),
    type-to-confirm inline, Hasil replaces the content.
  - `review`: eligibility table (from E2), values, per-materi before/after confirm, Hasil.
- States: E2 loading/error/retry, E1 400 alert, E1 403, partial failure that never auto-closes.
- Switcher toggles: simulate E2 error, E1 403, E1 400.

## Decisions
- Program prefills all values; editing marks the field "diubah dari program".
- Mixed tipe disables the program step; kelompok is chosen once per tipe.
- Type-to-confirm requires typing `akan_direset` (materi whose work is discarded).
- One seeded materi (`m-05`) always returns `gagal / kesalahan_server`; `m-32` is listed as Diperiksa but turns
  Divalidasi on the first E2 call (race), so `terkunci` is reachable.
- Choosing a jenjang in a mixed-jenjang selection makes other-jenjang materi return `gagal / kelompok_tidak_sesuai`
  (server checks kelompok before program).

## Assumptions beyond the brief
- E1 body gains `kelompok_per_tipe` for mixed tipe (RFC 6.1 has one pair). Needs a BE decision.
- Selection is cleared only for materi that came back `ok`; the list is fetched in one page (limit 50).
- "Tidak berubah" is reachable by re-assigning identical values to an already-assigned materi.

## Open questions
- Should E1 accept a kelompok pair per tipe, or should mixed tipe be blocked?
- Is typing `akan_direset` or `dapat_diubah` the clearer confirmation number?
- Is the panel's E2 (ids only) enough, or should impact depend on chosen values?

## What to watch in review
- Do admins notice the amber block before confirming? Is "saat ini" understood?
- In `review`, is the before/after table too dense for 40 rows?
- Does a mixed-jenjang selection feel safe, or should it be blocked up front?

## Mock API
`/api/cms-kurasi-assignment/v1/*`, defined in `-api/handlers.ts` (shapes are proposals from RFC 6, not a BE spec):
`GET materi`, `GET penugasan-kurasi/dampak`, `POST penugasan-kurasi`, `GET program`, `GET institusi`,
`GET kelompok-instrumen`, `GET jenjang`. State is in memory and resets on reload.

## Program picker: combobox (iteration on draft)
- Program selection in all three variants is now one shared searchable combobox (`-components/ProgramCombobox.tsx`)
  instead of cards/select, because one jenjang+tipe may have many programs (seed now has 12 complete SD Modul Ajar).
- Type to filter by name (case-insensitive, 250ms debounce) via `GET /program?jenjang_id&tipe&lengkap=true&q=`;
  the handler caps at 20 and returns `total`; "Ketik untuk mempersempit" shows when more exist.
- Arrow keys, Enter, Escape; clear button; "Tanpa program" is the first option; empty text "Program tidak ditemukan".
- Mixed-tipe disabled alert, prefill and "diubah dari program" marking are unchanged. Selected value shows name plus
  a probis/review summary line. Legacy programs stay hidden (not lengkap).
- Assumption: `limit` and `total` in the program response are prototype-only proposals for the BE.


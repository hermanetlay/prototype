# Instrumen Kurasi — v1

Initiative context: [../CONTEXT.md](../CONTEXT.md). RFC:
`murid-command-center/docs/rfc/cms-instrumen-kurasi-crud.md`.

## Outcome (2026-11-25)

**Variant `halaman` is chosen.** It is the layout the RFC describes: a header with Aktifkan / Nonaktifkan, then an
accordion of kategori that lazy-loads its indikator, with dialogs for add, edit and delete. It is already the default.
`panel` and `tabel` stay in this version as the record of what was compared and will not be built.

The version is frozen (`status: 'review'`). Further changes go into `v2`, which starts from `halaman` only.

**Question this prototype answers:** Can Admin Super manage a kelompok instrumen
with its kategori and indikator, and do the guard rules make sense (the 409
refusals and the blocked or disabled actions)? Which of three structurally
different detail layouts works best?

## Scope
Route `/p/cms-instrumen-kurasi/v1`, variant in `?variant=halaman|panel|tabel`
(default `halaman`). The list page, data, MSW endpoints and guard behaviour are
identical; only the detail screen (`/p/cms-instrumen-kurasi/v1/<id>`) differs.

### Variants
- **halaman.** The RFC layout. Header with the Aktifkan / Nonaktifkan button, then an accordion of kategori. Each kategori lazy-loads its indikator when opened. Indikator and kategori are added or edited in dialogs (indikator: two text areas).
- **panel.** Split view. Left: tree of kategori and indikator, with the status button. Right: inline editor for the selected node (`?sel=k:<id>|i:<id>|new-k|new-i:<kategoriId>`). No dialogs; deletes confirm inline.
- **tabel.** One flat table of indikator with kategori header rows and row actions, under a sticky status bar ("Siap dipakai / Belum siap", counts, Aktifkan / Nonaktifkan).

### Other URL state
List filters `q`, `jenis_kurasi`, `tipe_materi`, `jenjang_id`, `status`, `limit` (10/20/50), `page`; `form=new|<id>` opens the create/edit modal on any page; `simulasi=error` makes the list endpoint return 500 (toggle in the switcher). Arrow keys also change variant.

## Guards implemented (`-logic/guards.ts`, called by `-api/handlers.ts`)
1. Activation needs >= 1 kategori and >= 1 indikator (409).
2. Active kelompok: cannot delete its last indikator, or the last kategori holding indikator (409 "Nonaktifkan kelompok terlebih dahulu.").
3. Delete kelompok: 409 if it has kategori, 409 if used by programs. The Hapus button is disabled (with the reason) unless the kelompok has no kategori.
4. Kelompok used by a program cannot change jenis kurasi, tipe materi or lose a jenjang (409).
5. Duplicate `lower(trim(nama))` refused for kelompok (message differs if the match is inactive), kategori within a kelompok, indikator within a kategori. Unchanged names on edit are not re-checked, so seeded duplicates stay editable.
400: empty or over-long fields, empty jenjang. The form runs the same 400 checks client-side.

## Try these seeds
- `Instrumen Media Gim Edukasi SD` (active, one indikator): delete it or its kategori to hit guard 2.
- `Instrumen Media Lab Maya SMK` (inactive, no indikator): Aktifkan to hit guard 1.
- `Instrumen Substansi Literasi SMP (draf)`: empty but used by a program; Hapus hits guard 3. `Instrumen Media Video SD` / `Instrumen Substansi SMP`: change jenis, tipe or jenjang to hit guard 4.
- `Instrumen Substansi Lama`: no jenjang ("Tanpa jenjang"). `Instrumen Media Teks SD`: two kategori named "Kebahasaan".
- `Instrumen Substansi Interaktif SD (draf)`: empty, deletable.

## Decisions
- Panel `sel`, form and list filters live in the URL so a review session can be pasted into Slack.
- State is in memory in the handlers module: edits persist until reload.
- Banner "Perubahan hanya berlaku untuk penugasan berikutnya." shows on the detail and the edit form of an active kelompok.

## Assumptions the brief did not cover
- Create goes to the new kelompok's detail page after saving. Edit stays on the current page.
- The programs table is seed only (`Program Pemerkayaan SD`, `Program Literasi SMP`); there is no endpoint for it.
- An extra empty, program-linked kelompok was seeded so guard 3 (programs) is reachable through the UI, since Hapus is only offered on empty kelompok.
- Writes to kategori or indikator also bump the parent kelompok's `updated_at`.
- Indikator numbering is by position only; no reordering.
- Back link from detail returns to the list without filters.
- Not visually verified in a browser: the embedded browser could not register the MSW service worker.

## Open questions
- Is a disabled Hapus with a reason clearer than hiding it?
- Should deleting the last indikator of an active kelompok offer "Nonaktifkan lalu hapus" instead of only refusing?
- Do reviewers prefer lazy accordion loading (halaman) or seeing everything at once (panel, tabel)?

## What to watch for in review
- Can a reviewer tell from the screen alone why an action was refused, and what to do next?
- panel: does the inline editor make editing many indikator faster than dialogs?
- tabel: is the sticky status bar enough, or does Aktifkan get lost for long kelompok?
- Is "Belum siap" visible enough on the list and detail?

## Mock API
`/api/cms-instrumen-kurasi/v1/*`, defined in `-api/handlers.ts` (K1 to K5, C1 to C4, I1 to I3, plus `GET jenjang`).

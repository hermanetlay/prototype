# CMS Informasi — v1

Initiative context: [../CONTEXT.md](../CONTEXT.md). RFC:
`learning-platform-be/doc/RFC_CMS_INFORMASI.md`.

**Question this prototype answers:** How should an `admin_super` find, create,
edit and delete informasi in the CMS, and can they make sense of the derived
status tayang, the homepage order (duplicates allowed) and the rule that
"tanggal selesai >= hari ini" applies to every create and update?

## Outcome (2026-11-17)

**Variant A, "Tabel + halaman form", is chosen.** It is the direction for the CMS
Informasi pages, and it matches the existing CMS pattern (Sumber Belajar).

**Why A:** it has the correct heading at the top of the filter. The card title
("Daftar Informasi" with its subtitle and the "Tambah Informasi" action) sits
above the filters, so the page reads heading → filter → table.

B and C stay in this version as the record of what was compared. Confirmed final on 2026-11-25.

The version is frozen (`status: 'review'`). Further changes go into `v2`, which
starts from variant A only.

## Scope
Route `/p/cms-informasi/v1`, variant in `?variant=A|B|C` (default A). All three
cover list + filters, create, edit, delete with confirmation, thumbnail upload
and the error cases. Out of scope: login/roles, real upload, the sheet script,
public-site preview, audit beyond created/updated by, paging beyond prev/next.

### Variants
- **A. Tabel + halaman form.** Current CMS pattern. Paginated table (10 per page); "Tambah Informasi" / "Ubah" replace the page with a full form (`?form=new|<id>`). Delete from the row menu.
- **B. Tabel + panel samping.** Same table stays visible; the form opens in a right drawer with a live preview card (thumbnail, judul, kategori, periode) above the fields.
- **C. Papan per status tayang.** No table. A "Beranda" strip (order ASC, mulai DESC, duplicates flagged "Urutan sama") above four lanes of cards. Form in a centered modal.

### Other URL state
Filters `q`, `kategori`, `layanan`, `jenjang_id`, `status_tayang`, `homepage=true`;
`page`; `form`; `simulasi=error` (list endpoints return 500, also toggled from the switcher).
The `form` param works in every variant, so a link opens the same record in the
variant's own form style.

## Decisions
- Validation lives in `-logic/rules.ts`, used by the form and by the MSW handler, so client and 400 paths show identical messages.
- Expired items show an inline warning on the date field as soon as "Ubah" opens; Hapus stays available in the form footer.
- Thumbnail upload goes straight to the fake endpoint (no client type/size pre-check), so the 400/413 messages come from the "server". The picked file is previewed from a local object URL.
- Seed dates are computed from today (Asia/Jakarta), so all four statuses exist at any time.
- Layanan `Kelas Belajar` ditambahkan di prototype; RFC §6.1 dan enum OpenAPI perlu diperbarui.

## Open questions
- Is the inline warning enough, or should an expired item offer a one-click "Set selesai ke hari ini"?
- Should the board (C) strip show non-Tayang items? It does (with status badge) since they hold an order but are not public.
- Is the duplicate-order flag only on the board enough? A and B only show the number.

## What to watch for in review
- Can a reviewer tell why a Berakhir item will not save, and what to do about it?
- Does "Urutan sama" in C explain the tie-break (later tanggal mulai first)?
- B: is the preview useful, or does the drawer feel crowded?
- A vs B vs C for scanning many items versus editing one.
- Jenjang/layanan as checkboxes: fine for 6 jenjang, ok for more?

## Mock API
`/api/cms-informasi/v1/*`, defined in `-api/handlers.ts`: `GET/POST /informasi`,
`GET/PUT/DELETE /informasi/:id`, `GET /jenjang`, `POST /files/upload`. The
signed-in editor is always Budi Santoso. Seed has no stale jenjang id; unknown
ids are only rejected by the handler.

# v2: Program Penugasan + dialog review

Part of [cms-kurasi-assignment](../CONTEXT.md). Builds on the frozen [v1](../v1/CONTEXT.md), where the `review` dialog variant was chosen.

- **RFC:** `docs/rfc/admin-super-kurasi-assignment-and-program.md` in the command-center repo (sections 4.1, 4.3, 5.2, 6.3, 7.1, 7.3). Endpoint shapes (E3 to E6) are RFC proposals, not a BE spec.
- **URLs:** `/p/cms-kurasi-assignment/v2` (Kelola Materi), `/v2/program` (list), `/v2/program/baru` (create), `/v2/program/$id` (detail, `?edit=1` to edit).
- **Status:** review, 2026-11-25 (frozen; further changes go into v3).

## Question
Can Admin Super manage Programs (create, complete a legacy one, edit values), and does that flow into the assignment dialog's program picker? Is the immutability of nama/jenjang/tipe clear at create time, and is "Lengkapi" discoverable?

## Scope
- Dialog: `review` only (wizard and panel removed). Program step gets a "Kelola Program" link; the combobox empty text points to the Program menu.
- Program pages: one design, standard CMS list + form. Filters, page size and page live in the URL.
- Shared in-memory store: `programs` in `-data/seed.ts` is mutated by POST/PATCH, so a created or completed program shows in the picker (`GET /program?lengkap=true`) without reload. Resets on reload.
- Simulasi bar (every page): E2 error, E1 403, E1 400, 409 on next program POST, 500 on program list.
- UI SDK (`@ui-sdk/react`) for new Select, Combobox (institusi) and Switch; v1 pieces (Modal, ProgramCombobox, dialog forms) are reused as they were.

## Decisions
- Kurasi forces review to Dalam CMS and disables Luar CMS in both forms (helper text from the brief).
- Kelompok selects stay disabled until jenjang and tipe are chosen; changing either clears them.
- Legacy edit allows a partial save (stays legacy). A save with all eight values flips it to complete, shows the "Program sudah lengkap" notice with a link to Kelola Materi.
- Complete programs require all eight values on edit.
- No delete, rename or deactivate anywhere.
- Detail shows the linked-materi count (from the materi store); some seed materi point at legacy programs.
- List items are mapped to names on the FE (existing institusi/kelompok/jenjang queries); the list API returns ids.

## Assumptions (brief did not cover)
- Legacy programs store a partial value set in a `partial` field; `values` stays null until complete. Prototype-only shape.
- 409 is also matched on trimmed, case-insensitive name per jenjang and tipe; the two "Program Pemerkayaan" rows differ by jenjang so both can exist.
- List sort is jenjang (sd, smp, sma), tipe, nama; default page size 20 so SD legacy rows show on page 1.
- "Perlu dilengkapi" toggle maps to `lengkap=false`.
- "Kelola Program" opens in a new tab. Updated-by is a fixed "Admin Super".
- Not exercised in a real browser during the build (typecheck and build only).

## Open questions
- Should a legacy program be allowed a partial save, or must Lengkapi be all-or-nothing?
- Should the list show the linked materi count, not only the detail?
- Should the dialog link "Kelola Program" exist in the product?

## What to watch
- Does the admin notice the lock note and the "tidak dapat diubah" alert before saving?
- Is the "Lengkapi" badge plus action enough to find legacy programs, without the toggle?
- After completing a program, do they go back to Kelola Materi and find it in the picker?

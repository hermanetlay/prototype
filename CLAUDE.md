# CLAUDE.md

## What this repo is

A single client-only React app that hosts **many prototypes**. Each initiative
is a URL prefix; each iteration of that initiative is a version segment beneath
it. There is no backend anywhere — MSW fakes every request in the browser.

```
/                                catalogue of every prototype
/p/<initiative>/<version>/...    one prototype
/p/persetujuan-materi/v1         the worked example to copy from
```

The code here is deliberately disposable. The **context is not**: `-meta.ts`
and `CONTEXT.md` in each version folder are the durable output of this repo.

## Stack

Vite + React 19 · TanStack Router (file-based, auto code-split) · TanStack Query
· MSW (browser worker) · Tailwind v4 · TypeScript strict. Client-only: `pnpm
build` emits static files. Do not add SSR, a server, or a database.

`DESIGN.md` is the visual system (Ruang Murid CMS). It is framework-agnostic —
tokens and component contracts, not a component library.

## Commands

```bash
pnpm dev                       # http://localhost:5173
pnpm new <initiative> [vN]     # scaffold an initiative or a new version
pnpm typecheck                 # tsr generate && tsc -b
pnpm build
```

`pnpm typecheck` and `pnpm build` both regenerate `src/routeTree.gen.ts` first,
so run one of them after adding or renaming a route file. The generated tree is
git-ignored.

## Layout

```
src/
  main.tsx                     boots MSW, then the router
  routeTree.gen.ts             generated, git-ignored
  styles/tokens.css            DESIGN.md tokens as Tailwind @theme vars
  mocks/browser.ts             globs every initiative's MSW handlers
  shared/                      used by 2+ initiatives only
    layout/AppShell.tsx        header + navy sidebar + toolbar + gray canvas
    ui/                        Button, Card, Badge, Table
    lib/                       registry (catalogue glob), query client, cn
  routes/
    __root.tsx  index.tsx      devtools shell; the catalogue page
    p/<initiative>/<version>/
      -meta.ts                 catalogue entry — REQUIRED
      CONTEXT.md               why it exists, decisions, open questions — REQUIRED
      -api/handlers.ts         MSW handlers, auto-collected
      -data/                   seed fixtures
      -components/             screens/widgets local to this version
      -queries.ts              queryOptions + mutations
      route.tsx                version layout, wraps AppShell
      index.tsx  $param.tsx    screens
```

**The `-` prefix is load-bearing.** TanStack Router's generator ignores any file
or folder starting with `-`, which is what lets an initiative colocate its
mocks, fixtures and components beside its screens. Never name a route file with
a leading `-`, and never put non-route code in a file without one.

## Rules

1. **Scaffold, don't hand-roll.** `pnpm new <slug> [vN]` writes the folder. It
   only accepts `a-z0-9-` slugs and `vN` versions, and refuses to overwrite.
2. **No central registration.** The catalogue (`src/shared/lib/registry.ts`) and
   the MSW worker (`src/mocks/browser.ts`) discover folders via
   `import.meta.glob`. If you find yourself editing a list of initiatives, stop
   — something is wrong.
3. **Iterations are new version folders, not edits.** Copy `v1` to `v2` and
   change the copy. A version is frozen once it has been shown to stakeholders,
   so `v1` stays linkable forever.
4. **Never import across initiatives**, and never from one version into another.
   If two need the same thing, it moves to `src/shared/` and becomes generic —
   no initiative-specific copy, fixture, or business rule lives there.
5. **All data flows through MSW.** Fixtures in `-data/`, served by
   `-api/handlers.ts`, read with TanStack Query. No arrays rendered straight
   into a component — the prototype should exercise loading, empty and error
   states the way the real thing will.
6. **Namespace mock endpoints** as `/api/<initiative>/<version>/...` so two
   versions can disagree about the API shape.
7. **Shareable state goes in the URL** via `validateSearch` (filters, tabs,
   selected row). A review session should survive being pasted into Slack.
8. **No raw hex in components.** Change `DESIGN.md` first, mirror it into
   `src/styles/tokens.css`, then use token classes: `bg-surface`,
   `text-text-subdued`, `text-body-sm`, `rounded-md`.
9. **Interface copy is Indonesian**, short and verb-first ("Tambah Materi",
   "Simpan", "Tutup"). Code, comments and docs are English.
10. **Light mode only.** `DESIGN.md` defines dark tokens but no screen is
    authored against them; don't invent a dark theme by inverting.

## Gotchas

- Dynamic `to={...}` on a `<Link>` can't be statically verified by the router's
  types; the codebase writes `to={path as never}` at those two call sites
  (catalogue, AppShell nav). Don't spread that pattern to static links.
- A route whose `validateSearch` has required fields makes `search` required on
  every `Link`/`navigate` targeting it.
- `public/mockServiceWorker.js` is generated by `pnpm msw:init` and committed.
  Re-run it after an MSW major upgrade.
- Nothing renders until the MSW worker is listening (see `main.tsx`); a blank
  page usually means the worker failed to register.
- **react-select** (used for multi-selects) styles with emotion, whose CSS is
  unlayered and beats Tailwind v4's `@layer utilities`. Theme it with
  `unstyled` + `classNames`, but anything that must *override* a base style
  (e.g. `display: none` on a fixed chip's remove button) goes in `styles`.
- Chrome matches `<select>` against `:read-only`, so never use Tailwind's
  `read-only:` variant on shared control classes; use `[&[readonly]]:`.
- Shell commands on `-`-prefixed paths need `./` (`mkdir -p ./-data`), or the
  dash is parsed as a flag.

## Statuses in `-meta.ts`

`draft` (building) · `review` (ready for feedback) · `shipped` (went into the
real product) · `archived` (superseded; keep the folder, record why in
`CONTEXT.md`).

## Further reading

- [README.md](README.md) — the short version, for humans arriving fresh
- [docs/CONVENTIONS.md](docs/CONVENTIONS.md) — the same rules, expanded
- [DESIGN.md](DESIGN.md) — tokens, components, layout, copy tone

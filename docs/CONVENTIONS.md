# Conventions

## Directory structure

```
.
├── DESIGN.md                     visual system: tokens, components, layout rules
├── README.md
├── docs/                         cross-initiative context
│   └── CONVENTIONS.md            this file
├── scripts/new-prototype.mjs     scaffolder
├── public/mockServiceWorker.js   MSW worker (generated, committed)
└── src/
    ├── main.tsx                  boots MSW, then the router
    ├── routeTree.gen.ts          generated, git-ignored
    ├── styles/
    │   ├── tokens.css            DESIGN.md tokens as Tailwind @theme vars
    │   └── app.css
    ├── mocks/browser.ts          collects every initiative's MSW handlers
    ├── shared/                   used by two or more initiatives
    │   ├── layout/AppShell.tsx   header + sidebar + toolbar + canvas
    │   ├── ui/                   Button, Card, Badge, Table
    │   └── lib/                  registry, query client, cn
    └── routes/
        ├── __root.tsx            devtools + outlet
        ├── index.tsx             the catalogue
        └── p/
            └── <initiative>/     e.g. cms-user-management
                ├── CONTEXT.md    initiative context (see below)
                └── <version>/    e.g. v1
                    ├── -meta.ts        catalogue entry (required)
                    ├── CONTEXT.md      why this exists, decisions, open questions
                    ├── -api/handlers.ts  MSW handlers (auto-collected)
                    ├── -data/          seed fixtures
                    ├── -components/    screens/widgets local to this version
                    ├── -queries.ts     query options + mutations
                    ├── route.tsx       version layout (AppShell)
                    ├── index.tsx       entry screen
                    └── ...             more route files
```

**The `-` prefix is load-bearing.** TanStack Router treats any file or folder
starting with `-` as colocated support code, not a route. That is what lets an
initiative keep its data, mocks, and components next to its screens.

## Rules

1. **One initiative per folder under `src/routes/p/`.** The folder name is the
   URL segment: lowercase, hyphenated, stable forever.
2. **Iterations are new version folders, not edits.** `v1` stays shipped and
   linkable when `v2` lands; copy the folder, then change it. A version is
   frozen once it has been shown to stakeholders.
3. **Never import across initiatives.** If two initiatives need the same thing,
   it moves to `src/shared/`. Cross-imports make v1 break when v2 changes.
4. **Anything shared is generic.** `src/shared/` holds no initiative-specific
   copy, fixture, or business rule.
5. **Context lives at two levels.** Each initiative has a `CONTEXT.md` for what
   holds across versions: the problem, the domain glossary, business rules, a
   version table and a decision log. Each version has a `-meta.ts` (what the
   catalogue shows) and its own `CONTEXT.md` (what that iteration tried,
   decided, and left open), linking up to the initiative doc. `pnpm new` creates
   the initiative doc the first time. These files are the point of the repo —
   the code is disposable, the context is not.
6. **All data comes from MSW.** No hardcoded arrays rendered directly in a
   component: put fixtures in `-data/`, serve them from `-api/handlers.ts`, read
   them with TanStack Query. That way the prototype exercises loading, empty,
   and error states like the real thing will.
7. **Mock endpoints are namespaced** as `/api/<initiative>/<version>/...` so two
   versions can disagree about the API shape without colliding.
8. **State that a reviewer might want to share goes in the URL** (filters, tabs,
   selected row) via `validateSearch`.
9. **Colors, type, spacing come from `DESIGN.md`.** Change `DESIGN.md` first,
   mirror it into `src/styles/tokens.css`, then use the Tailwind token classes
   (`bg-surface`, `text-text-subdued`, `text-body-sm`). No raw hex in
   components.

## Statuses used in `-meta.ts`

| Status | Meaning |
|---|---|
| `draft` | being built, not ready to show |
| `review` | ready for stakeholder feedback |
| `shipped` | the idea went into the real product |
| `archived` | superseded or abandoned; kept for the record |

## Retiring a prototype

Set `status: 'archived'` in `-meta.ts` and record why in `CONTEXT.md`. Delete
the folder only when the URL has stopped being referenced anywhere.

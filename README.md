# Wartek Prototypes

A single client-only React app that hosts every prototype. One initiative =
one URL prefix; one iteration = one version segment under it.

```
/                                  catalogue of every prototype
/p/<initiative>/<version>/...      one prototype
/p/persetujuan-materi/v1           the worked example
```

## Stack

| Concern | Choice |
|---|---|
| Build | Vite + `@vitejs/plugin-react` |
| Routing | TanStack Router (file-based, auto code-split) |
| Server state | TanStack Query |
| Fake backend | MSW (browser worker, no server anywhere) |
| Styling | Tailwind v4, tokens generated from `DESIGN.md` |
| Types | TypeScript, strict |

No backend, no SSR, no database. `pnpm build` emits static files.

## Commands

```bash
pnpm install
pnpm dev            # http://localhost:5173
pnpm new <slug> [v] # scaffold an initiative or a new version
pnpm typecheck
pnpm build
```

## Adding a prototype

```bash
pnpm new persetujuan-materi v2
```

That writes `src/routes/p/persetujuan-materi/v2/` and you are done — the
catalogue on `/` and the MSW worker both discover new folders by glob, so
there is no central list to edit.

See [docs/CONVENTIONS.md](docs/CONVENTIONS.md) for the rules of the road and
[DESIGN.md](DESIGN.md) for the visual system.

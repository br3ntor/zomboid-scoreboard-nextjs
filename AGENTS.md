# AGENTS.md

## Stack

- Next.js 15 (App Router) + React 18 + TypeScript (strict, `noEmit`)
- Tailwind CSS 3 + shadcn/ui (Radix primitives live in `src/components/ui/`)
- Tests: **vitest** (only `src/lib/normalize.ts` is exercised so far; colocated `*.test.ts`)
- Package manager: **pnpm 11** (`pnpm-lock.yaml` and `pnpm-workspace.yaml` are both committed — install with pnpm, not npm/yarn)

## Commands

- `pnpm dev` — `next dev`
- `pnpm build` — `next build`
- `pnpm start` — `next start`
- `pnpm lint` — `next lint` (extends `next/core-web-vitals`)
- `pnpm test` — `vitest run` (one-shot) / `pnpm test:watch` for watch mode
- Typecheck: **no script defined**; run `pnpm exec tsc --noEmit` or rely on the TS plugin in your editor
- Format: Prettier + `prettier-plugin-tailwindcss` (no script; use editor or `pnpm exec prettier .`)

## Layout

- Root layout: `src/app/layout.tsx` — dark mode is hard-coded via `className="dark"` (no theme toggle exists; light tokens in `globals.css` are unused)
- Home page: `src/app/page.tsx` — server component; default tab is hard-coded to `b42-vanilla`
- Client component: `src/components/scoreboard.tsx` (`"use client"`) — accepts a `Result<NormalizedPlayer[]>` and renders either the table or a per-tab error banner
- shadcn primitives: `src/components/ui/{button,progress,sheet,table,tabs}.tsx`. Add more with `pnpm dlx shadcn@latest add <name>` — `components.json` is the source of truth for the alias and base color (slate). Don't add custom `onClick` URL mutations to `tabs.tsx`; the page does not use URL-driven tab state.

## Data flow

- `src/lib/env.ts` — `env.B42_MODDED_API_URL` / `env.B42_VANILLA_API_URL`. URLs are validated at module load; an invalid env var throws immediately. (The b41 `B41_API_URL` entry is commented out — the b41-modded tab was decommissioned; see git history to restore it.)
- `src/lib/data.ts` — `B42ModdedPlayer` / `B42VanillaPlayer` types + `getB42ModdedPlayerData` / `getB42VanillaPlayerData`. Fetch uses `cache: "no-store"` and `AbortSignal.timeout(5_000)`. Throws on error. (b41 `B41Player` / `getB41PlayerData` commented out.)
- `src/lib/normalize.ts` — `normalizeB42ModdedPlayer` / `normalizeB42VanillaPlayer` collapse both into `NormalizedPlayer` / `VanillaPlayer`. (The b41 `normalizeB41Player` path + `safeJsonParse`/`NormalizeError` helpers are commented out.)
- `src/lib/result.ts` — `Result<T>` discriminated union (`{status:"ok",data}` | `{status:"error",error}`) + `tryAsync` helper.
- The page wraps fetch + normalize in `tryAsync`, then passes each `Result` to `<Scoreboard result={…} />` so one failing upstream shows an error in that tab only.

## Conventions

- Path alias: `@/*` → `./src/*`
- Tailwind classes are auto-sorted by Prettier on save (plugin enabled in `.prettierrc`)
- `pnpm-workspace.yaml` is **not** a multi-package setup — it's only used for `allowBuilds` (`sharp`, `unrs-resolver`) and `overrides` patches
- ESLint is intentionally pinned to v8 (Next 15 still supports it; v9+ would require a flat-config migration). Don't bump it casually.
- Test files are colocated as `*.test.ts` next to the module they cover; `vitest.config.ts` enforces that pattern via `include`.

## CI / Deploy

- `.github/workflows/action.yml` runs on every push and SSHes to a host to execute `deploy-pz-scoreboard.sh` (the script is **not** in this repo). No lint, typecheck, or test step runs in CI.

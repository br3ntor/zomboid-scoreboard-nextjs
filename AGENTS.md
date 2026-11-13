# AGENTS.md

## Stack

- Next.js 15 (App Router) + React 18 + TypeScript (strict, `noEmit`)
- Tailwind CSS 3 + shadcn/ui (Radix primitives live in `src/components/ui/`)
- Tests: **vitest** (colocated `*.test.ts`; currently covers `src/lib/normalize.ts` and `src/lib/scoreboard.ts`)
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
- Home page: `src/app/page.tsx` — server component; fetches both tabs and passes `Result<PlayerData<…>>` props to `ScoreboardTabs`; no URL-driven tab state
- Client components: `src/components/scoreboard-tabs.tsx` (`"use client"`) — owns the shared online-only toggle and the active tab (default `b42-vanilla`); `src/components/scoreboard.tsx` (`"use client"`) — modded table/sheet; `src/components/vanilla-scoreboard.tsx` — vanilla table. Each table accepts `Result<PlayerData<…>>` plus `onlineOnly` and renders either the table or a per-tab error banner
- shadcn primitives: `src/components/ui/{button,progress,sheet,table,tabs}.tsx`. Add more with `pnpm dlx shadcn@latest add <name>` — `components.json` is the source of truth for the alias and base color (slate). Don't add custom `onClick` URL mutations to `tabs.tsx`; the page does not use URL-driven tab state.

## Data flow

- `src/lib/env.ts` — `env.B42_MODDED_API_URL` / `env.B42_VANILLA_API_URL`. URLs are validated at module load; an invalid env var throws immediately. (The b41 `B41_API_URL` entry is commented out — the b41-modded tab was decommissioned; see git history to restore it.)
- `src/lib/data.ts` — `B42ModdedPlayer` / `B42VanillaPlayer` types + `getB42ModdedPlayerData` / `getB42VanillaPlayerData`. Each response includes `players` (top 50) and `online_players` (live online list, nullable). Fetchers return `PlayerData<…>` = `{ players, onlinePlayers }`; a missing/null `online_players` becomes `null` (toggle disabled), while `[]` means zero online. Fetch uses `cache: "no-store"` and `AbortSignal.timeout(5_000)`. Throws on error. (b41 `B41Player` / `getB41PlayerData` commented out.)
- `src/lib/normalize.ts` — `normalizeB42ModdedPlayer` / `normalizeB42VanillaPlayer` collapse both into `NormalizedPlayer` / `VanillaPlayer`. `hours`, `profession`, `health`, and `infected` are nullable for the modded best-effort online rows (A2S name mismatch). (The b41 `normalizeB41Player` path + `safeJsonParse`/`NormalizeError` helpers are commented out.)
- `src/lib/scoreboard.ts` — `PlayerData<T>`, `MAX_LEADERBOARD_ROWS` (50), and `rankPlayers` (kills desc, username asc tie-break, optional limit, crown on #1).
- `src/lib/result.ts` — `Result<T>` discriminated union (`{status:"ok",data}` | `{status:"error",error}`) + `tryAsync` helper.
- The page wraps fetch + normalize in `tryAsync`, then passes each `Result<PlayerData<…>>` to `<ScoreboardTabs />` so one failing upstream shows an error in that tab only. The regular view uses `players` (top 50); the online view uses `online_players` ranked 1..n.
- `online_players` is the API's live A2S-derived list (30s poll). `null` = unavailable (disable the toggle); `[]` = zero online ("No players online right now"). The per-player `is_online` / `online_id` fields are unreliable and unused.

## Conventions

- Path alias: `@/*` → `./src/*`
- Tailwind classes are auto-sorted by Prettier on save (plugin enabled in `.prettierrc`)
- `pnpm-workspace.yaml` is **not** a multi-package setup — it's only used for `allowBuilds` (`sharp`, `unrs-resolver`) and `overrides` patches
- ESLint is intentionally pinned to v8 (Next 15 still supports it; v9+ would require a flat-config migration). Don't bump it casually.
- Test files are colocated as `*.test.ts` next to the module they cover; `vitest.config.mts` enforces that pattern via `include`.

## CI / Deploy

- Production runs under PM2 as the process `pnpm start` on port 3000, defined in `ecosystem.config.cjs`. Operations, deploy steps, and troubleshooting are in **`DEPLOY.md`** — read it before restarting or updating the server.
- ⚠️ PM2 snapshots `PATH` when its daemon starts, so switching nvm versions or upgrading pnpm does **not** update running processes. After either, run `pm2 kill && pm2 save && pm2 resurrect`, otherwise the next restart fails with `pnpm: command not found`.
- `.github/workflows/action.yml` runs on every push and SSHes to a host to execute `deploy-pz-scoreboard.sh` (the script is **not** in this repo). No lint, typecheck, or test step runs in CI.

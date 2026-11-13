# WCN API: online players — backend implemented (handoff to frontend)

Follow-up to `~/api-online-players-shape.md`. The backend change from that report
is now **implemented, built, deployed, and running in prod** (systemd, `127.0.0.1:8080`).
This doc is what you need to continue the frontend work.

## Current live status (verified against prod)

| | Modded | Vanilla |
| --- | --- | --- |
| Endpoint | `GET /api/leaderboard/kills` | `GET /api/leaderboard/vanilla/kills` |
| `online_players` | **`[]` — poll works, 0 online right now** | **20 real players** ✅ |
| `online_player_count` | 0 | 20 |
| `total_player_count` | 296 | 1015 |
| `generated_at` | 5m import time (mod's snapshot) | ~30s fresh (A2S poll) |
| `snapshot_player_count` | 1 (mod's file; see note) | 20 |

Both servers are now fully wired. Vanilla is the reference implementation
(real online data). Modded is returning `[]` because **zero players are
currently online on the modded server** — this is exactly the "toggle enabled,
no players online" case. If the modded poll were down or unconfigured it would
return `null` instead.

## Response shape

### `GET /api/leaderboard/kills` (modded)

`players` is unchanged (top 50 by `zombie_kills`, full player objects). New fields:

```json
{
  "server": "b42-modded",
  "generated_at": "2026-11-13T06:09:05Z",
  "snapshot_player_count": 1,
  "online_player_count": 0,
  "total_player_count": 296,
  "players": [ { "username": "Roo", "zombie_kills": 43202, "traits": [], "perks": {}, "health": {}, "..." : "full player object" } ],
  "online_players": []
}
```

Note: modded `snapshot_player_count` (from the mod's `scoreboard.json`) and
`online_player_count` (from A2S) can differ — the mod's count is written at its
own cadence. Treat `online_players` / `online_player_count` as the source of
truth for the online view.

When players are online, `online_players` will be `[{ "username": "...", "zombie_kills": 9331, ...full player object... }]`.

### `GET /api/leaderboard/vanilla/kills`

```json
{
  "server": "West Coast Noobs B42 Vanilla | PVE | Wiped 10-2-26",
  "generated_at": "2026-11-13T06:04:51Z",
  "snapshot_player_count": 21,
  "online_player_count": 21,
  "total_player_count": 1015,
  "players": [ { "username": "LEGENDARY", "score": 3839, "playtime_seconds": 7269 } ],
  "online_players": [
    { "username": "Port0l", "score": 21862, "playtime_seconds": 2248 },
    { "username": "Nomad", "score": 1556, "playtime_seconds": 3210 }
  ]
}
```

`online_players` for vanilla uses the exact same object shape as `players`
(`username`, `score`, `playtime_seconds` — all three always present, no nulls).

## Semantics (the important rules)

- `online_players` is the **live online list from a 30s A2S poll**, not
  `players.filter(is_online)`. It **includes players outside the top 50** —
  that was the whole original problem.
- `online_players: null` → couldn't determine (server not configured / not yet
  polled). **Frontend: disable the online toggle.**
- `online_players: []` → poll succeeded, **zero players online**. **Frontend:
  show "No players online right now."** Do not treat `[]` and `null` the same.
- `online_player_count` always equals `online_players.length` (0 when `null`).
- `total_player_count` = all-time rows in that server's table (not just top 50).
- Both `players` and `online_players` are sorted **kills/score descending, then
  username ascending**. Rank the online list 1..n yourself.
- Reuse the existing normalizers and table rendering for both arrays — same
  shape per server, no partial-row logic.

## Freshness & caching

- `Cache-Control: public, max-age=30` on both endpoints.
- Online list refreshes every **30s** (`ONLINE_POLL_INTERVAL`).
- The leaderboard (`players`) refreshes every **5m** (`IMPORT_INTERVAL`) — the
  all-time top 50 doesn't need to be fresher.
- `generated_at`: vanilla tracks the 30s poll (so it matches the online list);
  modded tracks the mod's 5m snapshot. If the frontend displays "updated X ago"
  next to the online view, the vanilla `generated_at` is the meaningful one.

## Modded caveat (name matching)

Modded online players come from A2S, which returns **Steam persona names**, then
are matched by username against the modded player table. If a player's Steam name
differs from their in-game username, they appear as a best-effort object with
only `username` + `zombie_kills` (no traits/perks/health). Handle that shape
gracefully if you see it (it only happens on name mismatches). An exact source
(mod export of a real online list, or RCON) is a possible future improvement —
not blocking.

## Backend config (for the ops/handoff picture)

| Var | Prod value | Notes |
| --- | --- | --- |
| `VANILLA_A2S_ADDR` | `153.75.232.90:16261` | Set, working |
| `MODDED_A2S_ADDR` | `pz.westcoastnoobs.com:17261` | Set, working — modded `online_players` is live |
| `ONLINE_POLL_INTERVAL` | 30s (default) | |
| `IMPORT_INTERVAL` | 5m (default) | |
| `HTTP_ADDR` | `127.0.0.1:8080` | Behind nginx, IP-allowlisted for the website VPS |

## What's left for the frontend (unchanged from the original report)

1. Add `online_players`, `online_player_count`, `total_player_count` to the
   response types for both endpoints.
2. Data layer returns both arrays; no A2S/dgram/name-merge code needed.
3. A client-side tabs component owns the toggle: picks `players` vs
   `online_players`. `null` disables the toggle; `[]` shows "No players online
   right now."
4. `server` field is still a slug (`b42-modded`) on modded and a display name
   on vanilla — same quirk as before, not blocking.

Verification tip: hit the vanilla endpoint and you should see ~20 online players
today; the modded endpoint should show `online_players: []` (poll working, zero
online right now) — it would show `null` only if the modded poll were
unconfigured or down.

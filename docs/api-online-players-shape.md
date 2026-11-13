# WCN API: online player response shape

Purpose: backend/API change needed for the scoreboard's "online only" toggle.

## Context

- Both leaderboard endpoints currently return exactly the top 50 players by kills.
- At test time, only 7 of 21 vanilla online players were in the top 50, and 0 of 1 modded online players were in the top 50.
- The modded API's per-player `is_online` field is not trustworthy: all 50 rows reported `true` while only 1 player was actually online.
- `snapshot_player_count` was correct (21 vanilla, 1 modded) and matched a live A2S query.
- `online_id` is a PZ internal ID, not a connection flag (offline players had non-zero values).
- Live A2S queries on `pz.westcoastnoobs.com:16261` (vanilla) and `:17261` (modded) return player names and scores. The A2S score matches zombie kills within 0-3 of the API value.
- The goal is for the API to be the source of truth for online players, so the scoreboard does not need to query Steam A2S itself.

## Recommended shape

Return two bounded arrays from the same full player dataset:

```json
{
  "server": "b42-modded",
  "generated_at": "2026-11-13T01:29:42Z",
  "online_player_count": 1,
  "total_player_count": 137,
  "players": [ "...top 50 by kills..." ],
  "online_players": [ "...all connected players, same object shape..." ]
}
```

For vanilla:

```json
{
  "server": "West Coast Noobs B42 Vanilla | PVE | Wiped 10-2-26",
  "generated_at": "...",
  "online_player_count": 21,
  "total_player_count": 50,
  "players": [
    { "username": "SnipeR", "score": 25107, "playtime_seconds": 8163 }
  ],
  "online_players": [
    { "username": "Nomad", "score": 1556, "playtime_seconds": null }
  ]
}
```

The important rules:

- `players` stays the top 50, so the normal leaderboard contract doesn't break.
- `online_players` is **not** `players.filter(is_online)`. It must come from the full player dataset or the live server list, so it includes players ranked below 50. That was the whole problem: at test time only 7 of 21 vanilla online players were in the top 50, and 0 of 1 modded.
- Use the **same object shape** as `players` for each server. The frontend can then reuse the existing normalizers and table rendering with no partial-row logic.
- `online_players: []` means zero players online. `online_players: null` (or omitted) means "couldn't determine"; the frontend disables the toggle. Don't use `[]` for both.
- Sort both arrays by kills descending, then username ascending. The frontend ranks the online list 1..n.
- `online_player_count` should equal `online_players.length`. `total_player_count` is optional but useful.

## Implementation gotchas

- **Don't use `online_id` as an online flag.** We saw non-zero `online_id` values for offline players. It's a PZ internal ID, not a connection status.
- **Don't trust the current `is_online`.** All 50 modded rows reported `true` while A2S showed 1 player online. Derive it from the actual online list if you keep the field, or drop it entirely. `online_players` is the source of truth.
- **Compute from the full dataset, not the top-50 slice.** If the mod currently exports only top 50, the API change needs the full export. The algorithm should be: load all players -> sort -> `players = sorted.slice(0, 50)` -> `online_players = sorted.filter(isOnline)`.
- **The modded payload is already ~86KB for 50 players** because of traits/perks. Don't switch `players` to "all players"; the payload will balloon. The online array is naturally bounded by server slots (80) and is usually much smaller.
- **Vanilla may need a real online source.** The vanilla leaderboard only has top-50 rows. A2S on `pz.westcoastnoobs.com:16261` gives all 21 online names and kills; that query belongs in the API, not the frontend. `playtime_seconds` can be `null` for online players outside the top 50. The vanilla table only needs username + kills.
- **Modded can use the mod's online list** if it exports one. Otherwise A2S on `17261` works. RCON is better if you have it enabled, because it gives exact PZ usernames and Steam IDs instead of Steam persona names. Name changes are the one place A2S matching can fail.
- **If a player is online but missing from the full player data**, include a best-effort object rather than dropping them. For vanilla that's easy (`username`, `score`, `playtime_seconds: null`). For modded, the full stat shape matters because the normalizer expects `health`, `traits`, `perks`, etc.; the mod's player database should have those.

## Go-specific detail

The `404 page not found` body suggests the API may be Go. If so, don't put `omitempty` on `online_players`:

- `nil` slice -> `null` -> "unavailable"
- empty non-nil slice -> `[]` -> "zero online"

That gives the frontend exactly the distinction it needs. `omitempty` would erase it.

## Freshness and caching

The current `generated_at` was about 3 minutes old when fetched, and the response sends `Cache-Control: public, max-age=60`. For an online toggle, that may feel stale. If the full response includes the online list, consider a 15-30s refresh and a shorter cache header, or `no-cache` if nginx is allowed to cache it. If the online list comes from the mod's snapshot, make sure the snapshot writes that often. If it comes from A2S, cache the query for ~15s inside the API.

## What this does to the scoreboard

It simplifies the frontend plan quite a bit:

- No `a2s.ts`, no `dgram`, no UDP egress, no split packets, no name-matching merge.
- `online_players` is just another normalized array.
- The toggle picks `players` vs `online_players`.
- The online view ranks 1..n by kills.
- `null` disables the toggle; `[]` shows "No players online right now."

So the frontend changes stay small: add `online_players` to the response types, return both arrays from the data layer, and pass them into a client tabs component that owns the toggle.

## Optional cleanup

The `server` field is a slug for modded (`b42-modded`) and a display name for vanilla. If that inconsistency bothers you, add `server_id` and `server_name`; otherwise it's not blocking anything.

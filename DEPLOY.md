# DEPLOY.md — running wcn-scoreboard under PM2

Operational runbook for the production server. Written after the 2025-10-05
incident where PM2 went missing from `PATH` and then crash-looped on restart.

## TL;DR — daily commands

```bash
cd ~/projects/zomboid-scoreboard-nextjs

pm2 start ecosystem.config.cjs    # first boot / after a reboot
pm2 reload ecosystem.config.cjs   # after a new build (graceful, zero-downtime)
pm2 list                          # status
pm2 logs pnpm start --lines 100   # tail logs
pm2 save                          # persist process list
```

Deploying a new build:

```bash
cd ~/projects/zomboid-scoreboard-nextjs
git pull
pnpm install --frozen-lockfile
pnpm build
pm2 reload ecosystem.config.cjs
```

## Current state

| | |
|---|---|
| Project | `~/projects/zomboid-scoreboard-nextjs` (`wcn-scoreboard`) |
| Process name | `pnpm start` |
| Port | `3000`, **loopback only** (`next start -H 127.0.0.1`); nginx on 443 is the only entry point |
| Config | `ecosystem.config.cjs` |
| PM2 home | `~/.pm2` |
| pnpm | 12.x, global shims in `~/.local/share/pnpm/bin` (`PNPM_HOME/bin`) |
| Node | **22.23.4**, pinned in `ecosystem.config.cjs` (not inherited from the shell or the daemon) |

Runtime patches applied:

| Date | Change |
|---|---|
| 2026-10-23 | Node 22.22.0 → **22.23.4** (the 22.x release of the [2026-10-21 Node security release](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases)); bind changed from all interfaces to loopback; Node + PATH pinned in `ecosystem.config.cjs` |
| 2026-10-24 | Next 15.5.19 → **15.5.28** and `sharp` **0.35.5** added as a direct dependency — the critical Image Optimization RCEs are fixed by next ≥15.5.28 *and* sharp ≥0.35.5 (librsvg CVE-2026-96889); next's own constraint allows the vulnerable 0.34.x, so sharp must stay pinned. Also overrides for postcss/nanoid/postcss-selector-parser/source-map-js. `pnpm audit --prod` is clean as of this date |

Two things this patch depends on, so don't undo them:

- `sharp` is a **direct** dependency on purpose (`^0.35.5`). Next treats it as optional and will happily resolve 0.34.x, which is vulnerable.
- `next.config.mjs` pins `images.dangerouslyAllowSVG: false` and an empty `remotePatterns`. Both gates are load-bearing: the optimizer is reachable from the public internet at `/_next/image`, and opening either one re-exposes the RCE class.

## ⚠️ The two traps that broke this

### 1. PM2 snapshots `PATH` at daemon start

PM2 captures the environment when the daemon boots and **bakes it into every
process definition**. Changing your nvm version or upgrading pnpm afterwards has
**no effect** on already-running PM2 processes.

This is what caused the outage. The process had been up 25 days with a `PATH`
frozen from December:

```
PATH=/home/br3ntor/.local/share/pnpm:/home/br3ntor/.nvm/versions/node/v23.9.0/bin:...
                              ^^^^^^^^^^^^^^^^ no /bin suffix      ^^^^^^ version deleted
```

Both entries were dead, so on the first restart the process died with
`pnpm: command not found` and entered a **378-restart crash loop** that wrote
**76 MB** of logs. The process still read as `online` right up until it was
restarted, because the original process never noticed its environment had rotted.

The long-running "online" status is not proof that a restart will work.

**This trap is now defused for this app**: `ecosystem.config.cjs` sets an
absolute `script` path and an explicit `PATH` in `env`, so the process no longer
depends on what the daemon snapshotted. As of 2026-10-23 it is pinned to Node
**22.23.4** — bump that `PATH` line when you patch Node.

After changing the pinned Node version, the daemon still has to be restarted so
the *daemon's own* Node is current too:

```bash
cd ~/projects/zomboid-scoreboard-nextjs
cp ~/.pm2/dump.pm2 ~/.pm2/dump.pm2.bak-pre-node-upgrade   # keep a rollback copy
pm2 save                                                 # snapshot the current list
pm2 kill                                                 # app is DOWN from here
# start pm2 from a shell where `node -v` is the new version
pm2 start ecosystem.config.cjs
pm2 save
```

Note the order: `pm2 save` **before** `pm2 kill` — saving after the daemon is
dead captures nothing.

Anything *not* pinned in the ecosystem file still follows the old rule: after
switching nvm versions or upgrading pnpm, recreate the process from the
ecosystem file rather than `pm2 restart`, and verify with
`readlink -f /proc/$(pm2 pid 'pnpm start')/exe`.

### 2. Upgrading pnpm moves its global shims

pnpm 12 writes global command shims to `$PNPM_HOME/bin`. Older versions wrote
them directly to `$PNPM_HOME`. After an upgrade, previously-installed globals
appear to vanish.

Symptom: `pm2: command not found`, even though `ls ~/.local/share/pnpm/pm2`
shows the file still exists.

Fix: reinstall globals with the current pnpm.

```bash
pnpm add -g pm2
```

Sanity check that `PNPM_HOME` is right:

```bash
pnpm bin -g    # must be a directory that is on your PATH
```

## Crash-loop guard

`ecosystem.config.cjs` sets:

```js
max_restarts: 10,
min_uptime: '20s',
```

A process that survives 20s counts as a successful start. If the app is broken,
PM2 now gives up after **10 restarts** instead of spinning forever. **Keep these
settings** — they're what stops a bad dependency from filling your disk.

## Logs

```
~/.pm2/logs/pnpm-start-out.log      # stdout (Next.js boot output)
~/.pm2/logs/pnpm-start-error.log   # stderr
```

These can grow large during a crash loop. Check and clear:

```bash
du -sh ~/.pm2/logs/*.log
truncate -s 0 ~/.pm2/logs/pnpm-start-out.log ~/.pm2/logs/pnpm-start-error.log
```

Truncating is safe — the running process holds the file descriptor and keeps
writing. It does **not** need a restart.

`Failed to find Server Action "cachefn"` lines in the error log are noise: this
app defines no server actions, so those requests are failing harmlessly. They
come from stale clients or from bots probing for Next.js server-action
endpoints. Only worth a look if the volume changes.

## Troubleshooting

**Process shows `stopped` with a high restart count**

```bash
pm2 describe 0                 # check exec cwd and interpreter
tail -30 ~/.pm2/logs/pnpm-start-error.log
```

Check for `command not found` — that's trap #1 above. Confirm the `PATH` the
saved process actually carries:

```bash
grep -o '"PATH":"[^"]*"' ~/.pm2/dump.pm2
```

It should name the pinned Node (`.../nvm/versions/node/v22.23.4/bin:...`). An
older version path there means the ecosystem file was never re-read — recreate
the process from it.

Fix by recreating the process from the ecosystem file rather than hand-rolled
`pm2 start` commands:

```bash
pm2 delete 0
pm2 start ecosystem.config.cjs
pm2 save
```

**`next start` fails with "Could not find a production build"**

There's no `.next` build — run `pnpm build` first.

**Rebuilding after a crash loop leaves stale state**

```bash
pm2 kill                      # stop the daemon entirely
rm -rf .next
pnpm install --frozen-lockfile
pnpm build
pm2 start ecosystem.config.cjs
pm2 save
```

**Backup of the process list before making changes**

```bash
cp ~/.pm2/dump.pm2 ~/.pm2/dump.pm2.bak-$(date +%F)
pm2 resurrect                # restore from that dump
```

**Port 3000 stops answering on the public IP**

Expected — the process is bound to `127.0.0.1` via `args: 'run start -H
127.0.0.1'` in `ecosystem.config.cjs`. nginx proxies to it from
`/etc/nginx/sites-available/westcoastnoobs.com.conf`. To go back to all
interfaces, drop `-H 127.0.0.1` from that line and `pm2 reload`.

**A file deleted from `public/` still answers, with a 400**

Next caches the public-file list when the server starts, so a removed asset
keeps resolving until the process restarts — and because the file is now
missing, the response is a `400 Bad Request` error page rather than a `404`.
Reload to refresh it:

```bash
pm2 reload ecosystem.config.cjs
```

After the reload the path returns a clean `404`.

## Note on CI

`.github/workflows/action.yml` SSHes to the host and runs
`deploy-pz-scoreboard.sh`, which is **not in this repo**. So CI deploys do *not*
go through the PM2 flow documented above — check that script before assuming a
push updates this process.

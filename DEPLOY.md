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
| Port | `3000` (also bound on the public network IP) |
| Config | `ecosystem.config.cjs` |
| PM2 home | `~/.pm2` |
| pnpm | 12.x, global shims in `~/.local/share/pnpm/bin` (`PNPM_HOME/bin`) |
| Node | nvm default **22.22.0** |

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

**After changing Node versions or upgrading pnpm, always run:**

```bash
pm2 kill && pm2 save && pm2 resurrect
```

The long-running "online" status is not proof that a restart will work.

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

## Troubleshooting

**Process shows `stopped` with a high restart count**

```bash
pm2 describe 0                 # check exec cwd and interpreter
tail -30 ~/.pm2/logs/pnpm-start-error.log
```

Check for `command not found` — that's trap #1 above. Confirm the stale `PATH`
with:

```bash
grep -o '"PATH":"[^"]*"' ~/.pm2/dump.pm2
```

Fix by recreating the process from the ecosystem file (which inherits the current
shell `PATH`) rather than hand-rolled `pm2 start` commands:

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

## Note on CI

`.github/workflows/action.yml` SSHes to the host and runs
`deploy-pz-scoreboard.sh`, which is **not in this repo**. So CI deploys do *not*
go through the PM2 flow documented above — check that script before assuming a
push updates this process.
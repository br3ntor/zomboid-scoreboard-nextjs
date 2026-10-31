/**
 * PM2 process definition for wcn-scoreboard (Next.js production server).
 *
 * Usage:
 *   pm2 start   ecosystem.config.cjs     # first run / after a reboot
 *   pm2 reload  ecosystem.config.cjs     # graceful reload after `pnpm build`
 *   pm2 restart ecosystem.config.cjs     # hard restart
 *   pm2 save                            # persist across daemon restarts
 *
 * `interpreter: 'none'` makes PM2 exec the `pnpm` shim directly rather than
 * wrapping it in a shell. The shim path below is absolute and `env.PATH` pins
 * the Node version, so this process does NOT depend on whatever PATH the PM2
 * daemon snapshotted at boot (the trap that caused the 2025-10 outage — see
 * DEPLOY.md). After bumping the pinned Node version, restart the daemon itself
 * so its own interpreter is current too:
 *
 *   pm2 save && pm2 kill && pm2 start ecosystem.config.cjs && pm2 save
 *
 * Full runbook (deploy steps, log cleanup, crash-loop troubleshooting):
 * see DEPLOY.md.
 */

module.exports = {
  apps: [
    {
      name: 'pnpm start',
      // Absolute script path + an explicit PATH in `env` pin this app to the
      // Node version below, instead of inheriting whatever the PM2 daemon
      // snapshotted at boot (the PATH-rot trap described in DEPLOY.md).
      // Pinned here: Node v22.23.4 — the 22.x security release of 2026-10-21.
      script: '/home/br3ntor/.local/share/pnpm/bin/pnpm',
      // -H 127.0.0.1 keeps Next bound to loopback: nginx is the only intended
      // entry point, so port 3000 is not exposed on the public IP.
      args: 'run start -H 127.0.0.1',
      interpreter: 'none',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
        PATH: '/home/br3ntor/.local/share/pnpm/bin:/home/br3ntor/.nvm/versions/node/v22.23.4/bin:/usr/local/bin:/usr/bin:/bin',
      },
      // Guard against crash loops: a process that survives 20s counts as a
      // successful start. Without this a broken dependency produces thousands
      // of restarts and megabytes of logs.
      max_restarts: 10,
      min_uptime: '20s',
      exp_backoff_restart_delay: 1000,
    },
  ],
};
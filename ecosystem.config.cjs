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
 * wrapping it in a shell. That requires PNPM_HOME/bin to be on the PATH that
 * starts the PM2 daemon — PM2 snapshots the environment at daemon start, so if
 * you upgrade pnpm or switch nvm versions, run `pm2 kill && pm2 save && pm2
 * resurrect` so processes pick up the new PATH.
 *
 * Full runbook (deploy steps, log cleanup, crash-loop troubleshooting):
 * see DEPLOY.md.
 */

module.exports = {
  apps: [
    {
      name: 'pnpm start',
      script: 'pnpm',
      args: 'start',
      interpreter: 'none',
      cwd: __dirname,
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
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
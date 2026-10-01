import { spawnSync, spawn } from "node:child_process";
import pg from "pg";
const url = new URL(process.env.DATABASE_URL);
if (
  !["localhost", "127.0.0.1"].includes(url.hostname) ||
  url.pathname !== "/portfolio_test"
)
  throw new Error("Tests require a dedicated local portfolio_test database.");
const adminUrl = new URL(url);
adminUrl.pathname = "/postgres";
const pool = new pg.Pool({ connectionString: adminUrl.toString() });
if (
  !(
    await pool.query(
      "SELECT 1 FROM pg_database WHERE datname = 'portfolio_test'",
    )
  ).rowCount
)
  await pool.query("CREATE DATABASE portfolio_test");
await pool.end();
for (const args of [
  ["node_modules/prisma/build/index.js", "migrate", "deploy"],
  ["node_modules/tsx/dist/cli.mjs", "prisma/seed.ts"],
]) {
  const result = spawnSync(process.execPath, args, {
    stdio: "inherit",
    env: process.env,
  });
  if (result.status !== 0) process.exit(result.status || 1);
}
const fixturePool = new pg.Pool({ connectionString: url.toString() });
await fixturePool.query('DELETE FROM "RateLimit"');
await fixturePool.end();
const child = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "-p", "3100"],
  { stdio: "inherit", env: process.env },
);
for (const signal of ["SIGINT", "SIGTERM"])
  process.on(signal, () => {
    child.kill();
    process.exit(0);
  });
child.on("exit", (code) => process.exit(code ?? 0));

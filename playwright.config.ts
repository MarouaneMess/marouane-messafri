import { defineConfig } from "@playwright/test";
import { config } from "dotenv";
import { randomBytes } from "node:crypto";
config({ path: ".env.local", quiet: true });
if (!process.env.DATABASE_URL)
  throw new Error(
    "Configure a local database before running end-to-end tests.",
  );
const dbUrl = new URL(process.env.DATABASE_URL);
dbUrl.pathname = "/portfolio_test";
process.env.TEST_AUTH_SECRET ||= randomBytes(32).toString("hex");
export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  use: {
    baseURL: "http://localhost:3100",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  reporter: [["list"]],
  webServer: {
    command: "node scripts/test-server.mjs",
    url: "http://localhost:3100/login",
    timeout: 120000,
    reuseExistingServer: false,
    env: {
      DATABASE_URL: dbUrl.toString(),
      NEXTAUTH_URL: "http://localhost:3100",
      SITE_URL: "http://localhost:3100",
      NEXTAUTH_SECRET: process.env.TEST_AUTH_SECRET,
      ADMIN_GITHUB_ID: "test-admin-001",
      ADMIN_GITHUB_USERNAME: "",
      ADMIN_EMAIL: "",
      GITHUB_CLIENT_ID: "",
      GITHUB_CLIENT_SECRET: "",
      RESEND_API_KEY: "",
      RESEND_FROM: "",
    },
  },
});

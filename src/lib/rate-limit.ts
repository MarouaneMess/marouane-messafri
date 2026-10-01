import "server-only";
import { createHash } from "node:crypto";
import { db } from "./db";
import { HttpError } from "./auth";
export function clientKey(request: Request) {
  return process.env.TRUST_PROXY === "true"
    ? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "shared"
    : "shared";
}
export async function rateLimit(subject: string, limit: number, seconds = 60) {
  if (!process.env.DATABASE_URL)
    throw new HttpError(503, "Le service doit être configuré.");
  const key = createHash("sha256").update(subject).digest("hex");
  const rows = await db.$queryRaw<{ count: number }[]>`
    INSERT INTO "RateLimit" ("key", "count", "expiresAt") VALUES (${key}, 1, (NOW() AT TIME ZONE 'UTC') + (${seconds} * INTERVAL '1 second'))
    ON CONFLICT ("key") DO UPDATE SET
      "count" = CASE WHEN "RateLimit"."expiresAt" < (NOW() AT TIME ZONE 'UTC') THEN 1 ELSE "RateLimit"."count" + 1 END,
      "expiresAt" = CASE WHEN "RateLimit"."expiresAt" < (NOW() AT TIME ZONE 'UTC') THEN (NOW() AT TIME ZONE 'UTC') + (${seconds} * INTERVAL '1 second') ELSE "RateLimit"."expiresAt" END
    RETURNING "count"`;
  if (rows[0].count > limit)
    throw new HttpError(429, "Trop de requêtes. Patientez avant de réessayer.");
}

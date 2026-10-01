import "server-only";
import { ZodError } from "zod";
import { HttpError } from "./auth";
export function checkOrigin(request: Request) {
  const expected = new URL(
    process.env.NEXTAUTH_URL || process.env.SITE_URL || "http://localhost:3000",
  ).origin;
  if (request.headers.get("origin") !== expected)
    throw new HttpError(403, "Origine de la requête refusée.");
}
export async function readJson(request: Request, limit = 200000) {
  if (!request.headers.get("content-type")?.includes("application/json"))
    throw new HttpError(415, "Format JSON requis.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Requête vide.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > limit) {
      await reader.cancel();
      throw new HttpError(413, "Contenu trop volumineux.");
    }
    chunks.push(value);
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8")) as unknown;
  } catch {
    throw new HttpError(400, "JSON invalide.");
  }
}
export function errorResponse(error: unknown) {
  if (error instanceof HttpError)
    return Response.json({ error: error.message }, { status: error.status });
  if (error instanceof ZodError)
    return Response.json(
      {
        error: error.issues
          .map((i) => `${i.path.join(".")}: ${i.message}`)
          .join(" · "),
      },
      { status: 400 },
    );
  if (
    typeof error === "object" &&
    error &&
    "code" in error &&
    error.code === "P2002"
  )
    return Response.json(
      { error: "Ce slug ou ce nom existe déjà." },
      { status: 409 },
    );
  console.error(
    "Request failed:",
    error instanceof Error ? error.name : "UnknownError",
  );
  return Response.json(
    {
      error: "Le service est temporairement indisponible. Réessayez plus tard.",
    },
    { status: 503 },
  );
}

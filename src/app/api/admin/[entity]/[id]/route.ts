import { HttpError, requireAdmin } from "@/lib/auth";
import {
  entityName,
  findContent,
  saveContent,
  trashContent,
} from "@/lib/admin-content";
import { checkOrigin, errorResponse, readJson } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
type Context = { params: Promise<{ entity: string; id: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    await requireAdmin();
    const { entity, id } = await context.params;
    const content = await findContent(entityName(entity), id);
    if (!content) throw new HttpError(404, "Contenu introuvable.");
    return Response.json(content, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function PUT(request: Request, context: Context) {
  try {
    const user = await requireAdmin();
    checkOrigin(request);
    await rateLimit(`mutate:${user.id}`, 90);
    const { entity, id } = await context.params;
    return Response.json(
      await saveContent(
        entityName(entity),
        await readJson(request),
        user.id,
        id,
      ),
    );
  } catch (e) {
    return errorResponse(e);
  }
}
export async function DELETE(request: Request, context: Context) {
  try {
    const user = await requireAdmin();
    checkOrigin(request);
    await rateLimit(`mutate:${user.id}`, 90);
    const { entity, id } = await context.params;
    await trashContent(entityName(entity), id, user.id);
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}
export async function PATCH(request: Request, context: Context) {
  try {
    const user = await requireAdmin();
    checkOrigin(request);
    await rateLimit(`mutate:${user.id}`, 90);
    const { entity, id } = await context.params;
    await trashContent(entityName(entity), id, user.id, true);
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

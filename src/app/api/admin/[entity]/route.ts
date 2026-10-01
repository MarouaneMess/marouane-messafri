import { requireAdmin } from "@/lib/auth";
import { entityName, listContent, saveContent } from "@/lib/admin-content";
import { checkOrigin, errorResponse, readJson } from "@/lib/http";
import { rateLimit } from "@/lib/rate-limit";
type Context = { params: Promise<{ entity: string }> };
export async function GET(_request: Request, context: Context) {
  try {
    await requireAdmin();
    return Response.json(
      await listContent(entityName((await context.params).entity)),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (e) {
    return errorResponse(e);
  }
}
export async function POST(request: Request, context: Context) {
  try {
    const user = await requireAdmin();
    checkOrigin(request);
    await rateLimit(`mutate:${user.id}`, 90);
    return Response.json(
      await saveContent(
        entityName((await context.params).entity),
        await readJson(request),
        user.id,
      ),
      { status: 201 },
    );
  } catch (e) {
    return errorResponse(e);
  }
}

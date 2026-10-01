import { z } from "zod";
import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkOrigin, readJson, errorResponse } from "@/lib/http";
import { taxonomySchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
const schema = taxonomySchema
  .extend({ kind: z.enum(["category", "tag"]), id: z.string().optional() })
  .strict();
export async function POST(request: Request) {
  try {
    const user = await requireAdmin();
    checkOrigin(request);
    await rateLimit(`mutate:${user.id}`, 90);
    const { kind, id, ...data } = schema.parse(await readJson(request));
    const result = await db.$transaction(async (tx) => {
      const row =
        kind === "category"
          ? id
            ? await tx.category.update({ where: { id }, data })
            : await tx.category.create({ data })
          : id
            ? await tx.tag.update({ where: { id }, data })
            : await tx.tag.create({ data });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: id ? "updated" : "created",
          entityType: kind,
          entityId: row.id,
        },
      });
      return row;
    });
    revalidatePath("/", "layout");
    return Response.json(result);
  } catch (e) {
    return errorResponse(e);
  }
}

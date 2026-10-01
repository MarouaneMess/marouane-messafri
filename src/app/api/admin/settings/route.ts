import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { checkOrigin, readJson, errorResponse } from "@/lib/http";
import { settingsSchema } from "@/lib/validation";
import { rateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
export async function PUT(request: Request) {
  try {
    const user = await requireAdmin();
    checkOrigin(request);
    await rateLimit(`mutate:${user.id}`, 90);
    const data = settingsSchema.parse(await readJson(request));
    await db.$transaction([
      db.siteSettings.upsert({
        where: { id: "site" },
        update: data,
        create: { id: "site", ...data },
      }),
      db.auditLog.create({
        data: {
          userId: user.id,
          action: "updated",
          entityType: "settings",
          entityId: "site",
        },
      }),
    ]);
    revalidatePath("/", "layout");
    return Response.json({ ok: true });
  } catch (e) {
    return errorResponse(e);
  }
}

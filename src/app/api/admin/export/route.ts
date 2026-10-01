import { requireAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { errorResponse } from "@/lib/http";
export async function GET() {
  try {
    await requireAdmin();
    const [posts, projects, research, categories, tags, settings, media] =
      await Promise.all([
        db.post.findMany({ include: { tags: true, category: true } }),
        db.project.findMany(),
        db.securityResearch.findMany(),
        db.category.findMany(),
        db.tag.findMany(),
        db.siteSettings.findUnique({ where: { id: "site" } }),
        db.media.findMany(),
      ]);
    const output = {
      version: 1,
      exportedAt: new Date().toISOString(),
      posts: posts.map(({ authorId: _authorId, ...post }) => post),
      projects,
      research,
      categories,
      tags,
      settings,
      media: media.map((m) => ({
        ...m,
        data: Buffer.from(m.data).toString("base64"),
      })),
    };
    return Response.json(output, {
      headers: {
        "Content-Disposition": 'attachment; filename="portfolio-content.json"',
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    return errorResponse(e);
  }
}

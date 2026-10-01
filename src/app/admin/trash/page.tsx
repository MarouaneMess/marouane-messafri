import { requirePageAdmin } from "@/lib/auth";
import { listContent } from "@/lib/admin-content";
import { ContentList, type ContentRow } from "@/components/admin/content-list";
export default async function Trash() {
  await requirePageAdmin();
  const rows: ContentRow[] = [];
  for (const entity of ["posts", "projects", "security"] as const) {
    for (const r of await listContent(entity))
      if (r.deletedAt)
        rows.push({
          id: r.id,
          title: r.title,
          slug: r.slug,
          status: r.status,
          updatedAt: r.updatedAt.toISOString(),
          entity,
        });
  }
  return (
    <>
      <div className="admin-heading">
        <div>
          <div className="eyebrow">CONTENU CONSERVÉ</div>
          <h1>Corbeille</h1>
          <p>Les contenus restaurés reviennent à l’état de brouillon.</p>
        </div>
      </div>
      <ContentList rows={rows} trash />
    </>
  );
}

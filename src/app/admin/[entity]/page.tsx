import Link from "next/link";
import { notFound } from "next/navigation";
import { requirePageAdmin } from "@/lib/auth";
import { listContent, type Entity } from "@/lib/admin-content";
import { ContentList } from "@/components/admin/content-list";
const titles = {
  posts: "Articles & write-ups",
  projects: "Projets",
  security: "Security Research",
};
export default async function ContentPage({
  params,
}: {
  params: Promise<{ entity: string }>;
}) {
  await requirePageAdmin();
  const { entity } = await params;
  if (!(entity in titles)) notFound();
  const rows = await listContent(entity as Entity);
  return (
    <>
      <div className="admin-heading">
        <div>
          <div className="eyebrow">CONTENT STUDIO</div>
          <h1>{titles[entity as Entity]}</h1>
          <p>Créez, enrichissez et publiez votre contenu.</p>
        </div>
        <Link className="button" href={`/admin/${entity}/new`}>
          + Créer
        </Link>
      </div>
      <ContentList
        rows={rows
          .filter((r) => !r.deletedAt)
          .map((r) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            status: r.status,
            type: "type" in r ? r.type : undefined,
            updatedAt: r.updatedAt.toISOString(),
            entity,
          }))}
      />
    </>
  );
}

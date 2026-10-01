import { requirePageAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { TaxonomyManager } from "@/components/admin/taxonomy-manager";
export default async function TaxonomyPage() {
  await requirePageAdmin();
  const [categories, tags] = await Promise.all([
    db.category.findMany({ orderBy: { name: "asc" } }),
    db.tag.findMany({ orderBy: { name: "asc" } }),
  ]);
  return (
    <>
      <div className="admin-heading">
        <div>
          <div className="eyebrow">ORGANISATION</div>
          <h1>Catégories & tags</h1>
          <p>Renommer un élément met à jour tous les articles associés.</p>
        </div>
      </div>
      <TaxonomyManager categories={categories} tags={tags} />
    </>
  );
}

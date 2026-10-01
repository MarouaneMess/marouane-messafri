import { requirePageAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { MediaLibrary } from "@/components/admin/media-library";
export default async function MediaPage() {
  await requirePageAdmin();
  const media = await db.media.findMany({
    select: { id: true, name: true, width: true, height: true, size: true },
    orderBy: { createdAt: "desc" },
  });
  return (
    <>
      <div className="admin-heading">
        <div>
          <div className="eyebrow">RESSOURCES VISUELLES</div>
          <h1>Médiathèque</h1>
          <p>Couvertures, captures et images d’articles.</p>
        </div>
      </div>
      <MediaLibrary media={media} />
    </>
  );
}

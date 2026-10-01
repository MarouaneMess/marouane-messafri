import { notFound } from "next/navigation";
import { requirePageAdmin } from "@/lib/auth";
import { findContent, type Entity } from "@/lib/admin-content";
import { MarkdownContent } from "@/components/blog/markdown";
import { PageHeading } from "@/components/ui";
export default async function Preview({
  params,
}: {
  params: Promise<{ entity: string; id: string }>;
}) {
  await requirePageAdmin();
  const { entity, id } = await params;
  if (!["posts", "projects", "security"].includes(entity)) notFound();
  const record = await findContent(entity as Entity, id);
  if (!record || record.deletedAt) notFound();
  return (
    <>
      <p className="notice">
        Aperçu privé · Visible uniquement dans votre session administrateur.
      </p>
      <PageHeading label="APERÇU" title={record.title}>
        {"excerpt" in record ? record.excerpt : record.description}
      </PageHeading>
      <MarkdownContent content={record.content} />
      {"problem" in record &&
        [
          ["Problème", record.problem],
          ["Solution", record.solution],
          ["Architecture", record.architecture],
          ["Défis techniques", record.challenges],
          ["Résultats", record.results],
          ["Enseignements", record.lessons],
        ]
          .filter(([, value]) => value)
          .map(([label, value]) => (
            <div className="detail-section" key={label}>
              <h2>{label}</h2>
              <p>{value}</p>
            </div>
          ))}
    </>
  );
}

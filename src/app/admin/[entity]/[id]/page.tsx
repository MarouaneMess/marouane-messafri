import { notFound } from "next/navigation";
import { requirePageAdmin } from "@/lib/auth";
import { findContent, type Entity } from "@/lib/admin-content";
import { postSchema, projectSchema, researchSchema } from "@/lib/validation";
import { Editor } from "@/components/admin/editor";
export default async function EditPage({
  params,
  searchParams,
}: {
  params: Promise<{ entity: string; id: string }>;
  searchParams: Promise<{ type?: string }>;
}) {
  await requirePageAdmin();
  const { entity, id } = await params;
  if (!["posts", "projects", "security"].includes(entity)) notFound();
  const schema =
    entity === "posts"
      ? postSchema
      : entity === "projects"
        ? projectSchema
        : researchSchema;
  let initial: Record<string, unknown>;
  if (id === "new") {
    const type = (await searchParams).type;
    initial = schema.strip().parse({
      title: "Nouveau contenu",
      slug: "nouveau-contenu",
      excerpt: "Un nouvel article",
      description: "Un nouveau contenu",
      content: "",
      ...(entity === "posts"
        ? { type: type === "WRITEUP" ? "WRITEUP" : "BLOG" }
        : {}),
    });
    initial.title = "";
    initial.slug = "";
    if (entity === "posts") initial.excerpt = "";
    else initial.description = "";
  } else {
    const record = await findContent(entity as Entity, id);
    if (!record || record.deletedAt) notFound();
    initial = schema.strip().parse(record);
  }
  return (
    <Editor
      entity={entity}
      initial={initial}
      initialId={id === "new" ? undefined : id}
    />
  );
}

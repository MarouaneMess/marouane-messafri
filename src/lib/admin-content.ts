import "server-only";
import { db } from "./db";
import { HttpError } from "./auth";
import { postSchema, projectSchema, researchSchema } from "./validation";
import { slugify } from "./utils";
import { revalidatePath } from "next/cache";
export type Entity = "posts" | "projects" | "security";
export function entityName(value: string): Entity {
  if (value !== "posts" && value !== "projects" && value !== "security")
    throw new HttpError(404, "Contenu introuvable.");
  return value;
}
export async function listContent(entity: Entity) {
  if (entity === "posts")
    return db.post.findMany({
      include: { category: true, tags: true },
      orderBy: { updatedAt: "desc" },
    });
  if (entity === "projects")
    return db.project.findMany({ orderBy: { updatedAt: "desc" } });
  return db.securityResearch.findMany({ orderBy: { updatedAt: "desc" } });
}
export async function findContent(entity: Entity, id: string) {
  if (entity === "posts") {
    const post = await db.post.findUnique({
      where: { id },
      include: { tags: true, category: true },
    });
    return post
      ? {
          ...post,
          tags: post.tags.map((t) => t.name),
          category: post.category?.name || "Notes",
        }
      : null;
  }
  if (entity === "projects") return db.project.findUnique({ where: { id } });
  return db.securityResearch.findUnique({ where: { id } });
}
export async function saveContent(
  entity: Entity,
  input: unknown,
  userId: string,
  id?: string,
) {
  const parsed =
    entity === "posts"
      ? postSchema.parse(input)
      : entity === "projects"
        ? projectSchema.parse(input)
        : researchSchema.parse(input);
  const previous = id ? await findContent(entity, id) : null;
  if (id && (!previous || previous.deletedAt))
    throw new HttpError(404, "Contenu introuvable.");
  if (previous && previous.version !== parsed.version)
    throw new HttpError(
      409,
      "Ce contenu a changé. Rechargez la page avant de le modifier.",
    );
  const record = await db.$transaction(async (tx) => {
    let saved;
    if (entity === "posts") {
      const { version, category, tags, ...fields } = postSchema.parse(input);
      const categorySlug = slugify(category || "Notes");
      if (!categorySlug || tags.some((t) => !slugify(t)))
        throw new HttpError(
          400,
          "Catégories et tags doivent contenir des lettres ou chiffres.",
        );
      const cat = await tx.category.upsert({
        where: { slug: categorySlug },
        update: {},
        create: { name: category || "Notes", slug: categorySlug },
      });
      const tagRecords = await Promise.all(
        [...new Map(tags.map((t) => [slugify(t), t])).entries()].map(
          ([slug, name]) =>
            tx.tag.upsert({
              where: { slug },
              update: {},
              create: { name, slug },
            }),
        ),
      );
      const data = {
        ...fields,
        authorId: userId,
        categoryId: cat.id,
        publishedAt:
          fields.status === "PUBLISHED"
            ? (previous && "publishedAt" in previous
                ? previous.publishedAt
                : null) || new Date()
            : null,
      };
      saved = id
        ? await tx.post.update({
            where: { id, version },
            data: {
              ...data,
              tags: { set: tagRecords.map((t) => ({ id: t.id })) },
              version: { increment: 1 },
            },
          })
        : await tx.post.create({
            data: {
              ...data,
              sourceSlug: fields.slug,
              tags: { connect: tagRecords.map((t) => ({ id: t.id })) },
            },
          });
    } else if (entity === "projects") {
      const { version, ...data } = projectSchema.parse(input);
      saved = id
        ? await tx.project.update({
            where: { id, version },
            data: { ...data, version: { increment: 1 } },
          })
        : await tx.project.create({ data });
    } else {
      const { version, ...fields } = researchSchema.parse(input);
      const data = {
        ...fields,
        publishedAt:
          fields.status === "PUBLISHED"
            ? (previous && "publishedAt" in previous
                ? previous.publishedAt
                : null) || new Date()
            : null,
      };
      saved = id
        ? await tx.securityResearch.update({
            where: { id, version },
            data: { ...data, version: { increment: 1 } },
          })
        : await tx.securityResearch.create({ data });
    }
    await tx.auditLog.create({
      data: {
        action: `${id ? "updated" : "created"}:${parsed.status.toLowerCase()}`,
        entityType: entity,
        entityId: saved.id,
        userId,
      },
    });
    return saved;
  });
  revalidatePath("/", "layout");
  return { id: record.id, version: record.version, status: record.status };
}
export async function trashContent(
  entity: Entity,
  id: string,
  userId: string,
  restore = false,
) {
  if (!(await findContent(entity, id)))
    throw new HttpError(404, "Contenu introuvable.");
  await db.$transaction(async (tx) => {
    const data = {
      deletedAt: restore ? null : new Date(),
      status: "DRAFT" as const,
      version: { increment: 1 },
    };
    if (entity === "posts") await tx.post.update({ where: { id }, data });
    else if (entity === "projects")
      await tx.project.update({ where: { id }, data });
    else await tx.securityResearch.update({ where: { id }, data });
    await tx.auditLog.create({
      data: {
        action: restore ? "restored" : "deleted",
        entityType: entity,
        entityId: id,
        userId,
      },
    });
  });
  revalidatePath("/", "layout");
}

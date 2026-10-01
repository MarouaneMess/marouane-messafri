import { config } from "dotenv";
config({ path: ".env.local", quiet: true });
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { projects } from "../src/data/projects";
import { research } from "../src/data/research";
import { getFilePosts } from "../src/lib/file-posts";
import { slugify } from "../src/lib/utils";
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function main() {
  for (const { version: _version, ...project } of projects) {
    if (project.slug === "du-pain-et-du-bonheur") {
      project.repoName = "Boulangerie-Du-Pain-et-du-Bonheur";
      project.githubUrl =
        "https://github.com/MarouaneMess/Boulangerie-Du-Pain-et-du-Bonheur";
    }
    await db.project.upsert({
      where: { slug: project.slug },
      update: {},
      create: project,
    });
  }
  for (const { version: _version, ...item } of research)
    await db.securityResearch.upsert({
      where: { slug: item.slug },
      update: {},
      create: item,
    });
  for (const {
    version: _version,
    category,
    tags,
    id: _id,
    updatedAt: _updatedAt,
    ...post
  } of await getFilePosts()) {
    const cat = await db.category.upsert({
      where: { slug: slugify(category) },
      update: {},
      create: { name: category, slug: slugify(category) },
    });
    await db.post.upsert({
      where: { sourceSlug: post.slug },
      update: {},
      create: {
        ...post,
        sourceSlug: post.slug,
        categoryId: cat.id,
        tags: {
          connectOrCreate: tags.map((name) => ({
            where: { slug: slugify(name) },
            create: { name, slug: slugify(name) },
          })),
        },
      },
    });
  }
  console.log(
    "Seed complete. Existing content preserved; no administrator credentials created.",
  );
}
main().finally(() => db.$disconnect());

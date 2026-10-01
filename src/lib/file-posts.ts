import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { postSchema, type Post } from "./validation";
export async function getFilePosts(): Promise<Post[]> {
  const directory = path.join(process.cwd(), "content/blog");
  const files = await fs.readdir(directory).catch(() => [] as string[]);
  const results = await Promise.all(
    files
      .filter((f) => /\.mdx?$/.test(f))
      .map(async (file) => {
        try {
          const { data, content } = matter(
            await fs.readFile(path.join(directory, file), "utf8"),
          );
          const post = postSchema.parse({
            title: data.title,
            slug: file.replace(/\.mdx?$/, ""),
            excerpt: data.description,
            content,
            type: data.type || "BLOG",
            status: data.published === true ? "PUBLISHED" : "DRAFT",
            coverImage: data.cover || "",
            category: data.category || "Notes",
            tags: data.tags || [],
          });
          const date = data.date ? new Date(data.date).toISOString() : null;
          return {
            ...post,
            publishedAt: date,
            updatedAt: data.updatedAt
              ? new Date(data.updatedAt).toISOString()
              : undefined,
          };
        } catch {
          console.warn("An invalid Markdown article was skipped.");
          return null;
        }
      }),
  );
  return results.filter((p): p is NonNullable<typeof p> => p !== null);
}

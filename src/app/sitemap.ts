import { getPosts, getProjects, getResearch } from "@/lib/content";
import { siteUrl } from "@/lib/seo";
import type { MetadataRoute } from "next";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [posts, projects, research] = await Promise.all([
    getPosts(),
    getProjects(),
    getResearch(),
  ]);
  return [
    "/",
    "/about",
    "/projects",
    "/security",
    "/blog",
    "/services",
    "/contact",
    ...posts.map((p) => `/blog/${p.slug}`),
    ...projects.map((p) => `/projects/${p.slug}`),
    ...research.map((r) => `/security/${r.slug}`),
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    changeFrequency: "weekly" as const,
    priority: path === "/" ? 1 : 0.7,
  }));
}

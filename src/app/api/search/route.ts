import { NextResponse } from "next/server";
import { getProjects, getPosts, getResearch } from "@/lib/content";
import type { SearchEntry } from "@/lib/search";
export const dynamic = "force-dynamic";
export async function GET() {
  try {
    const [projects, posts, research] = await Promise.all([
      getProjects(),
      getPosts(),
      getResearch(),
    ]);
    const items: SearchEntry[] = [
      ...projects.map((project) => ({
        title: project.title,
        href: `/projects/${project.slug}`,
        group: "Projet",
        description: project.description,
        keywords: [
          project.category,
          ...project.technologies,
          ...(project.topics || []),
        ].join(" "),
      })),
      ...research.map((entry) => ({
        title: entry.title,
        href: `/security/${entry.slug}`,
        group: "Recherche",
        description: entry.description,
        keywords: `${entry.cveId} ${entry.product} ${entry.vulnerabilityType}`,
      })),
      ...posts.map((post) => ({
        title: post.title,
        href: `/blog/${post.slug}`,
        group: "Journal",
        description: post.excerpt,
        keywords: [post.category, ...post.tags].join(" "),
      })),
    ];
    return NextResponse.json(
      { items },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "La recherche est momentanément indisponible." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}

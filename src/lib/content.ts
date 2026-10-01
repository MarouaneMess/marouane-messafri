import "server-only";
import { cache } from "react";
import { db } from "./db";
import { projects as localProjects } from "@/data/projects";
import { research as localResearch } from "@/data/research";
import { site } from "@/config/site";
import { githubConfig } from "@/config/github";
import { getFilePosts } from "./file-posts";
import { getGithubProjects } from "./github";
import { isPublic } from "./utils";
import {
  researchSchema,
  type Post,
  type Project,
  type Research,
  type Settings,
} from "./validation";
export const getSettings = cache(async (): Promise<Settings> => {
  const defaults = {
    heroMessage: site.heroMessage,
    availability: site.availability,
    contactEmail: process.env.CONTACT_EMAIL || site.email,
    github: site.github,
    linkedin: site.linkedin,
  };
  if (!process.env.DATABASE_URL) return defaults;
  return (
    (await db.siteSettings.findUnique({ where: { id: "site" } })) ?? defaults
  );
});
export const getProjects = cache(async (): Promise<Project[]> => {
  const [github, stored] = await Promise.all([
    getGithubProjects(),
    process.env.DATABASE_URL ? db.project.findMany() : Promise.resolve([]),
  ]);
  const merged = new Map<string, Project>();
  const githubHidden = new Set(githubConfig.hidden.map((x) => x.toLowerCase()));
  for (const p of github.projects)
    if (
      githubConfig.include.includes(p.repoName) &&
      !githubHidden.has(p.repoName.toLowerCase())
    )
      merged.set(p.slug, p);
  if (!process.env.DATABASE_URL)
    for (const p of localProjects)
      merged.set(p.slug, { ...p, source: "local" });
  for (const p of stored) {
    const repo = github.projects.find(
      (g) => g.repoName.toLowerCase() === p.repoName.toLowerCase(),
    );
    if (repo) merged.delete(repo.slug);
    merged.delete(p.slug);
    if (isPublic(p))
      merged.set(p.slug, {
        ...p,
        githubUrl: p.githubUrl || repo?.githubUrl || "",
        demoUrl: p.demoUrl || repo?.demoUrl || "",
        technologies: p.technologies.length
          ? p.technologies
          : repo?.technologies || [],
        stars: repo?.stars,
        topics: repo?.topics,
        forks: repo?.forks,
        updatedAt: p.updatedAt.toISOString(),
        source: "database",
      });
  }
  return [...merged.values()]
    .filter(isPublic)
    .sort(
      (a, b) =>
        Number(b.featured) - Number(a.featured) || a.sortOrder - b.sortOrder,
    );
});
export const getPosts = cache(async (): Promise<Post[]> => {
  const [files, stored] = await Promise.all([
    getFilePosts(),
    process.env.DATABASE_URL
      ? db.post.findMany({ include: { category: true, tags: true } })
      : Promise.resolve([]),
  ]);
  const merged = new Map<string, Post>(files.map((p) => [p.slug, p]));
  for (const p of stored) {
    if (p.sourceSlug) merged.delete(p.sourceSlug);
    merged.delete(p.slug);
    if (isPublic(p))
      merged.set(p.slug, {
        ...p,
        category: p.category?.name || "Notes",
        tags: p.tags.map((t) => t.name),
        publishedAt: p.publishedAt?.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
      });
  }
  return [...merged.values()]
    .filter(isPublic)
    .sort((a, b) => (b.publishedAt || "").localeCompare(a.publishedAt || ""));
});
export const getResearch = cache(async (): Promise<Research[]> => {
  const stored = process.env.DATABASE_URL
    ? await db.securityResearch.findMany()
    : [];
  const merged = new Map<string, Research>(
    (process.env.DATABASE_URL ? [] : localResearch).map((r) => [r.slug, r]),
  );
  for (const r of stored) {
    merged.delete(r.slug);
    if (isPublic(r))
      merged.set(r.slug, { ...researchSchema.strip().parse(r), id: r.id });
  }
  return [...merged.values()].filter(isPublic);
});

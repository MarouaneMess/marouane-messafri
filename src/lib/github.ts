import "server-only";
import { cache } from "react";
import { z } from "zod";
import { githubConfig } from "@/config/github";
import { projectSchema, safeUrl, type Project } from "./validation";
import { slugify } from "./utils";
const repoSchema = z.object({
  name: z.string(),
  description: z.string().nullable(),
  html_url: z.url(),
  homepage: z.string().nullable(),
  stargazers_count: z.number(),
  forks_count: z.number(),
  language: z.string().nullable(),
  topics: z.array(z.string()).default([]),
  updated_at: z.string(),
  fork: z.boolean(),
  archived: z.boolean(),
});
export const getGithubProjects = cache(
  async (): Promise<{ projects: Project[]; available: boolean }> => {
    const username = process.env.GITHUB_USERNAME || githubConfig.username;
    if (!username) return { projects: [], available: false };
    try {
      const repos: z.infer<typeof repoSchema>[] = [];
      for (let page = 1; page <= 5; page++) {
        const response = await fetch(
          `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100&sort=updated&page=${page}`,
          {
            headers: {
              Accept: "application/vnd.github+json",
              ...(process.env.GITHUB_TOKEN
                ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
                : {}),
            },
            next: { revalidate: 3600, tags: ["github"] },
            signal: AbortSignal.timeout(8000),
          },
        );
        if (!response.ok) throw new Error("GitHub unavailable");
        const batch = z.array(repoSchema).parse(await response.json());
        repos.push(...batch);
        if (batch.length < 100) break;
      }
      return {
        available: true,
        projects: repos
          .filter((r) => !r.fork && !r.archived)
          .map((r) => ({
            ...projectSchema.parse({
              title: r.name,
              slug: slugify(r.name),
              repoName: r.name,
              description:
                r.description ||
                "Projet open source. Retrouvez le code et la documentation sur GitHub.",
              githubUrl: r.html_url,
              demoUrl: safeUrl.safeParse(r.homepage ?? "").success
                ? (r.homepage ?? "")
                : "",
              category: "Open Source",
              technologies: r.language ? [r.language] : [],
              status: "PUBLISHED",
            }),
            stars: r.stargazers_count,
            topics: r.topics,
            forks: r.forks_count,
            updatedAt: r.updated_at,
            source: "github" as const,
          })),
      };
    } catch {
      return { projects: [], available: false };
    }
  },
);

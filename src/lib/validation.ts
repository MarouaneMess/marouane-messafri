import { z } from "zod";
export const slugSchema = z
  .string()
  .min(1)
  .max(140)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "Utilisez des lettres minuscules, chiffres et tirets.",
  );
const text = (max = 300) => z.string().trim().max(max);
export const safeUrl = z.union([
  z.literal(""),
  z
    .url()
    .max(2000)
    .refine((v) => /^https?:\/\//.test(v), "Lien HTTP(S) requis."),
]);
export const imageUrl = z.union([
  z.literal(""),
  z.string().regex(/^\/api\/media\/[a-zA-Z0-9-]+$/),
  z
    .string()
    .regex(
      /^\/(?:projects|images)\/[a-zA-Z0-9/_.-]+\.(?:png|jpe?g|webp|avif)$/,
    ),
]);
const common = {
  title: text(180).min(2),
  slug: slugSchema,
  status: z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]).default("DRAFT"),
  version: z.number().int().positive().optional(),
};
export const postSchema = z
  .object({
    ...common,
    excerpt: text(600).min(5),
    content: text(100000),
    type: z.enum(["BLOG", "WRITEUP", "ARTICLE"]).default("BLOG"),
    coverImage: imageUrl.default(""),
    category: text(80).default("Notes"),
    tags: z.array(text(50).min(1)).max(20).default([]),
  })
  .strict();
export const projectSchema = z
  .object({
    ...common,
    description: text(800).min(5),
    content: text(100000).default(""),
    repoName: text(150)
      .regex(/^[a-zA-Z0-9_.-]*$/)
      .default(""),
    githubUrl: safeUrl.default(""),
    demoUrl: safeUrl.default(""),
    coverImage: imageUrl.default(""),
    category: text(80).default("Development"),
    technologies: z.array(text(60).min(1)).max(30).default([]),
    screenshots: z.array(imageUrl).max(20).default([]),
    role: text().default(""),
    problem: text(5000).default(""),
    solution: text(5000).default(""),
    architecture: text(5000).default(""),
    challenges: text(5000).default(""),
    lessons: text(5000).default(""),
    results: text(5000).default(""),
    featured: z.boolean().default(false),
    hidden: z.boolean().default(false),
    sortOrder: z.number().int().min(-1000).max(1000).default(0),
  })
  .strict();
export const researchSchema = z
  .object({
    ...common,
    type: text(80).default("CVE"),
    cveId: text(40)
      .refine(
        (v) => !v || /^CVE-\d{4}-\d{4,}$/.test(v),
        "Identifiant CVE invalide.",
      )
      .default(""),
    product: text().default(""),
    affectedVersions: text().default(""),
    vulnerabilityType: text().default(""),
    severity: z.enum(["Low", "Medium", "High", "Critical"]).default("Medium"),
    cvss: z.number().min(0).max(10).nullable().default(null),
    cvssV3: z.number().min(0).max(10).nullable().default(null),
    description: text(3000).min(5),
    content: text(100000).default(""),
    disclosurePlatform: text().default(""),
    resolution: text().default(""),
    timeline: z
      .array(
        z
          .object({
            label: text(180).min(1),
            date: text(40),
            description: text(500),
          })
          .strict(),
      )
      .max(30)
      .default([]),
    references: z
      .array(
        z
          .object({
            label: text(180).min(1),
            url: z.url().refine((v) => v.startsWith("https://")),
          })
          .strict(),
      )
      .max(20)
      .default([]),
  })
  .strict();
export const settingsSchema = z
  .object({
    heroMessage: text(200),
    availability: z.boolean(),
    contactEmail: z.union([z.literal(""), z.email().max(254)]),
    github: safeUrl,
    linkedin: safeUrl,
  })
  .strict();
export const taxonomySchema = z
  .object({ name: text(80).min(1), slug: slugSchema })
  .strict();
export const contactSchema = z
  .object({
    name: text(120).min(2),
    email: z.email().max(254),
    company: text(160).default(""),
    subject: z.enum([
      "Freelance",
      "Collaboration",
      "Recrutement",
      "Cybersécurité",
      "Autre",
    ]),
    message: text(5000).min(20),
    website: z.string().max(0).default(""),
  })
  .strict();
export type Project = z.infer<typeof projectSchema> & {
  topics?: string[];
  id?: string;
  stars?: number;
  forks?: number;
  updatedAt?: string;
  source?: "github" | "local" | "database";
};
export type Post = z.infer<typeof postSchema> & {
  id?: string;
  publishedAt?: string | null;
  updatedAt?: string;
};
export type Research = z.infer<typeof researchSchema> & {
  id?: string;
  publishedAt?: string | null;
};
export type Settings = z.infer<typeof settingsSchema>;

import type { Metadata } from "next";
import { site } from "@/config/site";
export const siteUrl = process.env.SITE_URL || "http://localhost:3000";
export function metadata(
  title: string,
  description: string,
  path: string,
): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: `${title} · ${site.name}`,
      description,
      url: path,
      type: "website",
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

import { getPosts } from "@/lib/content";
import { PageHeading } from "@/components/ui";
import { BlogExplorer } from "@/components/blog/blog-explorer";
import { metadata as makeMetadata } from "@/lib/seo";
export const metadata = makeMetadata(
  "Journal",
  "Notes de développement, recherche en sécurité et write-ups.",
  "/blog",
);
export default async function Blog() {
  return (
    <div className="container page-content">
      <PageHeading
        label="JOURNAL / NOTES & WRITE-UPS"
        title="Apprendre à voix haute."
      >
        Des notes de développement, des recherches et les idées qui restent
        après avoir fermé l’éditeur.
      </PageHeading>
      <BlogExplorer posts={await getPosts()} />
    </div>
  );
}

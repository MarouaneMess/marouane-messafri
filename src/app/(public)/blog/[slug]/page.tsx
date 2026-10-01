import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getHeadings } from "@/lib/headings";
import { getPosts } from "@/lib/content";
import { metadata } from "@/lib/seo";
import { formatDate, readingTime } from "@/lib/utils";
import { PageHeading, Tags, SectionHeading } from "@/components/ui";
import { MarkdownContent } from "@/components/blog/markdown";
import { PostCard } from "@/components/blog/post-card";
import { JsonLd } from "@/components/json-ld";
import { site } from "@/config/site";
import { siteUrl } from "@/lib/seo";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const post = (await getPosts()).find((p) => p.slug === slug);
  return post ? metadata(post.title, post.excerpt, `/blog/${slug}`) : {};
}
export default async function Article({ params }: Props) {
  const { slug } = await params;
  const posts = await getPosts();
  const index = posts.findIndex((p) => p.slug === slug);
  const post = posts[index];
  if (!post) notFound();
  const headings = getHeadings(post.content);
  const related = posts
    .filter(
      (p) =>
        p.slug !== slug &&
        (p.category === post.category ||
          p.tags.some((t) => post.tags.includes(t))),
    )
    .slice(0, 2);
  return (
    <div className="container page-content">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.excerpt,
          author: { "@type": "Person", name: site.name, url: siteUrl },
          datePublished: post.publishedAt || undefined,
          dateModified: post.updatedAt,
          mainEntityOfPage: `${siteUrl}/blog/${slug}`,
          inLanguage: "fr",
        }}
      />
      <PageHeading label={`JOURNAL / ${post.category}`} title={post.title}>
        {post.excerpt}
      </PageHeading>
      <Tags values={post.tags} />
      <div className="article-date">
        <span>{formatDate(post.publishedAt)}</span>
        <span>{readingTime(post.content)} min de lecture</span>
        {post.updatedAt && (
          <span>Mis à jour le {formatDate(post.updatedAt)}</span>
        )}
      </div>
      {post.coverImage && (
        <Image
          src={post.coverImage}
          width={1200}
          height={650}
          alt={post.title}
          style={{ marginTop: 30, borderRadius: 8, height: "auto" }}
        />
      )}
      <div className="article-layout">
        <article>
          <MarkdownContent content={post.content} />
          <nav className="article-navigation" aria-label="Articles voisins">
            {posts[index - 1] && (
              <Link href={`/blog/${posts[index - 1].slug}`}>
                <small>← Article précédent</small>
                {posts[index - 1].title}
              </Link>
            )}
            {posts[index + 1] && (
              <Link href={`/blog/${posts[index + 1].slug}`}>
                <small>Article suivant →</small>
                {posts[index + 1].title}
              </Link>
            )}
          </nav>
        </article>
        {headings.length > 0 && (
          <aside className="article-aside">
            <h3 className="eyebrow">DANS CET ARTICLE</h3>
            <ol>
              {headings.map((h) => (
                <li key={h.id}>
                  <a href={`#${h.id}`}>{h.text}</a>
                </li>
              ))}
            </ol>
          </aside>
        )}
      </div>
      {related.length > 0 && (
        <section className="section">
          <SectionHeading label="POUR CONTINUER" title="À lire aussi." />
          <div className="post-grid">
            {related.map((p) => (
              <PostCard post={p} key={p.slug} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

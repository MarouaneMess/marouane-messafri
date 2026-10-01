import { notFound } from "next/navigation";
import { getResearch } from "@/lib/content";
import { PageHeading } from "@/components/ui";
import { MarkdownContent } from "@/components/blog/markdown";
import { metadata } from "@/lib/seo";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const r = (await getResearch()).find((r) => r.slug === slug);
  return r
    ? metadata(r.cveId || r.title, r.description, `/security/${slug}`)
    : {};
}
export default async function ResearchDetail({ params }: Props) {
  const { slug } = await params;
  const r = (await getResearch()).find((r) => r.slug === slug);
  if (!r) notFound();
  return (
    <div className="container page-content">
      <PageHeading
        label={`SECURITY RESEARCH / ${r.cveId || r.type}`}
        title={r.title}
      >
        {r.description}
      </PageHeading>
      <div className="detail-grid">
        <div>
          {r.content && <MarkdownContent content={r.content} />}
          {r.timeline.length > 0 && (
            <>
              <h2>Du signalement au correctif</h2>
              <div className="timeline">
                {r.timeline.map((item, i) => (
                  <div className="timeline-item" key={i}>
                    {item.date && <time>{item.date}</time>}
                    <h3>{item.label}</h3>
                    <p>{item.description}</p>
                  </div>
                ))}
              </div>
            </>
          )}
          {r.references.length > 0 && (
            <>
              <h2>Références</h2>
              <ul>
                {r.references.map((ref) => (
                  <li key={ref.url}>
                    <a
                      className="text-link"
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {ref.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </>
          )}
          <p className="notice">
            Cette fiche présente la recherche et sa divulgation responsable. Les
            versions et dates non renseignées ne sont pas extrapolées.
          </p>
        </div>
        <aside className="detail-sidebar">
          <h3>Fiche technique</h3>
          <dl>
            {[
              ["Identifiant", r.cveId],
              ["Produit", r.product],
              ["Versions affectées", r.affectedVersions],
              ["Catégorie", r.vulnerabilityType],
              ["Plateforme", r.disclosurePlatform],
              ["CVSS v4.0", r.cvss?.toFixed(1)],
              ["CVSS v3.1", r.cvssV3?.toFixed(1)],
              ["Statut", r.resolution],
            ]
              .filter(([, value]) => value)
              .map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
          </dl>
        </aside>
      </div>
    </div>
  );
}

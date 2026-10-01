import Link from "next/link";
import { Fingerprint, Flag, ShieldCheck, ArrowUpRight } from "lucide-react";
import { PageHeading, SectionHeading } from "@/components/ui";
import { getResearch } from "@/lib/content";
import { ContactCTA } from "@/components/contact-cta";
import { metadata as makeMetadata } from "@/lib/seo";
export const metadata = makeMetadata(
  "Security Research",
  "Recherche CVE, bug bounty, CTF et divulgation responsable.",
  "/security",
);
export default async function Security() {
  const research = await getResearch();
  return (
    <div className="container">
      <PageHeading
        label="SECURITY RESEARCH / c0fff33"
        title="Comprendre les failles. Renforcer les systèmes."
      >
        La sécurité est une discipline de compréhension. Mes recherches
        explorent les frontières de confiance et les défauts d’autorisation des
        applications web.
      </PageHeading>
      <div className="research-list">
        {research.map((r) => (
          <Link
            className="research-feature"
            key={r.slug}
            href={`/security/${r.slug}`}
          >
            <div className="research-symbol">
              <Fingerprint size={65} strokeWidth={1} />
              <span className="mono">RESPONSIBLE DISCLOSURE</span>
            </div>
            <div>
              <div className="research-badges">
                <span className="badge badge-cyan">{r.cveId || r.type}</span>
                <span className="badge">{r.resolution || r.severity}</span>
              </div>
              <h3>{r.title}</h3>
              <p>{r.description}</p>
              <div className="text-link">
                Lire la fiche de recherche <ArrowUpRight size={16} />
              </div>
            </div>
            {r.cvss !== null && (
              <div className="cvss">
                <span className="mono">CVSS v4.0</span>
                <strong>{r.cvss.toFixed(1)}</strong>
                <span>{r.severity}</span>
              </div>
            )}
          </Link>
        ))}
      </div>
      <div className="research-pillars">
        <div>
          <Fingerprint />
          <h3>Bug bounty</h3>
          <p>
            Recherche de vulnérabilités web dans le cadre de programmes
            autorisés, avec un signalement structuré et une attention portée au
            correctif.
          </p>
        </div>
        <div>
          <Flag />
          <h3>Capture The Flag</h3>
          <p>
            Participation régulière à des CTF. Top 1 % sur Hack The Box et
            participation à une équipe CTFtime ayant atteint le Top 3 mondial.
          </p>
        </div>
        <div>
          <ShieldCheck />
          <h3>Web Security</h3>
          <p>
            Analyse de la logique applicative, des contrôles d’accès et des
            frontières de confiance. Apprendre pour mieux concevoir.
          </p>
        </div>
      </div>
      <section className="about-strip">
        <div className="eyebrow">
          RESPONSIBLE
          <br />
          DISCLOSURE
        </div>
        <div>
          <SectionHeading
            label="UNE MÉTHODE, UN CADRE"
            title="La recherche implique une responsabilité."
          />
          <p>
            Mes travaux s’inscrivent dans un périmètre autorisé. Les constats
            sont partagés avec les équipes concernées et les publications
            respectent les conditions de divulgation. Ce portfolio présente les
            causes et les corrections sans procédure d’exploitation.
          </p>
        </div>
      </section>
      <ContactCTA />
    </div>
  );
}

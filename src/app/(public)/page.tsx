import Link from "next/link";
import {
  ArrowDown,
  ArrowUpRight,
  Download,
  Code2,
  Fingerprint,
  Trophy,
  GitBranch,
  GraduationCap,
} from "lucide-react";
import { site } from "@/config/site";
import { getProjects, getPosts, getResearch, getSettings } from "@/lib/content";
import { ButtonLink, SectionHeading } from "@/components/ui";
import { InteractiveCore } from "@/components/home/interactive-core";
import { Experience } from "@/components/home/experience";
import { MethodSection } from "@/components/home/method-section";
import { SelectedWork } from "@/components/home/selected-work";
import { ExpertiseExplorer } from "@/components/home/expertise-explorer";
import { PostCard } from "@/components/blog/post-card";
import { ServicesGrid } from "@/components/services-grid";
import { ContactCTA } from "@/components/contact-cta";
import { JsonLd } from "@/components/json-ld";
import { siteUrl } from "@/lib/seo";
export const metadata = { alternates: { canonical: "/" } };
export default async function Home() {
  const [projects, posts, research, settings] = await Promise.all([
    getProjects(),
    getPosts(),
    getResearch(),
    getSettings(),
  ]);
  return (
    <div className="container">
      <Experience />
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Person",
              "@id": `${siteUrl}/#person`,
              name: site.name,
              alternateName: site.alias,
              url: siteUrl,
              jobTitle: site.title,
              sameAs: [settings.github, settings.linkedin].filter(Boolean),
            },
            {
              "@type": "WebSite",
              name: site.name,
              url: siteUrl,
              inLanguage: "fr",
            },
          ],
        }}
      />
      <section className="hero">
        <div className="hero-copy">
          <div className="availability">
            <i className="status-dot" />
            {settings.availability
              ? "Ouvert aux projets & aux opportunités"
              : "Concentré sur mes projets actuels"}
          </div>
          <div className="hero-intro">
            Bonjour, je suis {site.name}
            <span> ↗</span>
          </div>
          <h1>
            {settings.heroMessage === site.heroMessage ? (
              <>
                Je construis.
                <br />
                J’explore.
                <br />
                <span>Je sécurise.</span>
              </>
            ) : (
              settings.heroMessage
            )}
          </h1>
          <p className="hero-role">
            Full-Stack Developer <span>&</span> Cybersecurity Researcher
          </p>
          <p className="hero-description">
            Du code à la recherche de vulnérabilités, je relie deux univers pour
            construire des applications plus solides.
          </p>
          <div className="hero-actions">
            <ButtonLink href="/projects">Explorer mes projets</ButtonLink>
            <ButtonLink href="/security" secondary>
              Mes recherches
            </ButtonLink>
          </div>
          <div className="hero-foot">
            <span className="mono">
              ALIAS <span className="bright">{site.alias}</span>
            </span>
            <span className="hero-foot-divider" />
            {site.resume ? (
              <a href={site.resume} download>
                <Download size={13} /> Télécharger mon CV
              </a>
            ) : (
              <Link href="/contact">
                <Download size={13} /> Demander mon CV
              </Link>
            )}
          </div>
        </div>
        <InteractiveCore />
        <a className="scroll-cue mono" href="#selected-work">
          <ArrowDown size={13} /> EXPLORER LE PORTFOLIO
        </a>
        <div className="hero-edition mono">
          SOFTWARE × SECURITY
          <br />
          <span>PORTFOLIO / {new Date().getFullYear()}</span>
        </div>
      </section>
      <div className="credibility">
        <div>
          <Fingerprint />
          <strong>
            {String(research.filter((r) => r.type === "CVE").length).padStart(
              2,
              "0",
            )}
          </strong>
          <span>CVE documentée</span>
        </div>
        <div>
          <Trophy />
          <strong>Top 1 %</strong>
          <span>Hack The Box</span>
        </div>
        <div>
          <Code2 />
          <strong>Build × Break</strong>
          <span>Une double perspective</span>
        </div>
        <div>
          <GraduationCap />
          <strong>Master MIAGE</strong>
          <span>{site.university}</span>
        </div>
      </div>
      <section id="selected-work" className="section">
        <SectionHeading
          number="01"
          label="PROJETS SÉLECTIONNÉS"
          title="Des idées devenues applications."
          description="Développement, outils et sécurité. Une sélection de ce que je construis."
          href="/projects"
          linkText="Tous les projets"
        />
        <SelectedWork
          projects={projects.filter((p) => p.featured).slice(0, 3)}
        />
      </section>
      <MethodSection />
      <section className="about-strip">
        <span className="eyebrow">
          DEUX DISCIPLINES.
          <br />
          UNE MÊME CURIOSITÉ.
        </span>
        <div>
          <h2>
            Comprendre comment un système se construit.
            <br />
            <span>Et ce qui peut le faire échouer.</span>
          </h2>
          <p>
            Étudiant en MIAGE, développeur et chercheur en cybersécurité. Je
            pense que comprendre les failles rend meilleur développeur — et que
            savoir construire rend meilleur chercheur.
          </p>
          <Link className="text-link" href="/about">
            Un peu plus sur moi <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
      <section className="section">
        <SectionHeading
          number="02"
          label="SECURITY RESEARCH"
          title="La curiosité, avec un cadre."
          description="Recherche de vulnérabilités, CTF et divulgation responsable."
          href="/security"
          linkText="Explorer mes recherches"
        />
        {research[0] && (
          <Link
            href={`/security/${research[0].slug}`}
            className="research-feature"
          >
            <div className="research-symbol">
              <Fingerprint size={66} strokeWidth={0.8} />
              <span className="mono">RESEARCH / 001</span>
            </div>
            <div className="research-feature-body">
              <div className="research-badges">
                <span className="badge badge-cyan">{research[0].cveId}</span>
                <span className="badge">
                  <i className="status-dot" /> {research[0].resolution}
                </span>
              </div>
              <h3>{research[0].product}</h3>
              <p>{research[0].description}</p>
              <div className="mono research-foot">
                {research[0].vulnerabilityType}
                <ArrowUpRight size={18} />
              </div>
            </div>
            <div className="cvss">
              <span className="mono">CVSS v4.0</span>
              <strong>{research[0].cvss?.toFixed(1)}</strong>
              <span>Sévérité modérée</span>
            </div>
          </Link>
        )}
      </section>
      <section className="section skills-section">
        <SectionHeading
          number="03"
          label="TOOLBOX"
          title="Les outils derrière les idées."
        />
        <ExpertiseExplorer />
      </section>
      <section className="section">
        <SectionHeading
          number="04"
          label="NOTES & WRITE-UPS"
          title="Apprendre. Documenter. Partager."
          href="/blog"
          linkText="Ouvrir le journal"
        />
        <div className="post-grid">
          {posts.slice(0, 3).map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      </section>
      <section className="section">
        <SectionHeading
          number="05"
          label="COLLABORONS"
          title="Votre prochain projet commence ici."
          href="/services"
          linkText="Tous les services"
        />
        <ServicesGrid compact />
      </section>
      <div className="open-source-strip">
        <GitBranch size={25} strokeWidth={1.3} />
        <div>
          <h3>Le code continue sur GitHub.</h3>
          <p>Projets publics, expérimentations et contributions.</p>
        </div>
        {settings.github && (
          <ButtonLink href={settings.github} external secondary>
            Explorer GitHub
          </ButtonLink>
        )}
      </div>
      <ContactCTA />
    </div>
  );
}

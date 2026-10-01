import { PageHeading, SectionHeading, ButtonLink } from "@/components/ui";
import { site, skills } from "@/config/site";
import { ContactCTA } from "@/components/contact-cta";
import { metadata as makeMetadata } from "@/lib/seo";
export const metadata = makeMetadata("À propos", site.description, "/about");
export default function About() {
  return (
    <div className="container">
      <PageHeading
        label="À PROPOS / BEHIND THE CODE"
        title="Une curiosité. Deux perspectives."
      >
        Je suis {site.name}, développeur full-stack et chercheur en
        cybersécurité sous l’alias {site.alias}.
      </PageHeading>
      <div className="about-grid">
        <div className="prose">
          <p>
            J’aime construire des applications, des API et des outils qui
            répondent à des besoins concrets. J’aime aussi comprendre ce qui se
            passe lorsque leurs hypothèses ne tiennent plus.
          </p>
          <p>
            Mon travail se situe à la rencontre du software engineering et de la
            sécurité applicative : développer, analyser, puis améliorer.
          </p>
          <p>
            Je suis actuellement en {site.education} à {site.university}. En
            parallèle, je participe à des CTF et mène des recherches sur les
            vulnérabilités web.
          </p>
          <ButtonLink href={site.resume || "/contact"} secondary>
            {site.resume ? "Télécharger mon CV" : "Demander mon CV"}
          </ButtonLink>
        </div>
        <div className="quote-card">
          <span>“</span>
          <blockquote>
            Comprendre comment les systèmes échouent me rend meilleur
            développeur. Comprendre comment ils sont construits me rend meilleur
            chercheur.
          </blockquote>
          <p>
            {site.name}
            <br />
            <span className="mono">alias: {site.alias}</span>
          </p>
        </div>
      </div>
      <section className="section">
        <SectionHeading
          label="PARCOURS"
          title="Un fil conducteur : comprendre."
        />
        <div className="timeline">
          {[
            [
              "Informatique & développement web",
              "Construire des interfaces, des services et des applications complètes.",
            ],
            [
              "Cybersécurité & CTF",
              "Explorer la sécurité web et progresser par la pratique de challenges.",
            ],
            [
              "Bug bounty & recherche CVE",
              "Étudier les défauts d’autorisation et contribuer à leur correction.",
            ],
            ["Master MIAGE", `${site.education}, ${site.university}.`],
          ].map(([title, text]) => (
            <div className="timeline-item" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="section">
        <SectionHeading label="COMPÉTENCES" title="Ma boîte à outils." />
        <div className="skills-grid">
          {Object.entries(skills).map(([title, items]) => (
            <div key={title}>
              <h3>{title}</h3>
              <div className="skills-list">
                {items.map((item) => (
                  <span key={item}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
      <ContactCTA />
    </div>
  );
}

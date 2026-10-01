import { PageHeading, SectionHeading } from "@/components/ui";
import { ServicesGrid } from "@/components/services-grid";
import { ContactCTA } from "@/components/contact-cta";
import { metadata as makeMetadata } from "@/lib/seo";
export const metadata = makeMetadata(
  "Services",
  "Développement web, API REST, sécurité applicative et collaboration technique.",
  "/services",
);
export default function Services() {
  return (
    <div className="container">
      <PageHeading
        label="SERVICES / LET’S BUILD TOGETHER"
        title="Du code utile. Une approche attentive."
      >
        Une application à créer, une API à connecter ou un regard sécurité sur
        votre projet. Échangeons sur vos besoins et le bon périmètre.
      </PageHeading>
      <ServicesGrid />
      <section className="section">
        <SectionHeading label="LA DÉMARCHE" title="Clair dès le départ." />
        <div className="research-pillars">
          {[
            [
              "01 / Échanger",
              "Comprendre le contexte, les utilisateurs, les contraintes et le résultat attendu.",
            ],
            [
              "02 / Construire",
              "Définir une architecture, avancer par étapes et partager les décisions techniques.",
            ],
            [
              "03 / Transmettre",
              "Vérifier le résultat, documenter les choix et préparer la suite du projet.",
            ],
          ].map(([title, text]) => (
            <div key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>
      <ContactCTA />
    </div>
  );
}

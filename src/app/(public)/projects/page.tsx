import { getProjects } from "@/lib/content";
import { getGithubProjects } from "@/lib/github";
import { PageHeading } from "@/components/ui";
import { ProjectExplorer } from "@/components/projects/project-explorer";
import { ContactCTA } from "@/components/contact-cta";
import { metadata as makeMetadata } from "@/lib/seo";
export const metadata = makeMetadata(
  "Projets",
  "Applications web, outils de sécurité et projets open source de Marouane Messafri.",
  "/projects",
);
export default async function ProjectsPage() {
  const [projects, github] = await Promise.all([
    getProjects(),
    getGithubProjects(),
  ]);
  return (
    <div className="container">
      <PageHeading
        label="PROJETS / SELECTED WORK"
        title="Du problème au produit."
      >
        Des applications utiles, des expérimentations et du code ouvert. Chaque
        projet est une occasion de construire et d’apprendre.
      </PageHeading>
      <div className="page-content">
        {!github.available && (
          <p className="notice">
            GitHub est momentanément indisponible. Les études de cas restent
            accessibles.
          </p>
        )}
        <ProjectExplorer projects={projects} />
      </div>
      <ContactCTA />
    </div>
  );
}

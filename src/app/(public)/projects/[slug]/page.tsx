import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ArrowUpRight } from "lucide-react";
import { getProjects } from "@/lib/content";
import { metadata, siteUrl } from "@/lib/seo";
import { ButtonLink, Tags, SectionHeading } from "@/components/ui";
import { ProjectVisual } from "@/components/projects/project-visual";
import { ArchitectureExplorer } from "@/components/projects/architecture-explorer";
import { CaseNavigation } from "@/components/projects/case-navigation";
import { MarkdownContent } from "@/components/blog/markdown";
import { JsonLd } from "@/components/json-ld";
import { site } from "@/config/site";
type Props = { params: Promise<{ slug: string }> };
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = (await getProjects()).find((p) => p.slug === slug);
  return project
    ? metadata(project.title, project.description, `/projects/${slug}`)
    : {};
}
export default async function ProjectDetail({ params }: Props) {
  const { slug } = await params;
  const projects = await getProjects();
  const project = projects.find((p) => p.slug === slug);
  if (!project) notFound();
  const sections = [
    {
      id: "probleme",
      title: "Le point de départ.",
      label: "Problème",
      text: project.problem,
    },
    {
      id: "solution",
      title: "La réponse apportée.",
      label: "Solution",
      text: project.solution,
    },
    {
      id: "architecture",
      title: "Sous la surface.",
      label: "Architecture",
      text: project.architecture,
    },
    {
      id: "defis",
      title: "Les défis techniques.",
      label: "Défis",
      text: project.challenges,
    },
    {
      id: "resultats",
      title: "Ce qui en ressort.",
      label: "Résultats",
      text: project.results,
    },
    {
      id: "enseignements",
      title: "Ce que j’en retiens.",
      label: "Enseignements",
      text: project.lessons,
    },
  ].filter((section) => section.text);
  const next =
    projects.length > 1
      ? projects[
          (projects.findIndex((p) => p.slug === slug) + 1) % projects.length
        ]
      : null;
  const showArchitecture =
    slug === "vulscan" &&
    project.architecture.includes("ResultatScan") &&
    ["React", "Django", "PostgreSQL"].every((tech) =>
      project.technologies.includes(tech),
    );
  return (
    <div className="container case-study">
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CreativeWork",
          name: project.title,
          description: project.description,
          url: `${siteUrl}/projects/${slug}`,
          creator: { "@type": "Person", name: site.name },
        }}
      />
      <Link href="/projects" className="case-back">
        <ArrowLeft size={15} />
        Tous les projets
      </Link>
      <header className="case-header">
        <div className="eyebrow">PROJET / {project.category.toUpperCase()}</div>
        <h1>
          {project.title}
          <span>.</span>
        </h1>
        <div className="case-introduction">
          <p>{project.description}</p>
          <div className="detail-actions">
            {project.githubUrl && (
              <ButtonLink href={project.githubUrl} external>
                Code source
              </ButtonLink>
            )}
            {project.demoUrl && (
              <ButtonLink href={project.demoUrl} external secondary>
                Voir la démo
              </ButtonLink>
            )}
            {!project.githubUrl && !project.demoUrl && (
              <ButtonLink href="/contact" secondary>
                Échanger sur ce projet
              </ButtonLink>
            )}
          </div>
        </div>
      </header>
      <ProjectVisual project={project} large />
      <div className="case-body">
        <div className="case-sections">
          {project.content && (
            <section id="presentation" className="case-section">
              <div className="eyebrow">PRÉSENTATION</div>
              <MarkdownContent content={project.content} />
            </section>
          )}
          {sections.map((section, index) => (
            <section className="case-section" id={section.id} key={section.id}>
              <div className="eyebrow">
                <span>{String(index + 1).padStart(2, "0")} /</span>
                {section.label.toUpperCase()}
              </div>
              <h2>{section.title}</h2>
              <p>{section.text}</p>
              {section.id === "architecture" && showArchitecture && (
                <ArchitectureExplorer />
              )}
            </section>
          ))}
          {!project.content && sections.length === 0 && (
            <section className="case-section">
              <div className="eyebrow">POUR ALLER PLUS LOIN</div>
              <h2>Parlons de ce projet.</h2>
              <p>
                Pour échanger sur les choix techniques ou le fonctionnement de{" "}
                {project.title}, contactez-moi directement.
              </p>
              <ButtonLink href="/contact" secondary>
                Me contacter
              </ButtonLink>
            </section>
          )}
        </div>
        <aside className="case-sidebar">
          <div className="case-sidebar-inner">
            {(sections.length > 0 || project.content) && (
              <CaseNavigation
                sections={[
                  ...(project.content
                    ? [{ id: "presentation", label: "Présentation" }]
                    : []),
                  ...sections.map(({ id, label }) => ({ id, label })),
                ]}
              />
            )}
            <dl className="case-facts">
              <div>
                <dt>DOMAINE</dt>
                <dd>{project.category}</dd>
              </div>
              {project.role && (
                <div>
                  <dt>MON RÔLE</dt>
                  <dd>{project.role}</dd>
                </div>
              )}
              {project.technologies.length > 0 && (
                <div>
                  <dt>TECHNOLOGIES</dt>
                  <dd>
                    <Tags values={project.technologies} />
                  </dd>
                </div>
              )}
            </dl>
            <Link className="text-link" href="/contact">
              En discuter
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </aside>
      </div>
      {project.screenshots.length > 0 && (
        <section className="section">
          <SectionHeading label="DANS LE PRODUIT" title="Aperçus du projet" />
          <div className="screenshot-grid">
            {project.screenshots.map((src, i) => (
              <Image
                src={src}
                alt={`${project.title}, capture ${i + 1}`}
                key={src}
                width={1000}
                height={650}
              />
            ))}
          </div>
        </section>
      )}
      {next && (
        <Link className="next-project" href={`/projects/${next.slug}`}>
          <div>
            <span className="eyebrow">PROJET SUIVANT</span>
            <h2>{next.title}</h2>
            <span className="next-project-category mono">{next.category}</span>
          </div>
          <span className="next-project-arrow">
            <ArrowUpRight size={38} strokeWidth={1} />
          </span>
        </Link>
      )}
    </div>
  );
}

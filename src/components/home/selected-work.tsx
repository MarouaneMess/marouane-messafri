import Link from "next/link";
import { ArrowUpRight, Github } from "lucide-react";
import type { Project } from "@/lib/validation";
import { Tags } from "@/components/ui";
import { ProjectVisual } from "@/components/projects/project-visual";

export function SelectedWork({ projects }: { projects: Project[] }) {
  return (
    <div className="selected-work-list">
      {projects.map((project, index) => (
        <article className="work-feature" key={project.slug}>
          <div className="work-copy">
            <div className="work-kicker mono">
              <span>{String(index + 1).padStart(2, "0")}</span>
              <span>{project.category}</span>
            </div>
            <h3>
              <Link href={`/projects/${project.slug}`}>{project.title}</Link>
            </h3>
            <p>{project.description}</p>
            {project.problem && (
              <div className="work-focus">
                <span className="mono">LE POINT DE DÉPART</span>
                <p>{project.problem}</p>
              </div>
            )}
            <Tags values={project.technologies} />
            <div className="work-actions">
              <Link href={`/projects/${project.slug}`} className="work-link">
                Découvrir le projet{" "}
                <span>
                  <ArrowUpRight size={21} />
                </span>
              </Link>
              {project.githubUrl && (
                <a
                  className="work-source"
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Code source de ${project.title}`}
                >
                  <Github size={18} />
                </a>
              )}
            </div>
          </div>
          <Link
            className="work-visual-link"
            href={`/projects/${project.slug}`}
            tabIndex={-1}
            aria-hidden="true"
          >
            <ProjectVisual project={project} />
          </Link>
        </article>
      ))}
    </div>
  );
}

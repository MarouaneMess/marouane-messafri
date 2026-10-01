import Link from "next/link";
import { ArrowUpRight, Github, ExternalLink, Star } from "lucide-react";
import type { Project } from "@/lib/validation";
import { Tags } from "../ui";
import { ProjectVisual } from "./project-visual";
export function ProjectArtwork({
  project,
  large = false,
}: {
  project: Project;
  large?: boolean;
}) {
  return <ProjectVisual project={project} large={large} />;
}
export function ProjectCard({
  project,
  index = 0,
}: {
  project: Project;
  index?: number;
}) {
  return (
    <article className="project-card">
      <Link href={`/projects/${project.slug}`} tabIndex={-1} aria-hidden="true">
        <ProjectArtwork project={project} />
      </Link>
      <div className="project-card-body">
        <div className="project-meta mono">
          <span>{project.category}</span>
          <span>{String(index + 1).padStart(2, "0")}</span>
        </div>
        <h3>
          <Link href={`/projects/${project.slug}`}>
            {project.title}
            <ArrowUpRight size={22} />
          </Link>
        </h3>
        <p>{project.description}</p>
        <Tags values={project.technologies.slice(0, 4)} />
        <div className="project-links">
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Github size={14} /> Code source
            </a>
          )}
          {project.demoUrl && (
            <a href={project.demoUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink size={14} /> Démo
            </a>
          )}
          {typeof project.stars === "number" && (
            <span>
              <Star size={13} />
              {project.stars}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

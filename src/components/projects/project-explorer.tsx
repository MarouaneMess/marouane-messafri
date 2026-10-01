"use client";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { ProjectCard } from "./project-card";
import { EmptyState } from "../ui";
import type { Project } from "@/lib/validation";
export function ProjectExplorer({ projects }: { projects: Project[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tous");
  const categories = ["Tous", ...new Set(projects.map((p) => p.category))];
  const filtered = projects.filter(
    (p) =>
      (category === "Tous" || p.category === category) &&
      `${p.title} ${p.description} ${p.technologies.join(" ")} ${p.topics?.join(" ") || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="filter-bar">
        <div className="filter-tabs" aria-label="Catégories de projets">
          {categories.map((c) => (
            <button
              key={c}
              className={category === c ? "selected" : ""}
              onClick={() => setCategory(c)}
              aria-pressed={category === c}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="search-input">
          <Search size={16} />
          <input
            aria-label="Rechercher un projet"
            placeholder="Rechercher un projet…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
      </div>
      <div className="result-count mono" aria-live="polite">
        <SlidersHorizontal size={13} />
        {filtered.length} PROJET{filtered.length > 1 ? "S" : ""}
      </div>
      {filtered.length ? (
        <div className="project-grid">
          {filtered.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} />
          ))}
        </div>
      ) : (
        <EmptyState>
          Aucun projet ne correspond à votre recherche. Essayez une autre
          technologie.
        </EmptyState>
      )}
    </>
  );
}

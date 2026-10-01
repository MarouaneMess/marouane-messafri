"use client";
import { useId, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Braces,
  Database,
  Fingerprint,
  GitBranch,
  PanelsTopLeft,
} from "lucide-react";
import { skills } from "@/config/site";

const expertise = [
  {
    category: "Frontend",
    title: "L’interface est le premier contact.",
    text: "Donner une forme claire aux fonctionnalités. Penser les composants, les interactions et les différents écrans comme un ensemble cohérent.",
    icon: PanelsTopLeft,
    code: "UI",
    keywords: ["Composants", "Interactions", "Responsive"],
    href: "/projects",
  },
  {
    category: "Backend",
    title: "La logique derrière l’expérience.",
    text: "Relier les interfaces aux données avec des API structurées. Organiser les responsabilités pour rendre une application compréhensible et évolutive.",
    icon: Braces,
    code: "API",
    keywords: ["API REST", "Logique métier", "Architecture"],
    href: "/projects",
  },
  {
    category: "Bases de données",
    title: "Donner une structure à l’information.",
    text: "Modéliser les entités, leurs relations et les accès. Une base solide pour organiser les informations utiles à l’application.",
    icon: Database,
    code: "DATA",
    keywords: ["Modélisation", "Relations", "SQL"],
    href: "/projects",
  },
  {
    category: "Cybersécurité",
    title: "Comprendre les limites du système.",
    text: "Étudier la sécurité des applications dans un cadre autorisé, documenter les observations et contribuer à la correction des vulnérabilités.",
    icon: Fingerprint,
    code: "SEC",
    keywords: ["Recherche", "CTF", "Divulgation responsable"],
    href: "/security",
  },
  {
    category: "Outils",
    title: "Un environnement pour mieux construire.",
    text: "Versionner le code, travailler avec les API et organiser les environnements. Les outils qui accompagnent le développement au quotidien.",
    icon: GitBranch,
    code: "DEV",
    keywords: ["Versionnement", "Environnements", "Collaboration"],
    href: "/projects",
  },
] as const;

export function ExpertiseExplorer() {
  const [selected, setSelected] = useState(0);
  const id = useId();
  const current = expertise[selected];
  const Icon = current.icon;
  function navigate(event: KeyboardEvent<HTMLDivElement>) {
    const delta =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0;
    if (!delta && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? expertise.length - 1
          : (selected + delta + expertise.length) % expertise.length;
    setSelected(next);
    event.currentTarget
      .querySelectorAll<HTMLButtonElement>("button")
      [next]?.focus();
  }
  return (
    <div className="expertise-explorer">
      <div
        className="expertise-tabs"
        role="tablist"
        aria-label="Domaines de compétences"
        onKeyDown={navigate}
      >
        {expertise.map((entry, index) => (
          <button
            key={entry.category}
            role="tab"
            id={`${id}-tab-${index}`}
            aria-selected={selected === index}
            aria-controls={`${id}-panel`}
            tabIndex={selected === index ? 0 : -1}
            onClick={() => setSelected(index)}
          >
            <entry.icon size={16} />
            <span>{entry.category}</span>
          </button>
        ))}
      </div>
      <div
        className="expertise-panel"
        role="tabpanel"
        id={`${id}-panel`}
        aria-labelledby={`${id}-tab-${selected}`}
        tabIndex={0}
      >
        <div className="expertise-copy">
          <span className="eyebrow">
            {String(selected + 1).padStart(2, "0")} /{" "}
            {current.category.toUpperCase()}
          </span>
          <h3>{current.title}</h3>
          <p>{current.text}</p>
          <div className="expertise-skills">
            {skills[current.category].map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
          <Link href={current.href} className="text-link">
            {current.href === "/security"
              ? "Voir mes recherches"
              : "Explorer mes projets"}
            <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="expertise-diagram" aria-hidden="true">
          <div className="expertise-rings">
            <span />
            <span />
            <div className="expertise-symbol">
              <Icon size={48} strokeWidth={1} />
              <strong>{current.code}</strong>
            </div>
          </div>
          <div className="expertise-keywords">
            {current.keywords.map((word) => (
              <span key={word}>{word}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

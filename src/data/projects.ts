import { projectSchema } from "@/lib/validation";
export const projects = [
  {
    title: "Vulscan",
    slug: "vulscan",
    description:
      "Une vue d’ensemble sur les résultats de scans de sécurité. Centraliser, explorer et comprendre les vulnérabilités web.",
    category: "Cybersecurity",
    technologies: ["React", "Django", "Django REST Framework", "PostgreSQL"],
    featured: true,
    sortOrder: 0,
    problem:
      "Les résultats de scans de sécurité doivent être organisés pour faciliter leur analyse.",
    solution:
      "Une application qui centralise les cibles, les scans et leurs résultats, avec des relations entre les ports et les vulnérabilités CVE.",
    architecture:
      "User → ConfigurationScan → Cible → Scan → ResultatScan. Les résultats relient les entités Port et VulnCVE.",
  },
  {
    title: "Blink",
    slug: "blink",
    description:
      "Moins de caractères. Le même chemin. Un raccourcisseur d’URL construit autour d’une architecture web structurée.",
    category: "Full Stack",
    featured: true,
    sortOrder: 1,
    problem: "Partager des liens longs est peu pratique.",
    solution:
      "Générer des liens courts et rediriger les visiteurs vers leur destination.",
  },
  {
    title: "Employee Payslip Portal",
    slug: "employee-payslip-portal",
    description:
      "Un espace dédié pour déposer et consulter les fiches de paie, avec un accès sécurisé pour chaque salarié.",
    category: "Full Stack",
    featured: true,
    sortOrder: 2,
    solution:
      "Authentification, gestion des utilisateurs, dépôt des fiches de paie et consultation par les salariés concernés.",
  },
  {
    title: "Du Pain et du Bonheur",
    slug: "du-pain-et-du-bonheur",
    description:
      "Un site professionnel pour une boulangerie. Une expérience web pensée autour d’une activité locale et de ses clients.",
    category: "Frontend",
    featured: false,
    sortOrder: 3,
  },
].map((p) => projectSchema.parse({ ...p, status: "PUBLISHED" }));

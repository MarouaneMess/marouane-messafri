export type Field = {
  key: string;
  label: string;
  type?:
    | "text"
    | "textarea"
    | "list"
    | "number"
    | "checkbox"
    | "select"
    | "image"
    | "timeline"
    | "references";
  options?: string[];
  help?: string;
};
const shared: Field[] = [
  { key: "title", label: "Titre" },
  {
    key: "slug",
    label: "Slug",
    help: "L’adresse publique du contenu. Elle doit être unique.",
  },
];
export const editorFields: Record<string, Field[]> = {
  posts: [
    ...shared,
    { key: "excerpt", label: "Résumé", type: "textarea" },
    {
      key: "type",
      label: "Type de publication",
      type: "select",
      options: ["BLOG", "WRITEUP", "ARTICLE"],
    },
    { key: "category", label: "Catégorie" },
    {
      key: "tags",
      label: "Tags",
      type: "list",
      help: "Séparez les tags par des virgules.",
    },
    { key: "coverImage", label: "Image de couverture", type: "image" },
  ],
  projects: [
    ...shared,
    { key: "description", label: "Description", type: "textarea" },
    {
      key: "category",
      label: "Catégorie",
      type: "select",
      options: [
        "Development",
        "Cybersecurity",
        "Full Stack",
        "Backend",
        "Frontend",
        "Research",
        "Open Source",
      ],
    },
    { key: "technologies", label: "Technologies", type: "list" },
    {
      key: "repoName",
      label: "Nom exact du repository GitHub",
      help: "Enrichit automatiquement le repository correspondant.",
    },
    { key: "githubUrl", label: "URL GitHub" },
    { key: "demoUrl", label: "URL de démo" },
    { key: "coverImage", label: "Image de couverture", type: "image" },
    {
      key: "screenshots",
      label: "Captures",
      type: "list",
      help: "URLs de la médiathèque séparées par des virgules.",
    },
    { key: "role", label: "Rôle" },
    { key: "problem", label: "Problème", type: "textarea" },
    { key: "solution", label: "Solution", type: "textarea" },
    { key: "architecture", label: "Architecture", type: "textarea" },
    { key: "challenges", label: "Défis techniques", type: "textarea" },
    { key: "results", label: "Résultats", type: "textarea" },
    { key: "lessons", label: "Enseignements", type: "textarea" },
    {
      key: "featured",
      label: "Mettre en avant sur l’accueil",
      type: "checkbox",
    },
    { key: "hidden", label: "Masquer sur le site public", type: "checkbox" },
    { key: "sortOrder", label: "Ordre d’affichage", type: "number" },
  ],
  security: [
    ...shared,
    { key: "description", label: "Description", type: "textarea" },
    {
      key: "type",
      label: "Type",
      type: "select",
      options: ["CVE", "Bug Bounty", "CTF", "Web Security Research"],
    },
    { key: "cveId", label: "Identifiant CVE" },
    { key: "product", label: "Produit" },
    { key: "affectedVersions", label: "Versions affectées" },
    { key: "vulnerabilityType", label: "Type de vulnérabilité" },
    {
      key: "severity",
      label: "Sévérité",
      type: "select",
      options: ["Low", "Medium", "High", "Critical"],
    },
    { key: "cvss", label: "CVSS v4.0", type: "number" },
    { key: "cvssV3", label: "CVSS v3.1", type: "number" },
    { key: "disclosurePlatform", label: "Plateforme de divulgation" },
    { key: "resolution", label: "État du correctif" },
    { key: "timeline", label: "Chronologie", type: "timeline" },
    { key: "references", label: "Références", type: "references" },
  ],
};

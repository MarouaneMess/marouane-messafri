import { researchSchema } from "@/lib/validation";
// Facts supplied by the portfolio owner; no dates or affected versions were supplied.
export const research = [
  researchSchema.parse({
    title: "Contrôle d’accès dans Events Manager",
    slug: "cve-2026-92711",
    cveId: "CVE-2026-92711",
    product: "WordPress · Events Manager",
    vulnerabilityType: "Authenticated IDOR / Authorization issue",
    description:
      "Un défaut d’autorisation permettait à un utilisateur authentifié de modifier des métadonnées et des relations de pièces jointes. Signalé via Wordfence Bug Bounty, puis corrigé par l’éditeur.",
    cvss: 5.3,
    cvssV3: 4.3,
    disclosurePlatform: "Wordfence Bug Bounty",
    resolution: "Correctif publié",
    status: "PUBLISHED",
    timeline: [
      {
        label: "Découverte",
        date: "",
        description: "Identification d’un défaut de contrôle d’accès.",
      },
      {
        label: "Signalement",
        date: "",
        description: "Transmission au programme Wordfence Bug Bounty.",
      },
      { label: "Attribution CVE", date: "", description: "CVE-2026-92711." },
      {
        label: "Correctif",
        date: "",
        description: "Publication d’un correctif par l’éditeur.",
      },
    ],
  }),
];

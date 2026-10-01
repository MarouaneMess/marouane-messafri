export type SearchEntry = {
  title: string;
  href: string;
  group: string;
  description: string;
  keywords: string;
};
export const navigationEntries: SearchEntry[] = [
  {
    title: "Accueil",
    href: "/",
    group: "Navigation",
    description: "Le portfolio de Marouane Messafri",
    keywords: "home build break secure",
  },
  {
    title: "À propos",
    href: "/about",
    group: "Navigation",
    description: "Parcours, profil et compétences",
    keywords: "cv formation MIAGE université",
  },
  {
    title: "Projets",
    href: "/projects",
    group: "Navigation",
    description: "Applications et projets publics",
    keywords: "développement full stack portfolio",
  },
  {
    title: "Recherche en sécurité",
    href: "/security",
    group: "Navigation",
    description: "Vulnérabilités, CVE et CTF",
    keywords: "cybersécurité bug bounty",
  },
  {
    title: "Journal",
    href: "/blog",
    group: "Navigation",
    description: "Articles, notes et write-ups",
    keywords: "blog documentation",
  },
  {
    title: "Services",
    href: "/services",
    group: "Navigation",
    description: "Développement et collaboration technique",
    keywords: "freelance prestation",
  },
  {
    title: "Contact",
    href: "/contact",
    group: "Navigation",
    description: "Un projet, une opportunité, une conversation",
    keywords: "email recrutement linkedin CV",
  },
];
const normalize = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
export function searchEntries(entries: SearchEntry[], query: string) {
  const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
  if (!terms.length) return entries.slice(0, 10);
  return entries
    .map((entry) => {
      const title = normalize(entry.title);
      const haystack = normalize(
        `${entry.title} ${entry.description} ${entry.keywords} ${entry.group}`,
      );
      const score = terms.every((term) => haystack.includes(term))
        ? terms.reduce(
            (total, term) =>
              total +
              (title.startsWith(term) ? 6 : title.includes(term) ? 3 : 1),
            0,
          )
        : 0;
      return { entry, score };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 12)
    .map((result) => result.entry);
}

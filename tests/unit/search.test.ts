import { describe, expect, it } from "vitest";
import { searchEntries, type SearchEntry } from "../../src/lib/search";
const entries: SearchEntry[] = [
  {
    title: "Recherche en sécurité",
    description: "Notes",
    group: "Navigation",
    href: "/security",
    keywords: "CVE",
  },
  {
    title: "Vulscan",
    description: "Une vue de la sécurité",
    group: "Projet",
    href: "/projects/vulscan",
    keywords: "React PostgreSQL",
  },
];
describe("portfolio search", () => {
  it("normalizes accents and case and ranks title matches first", () => {
    expect(
      searchEntries(entries, "SÉCURITÉ").map((entry) => entry.href),
    ).toEqual(["/security", "/projects/vulscan"]);
    expect(searchEntries(entries, "securite")).toHaveLength(2);
  });
  it("requires all terms across titles and technology keywords", () => {
    expect(
      searchEntries(entries, "  react   postgresql  ").map(
        (entry) => entry.title,
      ),
    ).toEqual(["Vulscan"]);
    expect(searchEntries(entries, "React inconnu")).toEqual([]);
  });
  it("limits suggestions and leaves the original list intact", () => {
    const many = Array.from({ length: 30 }, (_, i) => ({
      ...entries[0],
      title: `Entrée ${i}`,
    }));
    expect(searchEntries(many, "")).toHaveLength(10);
    expect(searchEntries(many, "entree")).toHaveLength(12);
    expect(many).toHaveLength(30);
  });
});

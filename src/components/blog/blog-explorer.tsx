"use client";
import { useState } from "react";
import { Search } from "lucide-react";
import type { Post } from "@/lib/validation";
import { PostCard } from "./post-card";
import { EmptyState } from "../ui";
export function BlogExplorer({ posts }: { posts: Post[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("Tous");
  const [tag, setTag] = useState("Tous");
  const result = posts.filter(
    (p) =>
      (category === "Tous" || p.category === category) &&
      (tag === "Tous" || p.tags.includes(tag)) &&
      `${p.title} ${p.excerpt} ${p.tags.join(" ")}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <>
      <div className="filter-bar">
        <div className="filter-tabs">
          {["Tous", ...new Set(posts.map((p) => p.category))].map((c) => (
            <button
              key={c}
              aria-pressed={category === c}
              className={category === c ? "selected" : ""}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
        <label className="search-input">
          <Search size={16} />
          <input
            aria-label="Rechercher un article"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un article…"
          />
        </label>
      </div>
      <label className="tag-filter">
        Tag{" "}
        <select value={tag} onChange={(e) => setTag(e.target.value)}>
          {["Tous", ...new Set(posts.flatMap((p) => p.tags))].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <div className="post-grid">
        {result.map((p) => (
          <PostCard key={p.slug} post={p} />
        ))}
      </div>
      {!result.length && (
        <EmptyState>
          Aucun article pour ces critères. D’autres notes viendront enrichir le
          journal.
        </EmptyState>
      )}
    </>
  );
}

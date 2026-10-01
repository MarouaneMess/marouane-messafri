"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, ArrowUpRight, RotateCcw } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { EmptyState } from "../ui";
export type ContentRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  type?: string;
  updatedAt: string;
  deletedAt?: string | null;
  entity: string;
};
export function ContentList({
  rows,
  trash = false,
}: {
  rows: ContentRow[];
  trash?: boolean;
}) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("Tous");
  const [type, setType] = useState("Tous");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const router = useRouter();
  const filtered = rows.filter(
    (r) =>
      (status === "Tous" || r.status === status) &&
      (type === "Tous" || (r.type || r.entity) === type) &&
      `${r.title} ${r.slug}`.toLowerCase().includes(query.toLowerCase()),
  );
  async function restore(row: ContentRow) {
    setBusy(row.id);
    setError("");
    try {
      const result = await fetch(`/api/admin/${row.entity}/${row.id}`, {
        method: "PATCH",
      });
      if (!result.ok) throw new Error((await result.json()).error);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de la restauration.");
    } finally {
      setBusy("");
    }
  }
  return (
    <>
      <div className="filter-bar">
        <label className="search-input">
          <Search size={16} />
          <input
            aria-label="Rechercher du contenu"
            placeholder="Titre ou slug…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </label>
        <div className="admin-filters">
          <select
            aria-label="Filtrer par état"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            {["Tous", "DRAFT", "PUBLISHED", "ARCHIVED"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            aria-label="Filtrer par type"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {["Tous", ...new Set(rows.map((r) => r.type || r.entity))].map(
              (t) => (
                <option key={t}>{t}</option>
              ),
            )}
          </select>
        </div>
      </div>
      {error && (
        <p role="alert" className="notice">
          {error}
        </p>
      )}
      {filtered.length ? (
        <div className="admin-panel table-scroll">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Contenu</th>
                <th>Type</th>
                <th>État</th>
                <th>Mis à jour</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.id}>
                  <td>
                    <Link href={`/admin/${row.entity}/${row.id}`}>
                      {row.title}
                    </Link>
                    <small>/{row.slug}</small>
                  </td>
                  <td>{row.type || row.entity}</td>
                  <td>
                    <span
                      className={`status-badge status-${row.status.toLowerCase()}`}
                    >
                      {row.status}
                    </span>
                  </td>
                  <td>{formatDate(row.updatedAt)}</td>
                  <td>
                    {trash ? (
                      <button
                        className="small-button"
                        disabled={busy === row.id}
                        onClick={() => restore(row)}
                      >
                        <RotateCcw size={13} /> Restaurer
                      </button>
                    ) : (
                      <Link
                        href={`/admin/${row.entity}/${row.id}`}
                        aria-label={`Modifier ${row.title}`}
                      >
                        <ArrowUpRight size={17} />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState>
          {trash
            ? "La corbeille est vide."
            : "Aucun contenu ne correspond à cette recherche."}
        </EmptyState>
      )}
    </>
  );
}

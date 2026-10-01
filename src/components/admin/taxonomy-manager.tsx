"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
type Item = { id: string; name: string; slug: string };
export function TaxonomyManager({
  categories,
  tags,
}: {
  categories: Item[];
  tags: Item[];
}) {
  const [kind, setKind] = useState("category");
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function save(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/admin/taxonomy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, ...(id ? { id } : {}), name, slug }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      setMessage("Enregistré.");
      setId("");
      setName("");
      setSlug("");
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="taxonomy-layout">
      <form className="settings-form admin-panel" onSubmit={save}>
        <h2>{id ? "Modifier" : "Créer"}</h2>
        <label>
          Type
          <select
            value={kind}
            onChange={(e) => {
              setKind(e.target.value);
              setId("");
            }}
          >
            <option value="category">Catégorie</option>
            <option value="tag">Tag</option>
          </select>
        </label>
        <label>
          Nom
          <input
            required
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!id) setSlug(slugify(e.target.value));
            }}
          />
        </label>
        <label>
          Slug
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        </label>
        <button className="button" disabled={busy}>
          Enregistrer
        </button>
        {id && (
          <button
            className="small-button"
            type="button"
            onClick={() => {
              setId("");
              setName("");
              setSlug("");
            }}
          >
            Annuler
          </button>
        )}
        <p role="status">{message}</p>
      </form>
      <div>
        {[
          ["category", categories],
          ["tag", tags],
        ].map(([type, items]) => (
          <section key={String(type)} className="admin-panel">
            <h2>{type === "category" ? "Catégories" : "Tags"}</h2>
            <div className="taxonomy-items">
              {(items as Item[]).map((item) => (
                <button
                  key={item.id}
                  className="small-button"
                  onClick={() => {
                    setKind(String(type));
                    setId(item.id);
                    setName(item.name);
                    setSlug(item.slug);
                  }}
                >
                  {item.name} ↗
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

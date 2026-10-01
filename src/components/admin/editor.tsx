"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Eye, Send, Trash2 } from "lucide-react";
import { slugify } from "@/lib/utils";
import { MarkdownContent } from "../blog/markdown";
import { editorFields } from "./editor-fields";
import { EditorField } from "./editor-field";
type Data = Record<string, unknown>;
export function Editor({
  entity,
  initial,
  initialId,
}: {
  entity: string;
  initial: Data;
  initialId?: string;
}) {
  const [data, setData] = useState<Data>(initial);
  const [id, setId] = useState(initialId);
  const [preview, setPreview] = useState(false);
  const [state, setState] = useState("Enregistré");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [uploading, setUploading] = useState(false);
  const dirty = useRef(false);
  const busy = useRef(false);
  const latest = useRef(data);
  const revision = useRef(0);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();
  function update(key: string, value: unknown) {
    const next = { ...latest.current, [key]: value };
    if (
      key === "title" &&
      (!latest.current.slug ||
        latest.current.slug === slugify(String(latest.current.title)))
    )
      next.slug = slugify(String(value));
    latest.current = next;
    dirty.current = true;
    revision.current++;
    setData(next);
    setState("Modifications non enregistrées");
  }
  const save = useCallback(
    async (status?: string) => {
      if (busy.current) return;
      busy.current = true;
      setSaving(true);
      setError("");
      setState("Enregistrement…");
      const atRevision = revision.current;
      const payload = { ...latest.current, ...(status ? { status } : {}) };
      try {
        const response = await fetch(
          `/api/admin/${entity}${id ? `/${id}` : ""}`,
          {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          },
        );
        const result = await response.json();
        if (!response.ok) throw new Error(result.error);
        if (!id) {
          setId(result.id);
          window.history.replaceState(
            null,
            "",
            `/admin/${entity}/${result.id}`,
          );
        }
        const next = {
          ...latest.current,
          version: result.version,
          status:
            revision.current === atRevision || status
              ? result.status
              : latest.current.status,
        };
        latest.current = next;
        setData(next);
        dirty.current = revision.current !== atRevision;
        setState(
          dirty.current ? "Modifications non enregistrées" : "Enregistré",
        );
      } catch (e) {
        setError(e instanceof Error ? e.message : "Enregistrement impossible.");
        setState("Échec de l’enregistrement");
      } finally {
        busy.current = false;
        setSaving(false);
      }
    },
    [entity, id],
  );
  useEffect(() => {
    if (!id || data.status !== "DRAFT" || !dirty.current || error) return;
    const timer = setTimeout(() => {
      void save();
    }, 1600);
    return () => clearTimeout(timer);
  }, [data, id, save, error]);
  useEffect(() => {
    const listener = (event: BeforeUnloadEvent) => {
      if (dirty.current) {
        event.preventDefault();
        event.returnValue = "";
      }
    };
    window.addEventListener("beforeunload", listener);
    return () => window.removeEventListener("beforeunload", listener);
  }, []);
  async function remove() {
    setSaving(true);
    try {
      const response = await fetch(`/api/admin/${entity}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error((await response.json()).error);
      dirty.current = false;
      router.push(`/admin/${entity}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Suppression impossible.");
      setSaving(false);
    }
  }
  async function upload(file: File, key: string) {
    setUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: form,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      update(key, result.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload impossible.");
    } finally {
      setUploading(false);
    }
  }
  function insert(before: string, after = "") {
    const element = editorRef.current;
    if (!element) return;
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const value = String(data.content || "");
    update(
      "content",
      `${value.slice(0, start)}${before}${value.slice(start, end)}${after}${value.slice(end)}`,
    );
    requestAnimationFrame(() => {
      element.focus();
      element.setSelectionRange(start + before.length, end + before.length);
    });
  }
  return (
    <div className="editor">
      <div className="admin-heading">
        <div>
          <Link className="eyebrow" href={`/admin/${entity}`}>
            ← RETOUR AUX CONTENUS
          </Link>
          <h1>{id ? "Modifier le contenu" : "Une nouvelle idée."}</h1>
          <p className="save-state" role="status">
            {state}
            {!id && " · Enregistrez une première fois pour activer l’autosave."}
          </p>
        </div>
        <span
          className={`status-badge status-${String(data.status).toLowerCase()}`}
        >
          {String(data.status)}
        </span>
      </div>
      <div className="editor-actions">
        <button
          className="button button-secondary"
          onClick={() => save()}
          disabled={saving || uploading}
        >
          <Save size={15} />
          Enregistrer
        </button>
        <button
          className="button button-secondary"
          onClick={() => setPreview(!preview)}
        >
          <Eye size={15} />
          {preview ? "Éditer" : "Aperçu"}
        </button>
        {data.status !== "PUBLISHED" ? (
          <button
            className="button"
            onClick={() => save("PUBLISHED")}
            disabled={saving || uploading}
          >
            <Send size={15} />
            Publier
          </button>
        ) : (
          <button
            className="button button-secondary"
            onClick={() => save("DRAFT")}
            disabled={saving}
          >
            Dépublier
          </button>
        )}
        {id && (
          <>
            <Link
              href={`/admin/preview/${entity}/${id}`}
              target="_blank"
              className="text-link"
            >
              Aperçu privé ↗
            </Link>
            <button
              className="icon-button danger"
              aria-label="Supprimer le contenu"
              disabled={saving}
              onClick={() => setConfirmDelete(true)}
            >
              <Trash2 size={16} />
            </button>
          </>
        )}
      </div>
      {error && (
        <p className="notice error-notice" role="alert">
          {error}
        </p>
      )}
      <div className="editor-layout">
        <div className="editor-writing">
          <div className="editor-tabs">
            <span className="mono">
              {preview ? "APERÇU PRIVÉ" : "CONTENU MARKDOWN"}
            </span>
            {!preview && (
              <div className="markdown-toolbar">
                <button title="Titre" onClick={() => insert("\n## ")}>
                  H2
                </button>
                <button title="Gras" onClick={() => insert("**", "**")}>
                  B
                </button>
                <button title="Liste" onClick={() => insert("\n- ")}>
                  Liste
                </button>
                <button title="Citation" onClick={() => insert("\n> ")}>
                  Citation
                </button>
                <button
                  title="Code"
                  onClick={() => insert("\n```typescript\n", "\n```\n")}
                >
                  {"{ }"}
                </button>
                <button title="Lien" onClick={() => insert("[", "](https://)")}>
                  Lien
                </button>
                <button
                  title="Image"
                  onClick={() => insert("![Description](", ")")}
                >
                  Image
                </button>
                <button
                  title="Tableau"
                  onClick={() =>
                    insert(
                      "\n| Colonne | Valeur |\n| --- | --- |\n| Texte | Texte |\n",
                    )
                  }
                >
                  Tableau
                </button>
              </div>
            )}
          </div>
          {preview ? (
            <div className="editor-preview">
              <h1>{String(data.title || "Sans titre")}</h1>
              <p>{String(data.excerpt || data.description || "")}</p>
              <MarkdownContent content={String(data.content || "")} />
            </div>
          ) : (
            <textarea
              ref={editorRef}
              aria-label="Contenu Markdown"
              className="markdown-input"
              value={String(data.content || "")}
              onChange={(e) => update("content", e.target.value)}
              placeholder="Une idée, une première ligne…\n\n## Votre premier titre"
            />
          )}
        </div>
        <aside className="editor-properties">
          <h2>Publication & détails</h2>
          {editorFields[entity].map((field) => (
            <EditorField
              key={field.key}
              field={field}
              data={data}
              update={update}
              upload={upload}
              uploading={uploading}
            />
          ))}
          <label>
            État
            <select
              value={String(data.status)}
              onChange={(e) => update("status", e.target.value)}
            >
              <option>DRAFT</option>
              <option>PUBLISHED</option>
              <option>ARCHIVED</option>
            </select>
          </label>
        </aside>
      </div>
      {confirmDelete && (
        <div className="modal-backdrop">
          <div
            className="confirm-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-title"
            onKeyDown={(e) => {
              if (e.key === "Escape") setConfirmDelete(false);
              if (e.key === "Tab") {
                const buttons = e.currentTarget.querySelectorAll("button");
                if (e.shiftKey && document.activeElement === buttons[0]) {
                  e.preventDefault();
                  buttons[1].focus();
                } else if (
                  !e.shiftKey &&
                  document.activeElement === buttons[1]
                ) {
                  e.preventDefault();
                  buttons[0].focus();
                }
              }
            }}
          >
            <h2 id="delete-title">Supprimer « {String(data.title)} » ?</h2>
            <p>
              Ce contenu quittera le site public. Vous pourrez le restaurer
              depuis la corbeille.
            </p>
            <div>
              <button
                autoFocus
                className="button button-secondary"
                onClick={() => setConfirmDelete(false)}
              >
                Annuler
              </button>
              <button
                className="button danger-button"
                disabled={saving}
                onClick={remove}
              >
                Déplacer dans la corbeille
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  CornerDownLeft,
  FileText,
  Folder,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";
import {
  navigationEntries,
  searchEntries,
  type SearchEntry,
} from "@/lib/search";

export function CommandMenu() {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const id = useId();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [selected, setSelected] = useState(0);
  const [attempt, setAttempt] = useState(0);
  const results = searchEntries(
    status === "ready" ? [...entries, ...navigationEntries] : navigationEntries,
    query,
  );
  const show = useCallback(() => {
    setQuery("");
    setSelected(0);
    setStatus("loading");
    setOpen(true);
  }, []);
  const close = () => dialog.current?.close();
  function navigate(href: string) {
    close();
    router.push(href);
  }

  useEffect(() => {
    const shortcut = (event: globalThis.KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (dialog.current?.open) dialog.current.close();
        else show();
      }
    };
    document.addEventListener("keydown", shortcut);
    return () => document.removeEventListener("keydown", shortcut);
  }, [show]);
  useEffect(() => {
    if (!open) return;
    dialog.current?.showModal();
    input.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    fetch("/api/search", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("unavailable");
        return response.json() as Promise<{ items: SearchEntry[] }>;
      })
      .then((data) => {
        if (!controller.signal.aborted) {
          setEntries(data.items);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setStatus("error");
      });
    return () => controller.abort();
  }, [open, attempt]);
  useEffect(() => {
    if (open)
      document
        .getElementById(`${id}-option-${selected}`)
        ?.scrollIntoView({ block: "nearest" });
  }, [id, selected, open]);
  function handleKeys(event: KeyboardEvent<HTMLInputElement>) {
    if (event.nativeEvent.isComposing || results.length === 0) return;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setSelected(
        (value) =>
          (value + (event.key === "ArrowDown" ? 1 : -1) + results.length) %
          results.length,
      );
    } else if (event.key === "Enter") {
      event.preventDefault();
      if (results[selected]) navigate(results[selected].href);
    }
  }
  return (
    <>
      <button
        className="command-trigger"
        onClick={show}
        aria-label="Rechercher dans le portfolio"
        aria-keyshortcuts="Control+k Meta+k"
      >
        <Search size={15} />
        <kbd>Ctrl K</kbd>
      </button>
      <dialog
        ref={dialog}
        className="command-dialog"
        aria-labelledby={`${id}-title`}
        onClose={() => setOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) close();
        }}
      >
        <div className="command-content">
          <div className="command-heading">
            <h2 id={`${id}-title`}>Explorer le portfolio</h2>
            <button
              onClick={close}
              className="icon-button"
              aria-label="Fermer la recherche"
            >
              <X size={17} />
            </button>
          </div>
          <div className="command-input">
            <Search size={22} />
            <input
              ref={input}
              role="combobox"
              aria-label="Rechercher un projet, une technologie ou un article"
              aria-autocomplete="list"
              aria-expanded={open}
              aria-controls={`${id}-results`}
              aria-activedescendant={
                results[selected] ? `${id}-option-${selected}` : undefined
              }
              placeholder="Un projet, une technologie, une idée…"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setSelected(0);
              }}
              onKeyDown={handleKeys}
              autoComplete="off"
              spellCheck={false}
            />
          </div>
          <div className="command-status" role="status">
            {status === "loading"
              ? "Chargement des projets et des publications…"
              : status === "error"
                ? "Les contenus sont indisponibles. La navigation reste accessible."
                : query
                  ? `${results.length} résultat${results.length !== 1 ? "s" : ""}`
                  : "PROJETS, RECHERCHES & NAVIGATION"}
            {status === "error" && (
              <button
                onClick={() => {
                  setStatus("loading");
                  setSelected(0);
                  setAttempt((value) => value + 1);
                }}
              >
                Réessayer
              </button>
            )}
          </div>
          <div
            className="command-results"
            role="listbox"
            id={`${id}-results`}
            aria-label="Résultats de recherche"
          >
            {results.map((entry, index) => {
              const Icon =
                entry.group === "Projet"
                  ? Folder
                  : entry.group === "Recherche"
                    ? ShieldCheck
                    : entry.group === "Journal"
                      ? FileText
                      : ArrowUpRight;
              return (
                <button
                  key={entry.href}
                  id={`${id}-option-${index}`}
                  role="option"
                  aria-selected={selected === index}
                  tabIndex={-1}
                  onClick={() => navigate(entry.href)}
                  onPointerMove={() => setSelected(index)}
                >
                  <span className="command-result-icon">
                    <Icon size={18} strokeWidth={1.5} />
                  </span>
                  <span className="command-result-copy">
                    <strong>{entry.title}</strong>
                    <span>{entry.description}</span>
                  </span>
                  <small>{entry.group}</small>
                  <CornerDownLeft size={14} className="command-enter" />
                </button>
              );
            })}
          </div>
          {results.length === 0 && (
            <div className="command-empty">
              <Search size={25} />
              <p>Aucun résultat pour « {query} ».</p>
              <span>Essayez un nom de projet ou une technologie.</span>
            </div>
          )}
          <div className="command-footer">
            <span>
              <kbd>
                <ArrowUp size={10} />
              </kbd>
              <kbd>
                <ArrowDown size={10} />
              </kbd>{" "}
              parcourir
            </span>
            <span>
              <kbd>↵</kbd> ouvrir
            </span>
            <span>
              <kbd>Esc</kbd> fermer
            </span>
          </div>
        </div>
      </dialog>
    </>
  );
}

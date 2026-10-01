"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, Upload } from "lucide-react";
import { EmptyState } from "../ui";
type Media = {
  id: string;
  name: string;
  width: number;
  height: number;
  size: number;
};
export function MediaLibrary({ media }: { media: Media[] }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function upload(file: File) {
    setBusy(true);
    setMessage("");
    try {
      const form = new FormData();
      form.set("file", file);
      const response = await fetch("/api/admin/media", {
        method: "POST",
        body: form,
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setMessage(
        "Image importée. Copiez son URL pour l’utiliser dans un contenu.",
      );
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Upload impossible.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <label className="media-dropzone">
        <Upload size={25} />
        <strong>
          {busy ? "Traitement de l’image…" : "Importer une image"}
        </strong>
        <span>JPEG, PNG, WebP ou AVIF · 5 Mo maximum</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          disabled={busy}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void upload(file);
          }}
        />
      </label>
      <p className="notice">
        Les médias importés sont publics. N’y ajoutez pas d’images
        confidentielles, y compris pour un brouillon.
      </p>
      {message && (
        <p role="status" className="notice">
          {message}
        </p>
      )}
      {media.length ? (
        <div className="media-grid">
          {media.map((m) => (
            <article key={m.id} className="media-card">
              <Image
                src={`/api/media/${m.id}`}
                width={400}
                height={250}
                alt={m.name}
              />
              <div>
                <h3>{m.name}</h3>
                <p>
                  {m.width} × {m.height} · {Math.ceil(m.size / 1024)} Ko
                </p>
                <button
                  className="small-button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(`/api/media/${m.id}`);
                      setMessage("URL copiée.");
                    } catch {
                      setMessage(`/api/media/${m.id}`);
                    }
                  }}
                >
                  <Copy size={13} /> Copier l’URL
                </button>
              </div>
            </article>
          ))}
        </div>
      ) : (
        <EmptyState>Votre médiathèque attend sa première image.</EmptyState>
      )}
    </>
  );
}

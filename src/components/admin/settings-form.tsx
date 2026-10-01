"use client";
import { useState, type FormEvent } from "react";
import type { Settings } from "@/lib/validation";
export function SettingsForm({ settings }: { settings: Settings }) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  async function save(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    const form = new FormData(e.currentTarget);
    try {
      const response = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          heroMessage: form.get("heroMessage"),
          contactEmail: form.get("contactEmail"),
          github: form.get("github"),
          linkedin: form.get("linkedin"),
          availability: form.get("availability") === "on",
        }),
      });
      if (!response.ok) throw new Error((await response.json()).error);
      setMessage("Paramètres enregistrés.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Échec de l’enregistrement.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="settings-form admin-panel" onSubmit={save}>
      <h2>Identité publique</h2>
      <label>
        Message d’accueil
        <textarea
          name="heroMessage"
          defaultValue={settings.heroMessage}
          rows={3}
          required
          maxLength={200}
        />
      </label>
      <label className="checkbox-field">
        <input
          type="checkbox"
          name="availability"
          defaultChecked={settings.availability}
        />{" "}
        Disponible pour de nouveaux projets
      </label>
      <label>
        Email de contact
        <input
          name="contactEmail"
          type="email"
          defaultValue={settings.contactEmail}
        />
      </label>
      <label>
        GitHub
        <input name="github" type="url" defaultValue={settings.github} />
      </label>
      <label>
        LinkedIn
        <input name="linkedin" type="url" defaultValue={settings.linkedin} />
      </label>
      <button className="button" disabled={busy}>
        {busy ? "Enregistrement…" : "Enregistrer les paramètres"}
      </button>
      <p role="status" className="form-status">
        {message}
      </p>
    </form>
  );
}

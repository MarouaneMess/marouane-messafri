"use client";
import { useState, type FormEvent } from "react";
import { ArrowUpRight } from "lucide-react";
export function ContactForm({
  email,
  serverDelivery,
  initialSubject = "Freelance",
}: {
  email: string;
  serverDelivery: boolean;
  initialSubject?: string;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [mailto, setMailto] = useState("");
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMessage("");
    setMailto("");
    const form = e.currentTarget;
    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      if (result.mailto) {
        setMailto(result.mailto);
        setMessage(
          "Votre message est prêt. Ouvrez votre messagerie pour l’envoyer.",
        );
      } else {
        setMessage(
          "Votre message a bien été envoyé. Merci pour votre prise de contact !",
        );
        form.reset();
      }
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "L’envoi a échoué.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-row">
        <label>
          Votre nom
          <input
            name="name"
            autoComplete="name"
            required
            minLength={2}
            maxLength={120}
            placeholder="Marie Dupont"
          />
        </label>
        <label>
          Votre email
          <input
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={254}
            placeholder="marie@entreprise.fr"
          />
        </label>
      </div>
      <div className="form-row">
        <label>
          Entreprise <span className="muted">(facultatif)</span>
          <input
            name="company"
            autoComplete="organization"
            maxLength={160}
            placeholder="Votre entreprise"
          />
        </label>
        <label>
          Parlons de…
          <select name="subject" defaultValue={initialSubject}>
            <option>Freelance</option>
            <option>Collaboration</option>
            <option>Recrutement</option>
            <option>Cybersécurité</option>
            <option>Autre</option>
          </select>
        </label>
      </div>
      <label>
        Votre message
        <textarea
          name="message"
          required
          minLength={20}
          maxLength={5000}
          rows={6}
          placeholder="Votre idée, votre contexte, ce que nous pourrions construire ensemble…"
        />
      </label>
      <div className="honeypot" aria-hidden="true">
        <label>
          Site internet
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <button className="button" disabled={busy || !email}>
        {busy
          ? "Préparation…"
          : serverDelivery
            ? "Envoyer le message"
            : "Préparer mon email"}
        <ArrowUpRight size={16} />
      </button>
      <p className="form-note">
        {serverDelivery
          ? "Vos informations servent uniquement à répondre à votre demande."
          : "L’envoi se fera depuis votre application de messagerie."}
      </p>
      <p role="status" className="form-status">
        {message}
      </p>
      {mailto && (
        <a href={mailto} className="button button-secondary">
          Ouvrir ma messagerie <ArrowUpRight size={16} />
        </a>
      )}
    </form>
  );
}

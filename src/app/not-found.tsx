import { ButtonLink } from "@/components/ui";
export default function NotFound() {
  return (
    <main id="main" className="error-page">
      <span className="mono">404 / HORS PÉRIMÈTRE</span>
      <h1>Cette page reste à construire.</h1>
      <p>Le contenu demandé n’existe pas ou n’est pas publié.</p>
      <ButtonLink href="/">Retour à l’accueil</ButtonLink>
    </main>
  );
}

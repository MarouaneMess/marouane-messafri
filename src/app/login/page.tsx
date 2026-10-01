import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { authConfigured } from "@/lib/auth";
import { LoginButton } from "@/components/admin/auth-buttons";
export const metadata = {
  title: "Administration",
  robots: { index: false, follow: false },
};
export const dynamic = "force-dynamic";
export default async function Login({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main id="main" className="login-page">
      <Link href="/" className="login-back">
        ← Retour au portfolio
      </Link>
      <div className="login-card">
        <ShieldCheck size={35} strokeWidth={1} />
        <div className="eyebrow">MAROUANE / STUDIO</div>
        <h1>Bienvenue dans les coulisses.</h1>
        <p>
          Un espace privé pour écrire, partager et faire évoluer le portfolio.
        </p>
        {error && (
          <p className="notice" role="alert">
            Connexion refusée ou interrompue. Seul le compte administrateur
            autorisé peut accéder au studio.
          </p>
        )}
        {authConfigured ? (
          <LoginButton />
        ) : (
          <p className="notice">
            La connexion GitHub n’est pas encore configurée. Ajoutez les
            identifiants de l’application OAuth dans les variables
            d’environnement, comme indiqué dans le README.
          </p>
        )}
        <div className="login-foot mono">ACCÈS ADMINISTRATEUR UNIQUEMENT</div>
      </div>
    </main>
  );
}

import { requirePageAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/content";
import { SettingsForm } from "@/components/admin/settings-form";
export default async function SettingsPage() {
  await requirePageAdmin();
  return (
    <>
      <div className="admin-heading">
        <div>
          <div className="eyebrow">PRÉFÉRENCES DU PORTFOLIO</div>
          <h1>Paramètres</h1>
          <p>
            Vos informations publiques. Les secrets restent dans l’environnement
            serveur.
          </p>
        </div>
        <a
          className="button button-secondary"
          href="/api/admin/export"
          download
        >
          Exporter le contenu ↓
        </a>
      </div>
      <SettingsForm settings={await getSettings()} />
    </>
  );
}

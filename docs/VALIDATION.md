# Validation locale — 1er octobre 2026

Vérifications réalisées sur la version incluant la scène 3D Three.js et le back-office PostgreSQL.

| Vérification | Résultat |
| --- | --- |
| Migrations PostgreSQL et seed | Appliqués sur une base locale dédiée |
| Build de production Next.js | Réussi |
| TypeScript strict | Aucune erreur |
| ESLint | Aucune erreur ni avertissement |
| Vitest | 19 tests réussis |
| Playwright | 13 scénarios réussis |
| Audit npm des dépendances de production | 0 vulnérabilité connue signalée au moment du contrôle |

Les scénarios navigateur vérifient les pages publiques et leurs 404 ; l’inaccessibilité des brouillons ; les accès admin anonymes et non autorisés ; la création, l’autosave, l’aperçu, la publication, la dépublication, la suppression et la restauration ; les conflits de slug et de version ; les uploads ; l’export sans secrets ; la recherche globale et son mode dégradé ; le fallback email ; la limitation de débit en base ; les en-têtes HTTP ; les modes 3D, la pause et la réduction des animations ; les compétences et l’architecture interactives. La recherche vérifie également qu’un brouillon n’est pas indexé avant sa publication.

Les contrôles axe-core WCAG A/AA automatisés passent sur l’accueil, les projets, une étude de cas, la recherche globale ouverte, un article, le contact, la connexion et les principales pages d’administration. Ce contrôle automatisé ne remplace pas un audit humain complet d’accessibilité.

Les pages testées ne présentent pas de débordement horizontal à 375, 768, 1024 et 1440 px. Les captures réelles se trouvent dans `.local/screenshots/` ; les captures complètes ont été faites après parcours des sections à apparition progressive.

## Vérifications nécessitant une configuration externe

- La connexion réelle GitHub OAuth attend `GITHUB_CLIENT_ID` et `GITHUB_CLIENT_SECRET`. Les tests de session emploient le mécanisme de chiffrement NextAuth avec une identité et un secret réservés à l’instance de tests.
- L’envoi email réel nécessite la clé Resend et un expéditeur validé. Le fallback `mailto:` est testé et fonctionnel.
- Le véritable CV, les captures de projets et les références/dates manquantes de la CVE doivent être ajoutés par le propriétaire.
- Aucun déploiement public, test de charge ou score Lighthouse n’est revendiqué.

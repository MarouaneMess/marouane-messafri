# Marouane Messafri — Portfolio & Content Studio

Portfolio personnel et professionnel, en français, autour du développement full-stack et de la recherche en sécurité. L’interface publique et le back-office partagent la même base PostgreSQL. Les données GitHub enrichissent une sélection éditoriale de projets.

## Stack

- Next.js 16 App Router, React, TypeScript strict, Tailwind CSS 4 et CSS personnalisé.
- PostgreSQL, Prisma ORM 7 avec le pilote `pg`.
- NextAuth 4 stable, GitHub OAuth, sessions JWT chiffrées et vérifiées côté serveur.
- Markdown portable, GFM, coloration du code, ancres, copie et table des matières. Le HTML brut et le JSX des fichiers `.mdx` ne sont **pas exécutés**.
- Zod, Sharp, Vitest et Playwright.
- Scène WebGL Three.js interactive : un cœur modulaire qui s’assemble, se décompose et se protège selon le mode Build / Break / Secure. Chargement différé, animation limitée à 30 images/s, pause manuelle, arrêt hors écran et respect de `prefers-reduced-motion`. Une composition CSS prend le relais si WebGL est indisponible.
- Typographies Manrope et Space Grotesk auto-hébergées ; aucune requête Google Fonts côté visiteur. Révélations progressives et inclinaison discrète des cartes à la souris.
- Sélection éditoriale de projets avec illustrations en perspective, fiches détaillées et sommaire actif. L’architecture de Vulscan propose une lecture interactive des couches applicatives.
- Recherche globale par nom, technologie ou sujet via le bouton de navigation ou `Ctrl+K` / `⌘K`. Navigation au clavier, gestion des accents, fermeture avec Échap et retour du focus. Seuls les contenus publics sont indexés ; le menu garde ses liens de navigation si la recherche est indisponible.
- Compétences explorables par onglets accessibles au clavier.

Node.js 22.12+ ou 24 LTS recommandé. PostgreSQL 15+.

Les commandes de développement et de build utilisent Webpack. Ce mode permet à Next.js d’utiliser son compilateur WebAssembly lorsque Windows Application Control bloque le module SWC natif ; Turbopack exige ce module natif.

## Démarrage

```sh
npm install
# Copier .env.example vers .env.local et renseigner DATABASE_URL et NEXTAUTH_SECRET
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

Ouvrir http://localhost:3000. Sans `DATABASE_URL`, les pages publiques utilisent les fichiers locaux ; le back-office exige une base configurée. Une erreur de connexion à une base configurée n’entraîne pas de retour aux données anciennes : les contenus dépubliés restent privés.

### Base locale Windows

Sur cette machine, PostgreSQL 18 est installé. `npm run db:local` initialise ou redémarre un **cluster dédié au projet**, dans `.local/postgres`, sur `127.0.0.1:54329`. Le script crée des secrets aléatoires dans `.env.local`, ignoré par Git. Il ne modifie pas le service PostgreSQL existant.

Le cluster a été initialisé et les migrations appliquées lors de la création du projet. Pour l’arrêter :

```powershell
& 'C:\Program Files\PostgreSQL\18\bin\pg_ctl.exe' -D '.local/postgres' stop
```

Ne pas utiliser ce cluster de développement pour héberger le site public.

## Connexion administrateur

1. Créer une **OAuth App** dans GitHub → Settings → Developer settings → OAuth Apps.
2. Homepage URL locale : `http://localhost:3000`.
3. Authorization callback URL locale : `http://localhost:3000/api/auth/callback/github`.
4. Renseigner `GITHUB_CLIENT_ID` et `GITHUB_CLIENT_SECRET` dans `.env.local`, puis redémarrer Next.js.
5. Configurer une liste d’autorisation : préférer `ADMIN_GITHUB_ID=180647953`, identifiant numérique du compte `MarouaneMess`. À défaut, utiliser `ADMIN_GITHUB_USERNAME` ou `ADMIN_EMAIL`.
6. Aller sur `/admin`, puis se connecter avec GitHub.

L’ID GitHub a priorité sur le pseudo, qui a priorité sur l’email. La voie email utilise uniquement les adresses **vérifiées** renvoyées par GitHub. Une liste vide refuse toute connexion. Il n’existe ni mot de passe par défaut ni connexion de démonstration.

`NEXTAUTH_SECRET` doit être une valeur aléatoire longue. Exemple de génération locale :

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('base64'))"
```

En production, définir `NEXTAUTH_URL` et `SITE_URL` sur l’URL HTTPS réelle et créer une OAuth App séparée avec le callback correspondant. Les cookies deviennent Secure en HTTPS, sont HttpOnly et SameSite=Lax. La session expire après 8 heures d’inactivité. La liste d’autorisation et le rôle en base sont revérifiés à chaque accès sensible ; changer la liste révoque l’accès aux anciennes identités. Le rôle `EDITOR` est réservé à une évolution future et n’obtient aucun accès dans cette version.

**À configurer encore :** les véritables identifiants OAuth n’ont pas été fournis. L’authentification auprès de GitHub ne peut pas être validée de bout en bout avant cette configuration. Les tests locaux utilisent le mécanisme normal de session NextAuth, avec un secret et une identité propres aux tests, sans point d’entrée de contournement dans l’application.

## Configuration publique

`src/config/site.ts` centralise nom, alias, formation, liens sociaux, email et chemin du CV. Les coordonnées fournies sont déjà intégrées.

- Ajouter le véritable CV dans `public/cv.pdf`, puis définir `resume: '/cv.pdf'`.
- En attendant, « Demander mon CV » ouvre la page de contact ; aucun faux PDF n’est distribué.
- Le message d’accueil, la disponibilité, l’email public et les liens sociaux se modifient aussi dans `/admin/settings`.
- Le français est la langue active. `src/config/i18n.ts` prépare les libellés anglais ; la traduction intégrale et le routage multilingue ne sont pas activés.
- Les illustrations des projets sont des compositions CSS identifiées comme concepts visuels. Remplacer leurs couvertures par de vraies captures depuis le studio.

## Projets et GitHub

`src/lib/github.ts` interroge les repositories publics côté serveur, avec cache Next.js d’une heure, délai maximal et pagination. `GITHUB_TOKEN` est facultatif, reste serveur et permet d’augmenter le quota API. Le compte par défaut est `MarouaneMess` ; `GITHUB_USERNAME` le remplace.

La sélection se configure dans `src/config/github.ts` (`include`, `hidden`). Depuis `/admin/projects`, créer une fiche et renseigner le **nom exact** du repository dans `repoName` : titre, description, technologie, couverture, démo, featured, hidden et ordre d’affichage complètent les informations GitHub. Aucun code de repository n’est exécuté.

Les projets initiaux sont dans `src/data/projects.ts`. Ils sont copiés en base par le seed. En présence d’une base, les fiches locales ne sont pas réaffichées après suppression/dépublication d’une fiche administrée. Les projets privés ou sans URL connue n’affichent pas de lien inventé.

## Articles et write-ups

Parcours complet : `/admin/posts/new` → titre, résumé, contenu Markdown → enregistrer → aperçu → publier. Un write-up utilise le type `WRITEUP`.

- L’autosave des brouillons débute après le premier enregistrement manuel et attend 1,6 seconde d’inactivité. Il ne publie pas automatiquement.
- Les enregistrements utilisent une version optimiste : une modification concurrente est refusée au lieu d’écraser silencieusement le contenu.
- Les aperçus serveur sont dans `/admin/preview/...`, protégés, privés et non indexables.
- Dépublier ou supprimer retire immédiatement le contenu public, même avec son slug exact.
- La suppression est réversible dans `/admin/trash` ; restaurer remet en brouillon.
- `/admin/taxonomy` permet de créer et renommer catégories et tags, avec propagation aux articles associés.

Les fichiers de `content/blog/*.md` restent une seconde source possible :

```yaml
---
title: "Titre de l’article"
description: "Résumé clair."
date: "2026-09-29"
updatedAt: "2026-09-29"
category: "Development"
tags: ["TypeScript"]
type: "BLOG"
published: false
cover: ""
---
```

Le nom du fichier devient le slug. Un fichier mal formé est ignoré. `published: false` est privé. `readingTime` est calculé à partir du contenu. `npm run db:seed` importe les nouveaux fichiers sans écraser les contenus déjà édités. `sourceSlug` conserve le lien à la source, même lorsque le slug public change : un brouillon dépublié ne réapparaît pas depuis son fichier original. Une fois importée, la version en base fait autorité ; modifier uniquement le fichier n’écrase pas les modifications du studio.

Un article éditorial général est publié au départ. Le write-up de la CVE reste en brouillon pour compléter ses dates et références avant publication.

## Recherches en sécurité

`/admin/security` gère les fiches CVE, bug bounty, CTF et recherche web, avec produit, versions affectées, scores, statut du correctif, timeline éditable et références HTTPS.

Les éléments de CVE-2026-92711 et les classements affichés proviennent du cahier des charges du propriétaire. Les dates, versions et références qui n’ont pas été fournies restent vides. Les scores ne constituent pas une vérification indépendante de la fiche officielle. Les contenus sont orientés compréhension, correctifs et divulgation responsable.

## Médias

La médiathèque accepte JPEG, PNG, WebP et AVIF, jusqu’à 5 Mo. Contrôles serveur : extension, MIME annoncé, format décodé, dimensions minimales, limite de pixels et refus des animations. Sharp réencode en WebP, retire les métadonnées et limite la taille à 2400 px. SVG et formats exécutables sont refusés.

Le stockage par défaut utilise PostgreSQL (`Media.data`), ce qui fonctionne avec Vercel et Node sans disque persistant. L’interface `src/lib/storage.ts` permet de remplacer le stockage par S3 ou un autre service. Les identifiants sont des UUID générés côté serveur ; le nom du fichier ne devient jamais un chemin.

**Les médias sont publics dès l’upload**, y compris s’ils illustrent un brouillon. Le texte des brouillons et leurs aperçus restent privés. Les requêtes d’image sont locales ; les images distantes doivent être importées en médiathèque. Prévoir un stockage objet si la bibliothèque devient volumineuse. Sur Vercel, la limite de corps de requête de la plateforme peut imposer une taille effective inférieure à 5 Mo ; utiliser un upload direct signé via le futur adaptateur pour de gros volumes.

## Contact

Sans service email, le formulaire valide les champs et prépare un lien `mailto:` contenant le message. Il affiche un bouton explicite pour ouvrir la messagerie, sans prétendre que le message a déjà été envoyé.

Pour l’envoi serveur, configurer `RESEND_API_KEY`, `RESEND_FROM` (expéditeur validé) et `CONTACT_EMAIL`. Aucune adresse de contact n’est inscrite en base par le formulaire et aucun message n’est journalisé. Les erreurs restent génériques.

## Protections et limites

- `requireAdmin()` dans le layout, les pages sensibles et toutes les API de lecture/écriture admin.
- Validation Zod stricte, liste explicite des champs modifiables, transactions Prisma, audit des mutations.
- Contrôle d’origine sur les mutations JSON/upload et protections CSRF natives de NextAuth.
- Limitation de débit atomique dans PostgreSQL : fonctionne entre plusieurs instances Node/Vercel. Par défaut, les visiteurs anonymes partagent un quota ; activer `TRUST_PROXY=true` seulement derrière un proxy qui **remplace** `x-forwarded-for`.
- CSP avec nonce par requête pour les scripts, `object-src 'none'`, interdiction d’encadrement, nosniff et Permissions-Policy. Le CSS inline reste autorisé pour Next/Image ; les scripts inline arbitraires ne le sont pas.
- Markdown sans HTML brut, sans exécution MDX et avec contrôle des protocoles par react-markdown.
- Pas de secret dans le navigateur, le CMS, les exports ou les logs applicatifs.
- `npm audit` doit être relancé régulièrement. Les overrides de Sharp, mysql2 et deepmerge-ts verrouillent des versions corrigées de dépendances transitives ; le pilote de base utilisé est PostgreSQL.

Les pages utilisent un rendu serveur dynamique pour la CSP à nonce et la visibilité immédiate des publications. GitHub conserve son cache propre. L’application ne revendique pas un score Lighthouse mesuré ou une certification de sécurité.

## Vérification

```sh
npm run lint
npm run typecheck
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Playwright démarre une instance de production sur le port 3100 et une base locale distincte `portfolio_test`, avec un secret de session éphémère. Il refuse les bases distantes. Le compte PostgreSQL local doit pouvoir créer cette base. Aucun accès de test n’est ajouté au serveur de production.

Les tests couvrent les routes publiques, les 404, les brouillons privés, les accès anonymes et non autorisés, la validation des mutations, les doublons de slug, les conflits de version, les uploads, l’export, la recherche, le fallback contact et le cycle création → autosave → aperçu → publication → dépublication → suppression → restauration. Captures responsives : `.local/screenshots/` à 375, 768, 1024 et 1440 px.

## Migrations et sauvegardes

```sh
npm run db:dev -- --name describe_change
npm run db:generate
npm run db:migrate
npm run db:seed
```

En production, utiliser `db:migrate` (migrations versionnées), jamais `db:dev`. Le seed est répétable et n’écrase pas les enregistrements existants. Ne pas le relancer pour « synchroniser » les projets après un renommage manuel : leur slug d’origine pourrait être réinséré.

L’export `/api/admin/export` contient posts, projets, recherches, catégories, tags, paramètres et médias encodés en base64 ; il exclut comptes, sessions, secrets et identifiants OAuth. Son format est versionné pour un import ultérieur. L’import JSON automatique n’est pas livré ; une restauration complète peut se faire avec les sauvegardes PostgreSQL standard (`pg_dump`/`pg_restore`). Stocker les exports hors du serveur, avec accès restreint puisqu’ils incluent les brouillons.

Purger périodiquement les anciennes lignes `RateLimit` expirées, à l’aide de Prisma ou d’une tâche SQL d’exploitation. Conserver les audit logs selon la politique de rétention choisie.

## Déploiement

### Vercel

1. Héberger PostgreSQL chez le fournisseur choisi (Neon, Supabase, Railway ou autre), avec TLS en production.
2. Configurer les variables de `.env.example` dans Vercel, notamment URL du site, base et OAuth.
3. Appliquer `npm run db:migrate` et `npm run db:seed` une première fois avec l’URL de production, depuis un environnement de confiance.
4. Build : `npm run build`. Ne pas exposer PostgreSQL directement au public sans contrôle réseau.
5. Vérifier le callback GitHub, le compte autorisé, la publication d’un brouillon et l’envoi email réel.

### Serveur Node

```sh
npm ci
npm run db:migrate
npm run build
npm start
```

Placer un reverse proxy HTTPS devant Next.js, définir `NEXTAUTH_URL` et `SITE_URL`, configurer la base et les sauvegardes. `npm run build` utilise Prisma CLI, donc les dépendances de développement doivent être disponibles pendant le build.

## Structure

```text
src/app/(public)/       Pages du portfolio
src/app/admin/          Studio privé et aperçus
src/app/api/            Auth, contenu, médias, contact
src/components/        Composants publics et administration
src/config/            Identité, sélection GitHub, dictionnaires
src/data/              Données initiales fournies
src/lib/               Auth, validation, contenu, GitHub, stockage
content/blog/          Articles Markdown locaux
prisma/                Schéma, migrations et seed
scripts/               Base locale et environnement de tests
tests/                 Tests unitaires et navigateur
```

Références techniques : [Next.js App Router](https://nextjs.org/docs/app), [CSP Next.js](https://nextjs.org/docs/app/guides/content-security-policy), [callbacks NextAuth](https://next-auth.js.org/configuration/callbacks), [Prisma PostgreSQL](https://www.prisma.io/docs/orm/v7/core-concepts/supported-databases/postgresql).

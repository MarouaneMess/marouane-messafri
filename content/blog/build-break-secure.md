---
title: "Build, Break, Secure : une même démarche"
description: "Pourquoi développement et sécurité applicative se complètent à chaque étape d’un projet."
date: "2026-09-29"
category: "Notes"
tags: ["Development", "Web Security"]
published: true
---
Construire une application et comprendre ses limites sont deux façons d’étudier le même système. Ce journal rassemble des notes de développement, de recherche et des retours sur les projets du portfolio.

## Construire avec intention

Une interface répond à un besoin. Une API définit un contrat. Une base de données organise des informations et leurs relations. Rendre ces décisions explicites facilite la maintenance et la revue de sécurité.

## Comprendre les frontières de confiance

L’authentification répond à la question « qui êtes-vous ? ». L’autorisation détermine ce que cette personne a le droit de faire. Cette distinction doit rester visible dans l’architecture, particulièrement lorsqu’une application manipule des données privées.

> Un identifiant connu ne constitue jamais une autorisation d’accès.

## Vérifier les invariants

Les tests les plus utiles décrivent des règles métier. Par exemple, un brouillon doit rester privé quelle que soit la manière dont son URL est obtenue.

```typescript
type Publication = { status: 'DRAFT' | 'PUBLISHED' };

function isPublished(post: Publication): boolean {
  return post.status === 'PUBLISHED';
}
```

Cette fonction illustre une règle de visibilité. Une application réelle doit l’appliquer côté serveur et vérifier les autorisations sur chaque opération sensible.

## Partager de manière responsable

Les notes de sécurité présentées ici privilégient les causes, les correctifs et la divulgation responsable. Les détails d’une recherche doivent respecter son périmètre et les conditions de publication convenues.

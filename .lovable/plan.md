## Contexte

Le projet est une **SPA React + Vite**. La recommandation reçue (migrer vers Next.js / Nuxt avec `getStaticProps`) **n'est pas applicable** : Lovable supporte uniquement React + Vite. Une migration framework casserait routing, Supabase Auth, edge functions, i18n et design system.

Le diagnostic sous-jacent est partiellement vrai : le HTML initial est quasi-vide. Mais Googlebot, Bingbot et Perplexity rendent le JavaScript et indexent déjà `/faq`, `/about`, `/inspirations`. Le vrai gain à obtenir concerne les **crawlers LLM non-JS** (GPTBot, ClaudeBot, PerplexityBot mode rapide).

## Objectif

Maximiser la lisibilité du site pour les crawlers IA et SEO **sans toucher à l'architecture** ni risquer de panne.

## Livrables (4 étapes, zéro risque)

### 1. Enrichir `public/llms.txt` et `public/llms-full.txt`
- Auditer le contenu actuel.
- Ajouter le texte complet de `/faq` (depuis `public/locales/fr/landing.json` → section `faq`), `/about`, `/inspirations`, présentation des plans tarifaires.
- Format markdown plat, en français, optimisé pour ingestion LLM.

### 2. Vérifier et compléter le sitemap
- Auditer `public/sitemap.xml` et `supabase/functions/sitemap/index.ts`.
- S'assurer que `/faq`, `/about`, `/inspirations`, `/categories`, `/blog`, `/blog/:slug`, `/premium`, `/cgv`, `/terms`, `/mentions-legales`, `/privacy` sont listés avec hreflang pour les 7 langues.

### 3. Ajouter un `<noscript>` enrichi dans `index.html`
- Bloc placé dans `<body>` (jamais dans `<head>` — règle projet respectée).
- Contient : description longue du service, liste de liens vers toutes les pages publiques, mots-clés thématiques (souvenirs, journal de famille privé, arbre généalogique, chronologie).
- Invisible pour les utilisateurs (tous ont JS), lisible par les crawlers sans JS.

### 4. Documentation interne
- Créer `docs/seo-crawling-strategy.md` expliquant :
  - Pourquoi la SPA est conservée (contrainte Lovable).
  - Les 3 leviers utilisés (`llms.txt`, `sitemap`, `<noscript>`).
  - Comment vérifier l'indexation dans Google Search Console.
  - Option future : `vite-plugin-prerender` (à tester en isolation si besoin).

## Hors-scope (refusé pour préserver la stabilité)

- Migration Next.js / Nuxt (impossible sur Lovable).
- Installation d'un plugin de pré-rendu sans branche de test dédiée.
- Toute modification de `src/App.tsx`, du routing, des pages, de l'auth ou du design system.

## Détails techniques

**Fichiers modifiés :**
- `public/llms.txt` (enrichi)
- `public/llms-full.txt` (enrichi)
- `public/sitemap.xml` (complété si lacunes)
- `index.html` (ajout `<noscript>` dans `<body>`, après `<div id="root">`)
- `docs/seo-crawling-strategy.md` (nouveau)

**Fichiers audités sans modification (sauf lacune avérée) :**
- `supabase/functions/sitemap/index.ts`
- `src/components/seo/SEOHead.tsx`
- `public/robots.txt`

**Validation post-changement :**
- Test manuel : `curl https://familygarden.fr/faq` → vérifier que le `<noscript>` est servi.
- Vérifier que la home, le login, et le dashboard se chargent normalement dans le preview.
- Aucune dépendance ajoutée, aucun build modifié.

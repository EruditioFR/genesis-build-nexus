# Stratégie SEO & crawling pour Family Garden

## Contexte technique

Family Garden est une **SPA React + Vite** hébergée sur Lovable. Le HTML initial servi par le CDN est intentionnellement minimal — le contenu de chaque route (`/faq`, `/about`, `/inspirations`, etc.) est rendu côté client par React Router après chargement du bundle JS.

## Pourquoi pas Next.js / Nuxt ?

Lovable supporte uniquement la stack **React + Vite**. Migrer vers un framework SSR (Next.js, Nuxt, Remix) est techniquement impossible sur la plateforme et casserait :
- Le routing actuel (`react-router-dom`)
- L'authentification Supabase et les hooks `useAuth`
- Les ~20 edge functions
- L'i18n (`react-i18next` + 7 langues)
- Le design system Tailwind / shadcn

## Levée du risque crawling : 3 leviers en place

### 1. Crawlers JS-aware (Google, Bing, Perplexity)
Ces moteurs **exécutent le JavaScript** et indexent correctement les SPA React depuis 2019. Aucune action requise — toutes les routes publiques sont indexées via le rendu client.

Vérification : Google Search Console → **Inspection d'URL** → tester `/faq` → cliquer **« Voir la page testée »** → onglet HTML rendu.

### 2. Crawlers LLM non-JS (GPTBot, ClaudeBot, PerplexityBot)
Pour ces bots qui ne rendent pas le JavaScript :

- **`public/llms.txt`** — résumé du site + FAQ complète, ingéré nativement par les LLM.
- **`public/llms-full.txt`** — documentation exhaustive (218 lignes) couvrant fonctionnalités, sécurité, cas d'usage.
- **`<noscript>` dans `index.html`** — bloc HTML statique avec H1, description, fonctionnalités, tarifs et **liens vers toutes les pages publiques**. Visible par tous les crawlers sans JS, invisible pour les utilisateurs.

### 3. Découvrabilité (sitemap + robots)
- **`public/sitemap.xml`** — liste statique des routes publiques (FAQ, about, inspirations, blog, premium, démo, légal).
- **Edge function `supabase/functions/sitemap`** — sitemap dynamique pour le contenu blog généré.
- **`public/robots.txt`** — autorise l'indexation publique, bloque les routes privées (`/dashboard`, `/profile`, etc.).

## Maintenance

À mettre à jour à chaque changement majeur :
- Nouvelle route publique → ajouter à `public/sitemap.xml` ET au `<noscript>` de `index.html`.
- Nouvelle fonctionnalité → mentionner dans `llms.txt` + `llms-full.txt`.
- Nouvelle FAQ → synchroniser `public/locales/fr/landing.json` ↔ `llms.txt`.

## Option future : pré-rendu statique

Si nécessaire un jour, `vite-plugin-prerender` ou `react-snap` peuvent générer du HTML pré-rendu pour les routes publiques au build, **sans changer de framework**. À tester en branche isolée car interactions potentielles avec i18n dynamique et hydration auth.

## Ce qui est volontairement EXCLU

- Migration Next.js / Nuxt (impossible sur Lovable).
- Server-Side Rendering (incompatible avec l'architecture Vite actuelle).
- Plugin de pré-rendu sans validation préalable.



## Plan : SEO + GEO — Audit et corrections

### Constat actuel

Contrairement à ce que vous pensez, une base SEO/GEO existe déjà : `SEOHead` sur 14 pages, JSON-LD (Organization, SoftwareApplication, FAQ, WebSite, HowTo, Breadcrumb), `robots.txt` complet, `sitemap.xml`, `llms.txt` et `llms-full.txt`. Mais plusieurs lacunes empêchent une visibilité réelle.

### Problèmes identifiés

| # | Problème | Impact |
|---|---|---|
| 1 | **SPA sans prerendering** — les crawlers reçoivent un HTML quasi-vide (`<div id="root">`) | Critique : Google peut render le JS mais lentement ; les LLM crawlers (GPTBot, ClaudeBot) ne le peuvent pas du tout |
| 2 | **Langues IT/PT manquantes** dans `SEOHead.SUPPORTED_LANGS` → pas de hreflang pour italien et portugais | Moyen |
| 3 | **sitemap.xml statique** — date 2026-02-16, manque `/marketing` | Moyen |
| 4 | **SearchAction** pointe vers `/capsules?q=` (route privée bloquée par robots.txt) | Faible mais incohérent |
| 5 | **og:image manquant** sur la plupart des pages (seul `index.html` l'a en statique) | Moyen (partage social) |
| 6 | **llms-full.txt incomplet** — ne mentionne ni l'italien ni le portugais | Faible |
| 7 | **Pas de meta verification** Google Search Console | Bloquant pour le suivi |

### Plan d'action

---

#### 1. Prerendering pour les crawlers (le plus impactant)

Créer une **edge function** `prerender` qui, lorsqu'elle détecte un user-agent bot (Googlebot, GPTBot, ClaudeBot, etc.), retourne un HTML statique pré-rendu avec toutes les balises meta, Open Graph, et JSON-LD directement dans le `<head>`. Cela résout le problème fondamental du SPA.

Alternative plus simple : ajouter des `<meta>` statiques directement dans `index.html` pour les informations critiques (déjà partiellement fait), et enrichir les fichiers `llms.txt` / `llms-full.txt` qui sont la vraie porte d'entrée pour les LLM crawlers.

**Recommandation** : enrichir `llms-full.txt` (c'est ce que lisent GPTBot/ClaudeBot) + ajouter un `<noscript>` dans `index.html` avec le contenu textuel clé pour les crawlers qui n'exécutent pas le JS.

---

#### 2. Corriger SEOHead — ajouter IT/PT

Dans `src/components/seo/SEOHead.tsx` :
- Ajouter `'it'` et `'pt'` à `SUPPORTED_LANGS`
- Ajouter `it: 'it_IT'` et `pt: 'pt_BR'` à `LANG_TO_LOCALE`

---

#### 3. Mettre à jour sitemap.xml

- Ajouter `/marketing`
- Mettre à jour toutes les dates `<lastmod>` à aujourd'hui
- Ajouter les pages légales manquantes si absentes

---

#### 4. Corriger le SearchAction

Dans `src/lib/seoSchemas.ts`, remplacer `urlTemplate: /capsules?q=` par une URL publique ou retirer le `potentialAction` SearchAction (car la recherche est privée).

---

#### 5. Ajouter og:image par défaut sur toutes les pages

Dans `SEOHead.tsx`, si aucun `ogImage` n'est passé, utiliser `https://www.familygarden.fr/og-image.png` par défaut au lieu de ne rien mettre.

---

#### 6. Enrichir llms-full.txt

- Ajouter italien et portugais dans les langues supportées
- Ajouter une section "Comparaison avec les alternatives" (albums photo, réseaux sociaux, Google Photos)
- Ajouter une section "Questions que les utilisateurs posent" (optimisé pour les citations LLM)

---

#### 7. Ajouter un bloc `<noscript>` SEO dans index.html

Insérer dans `<body>` un `<noscript>` contenant :
- Le nom du site, la description, les liens vers les pages publiques
- Les offres tarifaires en texte
- Cela donne du contenu aux crawlers qui n'exécutent pas JavaScript

---

#### 8. Meta Google Search Console (optionnel)

Ajouter une balise `<meta name="google-site-verification" content="...">` dans `index.html` — mais cela nécessite votre code de vérification Google.

---

### Fichiers impactés

| Fichier | Modifications |
|---|---|
| `src/components/seo/SEOHead.tsx` | Ajout IT/PT, og:image par défaut |
| `src/lib/seoSchemas.ts` | Retrait/correction SearchAction |
| `public/sitemap.xml` | Mise à jour dates + ajout /marketing |
| `public/llms-full.txt` | Enrichissement contenu + langues |
| `index.html` | Bloc `<noscript>` SEO |
| `src/components/seo/JsonLdSchema.tsx` | Ajout IT/PT dans knowsLanguage |

### Estimation

~6 fichiers modifiés, ~100 lignes ajoutées/modifiées. Aucune migration DB.


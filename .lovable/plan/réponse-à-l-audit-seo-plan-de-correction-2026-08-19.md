# Réponse à l'audit SEO + plan de correction

## Ce que j'ai vérifié en direct sur familygarden.fr

| Point de l'audit | Verdict |
| --- | --- |
| Title / description / canonical identiques sur `/`, `/premium`, `/faq`, `/tarifs`, `/blog`, `/about` | **Exact** — le HTML servi est le même pour toutes ces routes, canonical vers la home |
| Un seul H1 dupliqué dans le HTML servi | **Exact** (le vrai H1 n'apparaît qu'après exécution du JS) |
| Rendu 100 % client (SPA) | **Exact**, sauf les articles de blog qui sont déjà pré-rendus au build |
| `robots.txt` et `sitemap.xml` absents/non vérifiables | **Faux** — les deux répondent en 200, le sitemap contient 54 URLs avec hreflang |
| Prix incohérent (4,99 € / 9,99 €) | **Faux** — le tarif réel est bien 2,99 €/mois (+ 5 €/mois option arbre) ; l'audit s'appuie sur une doc périmée |
| `/blog` renvoie la home | **Partiellement** — la page liste oui, mais chaque article a déjà son HTML avec titre, description et image |
| Aucun JSON-LD FAQPage | **Partiellement** — il existe, mais injecté en JavaScript, donc invisible pour les robots qui ne rendent pas le JS |
| Open Graph / Twitter complets | **Exact**, c'est bon |

Deux problèmes réels que l'audit n'a pas vus :
- les balises `hreflang` pointent toutes vers la même URL pour les 7 langues (signal contradictoire pour Google) ;
- les dimensions d'image Open Graph sont figées à 1200×675 côté client, même quand l'image fait une autre taille.

**Conclusion : le diagnostic central est juste** — le site sert la même page à Google pour toutes les routes marketing. C'est bien la priorité n°1. Le reste du rapport est en partie basé sur des informations obsolètes ou sur des pages qu'il n'a pas pu charger.

## Ce que je propose de faire

### 1. Pré-rendu des pages publiques (correction du problème n°1)

Le mécanisme existe déjà pour les articles de blog : un script tourne au build et écrit un HTML dédié par page. Je l'étends aux pages marketing publiques :

`/`, `/tarifs`, `/pricing`, `/premium`, `/faq`, `/about`, `/blog`, `/demo`, `/privacy`, `/cgv`, `/terms`, `/mentions-legales`

Chaque page recevra dans son HTML servi :
- un `<title>` et une meta description propres (repris des textes déjà écrits dans chaque page) ;
- un `<link rel="canonical">` qui pointe vers elle-même ;
- ses balises Open Graph / Twitter propres ;
- son JSON-LD (FAQPage sur `/faq`, Offer/Product sur les pages tarifs, Organization sur la home, BreadcrumbList) ;
- un bloc `<noscript>` court avec le H1 et le résumé de la page, pour les robots sans JavaScript.

La page liste `/blog` recevra en plus les titres et liens des derniers articles dans le HTML servi.

### 2. Corrections annexes

- `hreflang` : une URL distincte par langue au lieu de 7 fois la même, plus `x-default`.
- Meta descriptions raccourcies sous 160 caractères là où elles débordent.
- Dimensions Open Graph calculées à partir de l'image réelle au lieu d'être figées.
- Sitemap resynchronisé avec la liste des pages effectivement pré-rendues.

### 3. Ce que je ne fais pas maintenant

- Transformer les questions FAQ en articles dédiés : le blog compte déjà 38 articles publiés couvrant ces sujets. À rediscuter une fois les pages indexées.
- Passer à un rendu serveur complet : le pré-rendu au build couvre le besoin ici, sans changer de technologie.

## Détails techniques

- Renommage de `scripts/prerender-blog.mjs` en script générique de pré-rendu, avec deux sources : une table de métadonnées statiques par route et les articles récupérés depuis la base.
- Création de `src/lib/routeSeoMeta.ts` : source unique des titres, descriptions et JSON-LD par route, consommée à la fois par le composant `SEOHead` (runtime) et par le script de build (Node), pour qu'il n'y ait jamais deux vérités.
- Chaque route pré-rendue produit `dist/<route>/index.html` à partir du template `dist/index.html`, en remplaçant title / description / canonical / og / twitter et en injectant le JSON-LD.
- Plafond de pages généré conservé (limite de publication) ; le fallback SPA reste inchangé pour toutes les routes non pré-rendues.
- `SEOHead` : hreflang par langue, dimensions d'image mesurées, pas d'autre changement de comportement.

Après mise en ligne, il faudra republier puis demander une réindexation dans Search Console.



# Audit SEO & GEO complet de FamilyGarden.fr

## Etat des lieux : ce qui est bien fait

- **JSON-LD structuré** : 3 schemas (Organization, SoftwareApplication, FAQPage) dans `index.html` + composant `JsonLdSchema` dynamique
- **NoIndex sur les pages privées** : 11 pages authentifiées protégées via le composant `<NoIndex />`
- **robots.txt + sitemap.xml** : configurés avec les bonnes exclusions
- **Open Graph + Twitter Cards** : image 1200x630 et balises complètes
- **Canonical URL** : presente dans `index.html`
- **FAQ riche** : contenu dense, bon pour les featured snippets
- **i18n** : 5 langues (fr, en, es, ko, zh) -- bon signal international
- **Google Analytics** : RGPD-compliant avec consentement cookies
- **Balise hreflang** : absente (probleme)

---

## Problemes identifies (par priorite)

### P1 -- Critiques

| # | Probleme | Impact |
|---|----------|--------|
| 1 | **Aucun title/description dynamique par page** : Seule la page About change `document.title`. Login, Signup, FAQ, Premium, legal pages gardent toutes le title par defaut de `index.html`. | Google affiche le meme titre pour toutes les pages indexees |
| 2 | **Pas de balises hreflang** : Le site est en 5 langues mais aucun signal n'est envoye aux moteurs de recherche pour indiquer les versions linguistiques. | Contenu duplique inter-langues, mauvais ciblage geographique |
| 3 | **URL canonique statique** : Le `<link rel="canonical">` dans `index.html` pointe toujours vers `/` quelle que soit la page visitee. | Toutes les pages signalent `/` comme URL canonique -- confusion pour Google |
| 4 | **SPA non-rendue cote serveur** : En tant que SPA React, le HTML envoye au crawler ne contient que `<div id="root"></div>`. Les balises meta injectees dynamiquement par `useEffect` ne sont pas visibles par les crawlers. | Le contenu JSON-LD dynamique, les FAQ, et le contenu texte sont invisibles pour les moteurs |

### P2 -- Importants

| # | Probleme | Impact |
|---|----------|--------|
| 5 | **Liens morts dans le footer** : Roadmap, Changelog, Blog, Carrieres, Partenaires, Guides, Communaute, RGPD pointent vers `#` | Mauvais signal E-E-A-T, UX degradee |
| 6 | **Sitemap incomplet** : Manque `/about`, `/faq` (la page dediee). Le sitemap ne contient que 9 URLs. | Pages publiques non decouvertes |
| 7 | **Images hero sans alt descriptif** : Les 6 slides du hero utilisent toutes le meme alt generique (`hero.badge`). | Opportunite SEO images manquee |
| 8 | **Page FAQ dediee (`/faq`) sans JSON-LD FAQPage** : Le schema FAQPage est uniquement injecte sur la landing, pas sur `/faq` qui contient 24 questions detaillees. | Manque de rich snippets sur la page la plus pertinente |
| 9 | **Footer logo : `<a>` au lieu de `<Link>`** : Le logo du footer utilise un `<a href="/">` natif au lieu de React Router, causant un rechargement complet. | UX degradee, pas critique SEO |
| 10 | **Pas de page 404 avec bon status HTTP** : La SPA renvoie toujours un status 200, meme pour les pages inexistantes. | Soft 404, pollution de l'index Google |

### P3 -- Ameliorations GEO

| # | Probleme | Impact |
|---|----------|--------|
| 11 | **Pas de BreadcrumbList schema** sur les pages profondes (FAQ, Premium, About, Legal) | Manque de rich snippets breadcrumb |
| 12 | **Pas de WebSite schema avec SearchAction** | Manque de sitelinks searchbox dans Google |
| 13 | **Pas de HowTo schema** pour la section "Comment ca marche" | Opportunite de rich snippet perdue |
| 14 | **Contenu About non internationalise** : Tout est en dur en francais, pas de traduction | Incoherence avec les 5 langues du site |

---

## Plan d'optimisation

### Phase 1 : SEO Meta dynamique (impact le plus fort)

**Creer un composant `<SEOHead />`** reutilisable qui gere :
- `document.title` dynamique par page
- Meta description dynamique
- Canonical URL dynamique (basee sur `location.pathname`)
- Balises Open Graph par page

Pages a mettre a jour :
- `/` : "Family Garden -- Journal de famille prive et securise"
- `/login` : "Connexion | Family Garden"
- `/signup` : "Inscription gratuite | Family Garden"
- `/premium` : "Tarifs et abonnements | Family Garden"
- `/faq` : "FAQ -- Questions frequentes | Family Garden"
- `/about` : "A propos | Family Garden"
- `/privacy`, `/cgv`, `/terms`, `/mentions-legales` : titres specifiques

### Phase 2 : Schemas JSON-LD enrichis

- Ajouter **FAQPage schema** sur `/faq` (24 questions)
- Ajouter **BreadcrumbList** sur les pages About, FAQ, Premium, Legal
- Ajouter **WebSite schema** avec `potentialAction` SearchAction
- Ajouter **HowTo schema** pour la section "Comment ca marche"

### Phase 3 : Corrections techniques

- **Mettre a jour le sitemap** : ajouter `/about` et `/faq`
- **Corriger les liens morts du footer** : soit les retirer, soit les pointer vers de vraies pages ou des ancres
- **Ajouter des alt descriptifs uniques** aux images du hero slider (mariage, anniversaire, voyages, etudes, playlist)
- **Corriger le lien logo footer** : utiliser `<Link to="/">` au lieu de `<a href="/">`

### Phase 4 : Internationalisation SEO

- **Ajouter des balises hreflang** dynamiques via le composant `<SEOHead />` pour les 5 langues
- **Internationaliser la page About** via les fichiers de traduction i18n
- **Ajouter les meta descriptions** dans chaque fichier de locale

---

## Estimation technique

| Phase | Fichiers impactes | Complexite |
|-------|-------------------|------------|
| Phase 1 | Nouveau composant `SEOHead.tsx` + toutes les pages publiques (environ 10) | Moyenne |
| Phase 2 | Extension de `JsonLdSchema.tsx` + pages FAQ/About/Premium | Faible |
| Phase 3 | `sitemap.xml`, `Footer.tsx`, `HeroSection.tsx`, locales FR/EN | Faible |
| Phase 4 | `SEOHead.tsx`, locales x5, `About.tsx` | Moyenne |

Les phases 1 et 3 auront l'impact le plus immediat sur le referencement. La phase 4 est importante pour le ciblage international.


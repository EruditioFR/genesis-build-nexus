

# Audit SEO complet -- Family Garden

## Ce qui est deja bien fait

- SEOHead dynamique sur toutes les pages publiques (title, description, canonical, OG, hreflang)
- JSON-LD riche : Organization, SoftwareApplication, WebSite, HowTo, FAQPage, BreadcrumbList, AboutPage
- NoIndex sur toutes les pages authentifiees (dashboard, capsules, timeline, profile, etc.)
- robots.txt bien configure avec Disallow sur les pages privees
- sitemap.xml avec toutes les pages publiques
- Images hero avec alt descriptifs et optimises
- Preload du hero background
- DNS prefetch pour le backend
- Lazy loading des sections below-the-fold
- Open Graph avec image custom 1200x630

---

## Problemes identifies et optimisations proposees

### 1. SPA et indexation : pre-rendering manquant (CRITIQUE)

**Probleme** : En tant que SPA React, le HTML envoye au crawler est une page vide (`<div id="root"></div>`). Googlebot execute le JS mais avec des limites. Les meta tags injectes dynamiquement par SEOHead ne sont pas dans le HTML initial.

**Solution** : Pas realisable directement dans Lovable (necessite un serveur de pre-rendering). Mais on peut ameliorer le HTML statique de `index.html` pour que les metadonnees par defaut soient presentes.

**Action** : Verifier que le `index.html` contient deja les bonnes meta par defaut (c'est le cas). Aucune modification requise ici -- la config actuelle est le maximum possible dans une SPA.

### 2. Page 404 non optimisee

**Probleme** : La page NotFound affiche un texte en anglais ("Oops! Page not found", "Return to Home") et n'a pas de SEOHead avec noIndex.

**Actions** :
- Ajouter `<SEOHead title="Page non trouvee | Family Garden" noIndex={true} />`
- Traduire le contenu en francais
- Ajouter un lien vers les pages principales (FAQ, About)

### 3. Liens sociaux du footer pointent vers "#"

**Probleme** : Les icones Facebook, Twitter, Instagram, LinkedIn dans le Footer ont `href="#"` et affichent des cercles generiques au lieu de vraies icones. Cela nuit a l'E-E-A-T et a l'experience.

**Actions** :
- Soit retirer les icones sociales si aucun compte n'existe
- Soit les remplacer par les vrais liens une fois les comptes crees

### 4. Section Temoignages non internationalisee

**Probleme** : `TestimonialsSection.tsx` a tout le contenu en dur en francais (pas de `useTranslation`). Les badges "Temoignages" et "heritage" ne passent pas par i18n.

**Action** : Internationaliser cette section via le namespace `landing`.

### 5. Balises semantiques manquantes sur certaines pages

**Probleme** : Certaines pages publiques n'utilisent pas de balise `<main>` :
- `About.tsx` : pas de `<main>`
- `Premium.tsx` : utilise `<main>` (OK)
- `FAQ.tsx` : utilise `<main>` (OK)

**Action** : Ajouter `<main>` sur la page About pour ameliorer la semantique HTML.

### 6. Attributs d'accessibilite manquants (impact SEO indirect)

**Probleme** : 
- Le toggle mensuel/annuel sur PricingSection et Premium n'a pas de `role="switch"` ni `aria-checked`
- Le menu mobile du Header n'a pas d'`aria-expanded`

**Actions** : Ajouter les attributs ARIA manquants.

### 7. Sitemap incomplet

**Probleme** : Le sitemap ne contient pas la page `/inspirations` qui est une page publique potentielle. Il manque aussi les `<lastmod>` sur toutes les URLs.

**Actions** :
- Ajouter `/inspirations` si c'est une page publique
- Ajouter des `<lastmod>` avec une date recente sur chaque URL

### 8. Page Signup sans SEOHead

**Probleme** : La page `/signup` n'a probablement pas de SEOHead (elle n'apparait pas dans la recherche).

**Action** : Ajouter `<SEOHead>` avec title/description pertinents sur la page Signup.

### 9. Image preload incorrecte

**Probleme** : Le `index.html` fait un preload de `/src/assets/hero-background.jpg` mais le fichier reel est `hero-background.webp`. Le preload ne fonctionne donc pas.

**Action** : Corriger le chemin du preload ou le retirer (Vite transforme les imports de toute facon).

### 10. Pas de meta `og:type` dynamique

**Probleme** : Le `og:type` est defini statiquement comme "website" dans `index.html` mais n'est jamais mis a jour par SEOHead. Les pages comme FAQ ou About devraient avoir `og:type: article`.

**Action** : Ajouter la gestion de `og:type` dans SEOHead.

### 11. Pas de `og:locale` ni `og:site_name`

**Probleme** : Les meta OG ne contiennent pas `og:locale` (devrait etre `fr_FR`) ni `og:site_name` (devrait etre "Family Garden").

**Action** : Ajouter ces deux meta dans SEOHead.

### 12. Mot-cle "capsule memorielle" vs "souvenir"

**Observation** : Le site utilise les deux termes de facon inconsistante. Le JSON-LD parle de "capsules memorielles" tandis que les pages utilisent "souvenir". Pour le SEO, il faut choisir un terme principal et l'utiliser de facon coherente dans les titles et descriptions.

**Recommandation** : Pas de modification de code mais uniformiser la terminologie dans les prochaines iterations.

---

## Fichiers a modifier

| Fichier | Modifications |
|---------|---------------|
| `src/pages/NotFound.tsx` | Ajouter SEOHead avec noIndex, traduire en francais, ameliorer le design |
| `index.html` | Corriger le preload (jpg -> webp ou retirer), ajouter og:locale et og:site_name |
| `src/components/seo/SEOHead.tsx` | Ajouter og:type, og:locale, og:site_name |
| `src/components/landing/TestimonialsSection.tsx` | Internationaliser via i18n |
| `src/components/landing/Footer.tsx` | Retirer les liens sociaux factices ou les masquer |
| `public/sitemap.xml` | Ajouter lastmod et page /inspirations si publique |
| `src/pages/About.tsx` | Ajouter balise `<main>` semantique |
| `src/pages/Signup.tsx` | Ajouter SEOHead si manquant |

## Priorite d'implementation

1. **Haute** : Corriger preload index.html, ajouter og:locale/og:site_name/og:type dans SEOHead
2. **Haute** : Page 404 en francais + noIndex
3. **Moyenne** : Sitemap avec lastmod
4. **Moyenne** : Retirer liens sociaux factices du footer
5. **Basse** : Internationaliser les temoignages
6. **Basse** : Attributs ARIA d'accessibilite


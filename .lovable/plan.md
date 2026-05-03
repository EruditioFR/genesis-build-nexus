# Démo immersive mobile — /demo

Page autonome, full-screen, 7 étapes, sans header/footer, optimisée conversion publicitaire (≤ 45 s).

## Route et structure fichiers

- Nouvelle route publique `/demo` ajoutée dans `src/App.tsx` (lazy-loaded, indexable mais avec canonical sur `https://familygarden.fr/demo`).
- Dossier `src/components/demo/` regroupant un composant par étape :
  - `DemoLayout.tsx` (gestion fond plein écran, transitions, anti-abandon)
  - `Step1Hook.tsx`
  - `Step2Persona.tsx`
  - `Step3Create.tsx`
  - `Step4Wow.tsx`
  - `Step5Loss.tsx`
  - `Step6Projection.tsx`
  - `Step7Conversion.tsx`
  - `AbandonDialog.tsx`
- Page conteneur : `src/pages/DemoExperience.tsx` (state machine simple : `step`, `persona`, `title`, `text`).

## Comportement par étape

1. **Hook** — image émotionnelle floutée (réutiliser visuel landing existant, pas de nouvel asset lourd), overlay sombre, titre + sous-texte, CTA bas écran "Créer un souvenir". Tracking `start_demo` au mount.
2. **Persona** — 3 boutons pleine largeur (Mes enfants / Ma famille / Mes parents). Sélection → animation scale + auto-advance après 250 ms. Tracking `select_persona` avec valeur. Stockage localStorage `demo_persona`.
3. **Création** — image pré-chargée (placeholder doux), champ titre auto-focus pré-rempli "Vacances à la mer", textarea pré-remplie. CTA "Continuer". Sauvegarde dans localStorage. Tracking `complete_creation`.
4. **Wow moment** — carte souvenir premium (ombre `shadow-gold`, gradient warm), mini timeline verticale fictive (3 jalons), avatar correspondant au persona. Bouton "Partager avec {persona}" → étape 5.
5. **Effet perte** — fond qui s'assombrit (fade 600 ms), texte centré, bouton caché 1500 ms via `setTimeout` puis apparition fade-in pour continuer.
6. **Projection** — texte en deux temps (apparition séquencée à 0 s puis 1 s), CTA "Je veux ça pour ma famille" apparaît à 1800 ms. Tracking `reach_projection`.
7. **Conversion** — fond clair (contraste), 3 bénéfices avec icônes lucide (Shield, Lock, Heart), CTA principal "Créer mon espace" → `/signup?source=demo&persona={persona}`, CTA secondaire texte "Voir un exemple" → `/`. Tracking `click_conversion`.

## Personnalisation dynamique

Helper `getPersonaCopy(persona)` retournant : label affiché, possessif ("vos enfants", "votre famille", "vos parents"), ton (chaleureux pour enfants, respectueux pour parents). Utilisé dans étapes 4, 6, 7.

## Anti-abandon

Hook `useAbandonGuard` : sur `beforeunload` ou clic bouton retour navigateur entre étapes 3 et 6, afficher `AbandonDialog` ("Votre souvenir n'a pas été enregistré." + bouton "Reprendre"). État conservé dans localStorage pour reprise.

## Tracking

Utiliser le hook existant `useGoogleAnalytics` (déjà en place via `GoogleAnalyticsProvider`). Évènements : `start_demo`, `select_persona`, `complete_creation`, `reach_projection`, `click_conversion`. Paramètre commun `persona`.

## Style et contraintes

- Mobile-first strict, viewport `100dvh`, overflow hidden, pas de scroll.
- Transitions framer-motion (déjà installé) : fade + slide ≤ 300 ms.
- Boutons : variantes existantes `mobilePrimary` / `mobileLg` (zone pouce, min 52 px).
- Typographie : `font-display` pour titres, lisibilité ≥ 18 px.
- Aucun nouvel asset > 200 ko ; réutiliser images landing déjà optimisées.
- Pas de header / footer / menu / lien externe pendant la démo.

## SEO

- `SEOHead` minimal : title "Découvrez Family Garden en 1 minute", description orientée acquisition, canonical `https://familygarden.fr/demo`, `noindex` non appliqué (page marketing publique).
- Ajout de `/demo` dans `public/sitemap.xml`.

## Hors scope

- Pas d'API ni table Supabase.
- Pas d'upload réel ni création de souvenir en base.
- Pas de modification du parcours signup existant (juste lecture du query param `source` côté Signup ultérieurement si besoin — non inclus ici).

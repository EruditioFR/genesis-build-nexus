## Problème

Sur mobile (screenshot fourni), le CTA principal de la hero « Commencer mes 14 jours d'essai gratuit » déborde du bouton (le "C" initial est coupé). Le `\n` inséré précédemment n'est pas respecté visuellement sur ce bouton, et d'autres boutons du site risquent le même problème sur petits écrans.

## Objectif

Auditer **tous les boutons du site** et garantir que :
1. Aucun texte ne déborde horizontalement.
2. Les libellés longs passent proprement sur deux lignes (avec hauteur auto).
3. Le rendu reste cohérent en 7 langues (certaines traductions sont plus longues, ex. allemand-like en portugais/italien).

## Périmètre à auditer

- **Header** (desktop + mobile) : Sign In / Sign Up / Contact
- **Hero sections** v1/v2/v3 (CTA primaire + secondaire)
- **How It Works** (v3 + short)
- **CTA sections** v1/v2/v3
- **Pricing sections** v1/v3 (bouton principal + toggle)
- **FAQ / About / Marketing / Demo** (CTAs finaux)
- **Footer** (liens/boutons éventuels)
- **Dashboard authentifié** : QuickActions, PremiumPromoCard, MobileBottomNav
- **Formulaires** : Signup, Login, Checkout, Contact (boutons submit)
- **Wizard démo** (`DemoExperience`) : boutons Suivant / Précédent / Créer
- **Composants récurrents** : `Button` shadcn (vérifier les variants utilisés avec textes longs)

## Approche technique

1. **Recensement** : rechercher tous les `<Button>` et `<a role="button">` du site via `rg`, lister les libellés potentiellement longs (multilingues).
2. **Règle CSS unifiée** pour les boutons à texte long :
   - `whitespace-normal` (ou `whitespace-pre-line` si `\n` explicite) au lieu du `whitespace-nowrap` par défaut de shadcn.
   - `h-auto min-h-11` pour permettre l'expansion verticale tout en gardant la cible tactile ≥ 44px.
   - `text-center leading-tight` pour un rendu propre sur 2 lignes.
   - `px-4` (au lieu de `px-8`) sur mobile pour laisser plus de place au texte via `sm:px-8`.
3. **Cas du CTA Hero mobile qui déborde** : investiguer pourquoi le `\n` n'agit pas — probablement un parent qui force `flex-nowrap` ou un `text-lg`/`text-xl` trop grand pour la largeur. Réduire la taille de police en mobile (`text-base sm:text-lg`) et confirmer `whitespace-pre-line` bien appliqué au span interne.
4. **Vérification multilingue** : tester visuellement en français + une langue longue (portugais ou italien) via Playwright sur viewport mobile (375px) et desktop (1280px), sur les pages `/`, `/faq`, `/about`, `/tarifs`, `/demo`.
5. **Pas de changement de copie** — uniquement CSS/structure.

## Livrable

- Composants ajustés (headers, heros, CTAs, pricing, wizard, dashboard) avec classes uniformes pour texte long.
- Screenshots avant/après sur mobile 375px et desktop 1280px, FR + PT.
- Aucun impact fonctionnel, aucun changement backend.

## Ce qui ne sera PAS fait

- Pas de refonte de la copie ni des traductions.
- Pas de modification des variants du composant `Button` de base (impact trop large) — les overrides seront appliqués localement sur chaque bouton concerné.

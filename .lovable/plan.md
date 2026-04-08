

## Objectif

Rendre la landing page plus attractive en y intégrant deux éléments actuellement réservés au dashboard :
1. **Un slider d'inspirations "hero-size"** — version publique (sans login requis), plus grand et visuellement impactant
2. **Les cartes "Bienvenue sur Family Garden"** — les 3 feature cards (Créer, Organiser, Partager) + le "Comment ça marche" en 4 étapes

L'idée : le prospect voit immédiatement le produit en action et comprend qu'il sera guidé.

---

## Plan d'implémentation

### 1. Créer un composant `LandingInspirationSlider`

Nouveau fichier : `src/components/landing/LandingInspirationSlider.tsx`

- Reprend la mécanique du `DashboardInspirationWidget` (carrousel avec les 5 images aquarelles + questions) mais :
  - **Pas de dépendance à `useMemoryPrompts`** (pas de Supabase, pas de login) — utilise directement `memoryCategories` et `SLIDE_QUESTIONS`
  - **Plus grand** : hauteur `h-72 sm:h-80 md:h-96` (format hero) au lieu de `h-48`
  - **Pas de bouton dismiss** (c'est du contenu marketing, pas dismissable)
  - **CTA = "Commencer gratuitement"** → lien vers `/signup` au lieu d'ouvrir le dialog
  - Autoplay, swipe, flèches de navigation, dots — même logique
  - Texte d'accroche au-dessus : "Trouvez l'inspiration pour vos premiers souvenirs"

### 2. Créer un composant `LandingProductPreview`

Nouveau fichier : `src/components/landing/LandingProductPreview.tsx`

- Reprend les 3 cartes du `WelcomeSection` (Créer / Organiser / Partager) dans une section dédiée
- Titre de section : "Un espace pensé pour vous guider"
- Les 3 cartes avec icônes, titre et description (réutilise les clés i18n existantes ou en crée de nouvelles dans `landing.json`)
- Sous les cartes : résumé compact du "Comment ça marche" en 4 étapes (icônes numérotées + titre, sans les descriptions longues du `HowItWorksSection` actuel — format plus condensé)
- Animation au scroll (framer-motion `whileInView`)

### 3. Intégrer dans les deux variantes de landing

**`src/pages/Index.tsx` (V1)** :
- Ajouter `LandingInspirationSlider` juste après le `HeroSection`
- Ajouter `LandingProductPreview` après le slider, avant `FeaturesSection`

**`src/pages/IndexV2.tsx` (V2)** :
- Ajouter `LandingInspirationSlider` après `PainPointsSection` (= après avoir exposé le problème, on montre la solution concrète)
- Ajouter `LandingProductPreview` après le slider, avant `SolutionSection`

### 4. Ajouter les traductions

Dans `public/locales/fr/landing.json` et `public/locales/en/landing.json` :
- `productPreview.badge` : "Découvrez l'expérience" / "Discover the experience"
- `productPreview.title` : "Vous êtes guidé" / "You're guided"
- `productPreview.titleHighlight` : "à chaque étape" / "every step of the way"
- `inspiration.landingTitle` : "Trouvez l'inspiration pour vos premiers souvenirs"
- `inspiration.landingCta` : "Commencer gratuitement"
- Clés pour les 3 feature cards (Créer, Organiser, Partager) adaptées au contexte prospect

---

## Structure visuelle

```text
┌──────────────────────────────────────────┐
│  HERO (existant)                         │
├──────────────────────────────────────────┤
│  INSPIRATION SLIDER (nouveau, hero-size) │
│  ┌────────────────────────────────────┐  │
│  │ 🌱 Enfance                        │  │
│  │ « À quoi ressemblait la maison    │  │
│  │   de votre enfance ? »            │  │
│  │                                    │  │
│  │ [Commencer gratuitement →]        │  │
│  └────────────────────────────────────┘  │
├──────────────────────────────────────────┤
│  PRODUCT PREVIEW (nouveau)               │
│  "Un espace pensé pour vous guider"      │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐   │
│  │ 📷      │ │ ⏰      │ │ 👥      │   │
│  │ Créer   │ │Organiser│ │Partager │   │
│  └─────────┘ └─────────┘ └─────────┘   │
│                                          │
│  1→ 2→ 3→ 4  (mini How It Works)        │
├──────────────────────────────────────────┤
│  FEATURES (existant)                     │
│  ...                                     │
└──────────────────────────────────────────┘
```

---

## Points techniques

- Le `LandingInspirationSlider` importe directement `memoryCategories` depuis `@/lib/memoryCategories` et les images depuis `@/assets/inspirations/` — aucune requête Supabase, donc chargement instantané
- Lazy-load les deux nouveaux composants pour ne pas impacter le LCP du hero
- Les images aquarelles sont déjà dans les assets (enfance, ecole, musiques, famille, vie) — pas besoin de nouveaux visuels
- Responsive : sur mobile, le slider occupe toute la largeur, les 3 cards passent en colonne

